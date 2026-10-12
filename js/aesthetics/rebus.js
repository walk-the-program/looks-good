/* 26 Rebus — read it aloud. Reference: Paul Rand's Eye-Bee-M poster (1981) and the
   IBM rebus redraw, Glaser's I ♥ NY, Victorian rebus cards ("May I see you home my
   dear"), the 1592 French rebus sheets and the Nouveau Rebus campaigns.

   Mechanism: sound, never meaning. A picture stands in for a word or syllable only
   when its NAME sounds like it: eye = I, bee = be, sea = see/c, ewe = you, 4 = for,
   8 = ate, a signpost = -sign ("de" + [sign] = design). rbSegment(word) tries, in
   order, a whole-word homophone (RB_WHOLE), then a prefix and / or suffix syllable
   (RB_PRE / RB_SUF), keeping the rest of the word as letters. Words with no sound
   match stay type; there is no synonym fallback, so the puzzle is always honest.
   The brand-name lockup (rbEquation) uses the same engine, then spelling arithmetic
   ([bee] - e + ar = bear) on one word, then a fixed rebus sign-off ("I see you").

   Glyphs (RB_G) are drawn from geometric primitives only (discs, half-discs, bars,
   stripe cuts) on a 24-unit grid, cap height tall. Strokes and cuts use the stem
   width derived from the heading weight (rbStem: weight / 800 * 3.4 units), so the
   pictures carry the letters' own weight. Everything is ink; exactly one glyph per
   view is primary (the Glaser heart rule): the last headline glyph, or the first
   lockup glyph when the headline has none.

   The real <h2 aria-label> (def.headline, framework-wrapped) keeps every word for
   assistive tech. Component pictograms are baked into CSS custom properties as data
   URIs by tokens() so PNG export and brand recolouring work. */
(function () {
'use strict';

// ---- stem width (24-unit grid) from the heading weight ----
// The weight is the shared abWeight(face, 800) (heaviest published weight <= 800; 700 when the
// face lists none); the only rebus rule on top: a 400-only display face (Archivo Black, Anton)
// is heavy by design, so its glyph stems are drawn at 800. `view` is the rendered state
// (tokens(t, state) and ctx.state pass it; a blend swaps the faces); the global is a fallback.
function rbHeadWeight(view) {
  const st = view || (typeof state !== 'undefined' ? state : null);
  const hf = st && st.headingFont;
  const hw = abWeight(hf && hf.weights ? hf : { weights: '700' }, 800);
  return hf && (hf.cls === 'heavy' || hf.cls === 'condensed') && hw < 600 ? 800 : hw;
}
function rbStem(hw) { return Math.max(2, Math.min(4.2, (hw || 700) / 800 * 3.4)); }
const f1 = n => (Math.round(n * 100) / 100).toString();

// ---- glyphs: inner SVG for a W x 24 box; a = fill, g = cut colour (the ground), s = stem ----
const RB_G = {
  eye: { w: 24, say: 'eye', d: (a, g, s) => `<path d="M3 6.6A11 8 0 0 1 21 6.6" fill="none" stroke="${a}" stroke-width="${f1(s * 0.9)}"/>`
    + `<path d="M1 15C5 9.6 8.4 8 12 8S19 9.6 23 15C19 20.4 15.6 22 12 22S5 20.4 1 15Z" fill="${a}"/>`
    + `<circle cx="12" cy="15" r="5.3" fill="${g}"/><circle cx="12" cy="15" r="${f1(Math.max(1.6, 5.3 - s * 0.85))}" fill="${a}"/>` },
  bee: { w: 24, say: 'bee', d: (a, g, s) => `<circle cx="9.7" cy="3.4" r="2.3" fill="${a}"/><circle cx="14.3" cy="3.4" r="2.3" fill="${a}"/>`
    + `<path d="M7.2 9.6L1.2 12.4A3.5 3.5 0 0 0 4.6 18.4L7.2 17.2ZM16.8 9.6L22.8 12.4A3.5 3.5 0 0 1 19.4 18.4L16.8 17.2Z" fill="${a}"/>`
    + `<rect x="7.4" y="7" width="9.2" height="17" rx="4.6" fill="${a}"/>`
    + `<rect x="6" y="${f1(12.4 - s * 0.32)}" width="12" height="${f1(s * 0.64)}" fill="${g}"/><rect x="6" y="${f1(17.4 - s * 0.32)}" width="12" height="${f1(s * 0.64)}" fill="${g}"/>` },
  wave: { w: 24, say: 'sea', d: (a, g, s) => [7, 13.5, 20].map(y => `<path d="M0.5 ${y}q2.875 -4 5.75 0t5.75 0t5.75 0t5.75 0" fill="none" stroke="${a}" stroke-width="${f1(s)}"/>`).join('') },
  ewe: { w: 26, say: 'ewe', d: (a, g, s) => `<rect x="${f1(11.2 - s * 0.38)}" y="16" width="${f1(s * 0.76)}" height="8" fill="${a}"/><rect x="${f1(19.6 - s * 0.38)}" y="16" width="${f1(s * 0.76)}" height="8" fill="${a}"/>`
    + [[11.2, 9.6], [16.6, 8.4], [21.4, 10.6], [10.6, 14.6], [16, 15.6], [21.2, 15]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.4" fill="${a}"/>`).join('')
    + `<ellipse cx="4.2" cy="12.6" rx="3.4" ry="4" fill="${a}"/><rect x="0.6" y="9.2" width="3" height="2" fill="${a}"/><circle cx="3.6" cy="12" r="0.95" fill="${g}"/><rect x="6.6" y="8" width="${f1(Math.max(0.8, s * 0.3))}" height="10" fill="${g}"/>` },
  cup: { w: 24, say: 'tea', d: (a, g, s) => `<path d="M2.4 9.4H18.6V13A8.1 8.1 0 0 1 2.4 13Z" fill="${a}"/>`
    + `<circle cx="19" cy="13.4" r="${f1(3.3 - s * 0.15)}" fill="none" stroke="${a}" stroke-width="${f1(s * 0.7)}"/>`
    + `<rect x="0.6" y="22" width="20" height="2" fill="${a}"/>`
    + `<rect x="${f1(7.4 - s * 0.3)}" y="1.6" width="${f1(s * 0.6)}" height="5" fill="${a}"/><rect x="${f1(13 - s * 0.3)}" y="1.6" width="${f1(s * 0.6)}" height="5" fill="${a}"/>` },
  can: { w: 20, say: 'can', d: (a, g, s) => `<rect x="3.4" y="1" width="13.2" height="2" fill="${a}"/><rect x="2" y="3" width="16" height="21" fill="${a}"/>`
    + `<rect x="2" y="7" width="16" height="${f1(s * 0.42)}" fill="${g}"/><rect x="2" y="${f1(19.6 - s * 0.42)}" width="16" height="${f1(s * 0.42)}" fill="${g}"/>` },
  knot: { w: 24, say: 'knot', d: (a, g, s) => `<circle cx="12" cy="9.2" r="6.4" fill="none" stroke="${a}" stroke-width="${f1(s)}"/>`
    + `<path d="M8.4 14.4L3.4 23.6M15.6 14.4L20.6 23.6" fill="none" stroke="${a}" stroke-width="${f1(s)}"/>` },
  deer: { w: 24, say: 'deer', d: (a, g, s) => `<path d="M6.8 11.6H17.2L13.6 23.4H10.4Z" fill="${a}"/><path d="M6.8 11.6L2 10.4L5.8 15ZM17.2 11.6L22 10.4L18.2 15Z" fill="${a}"/>`
    + `<path d="M9.6 11.6V1.6M9.6 5.4L5.4 2M9.6 8.6H4.4M14.4 11.6V1.6M14.4 5.4L18.6 2M14.4 8.6H19.6" fill="none" stroke="${a}" stroke-width="${f1(s * 0.66)}"/>`
    + `<circle cx="10.3" cy="14.6" r="0.95" fill="${g}"/><circle cx="13.7" cy="14.6" r="0.95" fill="${g}"/>` },
  sun: { w: 24, say: 'sun', d: (a, g, s) => `<circle cx="12" cy="12" r="5.6" fill="${a}"/>`
    + Array.from({ length: 8 }, (_, i) => { const r = i * Math.PI / 4, c = Math.cos(r), n = Math.sin(r); return `<path d="M${f1(12 + c * 8)} ${f1(12 + n * 8)}L${f1(12 + c * 11.6)} ${f1(12 + n * 11.6)}" stroke="${a}" stroke-width="${f1(s * 0.8)}"/>`; }).join('') },
  sign: { w: 24, say: 'sign', d: (a, g, s) => `<rect x="${f1(12 - s * 0.42)}" y="1.6" width="${f1(s * 0.84)}" height="22.4" fill="${a}"/>`
    + `<path d="M2.4 3H18.6L22.6 6.6L18.6 10.2H2.4ZM21.6 13.4H5.4L1.4 17L5.4 20.6H21.6Z" fill="${a}"/>`
    + `<rect x="2.4" y="${f1(6.6 - s * 0.16)}" width="13" height="${f1(Math.max(0.7, s * 0.32))}" fill="${g}"/><rect x="8.6" y="${f1(17 - s * 0.16)}" width="13" height="${f1(Math.max(0.7, s * 0.32))}" fill="${g}"/>` },
  gold: { w: 26, say: 'gold', d: (a, g, s) => `<path d="M0.8 23.6L3 16.2H10.8L13 23.6ZM13.4 23.6L15.6 16.2H23.4L25.6 23.6ZM7.1 14.8L9.3 7.4H16.7L18.9 14.8Z" fill="${a}"/>`
    + `<path d="M3.6 18.6H10.2M16.2 18.6H22.8M9.9 9.8H16.1" stroke="${g}" stroke-width="${f1(Math.max(0.6, s * 0.3))}"/>` },
  horse: { w: 24, say: 'mare', d: (a, g, s) => `<path d="M9.4 24V17.4L5 16.6L1 15.4V11.2L7.4 5.4L8.4 1.4L11 4.4C17.6 4.8 21.8 10.4 22.6 24Z" fill="${a}"/>`
    + `<circle cx="8" cy="9.2" r="1.15" fill="${g}"/><circle cx="2.8" cy="13.2" r="0.75" fill="${g}"/>`
    + `<path d="M12.6 7.4L15.6 4.6M15.4 9.4L18.8 7M17.6 12L21.2 10" stroke="${g}" stroke-width="${f1(Math.max(0.7, s * 0.36))}"/>` },
  stud: { w: 24, say: 'stud', d: (a, g, s) => `<path d="M3 18.4A9 9 0 0 1 21 18.4Z" fill="${a}"/><rect x="1" y="20" width="22" height="${f1(Math.max(2, s * 0.9))}" fill="${a}"/>`
    + `<path d="M7.4 15.2A5 5 0 0 1 11.4 11" fill="none" stroke="${g}" stroke-width="${f1(s * 0.4)}"/>` },
  ant: { w: 26, say: 'ant', d: (a, g, s) => `<ellipse cx="20" cy="15" rx="5.2" ry="4.2" fill="${a}"/><circle cx="12.6" cy="14.2" r="2.7" fill="${a}"/><circle cx="6" cy="12.6" r="3.3" fill="${a}"/>`
    + `<path d="M11.2 15.6L7.6 22M12.8 16L13 23M14.6 15.6L18.6 22M4.8 9.6L2.2 3.6M7 9.4L8.4 3.4" fill="none" stroke="${a}" stroke-width="${f1(Math.max(1.2, s * 0.46))}"/>` },
  ear: { w: 20, say: 'ear', d: (a, g, s) => `<path d="M3.6 9.4A6.8 6.8 0 1 1 14.2 15C12.4 16.4 11.8 18 11.4 20.4A3.6 3.6 0 0 1 4.4 20.6" fill="none" stroke="${a}" stroke-width="${f1(s * 1.05)}"/>`
    + `<path d="M7.6 10A3 3 0 0 1 12.8 10.8" fill="none" stroke="${a}" stroke-width="${f1(s * 0.7)}"/>` },
  knee: { w: 24, say: 'knee', d: (a, g, s) => `<path d="M0.6 8.6H12.6M16 12V21.4H23" fill="none" stroke="${a}" stroke-width="${f1(s * 1.5)}"/><circle cx="14.4" cy="10.2" r="${f1(s * 0.9 + 1.6)}" fill="${a}"/>` },
  tie: { w: 16, say: 'tie', d: (a, g, s) => `<path d="M4.6 1.4H11.4L10.2 6.4H5.8Z" fill="${a}"/><path d="M5.8 7.6H10.2L12.8 19.2L8 23.8L3.2 19.2Z" fill="${a}"/>`
    + `<path d="M2.6 12.6L13.6 9.4M2.6 17.4L13.6 14.2" stroke="${g}" stroke-width="${f1(s * 0.42)}"/>` },
  pen: { w: 18, say: 'pen', d: (a, g, s) => `<path d="M9 23.6L1.8 13V2.4H16.2V13Z" fill="${a}"/><rect x="1.8" y="0.2" width="14.4" height="1.2" fill="${a}"/>`
    + `<path d="M9 23.6V12.4" stroke="${g}" stroke-width="${f1(s * 0.42)}"/><circle cx="9" cy="12" r="1.8" fill="${g}"/>` },
  key: { w: 26, say: 'key', d: (a, g, s) => `<circle cx="6.4" cy="12" r="${f1(5.6 - s / 2)}" fill="none" stroke="${a}" stroke-width="${f1(s)}"/>`
    + `<rect x="11" y="${f1(12 - s / 2)}" width="14.4" height="${f1(s)}" fill="${a}"/><rect x="18.4" y="12" width="${f1(s * 0.8)}" height="6" fill="${a}"/><rect x="${f1(25.4 - s * 0.8)}" y="12" width="${f1(s * 0.8)}" height="7.4" fill="${a}"/>` },
  rose: { w: 22, say: 'rose', d: (a, g, s) => `<rect x="${f1(11 - s * 0.35)}" y="14" width="${f1(s * 0.7)}" height="10" fill="${a}"/><path d="M11 20.6Q15 15.2 20 17Q16 22.6 11 20.6Z" fill="${a}"/>`
    + `<circle cx="11" cy="8.4" r="7.4" fill="${a}"/><path d="M11 4.2A4.2 4.2 0 1 1 6.8 8.4M11 6.6A1.8 1.8 0 1 0 12.8 8.4" fill="none" stroke="${g}" stroke-width="${f1(s * 0.42)}"/>` },
  saw: { w: 28, say: 'saw', d: (a, g, s) => {
    let teeth = 'M8 16';
    for (let x = 8; x < 27; x += 2.4) teeth += `L${f1(x + 1.2)} 18.6L${f1(Math.min(27.4, x + 2.4))} 16`;
    return `<path d="M8 6.6H27.4V16H8Z" fill="${a}"/><path d="${teeth}Z" fill="${a}"/><rect x="0.6" y="4.6" width="8.6" height="13.4" fill="${a}"/><rect x="3" y="8" width="3.8" height="6.4" fill="${g}"/>`;
  } },
  clock: { w: 24, say: 'hour', d: (a, g, s) => `<circle cx="12" cy="13" r="10.6" fill="${a}"/><path d="M12 13.4V5.6M11.6 13H18" fill="none" stroke="${g}" stroke-width="${f1(s * 0.66)}"/>`
    + `<rect x="9" y="0.2" width="6" height="${f1(Math.max(1.4, s * 0.5))}" fill="${a}"/>` },
  eel: { w: 28, say: 'eel', d: (a, g, s) => `<path d="M1.6 16.4C5 8.6 9 8.6 12.4 14.2S20 20 23.4 12.8" fill="none" stroke="${a}" stroke-width="${f1(s * 1.5)}" stroke-linecap="round"/>`
    + `<ellipse cx="24.4" cy="11.4" rx="3.4" ry="2.9" fill="${a}"/><circle cx="25.2" cy="10.6" r="0.85" fill="${g}"/>` },
  ink: { w: 20, say: 'ink', d: (a, g, s) => `<rect x="7" y="1.4" width="6" height="4.6" fill="${a}"/><path d="M5.4 6H14.6L17.6 10V24H2.4V10Z" fill="${a}"/>`
    + `<rect x="2.4" y="13.4" width="15.2" height="${f1(Math.max(2.4, s))}" fill="${g}"/>` },
  ring: { w: 22, say: 'ring', d: (a, g, s) => `<circle cx="11" cy="15.6" r="${f1(7.6 - s / 2)}" fill="none" stroke="${a}" stroke-width="${f1(s)}"/>`
    + `<path d="M11 0.8L15.4 4.8L11 8.8L6.6 4.8Z" fill="${a}"/>` },
  pea: { w: 26, say: 'pea', d: (a, g, s) => `<path d="M0.8 13C5.6 5 20.4 5 25.2 13C20.4 20 5.6 20 0.8 13Z" fill="${a}"/>`
    + [6.6, 13, 19.4].map(x => `<circle cx="${x}" cy="12.8" r="2.9" fill="${g}"/><circle cx="${x}" cy="12.8" r="${f1(Math.max(1, 2.9 - s * 0.4))}" fill="${a}"/>`).join('') },
};

// ---- the sound table ----
// Token strings: 'name' = glyph for the rest of the word, 'name:n' = glyph that says the
// next n letters, '_n' = keep the next n letters as type. Digits 1 2 4 8 are numerals.
const RB_WHOLE = {};
const W = (words, tok) => words.split(' ').forEach(w => { RB_WHOLE[w] = tok; });
W('i eye aye', 'eye'); W('eyes', 'eye:3 _1');
W('be bee b', 'bee'); W('bees', 'bee:3 _1');
W('see sea c', 'wave'); W('seas sees', 'wave:3 _1');
W('you u ewe', 'ewe'); W('your', 'ewe:3 _1'); W('yours', 'ewe:3 _2'); W('yourself', 'ewe:3 _5');
W('tea tee t', 'cup');
W('for four fore', '4'); W('to too two', '2'); W('ate eight', '8'); W('won', '1');
W('can', 'can'); W('cannot', 'can:3 knot'); W('not knot', 'knot');
W('dear deer', 'deer'); W('son sun', 'sun'); W('sons suns', 'sun:3 _1');
W('sign', 'sign'); W('signs', 'sign:4 _1'); W('gold', 'gold'); W('mare mayor', 'horse'); W('stud', 'stud');
W('ant aunt', 'ant'); W('ants aunts', 'ant:3 _1'); W('ear', 'ear'); W('ears', 'ear:3 _1');
W('knee', 'knee'); W('knees', 'knee:4 _1'); W('tie thai', 'tie'); W('ties', 'tie:3 _1');
W('pen', 'pen'); W('pens', 'pen:3 _1'); W('key quay', 'key'); W('keys', 'key:3 _1');
W('rose rows roes', 'rose'); W('saw', 'saw'); W('hour our', 'clock'); W('hours ours', 'clock:-1 _1');
W('great', '_2 8'); W('wait weight', '_1 8'); W('freight', '_2 8'); W('later', '_1 8:3 _1');
W('eel', 'eel'); W('ink', 'ink'); W('ring', 'ring'); W('rings', 'ring:4 _1'); W('pea pee p', 'pea'); W('peas', 'pea:3 _1');
W('before', 'bee:2 4'); W('therefore', '_5 4'); W('season', 'wave:3 sun'); W('seesaw', 'wave:3 saw');

const L = s => s.split(' ');
// prefixes: [spelling, token for that spelling, test(word)]; the rest of the word stays type
const RB_PRE = [
  ['mari', 'horse:3 eye:1', w => w.length > 5],
  ['for', '4', w => w.length > 4 && !/^for[aeiouyr]/.test(w) || /^forever/.test(w)],
  ['fore', '4', w => w.length > 5],
  ['to', '2', w => L('today together tomorrow tonight toward towards').includes(w)],
  ['be', 'bee', w => L('become becomes becoming begin begins beginning believe believes belief beyond behind below belong belongs beside besides between beneath because behold beloved bespoke bestow beware').includes(w)],
  ['bee', 'bee', w => w.length > 4],
  ['sea', 'wave', w => L('seasons seasonal seaside seafood seal seals seat seats').includes(w)],
  ['see', 'wave', w => L('seed seeds seek seeks seem seems seen').includes(w)],
  ['you', 'ewe', w => w.length > 4 && !/^young/.test(w)],
  ['u', 'ewe', w => L('use used useful user users unique unit units united unity universe universal utility usual usually utopia').includes(w)],
  ['i', 'eye', w => L('idea ideas ideal ideals icon icons iconic ice icy item items island islands iris identity idle iron ivory').includes(w)],
  ['eye', 'eye', w => w.length > 4],
  ['tea', 'cup', w => L('team teams teamwork teach teaches teacher teal tease').includes(w)],
  ['can', 'can', w => L('candid candle candles canvas candy canopy canyon canteen').includes(w)],
  ['pen', 'pen', w => w.length > 4 && /^pen[^aeiouy]/.test(w)],
  ['key', 'key', w => w.length > 4],
  ['sun', 'sun', w => w.length > 4],
  ['gold', 'gold', w => w.length > 5],
  ['rose', 'rose', w => w.length > 5],
  ['hour', 'clock', w => w.length > 5],
  ['our', 'clock', w => L('ourselves').includes(w)],
  ['ant', 'ant', w => L('antler antlers').includes(w)],
  ['saw', 'saw', w => w.length > 4],
  ['tie', 'tie', w => w.length > 4],
  ['knee', 'knee', w => w.length > 5],
  ['deer', 'deer', w => w.length > 5],
  ['eight', '8', w => w.length > 5],
  ['pea', 'pea', w => L('peace peaceful peak peaks peach peanut peanuts peacock').includes(w)],
];
const RB_ATE_IT = L('chocolate private climate senate ultimate intimate delicate accurate fortunate passionate compassionate considerate moderate desperate adequate appropriate immediate separate deliberate certificate graduate corporate affectionate approximate literate pirate palate karate senate delegate advocate associate');
// suffixes: [spelling, token, test(word)]; the start of the word stays type
const RB_SUF = [
  ['sign', 'sign', w => w.length > 4],
  ['fore', '4', w => w.length > 4],
  ['eight', '8', w => w.length > 5],
  ['ate', '8', w => w.length > 4 && !RB_ATE_IT.includes(w)],
  ['son', 'sun', w => w.length > 4],
  ['pen', 'pen', w => w.length > 3],
  ['can', 'can', w => w.length > 4],
  ['ant', 'ant', w => w.length > 4],
  ['ear', 'ear', w => w.length > 3 && !/[bpw]ear$/.test(w) && w !== 'tear'],
  ['key', 'key', w => w.length > 4],
  ['rose', 'rose', w => w.length > 5],
  ['deer', 'deer', w => w.length > 5],
  ['gold', 'gold', w => w.length > 4],
  ['saw', 'saw', w => w.length > 4],
  ['bee', 'bee', w => w.length > 4],
  ['tie', 'tie', w => w.length > 4],
  // sound extensions (round 6): f + [eel] = feel, th + [ink] = think, b + [ring] = bring, quali + [tea] = quality
  ['eel', 'eel', w => w.length > 3],
  ['ink', 'ink', w => w.length > 3],
  ['ring', 'ring', w => w.length > 4 && !/[aeiou]ring$/.test(w)],
  ['ty', 'cup', w => w.length > 4],
];

// token string -> pieces over a word of length n: [{ g } | { n: digit } | { l: count }]
function rbTok(tok, n) {
  const out = [];
  let used = 0;
  const parts = tok.split(' ');
  parts.forEach((p, i) => {
    const last = i === parts.length - 1;
    if (p[0] === '_') { const c = +p.slice(1); out.push({ l: c }); used += c; return; }
    const [name, cnt] = p.split(':');
    let c = cnt == null ? (last ? n - used : 1) : (+cnt < 0 ? n - used + +cnt : +cnt);
    if (last && cnt == null) c = n - used;
    out.push(/^\d$/.test(name) ? { n: name, c } : { g: name, c });
    used += c;
  });
  return used === n ? out : null;
}

// Sound segmentation of one word (letters only). Returns pieces with letter slices, or null.
function rbSegment(raw) {
  if (!/^[A-Za-z]+$/.test(raw)) return null;
  const w = raw.toLowerCase(), n = w.length;
  let pieces = null, kind = '';
  if (RB_WHOLE[w]) { pieces = rbTok(RB_WHOLE[w], n); kind = 'whole'; }
  if (!pieces) {
    let best = null;
    const pre = RB_PRE.filter(([p, , ok]) => w.startsWith(p) && w.length > p.length && ok(w));
    const suf = RB_SUF.filter(([s, , ok]) => w.endsWith(s) && w.length > s.length && ok(w));
    const cand = [];
    pre.forEach(([p, t]) => cand.push({ a: [p, t], b: null }));
    suf.forEach(([s, t]) => cand.push({ a: null, b: [s, t] }));
    pre.forEach(([p, t]) => suf.forEach(([s, u]) => { if (p.length + s.length <= n) cand.push({ a: [p, t], b: [s, u] }); }));
    cand.forEach(c => {
      const pl = c.a ? c.a[0].length : 0, sl = c.b ? c.b[0].length : 0;
      const ps = [];
      if (c.a) { const x = rbTok(c.a[1], pl); if (!x) return; ps.push(...x); }
      if (n - pl - sl > 0) ps.push({ l: n - pl - sl });
      if (c.b) { const x = rbTok(c.b[1], sl); if (!x) return; ps.push(...x); }
      const cover = pl + sl, glyphs = ps.filter(q => !('l' in q)).length;
      const score = cover * 2 + glyphs;
      if (!best || score > best.score) best = { ps, score };
    });
    if (best) { pieces = best.ps; kind = 'syllable'; }
  }
  if (!pieces || !pieces.some(q => !('l' in q))) return null;
  // attach the original letters (case kept) to every piece
  let i = 0;
  pieces = pieces.map(q => { const c = 'l' in q ? q.l : q.c; const txt = raw.slice(i, i + c); i += c; return Object.assign({}, q, { txt }); });
  return { pieces, kind };
}

// Spelling arithmetic for the brand lockup: [picture] - its extra letters + the rest.
function rbArith(raw) {
  if (!/^[A-Za-z]{3,}$/.test(raw)) return null;
  const w = raw.toLowerCase();
  let best = null;
  Object.keys(RB_G).forEach(name => {
    const say = RB_G[name].say;
    if (!say || /[^a-z]/.test(say) || say.length < 3) return;
    let k = 0;
    while (k < say.length && k < w.length && say[k] === w[k]) k++;
    const drop = say.length - k, add = w.length - k;
    if (k < 2 || drop > 2 || add < 1 || add > 7) return;
    const score = k * 3 - drop * 2;
    if (!best || score > best.score) best = { score, g: name, drop: say.slice(k), add: raw.slice(k) };
  });
  return best;
}

// Rand's IBM stripe cuts: three horizontal knock-out bars across every glyph, in the ground
// colour, as thick as the slab's hairline (stem x 0.36). `hot` (optional) is the index of
// one bar drawn in another colour (the deck's construction sheet puts primary on one).
// `clip` keeps every cut inside the glyph's silhouette (the construction sheet, where a
// full-width paper bar would cut the grid lines behind the glyph and read as a seam).
const RB_STRIPES = [7.6, 13.2, 18.8];
let rbMaskSeq = 0;
function rbDraw(name, a, g, s, hot, hotCol, clip) {
  const G = RB_G[name];
  const h = f1(Math.max(0.7, s * 0.36));
  const bar = (y, fill, extra) => `<rect x="-1" y="${f1(y - Math.max(0.7, s * 0.36) / 2)}" width="${G.w + 2}" height="${h}" fill="${fill}"${extra || ''}/>`;
  const cuts = RB_STRIPES.map((y, i) => i === hot ? '' : bar(y, g)).join('');
  if (hot == null && !clip) return G.d(a, g, s) + cuts;
  // the glyph's own silhouette as a mask: the coloured stripe (and, with clip, the cuts) only where the glyph is
  const id = 'rbm' + (++rbMaskSeq);
  let out = `<mask id="${id}" maskUnits="userSpaceOnUse" x="-1" y="-1" width="${G.w + 2}" height="26"><rect x="-1" y="-1" width="${G.w + 2}" height="26" fill="#000"/>${G.d('#fff', '#000', s)}</mask>`
    + G.d(a, g, s) + (clip ? `<g mask="url(#${id})">${cuts}</g>` : cuts);
  if (hot != null) out += bar(RB_STRIPES[hot], hotCol, ` mask="url(#${id})"`);
  return out;
}
function rbSvg(name, a, g, s, cls, style) {
  const G = RB_G[name];
  if (!G) return '';
  return `<svg class="${cls || 'rb-sym'}" viewBox="0 0 ${G.w} 24" style="width:${f1(G.w / 24 * 0.92)}em${style ? ';' + style : ''}" focusable="false" aria-hidden="true">${rbDraw(name, a, g, s)}</svg>`;
}
function rbUri(name, a, g, s) {
  const G = RB_G[name];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${G.w} 24">${rbDraw(name, a, g, s)}</svg>`;
  return `url('data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, '%27')}')`;
}

// one piece as HTML: a glyph, a numeral or letters
function rbPiece(q, col, t, s) {
  const e = escapeHtml;
  if ('l' in q) return `<span class="rb-l">${e(q.txt)}</span>`;
  if (q.n) return `<span class="rb-num"${col !== t.ink ? ` style="color:${col}"` : ''}>${q.n}</span>`;
  return `<span class="rb-g">${rbSvg(q.g, col, t.canvas, s)}</span>`;
}

// Plan the headline: which words get their sound picture (at most 3 words, 4 pictures).
function rbPlan(text) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean).map(w => {
    const m = w.match(/^([^A-Za-z0-9]*)([\s\S]*?)([^A-Za-z0-9]*)$/);
    return { lead: m[1], raw: m[2], punct: m[3], seg: rbSegment(m[2]) };
  });
  const cands = words.map((w, i) => ({ i, w })).filter(c => c.w.seg)
    .sort((x, y) => (y.w.seg.kind === 'whole') - (x.w.seg.kind === 'whole') || x.i - y.i);
  const chosen = new Set();
  let pics = 0;
  for (const c of cands) {
    const k = c.w.seg.pieces.filter(q => !('l' in q)).length;
    if (chosen.size >= 3 || pics + k > 4) continue;
    chosen.add(c.i); pics += k;
  }
  return { words, chosen, pics };
}

function rbHeadline(text, t, s) {
  const plan = rbPlan(text);
  const e = escapeHtml;
  // the last picture in the line is the one primary glyph
  let lastWord = -1;
  plan.words.forEach((w, i) => { if (plan.chosen.has(i)) lastWord = i; });
  return plan.words.map((w, i) => {
    let inner;
    if (plan.chosen.has(i)) {
      const ps = w.seg.pieces;
      let lastPic = -1;
      ps.forEach((q, j) => { if (!('l' in q)) lastPic = j; });
      inner = ps.map((q, j) => rbPiece(q, i === lastWord && j === lastPic ? t.primary : t.ink, t, s)).join('');
    } else {
      inner = e(w.raw);
    }
    return `<span class="rb-w">${e(w.lead)}${inner}${e(w.punct)}</span>`;
  }).join(' ');
}

// The brand-name lockup: sound pictures for every word that has one, else spelling
// arithmetic on one word, else the rebus sign-off "I see you" next to the name.
function rbLockup(ctx, primaryFirst, s) {
  const t = ctx.t, e = escapeHtml;
  const name = String(ctx.brandName || '').trim();
  const words = name.split(/\s+/).filter(Boolean);
  const segs = words.map(w => rbSegment(w.replace(/[^A-Za-z]/g, '') === w ? w : ''));
  let usedPrimary = !primaryFirst;
  const col = () => { if (!usedPrimary) { usedPrimary = true; return t.primary; } return t.ink; };
  const op = c => `<i class="rb-op" data-op="${c === '+' ? 'plus' : 'minus'}">${c}</i>`;
  let row = '', kind;
  if (segs.some(Boolean)) {
    kind = 'sound';
    row = words.map((w, i) => {
      if (!segs[i]) return `<span class="rb-eq-w"><span class="rb-l">${e(w)}</span></span>`;
      return `<span class="rb-eq-w">${segs[i].pieces.map(q => rbPiece(q, 'l' in q ? t.ink : col(), t, s)).join(op('+'))}</span>`;
    }).join('');
  } else {
    const ai = words.findIndex(w => rbArith(w));
    if (ai >= 0) {
      kind = 'arith';
      const a = rbArith(words[ai]);
      row = words.map((w, i) => {
        if (i !== ai) return `<span class="rb-eq-w"><span class="rb-l">${e(w)}</span></span>`;
        const pic = rbPiece({ g: a.g }, col(), t, s);
        const minus = a.drop ? `${op('−')}<span class="rb-l rb-drop">${e(a.drop)}</span>` : '';
        return `<span class="rb-eq-w">${pic}${minus}${op('+')}<span class="rb-l">${e(a.add)}</span></span>`;
      }).join('');
    } else {
      kind = 'signoff';
      row = `<span class="rb-eq-w">${['eye', 'wave', 'ewe'].map(g => rbPiece({ g }, col(), t, s)).join('')}</span><span class="rb-eq-w rb-eq-name"><span class="rb-l">${e(name)}</span></span>`;
    }
  }
  const answer = kind === 'signoff' ? `I see you, ${name}` : name;
  return `<div class="rb-eq" data-kind="${kind}"><div class="rb-eq-row">${row}</div>`
    + `<p class="rb-ans"><span class="rb-ans-k">Read it aloud. Answer</span><span class="rb-ans-flip">${e(answer)}</span></p></div>`;
}

// The glyph construction sheet (deck Material slide): one glyph on the 24-unit grid with
// its stem marked, plus the set the brand uses.
function rbBuild(ctx, s, hw, lead, set) {
  const t = ctx.t;
  const G = RB_G[lead];
  const grid = Array.from({ length: 25 }, (_, i) => `M${i} 0V24M0 ${i}H${G.w > 24 ? G.w : 24}`).join('');
  const W = Math.max(24, G.w);
  const strip = set.map(g => `<span class="rb-g">${rbSvg(g, t.ink, t.canvas, s)}</span>`).join('');
  return `<div class="rb-build">
    <figure class="rb-build-fig"><svg viewBox="-1 -1 ${W + 2} 26" focusable="false" aria-hidden="true">
      <path d="${grid}" fill="none" stroke="${t.ink}" stroke-opacity=".14" stroke-width=".06"/>
      <path d="M0 0H${W}V24H0Z" fill="none" stroke="${t.ink}" stroke-opacity=".5" stroke-width=".1"/>
      <g transform="translate(${(W - G.w) / 2} 0)">${rbDraw(lead, t.ink, t.canvas, s, 1, t.primary, true)}</g>
      <path d="M0 24.6H${f1(s)}M0 24.3V24.9M${f1(s)} 24.3V24.9" stroke="${t.ink}" stroke-width=".12" fill="none"/>
    </svg>
    <figcaption class="rb-build-cap"><b>24-unit grid</b><span>stem ${f1(s)} units · from heading weight ${hw} · three stripe cuts</span></figcaption></figure>
    <div class="rb-build-set">${strip}</div>
  </div>`;
}

// Pictogram wallpaper tile (deck cover band and closing strip): the set in ink on canvas.
function rbWall(t, s) {
  const set = ['eye', 'bee', 'wave', 'sign', 'cup', 'ewe'];
  const cell = 40, cols = 3, rows = 2;
  const items = set.map((g, i) => {
    const G = RB_G[g], c = i % cols, r = Math.floor(i / cols);
    const x = c * cell + (cell - G.w) / 2, y = r * cell + 8;
    return `<g transform="translate(${f1(x)} ${y})">${rbDraw(g, t.ink, t.canvas, s)}</g>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * cell}" height="${rows * cell}" viewBox="0 0 ${cols * cell} ${rows * cell}"><rect width="100%" height="100%" fill="${t.canvas}"/>${items}</svg>`;
  return `url('data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, '%27')}')`;
}

// The construction sheet's lead glyph (the lockup's first picture, else the eye) and the set.
function rbLeadSet(ctx) {
  let lead = 'eye';
  const segAll = String(ctx.brandName || '').split(/\s+/).map(w => rbSegment(w)).find(Boolean);
  if (segAll) { const p = segAll.pieces.find(q => q.g); if (p) lead = p.g; }
  else { const a = String(ctx.brandName || '').split(/\s+/).map(w => rbArith(w)).find(Boolean); if (a) lead = a.g; }
  return { lead, set: [lead, ...['eye', 'bee', 'wave', 'ewe', 'cup', 'sign', 'gold', 'horse'].filter(g => g !== lead)].slice(0, 8) };
}

registerAesthetic({
  key: 'rebus', order: 26,
  name: 'Rebus',
  descriptor: 'Phonetic · Graphic · Clever',
  influences: 'Rand\'s Eye-Bee-M / Glaser / Victorian rebus cards',
  summary: 'Pictures that sound like the words stand in for them, so the line reads as a puzzle you say out loud.',
  motto: 'Be seen. Be heard.',
  kicker: 'Read it aloud',
  mode: 'light',
  slideShape: 'minimal',
  labels: { material: 'Glyphs', states: ['Word', 'Picture', 'Its name'], statesKind: 'swatch' },
  layout: { hero: 'centered', palette: 'swatches', sections: 'two-col', subcopy: false },
  deck: {
    coverDisplay: 1.2,
    // Material slide: the glyph construction sheet (lead glyph on the 24-unit grid, the set below)
    materialArt(ctx) {
      const hw = rbHeadWeight(ctx.state);
      const { lead, set } = rbLeadSet(ctx);
      return `<div class="rb rb--mat">${rbBuild(ctx, rbStem(hw), hw, lead, set)}</div>`;
    },
    // Patterns slide: rebus-native fields (unless the brief pins its own patterns): a glyph
    // field, a 1592-style sentence wall typeset with the engine, and the striped glyph at 1:1.
    patternsStage(ctx) {
      if (ctx.pinned) return '';
      const t = ctx.t, e = ctx.e;
      const s = rbStem(rbHeadWeight(ctx.state));
      const inkT = Object.assign({}, t, { primary: t.ink });
      const lines = [ctx.tagline, 'Be seen. Be heard.', 'I see you', 'Good design should feel alive', 'Think before you sign', 'For you, for ever']
        .filter(Boolean).map(l => `<p class="rb-wall-l">${rbHeadline(l, inkT, s)}</p>`).join('');
      const { lead } = rbLeadSet(ctx);
      const hw = rbHeadWeight(ctx.state);
      const fig = (cls, name, inner) => `<figure class="ab-deck-pt rb-pt ${cls}"><div class="rb-pt-box">${inner}</div><figcaption><span class="ab-label">${e(name)}</span><span class="ab-label ab-deck-ptcw">Ink</span></figcaption></figure>`;
      return `<div class="ab-labelrow"><span class="ab-label">Pattern suite</span><span class="ab-label">${e('Rebus')}</span></div>
        <div class="ab-deck-ptgrid" data-n="3">
          ${fig('rb-pt-field', 'Glyph field', '')}
          ${fig('rb-pt-wall', 'Sentence wall', `<div class="rb-wall">${lines}</div>`)}
          ${fig('rb-pt-build', 'Stripe study', rbBuild(ctx, s, hw, lead, []))}
        </div>`;
    },
    principles: [
      ['Pictures say the sound', 'Eye for I, bee for be, sign for -sign.'],
      ['Drawn at the letters\' weight', 'Discs, bars and three stripe cuts on a 24-unit grid.'],
      ['One colour, one red', 'Everything in ink; one glyph per view in primary.'],
    ],
    do: [
      'Replace a word or syllable only where the picture says the sound.',
      'Set glyphs at cap height, kerned like letters.',
      'Keep one glyph per view in primary.',
    ],
    dont: [
      'Swap a word for a picture of its meaning.',
      'Put an icon beside a word.',
      'Put glyphs on discs, pills or app tiles.',
    ],
  },
  type: { ui: 'body', label: 'body' },
  highlight: 'custom',
  highlightNote: 'No highlight band. A word or syllable that has a sound picture (eye = I, bee = be, sign = -sign) is drawn as a flat geometric glyph at cap height inside the line; the last glyph is the one primary mark, every other glyph and word is ink. Words with no sound picture stay type.',
  cardFill: '--ab-canvas',

  roles: {
    canvas: { use: 'The page: flat paper the type and glyphs are printed on', never: 'Text' },
    ink: { use: 'Every word, every glyph but one, the rules, the selected tab and the switch', never: 'Tinted panels or tiles; ink is type, glyphs and 2px rules' },
    primary: { use: 'Exactly one glyph per view (the last headline glyph), and the one main action', never: 'Body text, a second glyph, tiles, borders' },
    secondary: { use: 'Support only: a 20px reference square in the palette', never: 'Glyphs, bars, the main action, backgrounds', coverage: '≤1%' },
    accent: { use: 'Support only: a 20px reference square in the palette', never: 'Glyphs, the footer mark, buttons, text', coverage: '≤1%' },
  },

  tokens(t, view) {
    const hw = rbHeadWeight(view);
    const s = rbStem(hw);
    const ic = (name, a, g) => rbUri(name, a, g, s);
    return {
      '--ab-type-pick-w': 400,
      '--rb-hw': hw,
      // the Design tab is spelled De + [sign]: the sign glyph (sound), never an icon beside a word
      '--rb-i-sign': ic('sign', t.muted, t.canvas),
      '--rb-i-sign-on': ic('sign', t.canvas, t.ink),
      '--rb-i-eye-st': ic('eye', t.ink, t.canvas),
      '--rb-wall': rbWall(t, s),
    };
  },

  // The rebus headline for the real <h2> (the framework wraps it, escapes the label and sizes it).
  headline(ctx, text) { return rbHeadline(text, ctx.t, rbStem(rbHeadWeight(ctx.state))); },

  art(ctx) {
    const t = ctx.t;
    const s = rbStem(rbHeadWeight(ctx.state));
    const plan = rbPlan(ctx.tagline);
    const lock = rbLockup(ctx, plan.chosen.size === 0, s);
    const e = escapeHtml;
    const sub = `<p class="rb-sub">A de<span class="rb-g rb-gx">${rbSvg('sign', t.ink, t.canvas, s)}</span> language for ${e(String(ctx.brandName || '').trim())} — type, colour and material in one place.</p>`;
    return `<div class="rb">${sub}${lock}</div>`;
  },

  materials: [
    { name: 'Sound glyph', css: 'fill: {ink}; height: 0.92em (equal visual weight with the capitals); margin: 0 0.01em; /* flat geometric primitives on a 24-unit grid with three Rand stripe cuts in the paper colour; stem = heading weight / 800 x 3.4 units; a picture only stands where its name says the sound */' },
    { name: 'The one primary glyph', css: 'fill: {primary}; /* exactly one per view: the last glyph in the headline (or the first in the brand lockup when the headline has none) */' },
    { name: 'Lockup', css: 'the board\'s first element, up to 200px: glyphs at equal weight with the letters, joined by hairline "+" operators; the answer printed upside down in small type underneath (transform: rotate(180deg))' },
    { name: 'Primary action', css: 'background: {primary}; color: {onPrimary}; border-radius: 0; padding: 15px 18px; /* a flat rectangle ending in a typeset "→" in the slab; no icon */' },
    { name: 'Poster block', css: 'background: {canvas}; border-top: 2px solid {ink}; border-radius: 0; /* cards are ruled blocks, never tinted tiles */' },
    { name: 'Switch', css: 'track: 2px {ink} outline, square; knob: a plain square ({ink} off, {canvas} on); no pictogram, because a knob makes no sound.' },
  ],

  rules: {
    do: [
      'Replace a word or a syllable only where the picture says the sound: eye = I, bee = be, sea = see, ewe = you, 4 = for, 8 = ate, "de" + [sign] = design. Keep every replaced word in the aria-label.',
      'Draw glyphs from discs, half-discs, bars and stripe cuts on a 24-unit grid, with the stem taken from the heading weight, at cap height and kerned like letters.',
      'Print everything in ink and exactly one glyph per view in primary; colour is the paper and one red mark.',
      'Set the brand as a lockup of sound pictures joined by "+", with the answer upside down in small type.',
    ],
    dont: [
      'Swap a word for a picture of what it means (a pencil for "design", a sun for "alive"); that is an icon caption, not a rebus.',
      'Put an icon beside a word (a tab, a button, a knob): a rebus replaces a sound, it never decorates a word.',
      'Round the shell into pills and pastel tiles; this is a flat poster with hairline rules.',
      'Force a picture into a word that has no sound match; leave it as type.',
    ],
  },
});
})();
