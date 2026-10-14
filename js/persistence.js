/* -----------------------------------------------------------------------
   persistence.js — serialize/restore a brand's design state. (The old
   single-session localStorage autosave is gone; loadSession survives only
   for the one-time import into the library.)
----------------------------------------------------------------------- */

const BRAND_SESSION_KEY = 'brandingDesigner.session.v1';

function serializeState(state) {
  return {
    headingFontName: state.headingFont.name,
    bodyFontName: state.bodyFont.name,
    scheme: state.scheme,
    hue: state.hue,
    colors: { ...state.colors },
    shapePresetKey: state.shapePreset.key,
    bgMode: state.bgMode,
    // Pure #FFFFFF / #000000 ground instead of the style's canvas tint (js/aesthetic-board.js).
    pureBg: state.pureBg === true,
    aestheticKey: state.aesthetic,
    // 'current' | 'classic': which version of the aesthetic renders (js/aesthetics/registry.js).
    aestheticVersion: state.aestheticVersion === 'classic' ? 'classic' : 'current',
    // Blend with a second aesthetic (js/blend.js): null or a copy of
    // { with, strength, channels }. Saved as is even when BLEND_ENABLED is false.
    blend: state.blend && typeof state.blend === 'object'
      ? { with: state.blend.with, strength: state.blend.strength, channels: { ...state.blend.channels } } : null,
    logoDataUrl: state.logoDataUrl,
    content: { ...state.content },
    locks: { ...state.locks },
    // typography is a later addition (size/weight/tracking/case fine-tuning)
    // — guard with a plain object so older saved sessions without it still
    // restore cleanly.
    typography: state.typography ? { ...state.typography } : null,
    // Suggestion ids the user dismissed for this brand.
    dismissedSuggestions: Array.isArray(state.dismissed) ? state.dismissed.slice().sort() : [],
    // Patterns in the brief (js/patterns-ui.js). Entries are immutable
    // { key, params, colorway, seed, use, svg }; brands saved before `use` / `svg`
    // existed have neither and load with the family default.
    patterns: Array.isArray(state.patterns) ? state.patterns.map(p => ({ key: p.key, params: p.params, colorway: p.colorway, seed: p.seed, use: p.use, svg: p.svg })) : [],
  };
}

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(BRAND_SESSION_KEY));
  } catch (e) {
    return null;
  }
}

function applySavedSessionToState(saved, state) {
  if (!saved) {
    return Promise.resolve(false);
  }

  // Restore fonts
  const headingFont = FONTS.find(f => f.name === saved.headingFontName);
  if (headingFont) {
    state.headingFont = headingFont;
  }

  const bodyFont = FONTS.find(f => f.name === saved.bodyFontName);
  if (bodyFont) {
    state.bodyFont = bodyFont;
  }

  // Restore scheme
  if (typeof saved.scheme === 'string' && COLOR_SCHEMES[saved.scheme]) {
    state.scheme = saved.scheme;
  }

  // Restore hue
  if (typeof saved.hue === 'number') {
    state.hue = saved.hue;
  }

  // Restore colors
  // Only a complete, valid palette replaces the defaults; a partial or malformed
  // one would crash the color picker mid-render.
  const HEX = /^#[0-9a-f]{6}$/i;
  const COLOR_KEYS = ['primary', 'secondary', 'accent', 'neutralDark', 'neutralLight'];
  if (saved.colors && typeof saved.colors === 'object' && COLOR_KEYS.every(k => HEX.test(saved.colors[k]))) {
    state.colors = Object.fromEntries(COLOR_KEYS.map(k => [k, saved.colors[k].toLowerCase()]));
  }

  // Restore shape preset. A session saved against a preset that no longer
  // exists (e.g. the retired 'organic' key) falls back to the first preset
  // rather than leaving a dangling reference behind.
  if (typeof saved.shapePresetKey === 'string') {
    state.shapePreset = SHAPE_PRESETS.find(p => p.key === saved.shapePresetKey) || SHAPE_PRESETS[0];
  }

  // Restore bgMode
  if (typeof saved.bgMode === 'string') {
    state.bgMode = saved.bgMode;
  }

  // Restore the pure ground. Brands saved before it existed have no field and load off.
  state.pureBg = saved.pureBg === true;

  // Restore content
  if (saved.content && typeof saved.content === 'object') {
    state.content = { ...saved.content };
  }

  // Restore aesthetic. Brands saved before aesthetics existed (or against a
  // key that no longer exists) keep the default set by resetState().
  if (typeof saved.aestheticKey === 'string' && AESTHETICS.some(a => a.key === saved.aestheticKey)) {
    state.aesthetic = saved.aestheticKey;
  }

  // Restore the version. Brands saved before it existed, or with any other value, load current.
  state.aestheticVersion = saved.aestheticVersion === 'classic' ? 'classic' : 'current';

  // Restore the blend after the aesthetic: unknown donor, a donor equal to the base,
  // or malformed channels load as no blend. Brands saved before blends load with null.
  state.blend = typeof normalizeBlend === 'function' ? normalizeBlend(saved.blend, state.aesthetic) : null;

  // Restore locks. Merged onto the defaults so a brand saved before a lock
  // existed (e.g. aesthetic) still has every key.
  if (saved.locks && typeof saved.locks === 'object') {
    state.locks = Object.assign({ typography: false, color: false, shape: false, aesthetic: false }, saved.locks);
  }

  // Restore typography fine-tuning (size/weight/tracking/case). Merge onto
  // the existing defaults rather than replacing outright, so a saved
  // session from before a given field existed doesn't null it out.
  if (saved.typography && typeof saved.typography === 'object') {
    state.typography = Object.assign({}, state.typography, saved.typography);
  }

  state.dismissed = Array.isArray(saved.dismissedSuggestions) ? saved.dismissedSuggestions.slice() : [];

  // Patterns in the brief. Older brands have none; entries are cleaned against the
  // engine's schema (unknown families dropped, parameters clamped).
  state.patterns = typeof PatternPins !== 'undefined' ? PatternPins.normalizeList(saved.patterns) : [];

  // Restore logo if present
  if (saved.logoDataUrl && typeof saved.logoDataUrl === 'string') {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        state.logoImg = img;
        state.logoDataUrl = saved.logoDataUrl;
        resolve(true);
      };
      img.onerror = () => {
        resolve(true);
      };
      img.src = saved.logoDataUrl;
    });
  }

  return Promise.resolve(true);
}
