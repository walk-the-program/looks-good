/* ---------------------------------------------------------------------
   color-import.js — pure parsing for "Paste brand colors".

   extractColors(text)  -> [{ hex, hints, line }]   colors in reading order
   assignRoles(colors, current) -> { roles, unused }

   No DOM here. Depends on hexToHsl() from color.js. The review UI lives in
   color-picker.js.
------------------------------------------------------------------------ */

const IMPORT_ROLE_KEYS = ['primary', 'secondary', 'accent', 'neutralDark', 'neutralLight'];

// Label word -> role. 'cta' is resolved later: accent if a primary is already
// labeled somewhere in the text, otherwise primary.
const IMPORT_LABEL_WORDS = {
  primary: 'primary', brand: 'primary', main: 'primary', hero: 'primary',
  secondary: 'secondary', support: 'secondary',
  accent: 'accent', highlight: 'accent', pop: 'accent', cta: 'cta',
  dark: 'neutralDark', ink: 'neutralDark', text: 'neutralDark', black: 'neutralDark',
  charcoal: 'neutralDark', navy: 'neutralDark', night: 'neutralDark',
  light: 'neutralLight', background: 'neutralLight', bg: 'neutralLight', surface: 'neutralLight',
  white: 'neutralLight', cream: 'neutralLight', paper: 'neutralLight', canvas: 'neutralLight',
  'off-white': 'neutralLight', offwhite: 'neutralLight',
};

// #rgb / #rrggbb / #rrggbbaa, rgb()/rgba(), and bare "R G B" only after "RGB".
const IMPORT_COLOR_RE = new RegExp(
  '#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3})(?![0-9a-z])' +
  '|rgba?\\(\\s*(\\d{1,3})\\s*[,\\s]\\s*(\\d{1,3})\\s*[,\\s]\\s*(\\d{1,3})\\s*(?:[,/]\\s*[\\d.]+%?\\s*)?\\)' +
  '|\\brgb[\\s:=]+(\\d{1,3})[\\s,]+(\\d{1,3})[\\s,]+(\\d{1,3})(?!\\d)',
  'gi'
);

function importChannelHex(n) {
  return Math.max(0, Math.min(255, parseInt(n, 10))).toString(16).padStart(2, '0');
}

function importHexFromMatch(m) {
  if (m[1]) {
    let h = m[1].toLowerCase();
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    return '#' + h.slice(0, 6);                    // alpha dropped
  }
  const [r, g, b] = m[2] !== undefined ? [m[2], m[3], m[4]] : [m[5], m[6], m[7]];
  return '#' + importChannelHex(r) + importChannelHex(g) + importChannelHex(b);
}

function importHintsFrom(segment) {
  const words = (segment.toLowerCase().match(/[a-z][a-z-]*/g) || []).map(w => w.replace(/-+$/, ''));
  return words.filter(w => IMPORT_LABEL_WORDS[w]).map(w => IMPORT_LABEL_WORDS[w]);
}

function extractColors(text) {
  const out = [];
  const byHex = new Map();
  String(text || '').split(/\r?\n/).forEach((line, lineNo) => {
    const matches = Array.from(line.matchAll(IMPORT_COLOR_RE));
    matches.forEach((m, i) => {
      const hex = importHexFromMatch(m);
      const prevEnd = i > 0 ? matches[i - 1].index + matches[i - 1][0].length : 0;
      const nextStart = i + 1 < matches.length ? matches[i + 1].index : line.length;
      // Label words sit before the color ("Primary: #…"); fall back to the
      // words after it ("#… Primary") when nothing precedes it.
      let hints = importHintsFrom(line.slice(prevEnd, m.index));
      if (!hints.length) hints = importHintsFrom(line.slice(m.index + m[0].length, nextStart));
      const seen = byHex.get(hex);
      if (seen) { seen.hints.push(...hints); return; }
      const entry = { hex, hints, line: lineNo };
      byHex.set(hex, entry);
      out.push(entry);
    });
  });
  return out;
}

// Decide which color plays which of the five brand roles.
//   labeled: a label word on the color's line named the role
//   auto:    placed by lightness / saturation
//   kept:    nothing suitable was pasted; the current color stays
// `current` is the brand's present { primary, … } so "kept" has a value.
function assignRoles(colors, current) {
  const list = colors || [];
  const roles = {};
  const used = new Set();
  const take = (role, index, source) => {
    roles[role] = { index, hex: list[index].hex, source };
    used.add(index);
  };

  const primaryLabeled = list.some(c => c.hints[0] === 'primary');
  const resolve = h => (h === 'cta' ? (primaryLabeled ? 'accent' : 'primary') : h);

  // 1. Labeled colors claim their role; the first in reading order wins.
  list.forEach((c, i) => {
    const role = c.hints.map(resolve).find(r => !roles[r]);
    if (role) take(role, i, 'labeled');
  });

  // 2. Unlabeled leftovers: neutrals by lightness, then the rest by saturation.
  const left = () => list.map((c, i) => i).filter(i => !used.has(i));
  const lightness = i => hexToHsl(list[i].hex).l;
  const saturation = i => hexToHsl(list[i].hex).s;

  if (!roles.neutralLight) {
    const lightest = left().sort((a, b) => lightness(b) - lightness(a))[0];
    if (lightest !== undefined && lightness(lightest) >= 85) take('neutralLight', lightest, 'auto');
  }
  if (!roles.neutralDark) {
    const darkest = left().sort((a, b) => lightness(a) - lightness(b))[0];
    if (darkest !== undefined && lightness(darkest) <= 20) take('neutralDark', darkest, 'auto');
  }
  const bySat = left().sort((a, b) => saturation(b) - saturation(a));
  ['primary', 'secondary', 'accent'].forEach(role => {
    if (roles[role] || !bySat.length) return;
    take(role, bySat.shift(), 'auto');
  });

  // 3. Anything still empty keeps the brand's current color.
  IMPORT_ROLE_KEYS.forEach(role => {
    if (!roles[role]) roles[role] = { index: -1, hex: (current && current[role]) || null, source: 'kept' };
  });

  return { roles, unused: left() };
}
