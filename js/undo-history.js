/* ---------------------------------------------------------------------
   undo-history.js — Simple bounded undo stack for shuffleable design fields.
------------------------------------------------------------------------ */

// A small undo stack that remembers the design state (fonts, colors,
// typography) before each shuffle. This allows users to "undo" back to the combo
// they had right before their last randomize action. The stack is capped at
// UNDO_STACK_LIMIT entries to prevent unbounded memory growth.

const UNDO_STACK_LIMIT = 15;
let undoStack = [];

function pushUndoSnapshot(state, withTypography) {
  undoStack.push({
    headingFont: state.headingFont,
    bodyFont: state.bodyFont,
    scheme: state.scheme,
    hue: state.hue,
    colors: { ...state.colors },
    typography: withTypography ? { ...state.typography } : null,
  });

  if (undoStack.length > UNDO_STACK_LIMIT) {
    undoStack.shift();
  }
}

function popUndoSnapshot() {
  const snapshot = undoStack.pop();
  return snapshot || null;
}

function canUndo() {
  return undoStack.length > 0;
}

function applyUndoSnapshot(snapshot, state) {
  if (!snapshot) {
    return;
  }

  state.headingFont = snapshot.headingFont;
  state.bodyFont = snapshot.bodyFont;
  state.scheme = snapshot.scheme;
  state.hue = snapshot.hue;
  state.colors = { ...snapshot.colors };
  if (snapshot.typography) state.typography = { ...snapshot.typography };
}
