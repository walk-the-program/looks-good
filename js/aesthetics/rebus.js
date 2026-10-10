/* 26 Rebus — playful, symbolic, clever. Reference: AIGA Eye on Design's "Nouveau
   Rebus" (dingbat-like pictograms standing in for words) and Paul Rand's IBM
   eye-bee-M poster.

   Mechanism. A small dictionary (RB_DICT) maps words to flat SVG pictograms drawn on a
   24-unit grid (RB_SYM; no emoji, no outlines). The headline is rendered inside the art
   (the framework's headline is one text run): the last word becomes a symbol when it has
   one, set on an accent disc, plus the best non-adjacent mapped word as a symbol in the
   brand colours; the real <h2> stays in the DOM, visually hidden, so every replaced word
   is still read. A tagline with no match gets one symbol placed between its middle words.
   The art below it is the brand name as an equation (symbol + remaining letters = name,
   or initial + the tagline's symbol = name when no symbol hides in the name), then the
   dictionary legend. Components carry the same pictograms (icons in tabs, symbol avatars
   in the list, a symbol per palette role, the arrow in the CTA), baked into CSS custom
   properties as data URIs by tokens() so colours follow the brand and PNG export works. */

// ---- pictograms: inner SVG for a 24x24 box; a = main colour, b = detail, k = ink ----
const RB_SYM = {
  heart: ({ a }) => `<path d="M12 21.4C5.4 16.5 2 12.8 2 8.6 2 5.5 4.4 3.2 7.3 3.2c1.9 0 3.6 1 4.7 2.7 1.1-1.7 2.8-2.7 4.7-2.7 2.9 0 5.3 2.3 5.3 5.4 0 4.2-3.400 7.900-10 12.800z" fill="${a}"/>`,
  star: ({ a }) => `<path d="M12 1.8l2.9 6.600 7.100.7-5.400 4.700 1.600 7-6.200-3.700-6.200 3.700 1.600-7L2 9.100l7.100-.7z" fill="${a}" stroke="${a}" stroke-width="1.400" stroke-linejoin="round"/>`,
  sun: ({ a, k }) => {
    const rays = Array.from({ length: 8 }, (_, i) => {
      const r = i * Math.PI / 4, c = Math.cos(r), s = Math.sin(r);
      return `<path d="M${(12 + c * 8.6).toFixed(2)} ${(12 + s * 8.6).toFixed(2)}L${(12 + c * 11).toFixed(2)} ${(12 + s * 11).toFixed(2)}" stroke="${k}" stroke-width="2.600" stroke-linecap="round"/>`;
    }).join('');
    return `<circle cx="12" cy="12" r="5.600" fill="${a}"/>${rays}`;
  },
  eye: ({ a, b, k }) => `<path d="M1.200 12C4.400 6.300 8 4.400 12 4.400s7.600 1.900 10.800 7.600c-3.200 5.700-6.800 7.600-10.800 7.600S4.400 17.700 1.200 12z" fill="${k}"/><circle cx="12" cy="12" r="5.200" fill="${a}"/><circle cx="12" cy="12" r="2.400" fill="${k}"/><circle cx="13.200" cy="10.800" r="1" fill="${b}"/>`,
  arrow: ({ a }) => `<path d="M2.500 9.200h10V3.800L22 12l-9.500 8.200v-5.400h-10z" fill="${a}" stroke="${a}" stroke-width="1" stroke-linejoin="round"/>`,
  key: ({ a }) => `<path fill-rule="evenodd" d="M7.600 5.800a6.200 6.200 0 1 0 5.600 8.800H15v3.200h3v-3.200h1.800v2.800h3V10.600h-9.600A6.200 6.200 0 0 0 7.600 5.800zm-1.600 4a2.300 2.300 0 1 1 0 4.600 2.300 2.300 0 0 1 0-4.600z" fill="${a}"/>`,
  plant: ({ a, b, k }) => `<rect x="10.800" y="9" width="2.400" height="13" rx="1.200" fill="${k}"/><path d="M12 14.200C12 9.200 8.800 5.600 2.600 5.600 2.600 10.600 5.800 14.200 12 14.200z" fill="${a}"/><path d="M12 11C12 6.400 14.600 3 21.400 3 21.400 7.600 18.800 11 12 11z" fill="${b}"/>`,
  bolt: ({ a }) => `<path d="M14.200 1.200L3.800 13.600h6.400l-1.800 9.200 11.800-13.400h-6.800z" fill="${a}" stroke="${a}" stroke-width="1" stroke-linejoin="round"/>`,
  home: ({ a, b }) => `<path d="M12 2L1.200 11.800l1.800 2L4.600 12.400V21.800H9.800v-6.200h4.400v6.200h5.200V12.400l1.600 1.400 1.800-2z" fill="${a}"/><rect x="16.600" y="3.600" width="2.800" height="5" fill="${b}"/>`,
  pencil: ({ a, b, k }) => `<g transform="rotate(45 12 12)"><rect x="8.800" y="0.600" width="6.400" height="15.600" rx="1.200" fill="${a}"/><rect x="8.800" y="0.600" width="6.400" height="3.800" rx="1.200" fill="${b}"/><path d="M8.800 16.200h6.400L12 23.400z" fill="${k}"/></g>`,
  cup: ({ a, b, k }) => `<path d="M3 8.400h13.400v6.200a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z" fill="${a}"/><path d="M16.400 9.800h1.600a3.200 3.200 0 0 1 0 6.400h-1.600" fill="none" stroke="${a}" stroke-width="2.400"/><path d="M7 5.600c-1.200-1.400 1.200-2.200 0-3.800M11.600 5.600c-1.200-1.400 1.200-2.200 0-3.800" fill="none" stroke="${b}" stroke-width="1.800" stroke-linecap="round"/><rect x="1.400" y="20.600" width="17" height="2.200" rx="1.100" fill="${k}"/>`,
  moon: ({ a }) => `<path d="M20.600 14.800A9.200 9.200 0 1 1 9.400 3.200a7.400 7.400 0 0 0 11.200 11.600z" fill="${a}"/>`,
  check: ({ a, k }) => `<circle cx="12" cy="12" r="10.600" fill="${a}"/><path d="M7 12.600l3.200 3.200L17 8.800" fill="none" stroke="${k}" stroke-width="2.800" stroke-linecap="round" stroke-linejoin="round"/>`,
};

// word -> symbol. Inflections are handled by rbStem; the pairs from the brief come first.
const RB_DICT = {};
[
  ['eye', 'eye eyes i see vision look watch'],
  ['heart', 'heart love feel feeling care passion kind kindness'],
  ['sun', 'sun day alive light bright morning shine warm sunny summer'],
  ['star', 'star good best great top quality premium favorite favourite'],
  ['arrow', 'arrow go next forward direct move ahead way path'],
  ['key', 'key access unlock open secret answer'],
  ['plant', 'plant grow growth fresh green organic natural garden bloom'],
  ['bolt', 'bolt power fast quick energy electric speed charge instant busy'],
  ['home', 'home house family stay local shelter'],
  ['pencil', 'pencil design draw write sketch create craft make'],
  ['cup', 'coffee tea cup drink brew cafe mug'],
  ['moon', 'moon night dream sleep evening rest'],
  ['check', 'check done yes right true trust'],
].forEach(([sym, words]) => words.split(' ').forEach(w => { RB_DICT[w] = sym; }));

// which mapped word wins when only one of several can be replaced
const RB_PRIORITY = { pencil: 6, heart: 6, cup: 5, star: 4, plant: 4, key: 4, bolt: 4, home: 4, moon: 3, eye: 3, arrow: 3, sun: 2, check: 2 };
// short prefixes searched for inside the brand name (Sunrise, Keystone, Homebase ...)
const RB_NAME_KEYS = ['heart', 'pencil', 'plant', 'bolt', 'moon', 'star', 'sun', 'key', 'eye', 'home', 'cup'];
const RB_LEGEND = [['eye', 'I'], ['heart', 'love'], ['sun', 'day'], ['star', 'best'], ['arrow', 'next'], ['key', 'key'], ['plant', 'grow'], ['bolt', 'fast']];

function rbStem(w) {
  const x = String(w).toLowerCase().replace(/[^a-z]/g, '');
  if (RB_DICT[x]) return RB_DICT[x];
  for (const suf of ['ing', 'es', 's', 'ed', 'ly', 'ness']) {
    if (x.length > suf.length + 2 && x.endsWith(suf)) {
      const st = x.slice(0, -suf.length);
      if (RB_DICT[st]) return RB_DICT[st];
      if (RB_DICT[st + 'e']) return RB_DICT[st + 'e'];
    }
  }
  return null;
}

function rbSvg(name, colors, cls) {
  const f = RB_SYM[name] || RB_SYM.star;
  return `<svg class="${cls || 'rb-sym'}" viewBox="0 0 24 24" focusable="false" aria-hidden="true">${f(colors)}</svg>`;
}

// data URI (single-quote safe) for use in a CSS custom property
function rbUri(name, colors) {
  const f = RB_SYM[name] || RB_SYM.star;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${f(colors)}</svg>`;
  return `url('data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, '%27')}')`;
}

function rbHash(str) {
  let h = 2166136261;
  for (const ch of String(str)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// Split the tagline into word records and decide which become symbols.
function rbPlan(tagline) {
  const words = String(tagline || '').trim().split(/\s+/).filter(Boolean).map(w => {
    const m = w.match(/^([\s\S]*?)([.,;:!?…]*)$/);
    return { raw: m[1], punct: m[2], sym: rbStem(m[1]) };
  });
  const n = words.length;
  const chosen = new Set();
  const last = n - 1;
  if (n && words[last].sym) chosen.add(last);
  const rest = words.map((w, i) => ({ i, p: w.sym ? RB_PRIORITY[w.sym] || 1 : 0 }))
    .filter(c => c.p && !chosen.has(c.i))
    .sort((a, b) => b.p - a.p || b.i - a.i);
  const slots = chosen.size ? 1 : 2;
  for (const c of rest) {
    if (chosen.size >= (chosen.has(last) ? 2 : slots)) break;
    if ([...chosen].some(j => Math.abs(j - c.i) < 2)) continue;
    chosen.add(c.i);
  }
  // no mapped word at all: one symbol between the middle words
  const sepAfter = chosen.size === 0 && n > 1 ? Math.max(0, Math.ceil(n / 2) - 1) : -1;
  return { words, chosen, last, sepAfter };
}

function rbHeadline(tagline, t, seed) {
  const plan = rbPlan(tagline);
  const body = { primary: t.primary, secondary: t.secondary };
  let k = 0;
  const parts = plan.words.map((w, i) => {
    const hl = i === plan.last;
    let html;
    if (plan.chosen.has(i)) {
      if (hl) {
        html = `<span class="rb-w rb-hlsym">${rbSvg(w.sym, { a: t.onAccent, b: t.accent, k: t.onAccent }, 'rb-sym')}</span>`;
      } else {
        const a = k++ === 0 ? t.primary : t.secondary;
        html = `<span class="rb-w rb-s">${rbSvg(w.sym, { a, b: t.secondary === a ? t.primary : t.secondary, k: t.ink }, 'rb-sym')}</span>`;
      }
    } else {
      html = `<span class="rb-w${hl ? ' rb-hl' : ''}">${escapeHtml(w.raw)}</span>`;
    }
    const punct = w.punct ? `<span class="rb-p">${escapeHtml(w.punct)}</span>` : '';
    let out = html + punct;
    if (i === plan.sepAfter) {
      const names = ['star', 'bolt', 'heart', 'arrow', 'sun'];
      out += ` <span class="rb-w rb-s rb-sep">${rbSvg(names[seed % names.length], { a: t.primary, b: t.secondary, k: t.ink }, 'rb-sym')}</span>`;
    }
    return out;
  });
  return { html: parts.join(' '), plan, body };
}

// Brand name equation: [symbol][rest of word] = name, or [initial][symbol] = name.
function rbEquation(ctx, plan) {
  const t = ctx.t;
  const name = String(ctx.brandName || '').trim();
  const words = name.split(/\s+/).filter(Boolean);
  const lower = (words[0] || '').toLowerCase().replace(/[^a-z]/g, '');
  let key = null;
  for (const k of RB_NAME_KEYS) if (lower.startsWith(k) && lower.length >= k.length + 2) { key = k; break; }
  const e = escapeHtml;
  const tile = (cls, inner) => `<span class="rb-eq-t ${cls}">${inner}</span>`;
  const nameTile = tile('rb-eq-name', `<b>${e(name)}</b>`);
  let a, b, capHtml;
  if (key) {
    const rest = words[0].slice(key.length);
    a = tile('rb-eq-sym', rbSvg(key, { a: t.onSecondary, b: t.secondary, k: t.onSecondary }, 'rb-eq-svg'));
    b = tile('rb-eq-txt', `<b>${e(rest.toLowerCase())}</b>`);
    // a true phonetic rebus: the syllable key + the rest of the word really do say the name
    capHtml = `read it aloud: ${e(key)} + ${e(rest.toLowerCase())} = ${e(name)}`;
  } else {
    // the idea of the tagline: its last word's symbol, else the first mapped word's, else a stable pick
    const hit = plan && ((plan.words[plan.last] && plan.words[plan.last].sym) ? plan.words[plan.last] : plan.words.find(w => w.sym));
    const sym = (hit && hit.sym) || ['star', 'sun', 'bolt', 'heart'][rbHash(name) % 4];
    a = tile('rb-eq-init', `<b>${e(ctx.initial)}</b>`);
    b = tile('rb-eq-sym', rbSvg(sym, { a: t.onSecondary, b: t.secondary, k: t.onSecondary }, 'rb-eq-svg'));
    // no syllable key: this is a mark (initial + symbol), not a phonetic reading, so the caption does not claim one
    capHtml = `the mark: ${e(ctx.initial)} + ${e(sym)}`;
  }
  return `<div class="rb-eq" role="presentation"><div class="rb-eq-row">${a}<i class="rb-op">+</i>${b}<i class="rb-op">=</i>${nameTile}</div><p class="rb-eq-cap">${capHtml}</p></div>`;
}

function rbLegend(t) {
  const cols = [t.ink, t.primary, t.secondary];
  const one = (s, i) => {
    const a = s === 'eye' ? t.primary : cols[i % 3];
    return rbSvg(s, { a, b: s === 'eye' ? t.canvas : (a === t.secondary ? t.primary : t.secondary), k: t.ink }, 'rb-lg');
  };
  return `<ul class="rb-legend">${RB_LEGEND.map(([s, w], i) => `<li>${one(s, i)}<span>${escapeHtml(w)}</span></li>`).join('')}</ul>`;
}

registerAesthetic({
  key: 'rebus', order: 26,
  name: 'Rebus',
  descriptor: 'Playful · Symbolic · Clever',
  influences: 'Rebus puzzles / Paul Rand\'s IBM eye-bee-M / Nouveau Rebus branding',
  summary: 'Bold flat pictograms stand in for words, so the headline reads as a picture puzzle.',
  motto: 'Say it with a picture.',
  kicker: 'Read it aloud',
  mode: 'light',
  slideShape: 'soft',
  labels: { material: 'Symbols', states: ['Word', 'Mixed', 'Symbol'], statesKind: 'swatch' },
  layout: { hero: 'centered', palette: 'swatches', sections: 'two-col', subcopy: false },
  deck: { materialStage: 'pattern' },
  type: { ui: 'body', label: 'body' },
  highlight: 'custom',
  highlightNote: 'The last word is replaced by its pictogram on a flat accent disc (glyph in the on-accent colour); when it has no symbol it stays a word in the accent (shaded to read as text). The replaced word stays in visually-hidden text.',
  cardFill: '--ab-tile',

  roles: {
    canvas: { use: 'The page, and the quiet ground the symbols sit on', never: 'Text' },
    ink: { use: 'Headline words, body text, the result tile of the equation and the detail strokes inside symbols', never: 'Large filled fields other than the one result tile' },
    primary: { use: 'The one CTA, the selected tab, the "on" switch, one symbol in the headline and the initial tile of the equation', never: 'Body text, borders, more than one CTA, whole panels' },
    secondary: { use: 'Support: status pills, list avatars, the symbol tile of the equation, the second symbol colour', never: 'The main CTA, body text, the page background' },
    accent: { use: 'One spark: the disc behind the last headline word\'s symbol, and the footer star', never: 'Buttons, body text, borders, large fills' },
  },

  tokens(t) {
    const st = typeof state !== 'undefined' ? state : null;
    const hf = st && st.headingFont;
    const vars = {
      '--ab-type-pick-w': 800,
      '--ab-tile': t.mix(t.canvas, t.ink, t.isDark ? 0.93 : 0.94),
      '--ab-tile2': t.secTint,
      '--ab-tr': (hf && { condensed: 0, heavy: 0, wide: 0.4, techno: 0.4 }[hf.cls]) ?? 1,
    };
    if (hf) {
      const have = String(hf.weights || '400').split(';').map(Number).filter(Boolean);
      const under = have.filter(w => w <= 800);
      vars['--rb-hw'] = under.length ? Math.max(...under) : Math.max(...have);
    }
    // icons for components, colours baked in (custom properties hold data URIs)
    const ic = (name, a, b, k) => rbUri(name, { a, b: b || a, k: k || a });
    vars['--rb-i-pencil'] = ic('pencil', t.muted, t.muted, t.muted);
    vars['--rb-i-home'] = ic('home', t.muted, t.muted);
    vars['--rb-i-arrow'] = ic('arrow', t.muted);
    vars['--rb-i-pencil-on'] = ic('pencil', t.onPrimary, t.onPrimary, t.onPrimary);
    vars['--rb-i-home-on'] = ic('home', t.onPrimary, t.onPrimary);
    vars['--rb-i-arrow-on'] = ic('arrow', t.onPrimary);
    vars['--rb-i-cta'] = ic('arrow', t.onPrimary);
    vars['--rb-i-eye'] = ic('eye', t.primary, t.canvas, t.ink);
    vars['--rb-i-moon'] = ic('moon', t.muted);
    vars['--rb-i-heart'] = ic('heart', t.primary);
    vars['--rb-i-star-acc'] = ic('star', t.accentInk);
    vars['--rb-c-canvas'] = ic('home', t.ink, t.ink);
    vars['--rb-c-ink'] = ic('pencil', t.canvas, t.canvas, t.canvas);
    vars['--rb-c-primary'] = ic('arrow', t.onPrimary);
    vars['--rb-c-secondary'] = ic('heart', t.onSecondary);
    vars['--rb-c-accent'] = ic('star', t.onAccent);
    vars['--rb-a-pencil'] = ic('pencil', t.ink, t.secondary, t.ink);
    vars['--rb-a-arrow'] = ic('arrow', t.ink);
    vars['--rb-a-plant'] = ic('plant', t.ink, t.secondary, t.ink);
    vars['--rb-r-pencil'] = ic('pencil', t.primary, t.secondary, t.ink);
    vars['--rb-r-eye'] = ic('eye', t.secondary, t.canvas, t.ink);
    vars['--rb-r-bolt'] = ic('bolt', t.secondary);
    return vars;
  },

  art(ctx) {
    const t = ctx.t;
    const { html, plan } = rbHeadline(ctx.tagline, t, rbHash(ctx.brandName));
    return `<div class="rb">
      <p class="rb-hl-row">${html}</p>
      ${rbEquation(ctx, plan)}
      ${rbLegend(t)}
    </div>`;
  },

  materials: [
    { name: 'Pictogram', css: 'flat SVG on a 24-unit grid; fill: {primary}, {secondary} or {ink}; detail strokes in {ink}; no outlines, no gradients, no emoji. Height 0.8em, sitting on the baseline of the headline.' },
    { name: 'Highlight symbol', css: 'background: {accent}; border-radius: 50%; width: 1.05em; height: 1.05em; /* the last word as a pictogram drawn in {onAccent}; the word stays in visually-hidden text */' },
    { name: 'Symbol tile', css: 'background: {secTint}; border-radius: 22px; box-shadow: none; /* flat colour block; equation tiles use {primary}, {secondary} and {ink} fills */' },
    { name: 'Primary action', css: 'background: {primary}; color: {onPrimary}; border-radius: 999px; padding: 15px 22px; /* ends in a flat arrow pictogram in {onPrimary} */' },
    { name: 'Selected tab', css: 'background: {primary}; color: {onPrimary}; border-radius: 999px; /* leads with a pictogram in {onPrimary}; unselected tabs show it in {muted} */' },
    { name: 'Switch', css: 'track: {line} (off) or {primary} (on); border-radius: 999px; knob: {canvas} circle holding an eye (on) or a moon (off).' },
    { name: 'List avatar', css: 'background: {secTint}; border-radius: 50%; width: 40px; height: 40px; /* holds a pictogram in {ink} and {secondary} */' },
  ],

  rules: {
    do: [
      'Replace the last headline word with its pictogram on an accent disc, and one other mapped word with a brand-colour pictogram; keep every replaced word in visually-hidden text.',
      'Draw pictograms flat on a 24-unit grid at the weight of the heavy sans, sitting on the baseline at about cap height.',
      'Put a pictogram wherever a control would carry an icon: tab leaders, list avatars, palette chips, the CTA arrow, the switch knob.',
      'Set the headline in a heavy friendly sans with generous spacing, and read the brand name as an equation.',
    ],
    dont: [
      'Use emoji, outlined clip-art or gradients as symbols.',
      'Replace more than two words, or two neighbouring words, in one headline; it stops reading as a puzzle.',
      'Fill panels with primary or accent, or put text on the accent disc.',
      'Use a hairline, didone or pixel face; the words must carry the same weight as the symbols.',
    ],
  },
});
