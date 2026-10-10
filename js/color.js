/* ---------------------------------------------------------------------
   color.js — color math: HSL<->hex, WCAG contrast, and palette
   generation from a base hue + scheme recipe.
------------------------------------------------------------------------ */

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function rand(min, max) { return min + Math.random() * (max - min); }

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = clamp(s, 0, 100) / 100;
  l = clamp(l, 0, 100) / 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = x => Math.round(255 * x).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

function hexToRgb(hex) {
  const m = hex.replace('#', '');
  const full = m.length === 3 ? m.split('').map(c => c + c).join('') : m;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s; const l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

function hexToHsl(hex) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

// Circular hue distance, 0-180.
function hueDiff(h1, h2) {
  const d = Math.abs(h1 - h2) % 360;
  return d > 180 ? 360 - d : d;
}

function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const chan = c => {
    const cs = c / 255;
    return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
}

function contrastRatio(hexA, hexB) {
  const L1 = relativeLuminance(hexA);
  const L2 = relativeLuminance(hexB);
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}

// Returns whichever of near-white / near-black reads better on bgHex.
function pickReadableText(bgHex) {
  const white = '#ffffff', dark = '#141414';
  return contrastRatio(white, bgHex) >= contrastRatio(dark, bgHex) ? white : dark;
}

// Generate a full palette from a scheme key + base hue (0-360). Used for
// randomize/shuffle, where every color (including primary) is up for grabs.
function generatePalette(schemeKey, hue) {
  const scheme = COLOR_SCHEMES[schemeKey] || COLOR_SCHEMES.analogous;
  const [o0, o1, o2] = scheme.offsets;
  const primary = hslToHex(hue + o0, rand(60, 75), rand(42, 50));
  const secondary = hslToHex(hue + o1, rand(35, 55), rand(55, 64));
  const accent = hslToHex(hue + o2, rand(78, 92), rand(48, 56));
  const neutralDark = hslToHex(hue, 16, 13);
  const neutralLight = hslToHex(hue, 25, 97);
  return { primary, secondary, accent, neutralDark, neutralLight };
}

// Derive secondary/accent/neutral colors from a *fixed* primary color plus
// a scheme's hue-offset recipe, leaving the primary color itself untouched.
// Used when the scheme dropdown changes (keep the current primary, regen
// the rest) and when the primary swatch is edited (regen the rest around
// the new primary). Deterministic (no rand()) so re-picking the same
// primary/scheme combo always lands on the same palette.
//
// Secondary/accent saturation & lightness are offset *relative to the
// primary's own s/l*, not fixed absolute numbers. That matters because
// under schemes like monochromatic (hue offset 0 for everything), the most
// common way someone edits the primary swatch is dragging the picker's
// saturation/lightness square, not the hue slider — hue doesn't move at
// all. Fixed absolute s/l values would make secondary/accent come out
// identical before and after that edit, which looks exactly like "nothing
// updated." Offsetting from the primary's actual s/l means any edit to the
// primary — hue, saturation, or lightness — visibly moves the rest.
function derivePalette(primaryHex, schemeKey) {
  const scheme = COLOR_SCHEMES[schemeKey];
  if (!scheme || !scheme.offsets) {
    throw new Error(`derivePalette: "${schemeKey}" has no offset recipe (custom schemes aren't derived)`);
  }
  const [, o1, o2] = scheme.offsets;
  const { h, s, l } = hexToHsl(primaryHex);
  const secondary = hslToHex(h + o1, clamp(s - 15, 20, 90), clamp(l + 15, 12, 92));
  const accent = hslToHex(h + o2, clamp(s + 10, 20, 100), clamp(l - 5, 8, 90));
  const neutralDark = hslToHex(h, 16, 13);
  const neutralLight = hslToHex(h, 25, 97);
  return { primary: primaryHex, secondary, accent, neutralDark, neutralLight };
}
