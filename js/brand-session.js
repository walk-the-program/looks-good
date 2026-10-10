/* ---------------------------------------------------------------------
   brand-session.js — the editor's link to the brand library.

   Holds the open brand's record, tracks whether the live `state` differs
   from what was last saved, autosaves a separate working draft so a crash
   or quit never loses edits, and implements Save / Revert / Save as new /
   back to Library. Shuffling and editing never touch the saved brand;
   only an explicit Save does.

   Replaces the old single-session autosave (session-ui.js). Undo stays
   session-only.
------------------------------------------------------------------------ */

const BrandSession = (function () {
  const $ = id => document.getElementById(id);
  const DRAFT_DELAY_MS = 300;

  let current = null;          // the open brand record, or null on the Library
  let baseline = '';           // JSON of the saved state as the app re-serializes it
  let restoredDraft = false;   // true when the open brand came back with unsaved edits
  let draftTimer = null;

  const defaultTypography = () => ({
    headingSize: 44, bodySize: 16,
    headingWeight: 700, bodyWeight: 400,
    headingTracking: 0, bodyTracking: 0,
    headingCase: 'none', bodyCase: 'none',
  });

  // Always the committed state: a suggestion hover preview must never leak in.
  const snapshot = () => (window.withCommittedState ? window.withCommittedState(() => serializeState(state)) : serializeState(state));
  const snapshotJson = () => JSON.stringify(snapshot());
  const isDirty = () => !!current && snapshotJson() !== baseline;
  const currentName = () => effectiveContent().brandName;

  function setView(view) {
    document.body.dataset.view = view;
    window.scrollTo(0, 0);
    const side = document.querySelector('.sidebar');
    if (side) side.scrollTop = 0;
  }

  function resetState() {
    state.typography = defaultTypography();
    state.locks = { typography: false, color: false, shape: false, aesthetic: false };
    state.aesthetic = 'soft-form';
    state.logoImg = null;
    state.logoDataUrl = null;
    state.bgMode = 'light';
    state.dismissed = [];
    state.patterns = [];
  }

  function syncLogoUi() {
    const row = $('logoPreviewRow');
    if (state.logoDataUrl) {
      $('logoPreview').src = state.logoDataUrl;
      row.hidden = false;
    } else {
      row.hidden = true;
      $('logoInput').value = '';
    }
  }

  async function loadInto(saved) {
    resetState();
    await applySavedSessionToState(saved, state);
    syncLogoUi();
  }

  /* ---------- persistence of the record ---------- */

  function persist() { return LibraryStore.put(current); }

  function flushDraft() {
    clearTimeout(draftTimer);
    draftTimer = null;
    if (!current) return Promise.resolve();
    if (isDirty()) {
      current.draftState = snapshot();
      return persist();
    }
    if (current.draftState) {
      current.draftState = null;
      return persist();
    }
    return Promise.resolve();
  }
  function scheduleDraft() {
    clearTimeout(draftTimer);
    draftTimer = setTimeout(flushDraft, DRAFT_DELAY_MS);
  }

  /* ---------- editor chrome ---------- */

  function updateChrome() {
    if (!current) return;
    const dirty = isDirty();
    $('brandBarName').textContent = currentName();
    const status = $('saveStatus');
    status.classList.toggle('is-dirty', dirty);
    status.innerHTML = dirty ? '<i class="save-dot" aria-hidden="true"></i>Unsaved changes' : 'Saved';
    $('saveBrand').disabled = !dirty;
    $('revertBrand').disabled = !dirty;
    $('draftNote').hidden = !(dirty && restoredDraft);
  }

  /* ---------- actions ---------- */

  async function openBrand(id) {
    const rec = await LibraryStore.get(id);
    if (!rec) return;
    current = null;
    await loadInto(rec.savedState);
    baseline = snapshotJson();
    restoredDraft = false;
    if (rec.draftState) {
      await loadInto(rec.draftState);
      restoredDraft = snapshotJson() !== baseline;
      if (!restoredDraft) rec.draftState = null;
    }
    current = rec;
    undoStack.length = 0;
    if (window.resetSuggestionContext) window.resetSuggestionContext();
    setView('editor');
    render();
  }

  async function saveBrand() {
    if (!current) return;
    clearTimeout(draftTimer);
    const s = snapshot();
    current.savedState = s;
    current.draftState = null;
    current.name = currentName();
    current.updatedAt = Date.now();
    baseline = JSON.stringify(s);
    restoredDraft = false;
    updateChrome();
    try {
      await persist();
      showToast('Saved');
    } catch (e) {
      showToast('Could not save this brand');
    }
  }

  async function revertBrand() {
    if (!current || !isDirty()) return;
    clearTimeout(draftTimer);
    await loadInto(current.savedState);
    current.draftState = null;
    restoredDraft = false;
    undoStack.length = 0;
    await persist();
    render();
    showToast('Reverted to saved');
  }

  async function saveAsNew() {
    if (!current) return;
    const name = await Dialogs.prompt({
      title: 'Save as new brand',
      label: 'Brand name',
      value: `${currentName()} copy`,
      confirm: 'Save copy',
    });
    if (!name) return;
    clearTimeout(draftTimer);
    state.content.brandName = name;
    const now = Date.now();
    const rec = {
      id: LibraryStore.newId(), name, createdAt: now, updatedAt: now,
      savedState: snapshot(), draftState: null,
    };
    await LibraryStore.put(rec);
    // The fork takes the edits with it; the original keeps what it had saved.
    current.draftState = null;
    await LibraryStore.put(current);
    current = rec;
    baseline = snapshotJson();
    restoredDraft = false;
    render();
    showToast('Saved as a new brand');
  }

  async function createBrand(name, tagline) {
    current = null;
    resetState();
    randomizeTypography();
    randomizeColor();
    randomizeShape();
    state.content = Object.assign({}, CONTENT_DEFAULTS, { brandName: name, tagline });
    syncLogoUi();
    const now = Date.now();
    const rec = {
      id: LibraryStore.newId(), name, createdAt: now, updatedAt: now,
      savedState: snapshot(), draftState: null,
    };
    await LibraryStore.put(rec);
    await openBrand(rec.id);
  }

  async function backToLibrary() {
    if (!current) return true;
    if (isDirty()) {
      const choice = await Dialogs.choose({
        title: `Save changes to “${currentName()}”?`,
        message: 'Your edits will be lost if you don’t save them.',
        buttons: [
          { id: 'save', label: 'Save', primary: true },
          { id: 'discard', label: 'Don’t save' },
          { id: 'cancel', label: 'Cancel' },
        ],
      });
      if (choice === 'cancel' || !choice) return false;
      if (choice === 'save') await saveBrand();
      else {
        clearTimeout(draftTimer);
        current.draftState = null;
        await persist();
      }
    } else {
      await flushDraft();
    }
    current = null;
    setView('library');
    await LibraryUI.refresh();
    return true;
  }

  /* ---------- wiring ---------- */

  function wire() {
    const undoBtn = $('undoShuffle');

    // Every render keeps the save state honest and queues a draft write.
    const originalRender = render;
    render = function () {
      originalRender();
      if (current) { updateChrome(); scheduleDraft(); }
      if (window.renderSuggestions) window.renderSuggestions();
      undoBtn.disabled = !canUndo();
    };

    // undo-history.js only snapshots fonts, colors, shape and typography.
    // Selecting an aesthetic also changes the aesthetic itself and bgMode, so
    // both ride along on every snapshot and come back on Undo. So do the
    // pinned patterns (pin / unpin is one undo step).
    const pushBase = window.pushUndoSnapshot;
    window.pushUndoSnapshot = function (st, withTypography) {
      pushBase(st, withTypography);
      const snap = undoStack[undoStack.length - 1];
      if (snap) { snap.aesthetic = st.aesthetic; snap.bgMode = st.bgMode; snap.patterns = (st.patterns || []).slice(); }
    };
    const applyBase = window.applyUndoSnapshot;
    window.applyUndoSnapshot = function (snap, st) {
      applyBase(snap, st);
      if (!snap) return;
      if (snap.aesthetic) st.aesthetic = snap.aesthetic;
      if (snap.bgMode) st.bgMode = snap.bgMode;
      if (snap.patterns) st.patterns = snap.patterns.slice();
    };

    // Snapshot before each shuffle so Undo has something to go back to.
    ['Typography', 'Color', 'Shape', 'Aesthetic'].forEach(part => {
      const name = 'randomize' + part;
      const original = window[name];
      window[name] = function () { pushUndoSnapshot(state); original(); };
    });

    undoBtn.addEventListener('click', () => {
      if (!canUndo()) { showToast('Nothing to undo'); return; }
      applyUndoSnapshot(popUndoSnapshot(), state);
      render();
    });

    $('saveBrand').addEventListener('click', saveBrand);
    $('revertBrand').addEventListener('click', revertBrand);
    $('draftNoteRevert').addEventListener('click', revertBrand);
    $('backToLibrary').addEventListener('click', backToLibrary);
    $('saveAsNewBrand').addEventListener('click', saveAsNew);

    // Browsers get Cmd/Ctrl+S; in the Mac app the File menu owns the shortcut.
    const nativeShell = !!(window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.library);
    document.addEventListener('keydown', e => {
      if (nativeShell || !(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 's') return;
      e.preventDefault();
      window.BD.menu(e.shiftKey ? 'saveAs' : 'save');
    });

    // Last chance to get a pending draft onto disk.
    window.addEventListener('pagehide', () => { flushDraft(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) flushDraft(); });
  }

  window.BD = {
    // Called by the Mac File menu and the keyboard shortcuts.
    menu(cmd) {
      const editing = document.body.dataset.view === 'editor';
      if (cmd === 'new') {
        // Leaving an open brand behind: honour the unsaved-changes prompt first.
        if (editing) return backToLibrary().then(left => { if (left) LibraryUI.newBrandFlow(); });
        return LibraryUI.newBrandFlow();
      }
      if (!editing) return;
      if (cmd === 'save') return saveBrand();
      if (cmd === 'saveAs') return saveAsNew();
      if (cmd === 'revert') return revertBrand();
      if (cmd === 'library') return backToLibrary();
    },
    flushDrafts: flushDraft,
  };
  window.__flush = flushDraft;

  return { wire, openBrand, createBrand, backToLibrary, isDirty, saveBrand };
})();
