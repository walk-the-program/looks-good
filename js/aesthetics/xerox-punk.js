/* 29 Xerox Punk — ransom, pasted, defiant. References: Jamie Reid's ransom lettering,
   torn layers and censor bars, Gee Vaucher / Crass montage, Pettibon's captions, riot
   grrrl zines (cut, paste, scribble). NOT the app's Xerox (a clean copy of one page on
   white paper): this is a dark street wall of many pasted sources that overlap and
   collide, with one fluorescent hit and the reader's own hand marking it up.

   Mechanism. Xerox Punk owns THE HAND (scissors, glue, tape, staples, marker); Xerox owns the
   machine, and the two share no components. The ransom headline is drawn by
   def.headline(ctx, text) into the real <h2 aria-label>: letter tiles of 0.72-1.45x, up to 6
   degrees of tilt, +-0.15em on the baseline, uneven padding and 2-4px overlaps, every 3rd-5th
   unit a whole word cut from a magazine serif, one tile in five a one-bit photo crop with the
   letter knocked out (xpPhoto: an original halftone figure), seeded per brand. The wall is
   torn poster remnants (a halftone photo, giant cropped type, a typed bill, a second photo
   with a torn-away corner) at 18-30% contrast. The photo card is defaced with a marker strike
   and stapled. The UI is hand-made: cut-word tabs circled in marker, a marker tick toggle,
   rubber-stamped statuses, a handwritten set list. The fluoro is one of five Day-Glo inks
   snapped from the client primary (def.printPrimary). The hidden <svg> in art() defines the
   filters the css uses: xpn-torn (fibrous torn edge) and xpn-copy (photocopy threshold). The
   deck Material slide gets a ransom specimen sheet via def.deck.materialArt. */
(function () {

function xpRand(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function xpHash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// The fluoro is one ink from a real five-colour Day-Glo-style set, snapped from the client primary's hue
// (never a lightness-shifted client hue). A grey primary takes the yellow; blues and violets take the pink.
const XP_DAYGLO = [['Aurora Pink', '#FF3FA4', 330], ['Rocket Red', '#FF3B3B', 0], ['Blaze Orange', '#FF6A1A', 22], ['Saturn Yellow', '#EAFF00', 64], ['Signal Green', '#39FF14', 112]];
function xpFluoro(primary) {
  const c = hexToHsl(primary);
  if (c.s < 28) return '#EAFF00';
  if (c.h >= 185 && c.h < 300) return '#FF3FA4';
  const dist = h => Math.min(Math.abs(c.h - h), 360 - Math.abs(c.h - h));
  return XP_DAYGLO.reduce((a, b) => (dist(b[2]) < dist(a[2]) ? b : a))[1];
}

// A found photograph, copied hard: a one-bit dot screen of a lit head-and-shoulders figure (toner on
// newsprint), as a data URI. Original drawing, no source image.
function xpPhoto(seed, w, h, pitch) {
  const rnd = xpRand(seed);
  const ox = 0.42 + rnd() * 0.16;
  let dots = '';
  for (let j = 0, y = pitch / 2; y < h; j++, y += pitch * 0.87) {
    for (let x = (j % 2) * pitch / 2; x < w; x += pitch) {
      const hd = ((x - ox * w) / (0.17 * w)) ** 2 + ((y - 0.36 * h) / (0.21 * h)) ** 2;
      const sh = ((x - 0.5 * w) / (0.46 * w)) ** 2 + ((y - 1.02 * h) / (0.36 * h)) ** 2;
      const fig = Math.max(Math.exp(-Math.pow(hd, 3)), Math.exp(-Math.pow(sh, 3)));
      const lit = 0.75 - 0.55 * (x / w);
      let tone = fig * (0.35 + lit) + (1 - fig) * (0.12 + 0.22 * (y / h)) + (rnd() - 0.5) * 0.18;
      tone = Math.max(0, Math.min(1, tone));
      if (tone < 0.08) continue;
      dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(pitch * 0.6 * Math.sqrt(tone)).toFixed(2)}"/>`;
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"><rect width="${w}" height="${h}" fill="#D9D4C4"/><g fill="#111">${dots}</g></svg>`;
  return `url('data:image/svg+xml,${encodeURIComponent(svg)}')`;
}

const XP_POOL = ['Anton', 'Alfa Slab One', 'Abril Fatface', 'Playfair Display', 'DM Serif Display', 'Libre Caslon Text',
  'Bebas Neue', 'Special Elite', 'Courier Prime', 'Archivo Black', 'Oswald', 'Roboto Slab', 'Bitter', 'Big Shoulders Display', 'Yeseva One'];
const XP_RARE = ['Grenze Gotisch', 'Pirata One'];
// whole-word tiles are cut from a third source: a magazine serif
const XP_MAG = ['Playfair Display', 'Libre Caslon Text', 'DM Serif Display', 'Abril Fatface'];

function xpFace(name) {
  return (typeof FONTS !== 'undefined' && FONTS.find(f => f.name === name)) || null;
}
// the body face's bold (<= 700) and a display face's heaviest (<= 800), only from weights the face has
const xpBold = font => abWeight(font, 700);
const xpWeight = font => abWeight(font, 800);

// scissor-cut outline: eight points, each pulled in by up to 4%
function xpCut(rnd) {
  const j = () => (rnd() * 4).toFixed(1);
  return `polygon(${j()}% ${j()}%, 50% ${(rnd() * 2).toFixed(1)}%, calc(100% - ${j()}%) ${j()}%, calc(100% - ${(rnd() * 2).toFixed(1)}%) 50%, calc(100% - ${j()}%) calc(100% - ${j()}%), 50% calc(100% - ${(rnd() * 2).toFixed(1)}%), ${j()}% calc(100% - ${j()}%), ${(rnd() * 2).toFixed(1)}% 50%)`;
}

const XP_GROUNDS = [
  { c: 'news', bg: '#E9E3D0', fg: '#111111', w: 3 },
  { c: 'paper', bg: '#F6F3EA', fg: '#111111', w: 2 },
  { c: 'ink', bg: '#0B0B0B', fg: '#E9E3D0', w: 2 },
  { c: 'grey', bg: '#B9B6AB', fg: '#111111', w: 2 },
];

// ransom headline: lines of words of tiles. Letter tiles vary 0.72-1.45x in size, +-0.15em on the
// baseline, up to 6 degrees of tilt, uneven padding per side and 2-4px overlaps; every 3rd-5th unit is a
// WHOLE WORD cut from a magazine serif; one tile in five is a one-bit photo crop with the letter knocked out
// in paper. The brand faces still appear at least every 4th tile. Returns the HTML.
function xpHeadline(ctx, seed, text) {
  const rnd = xpRand(seed);
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '';
  const hf = ctx.state && ctx.state.headingFont, bf = ctx.state && ctx.state.bodyFont;
  const faces = [];
  if (hf) faces.push({ css: 'var(--ab-font-h)', weight: 'var(--ab-hw, 700)', up: true, name: hf.name });
  if (bf && bf.name !== (hf && hf.name)) faces.push({ css: 'var(--ab-font-b)', weight: xpBold(bf), up: false, name: bf.name });
  const pool = XP_POOL.map(xpFace).filter(f => f && !faces.some(x => x.name === f.name));
  const pick = [];
  pool.forEach(f => pick.push({ css: f.css, weight: xpWeight(f), up: ['condensed', 'heavy', 'slab'].includes(f.cls) || f.category === 'display', name: f.name }));
  XP_RARE.map(xpFace).filter(Boolean).forEach(f => pick.push({ css: f.css, weight: xpWeight(f), up: true, name: f.name, rare: true }));
  const mags = XP_MAG.map(xpFace).filter(Boolean);
  const mag = mags.length ? mags[Math.floor(rnd() * mags.length)] : null;
  const warm = typeof window !== 'undefined' && window.loadFontFamily;
  if (warm && mag) window.loadFontFamily(mag);
  const photo = xpPhoto(seed ^ 0x51ed, 64, 64, 3.2);

  // lines of at most 14 letters
  const lines = [];
  let cur = [], n = 0;
  words.forEach(w => {
    if (cur.length && n + w.length > 14) { lines.push(cur); cur = []; n = 0; }
    cur.push(w); n += w.length;
  });
  if (cur.length) lines.push(cur);

  let idx = 0, last = null, since = 0, nextWord = 2 + Math.floor(rnd() * 3);
  const total = words.reduce((a, w) => a + w.length, 0);
  const accentAt = Math.max(0, total - Math.ceil(words[words.length - 1].length * 0.7));
  const wsum = XP_GROUNDS.reduce((a, g) => a + g.w, 0);
  const pads = () => [0, 0, 0, 0].map(() => (0.04 + rnd() * 0.14).toFixed(2) + 'em').join(' ');
  let letterNo = 0;
  const html = lines.map(line => `<span class="xpl">${line.map(w => {
    const isLast = w === words[words.length - 1] && line === lines[lines.length - 1];
    // a whole word, cut from the magazine
    if (!isLast && mag && since >= nextWord && w.length <= 8) {
      since = 0; nextWord = 3 + Math.floor(rnd() * 3); idx++;
      letterNo += w.length;
      let g; { let r = rnd() * wsum; g = XP_GROUNDS.find(x => (r -= x.w) < 0) || XP_GROUNDS[0]; }
      const sz = 0.72 + rnd() * 0.3;
      const rot = (rnd() < 0.5 ? -1 : 1) * (1 + rnd() * 3.5);
      const ital = !!mag.ital && rnd() < 0.5;   // italics exist at 400 only
      const style = `font-family:${mag.css};font-weight:${ital ? 400 : xpWeight(mag)};font-style:${ital ? 'italic' : 'normal'};font-size:${sz.toFixed(2)}em;--r:${rot.toFixed(1)}deg;--dy:${((rnd() - 0.5) * 0.3).toFixed(3)}em;padding:${pads()};clip-path:${xpCut(rnd)}`;
      return `<span class="xpw"><i class="xpt xpt-word" data-g="${g.c}" style="${style}">${escapeHtml(w)}</i></span>`;
    }
    const tiles = Array.from(w).map(ch => {
      // face: never the same as the neighbour; the brand faces appear at least every 4th tile
      let f;
      const brand = faces.length && (idx % 4 === 1 || rnd() < 0.18);
      if (brand) f = faces[Math.floor(rnd() * faces.length)];
      else { do { f = pick[Math.floor(rnd() * pick.length)]; } while ((f.rare && rnd() < 0.7) || (last && f.name === last.name)); }
      last = f;
      if (warm && f.name && xpFace(f.name)) window.loadFontFamily(xpFace(f.name));
      const fluoro = idx % 5 === 2 && rnd() < 0.9 && letterNo !== accentAt;
      const accent = letterNo === accentAt;
      // the circled last word stays legible: no photo tiles, less shrink and tilt
      const isPhoto = !isLast && !fluoro && !accent && rnd() < 0.2;
      let g = null;
      if (!fluoro && !accent && !isPhoto) { let r = rnd() * wsum; g = XP_GROUNDS.find(x => (r -= x.w) < 0) || XP_GROUNDS[0]; }
      const kind = accent ? 'acc' : fluoro ? 'hot' : isPhoto ? 'photo' : g.c;
      const lower = !f.up && rnd() < 0.3;
      const sz = isLast ? 0.98 + rnd() * 0.3 : 0.72 + rnd() * 0.73;
      const rot = (rnd() < 0.5 ? -1 : 1) * (isLast ? 1 + rnd() * 2.5 : 1.5 + rnd() * 4.5);
      const dy = (rnd() - 0.5) * 0.3;
      idx++; since++; letterNo++;
      const bp = isPhoto ? `;background-position:${Math.round(rnd() * 100)}% ${Math.round(rnd() * 100)}%` : '';
      const style = `font-family:${f.css};font-weight:${f.weight};font-size:${sz.toFixed(2)}em;--r:${rot.toFixed(1)}deg;--dy:${dy.toFixed(3)}em;padding:${pads()};clip-path:${xpCut(rnd)}${bp}`;
      return `<i class="xpt" data-g="${kind}" style="${style}">${escapeHtml(lower ? ch.toLowerCase() : ch.toUpperCase())}</i>`;
    }).join('');
    const circle = isLast ? '<svg class="xpc" viewBox="0 0 120 60" preserveAspectRatio="none" focusable="false"><path d="M14 33C3 15 38 4 68 6c34 2 49 20 36 38C90 59 40 58 18 48 6 42 9 22 31 12" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/><path d="M24 14C6 24 8 44 30 52c26 8 62 4 78-14 9-12-2-26-24-30" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="46 3 30 4 24"/></svg>' : '';
    return `<span class="xpw${isLast ? ' is-circled' : ''}">${tiles}${circle}</span>`;
  }).join('')}</span>`).join('');
  return `<span class="xph" style="--xp-ph:${photo}">${html}</span>`;
}

// The deck Material slide's own art (def.deck.materialArt): a ransom specimen sheet. Tile anatomy, the face
// pool, the scale range and photo tiles, built from the same tile grounds as the headline.
function xpSpecimen(ctx) {
  const seed = xpHash(String(ctx.brandName || 'brand') + '|' + String(ctx.tagline || ''));
  const ini = escapeHtml(ctx.initial);
  const ph2 = xpPhoto(seed ^ 0x77, 90, 110, 3.4);
    const sp = (ch, face, g, extra) => `<i class="xpt" data-g="${g}" style="font-family:${face};${extra || ''}">${ch}</i>`;
    const mag = "'Playfair Display', Georgia, serif", slab = "'Alfa Slab One', Georgia, serif", cond = "'Bebas Neue', Impact, sans-serif", typ = "'Special Elite', 'Courier New', monospace";
    const spec = `<div class="xpsp">
        <div class="xpsp-a"><span class="xpsp-k">Tile anatomy</span>${sp(ini, 'var(--ab-font-h)', 'news', 'font-size:3.2em;--r:-4deg;padding:.06em .16em .1em .08em')}<ul><li>own face</li><li>own ground</li><li>tilt ±6°</li><li>scissor edge</li></ul></div>
        <div class="xpsp-b"><span class="xpsp-k">Face pool</span><span class="xpsp-row">${sp('A', slab, 'paper')}${sp('a', mag, 'ink')}${sp('A', cond, 'grey')}${sp('a', typ, 'news')}${sp('A', 'var(--ab-font-h)', 'hot')}</span></div>
        <div class="xpsp-b"><span class="xpsp-k">Scale 0.72 – 1.45</span><span class="xpsp-row">${sp('S', slab, 'news', 'font-size:.72em')}${sp('S', slab, 'news')}${sp('S', slab, 'news', 'font-size:1.45em')}</span></div>
        <div class="xpsp-b"><span class="xpsp-k">Photo tiles</span><span class="xpsp-row xph" style="--xp-ph:${ph2}">${sp('N', slab, 'photo', 'background-position:20% 30%')}${sp('O', cond, 'photo', 'background-position:70% 40%')}${sp('word', mag, 'paper', 'font-style:italic')}</span></div>
      </div>`;
  return spec;
}

registerAesthetic({
  key: 'xerox-punk', order: 29,
  name: 'Xerox Punk',
  descriptor: 'Ransom · Pasted · Defiant',
  influences: 'Jamie Reid / Wheatpaste street walls / Ransom-note collage',
  summary: 'A dark wall of pasted scraps: ransom-note headlines, torn layers, censor bars and one fluorescent hit.',
  motto: 'Cut it. Paste it. Mean it.',
  kicker: 'Stick no bills',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Paste-up', states: ['Pasted', 'Circled', 'Crossed out'], statesKind: 'button' },
  layout: { hero: 'centered', palette: 'swatches', sections: 'two-col', subcopy: true },
  type: { ui: 'body', label: 'body', display: 1 },
  highlight: 'custom',
  highlightNote: 'The headline is cut ransom-note tiles (each letter its own face, ground, size and tilt; one tile in five is the fluoro; one tile is the accent) and the last word is circled by hand in marker. In running UI text the highlight word is plain ink with a fluoro highlighter swipe behind it.',
  cardFill: '--ab-sheet',

  roles: {
    canvas: {
      use: 'The street wall: flat black (about #0A0A0A) in dark mode, newsprint #D9D4C4 in light mode (a flyer: black toner and one fluoro), with 4% grain; paper sheets are pasted on top. Fixed scrap grounds: newsprint #E9E3D0, white #F6F3EA, photocopy grey #B9B6AB',
      never: 'A white page as the main surface (that is Xerox), text, a coherent single column',
      coverage: '55–65%',
    },
    ink: {
      use: 'Bone text on the wall; black type on every pasted scrap, black censor bars, 2px tile borders and hard shadows',
      never: 'Soft greys, gradients, blurred shadows',
      coverage: '15–20%',
    },
    primary: {
      use: 'The ONE fluoro: the client primary snapped to the nearest of five Day-Glo inks (Aurora Pink #FF3FA4, Rocket Red #FF3B3B, Blaze Orange #FF6A1A, Saturn Yellow #EAFF00, Signal Green #39FF14; a grey primary takes the yellow): the main action tile, one tile in five of the ransom headline, the highlighter swipe, selected switch fill',
      never: 'Fluoro text on newsprint, a second fluoro, smooth UI fills, body text',
      coverage: '≈10–12%',
    },
    secondary: {
      use: 'Held back: it shows in the palette and nowhere on the wall. The tape is translucent bone paper, never the secondary',
      never: 'Tape, buttons, body text, large panels, a second fluoro',
      coverage: '≤2%',
    },
    accent: {
      use: 'A single tile in the ransom headline. The rubber stamps and labels are bone (#EDE6D3), never the accent',
      never: 'Stamps, buttons, borders, panel fills, a second tile',
      coverage: '≤2%',
    },
  },

  // Dark: the street wall, near-black with a trace of the client's hue. Light: a newsprint flyer
  // so the cream and white scraps still read as pasted on (never a white page).
  canvas(b) {
    if (b.isDark) { const h = b.hexToHsl(b.canvas); return b.hslToHex(h.h, Math.min(h.s, 8), Math.min(h.l, 4.5)); }
    return '#D9D4C4';   // B mode: a newsprint flyer (black toner and one fluoro), not a white copy
  },

  // The one fluoro: the client primary snapped to the Day-Glo five (the palette still shows the true brand hex).
  printPrimary(t) { return xpFluoro(t.primary); },

  // The ransom headline for the real <h2> (the framework wraps it, escapes the label and sizes it).
  headline(ctx, text) {
    return xpHeadline(ctx, xpHash(String(ctx.brandName || 'brand') + '|' + String(text || '')), text);
  },

  tokens(t, view) {
    const st = view || (typeof state !== 'undefined' ? state : null);
    const hf = st && st.headingFont;
    const hw = abWeight(hf, 900);
    const fl = t.printPrimary;   // the Day-Glo primary from printPrimary(t)
    const d = t.isDark;
    return {
      '--ab-type-pick-w': hw,
      '--ab-hw': hw,
      '--ab-tr': 0,
      '--xp-bw': xpBold(st && st.bodyFont),
      '--ab-fluoro': fl,
      '--xp-hot': d ? fl : t.ink,
      '--xp-stamp': d ? '#EDE6D3' : t.ink,    // stamps and labels are bone on the wall, never the accent
      '--ab-stamp': d ? '#EDE6D3' : t.ink,
      '--ab-news': '#E9E3D0',
      '--ab-sheet': '#E9E3D0',
      '--ab-copy': '#CFCBBF',
      '--ab-wire': '#F1EEE4',
      '--ab-tape': 'rgba(236, 228, 206, 0.55)',   // translucent paper tape, not a second hue
      '--ab-tape-edge': 'rgba(0, 0, 0, 0.15)',
      '--ab-sheet-ink': '#0d0d0d',
      '--ab-sheet-mute': '#4a463b',
    };
  },

  art(ctx) {
    const seed = xpHash(String(ctx.brandName || 'brand') + '|' + String(ctx.tagline || ''));
    const rnd = xpRand(seed ^ 0x9e3779b9);
    // marker captions use Permanent Marker; the cut-word UI uses a few fixed faces (idempotent: the loader dedupes)
    if (typeof window !== 'undefined' && window.loadFontFamily) {
      ['Permanent Marker', 'Alfa Slab One', 'Playfair Display', 'Bebas Neue', 'Special Elite'].map(xpFace).filter(Boolean).forEach(f => window.loadFontFamily(f));
    }
    const e = escapeHtml;
    const ini = e(ctx.initial);
    const words = String(ctx.brandName || 'Studio').trim().split(/\s+/);
    const big = e((words[words.length - 1] || 'STUDIO').toUpperCase().slice(0, 10));
    const ph1 = xpPhoto(seed ^ 0x1a2b, 120, 150, 4.4), ph2 = xpPhoto(seed ^ 0x77, 90, 110, 3.4);
    // the wall: torn poster remnants pasted over each other, at low contrast on the black
    const wall = `<div class="xpa-wall" aria-hidden="true">
        <span class="xpr xpr-1" style="background-image:${ph1}"></span>
        <span class="xpr xpr-2" style="--xpn-l:${big.length}"><b>${big}</b></span>
        <span class="xpr xpr-3"><i>Sat · doors 8pm · no fun</i><i>bring a friend · bring a copy</i><i>all ages · no gods</i></span>
        <span class="xpr xpr-4" style="background-image:${ph2}"></span>
      </div>`;
    const staple = '<svg class="xps" viewBox="0 0 40 10" width="40" height="10" aria-hidden="true" focusable="false"><path d="M3 7V3h34v4" fill="none" stroke="#9a9a96" stroke-width="2.2" stroke-linejoin="round"/><path d="M3 7V3h34v4" fill="none" stroke="#e8e8e4" stroke-width=".8"/></svg>';
    const strike = '<svg class="xpa-x" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M8 14C30 38 58 66 92 90" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><path d="M90 10C64 34 38 62 12 92" fill="none" stroke="currentColor" stroke-width="5.5" stroke-linecap="round"/></svg>';
    return `<svg class="xpd" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden"><defs>
      <filter id="xpn-torn" x="-6%" y="-6%" width="112%" height="112%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.028 0.05" numOctaves="2" seed="7" result="w"/>
        <feDisplacementMap in="SourceGraphic" in2="w" scale="11" xChannelSelector="R" yChannelSelector="G" result="d"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.22" numOctaves="2" seed="3" result="f"/>
        <feDisplacementMap in="d" in2="f" scale="3.2" xChannelSelector="G" yChannelSelector="R" result="e"/>
        <feComponentTransfer in="e"><feFuncA type="discrete" tableValues="0 0 0 1 1 1"/></feComponentTransfer>
      </filter>
      <filter id="xpn-copy" x="-4%" y="-4%" width="108%" height="108%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="8" result="w"/>
        <feDisplacementMap in="SourceGraphic" in2="w" scale="4" xChannelSelector="R" yChannelSelector="G" result="d"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="2" result="n"/>
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -55 0 0 0 39.5" result="h"/>
        <feComposite in="d" in2="h" operator="in" result="e"/>
        <feComponentTransfer in="e"><feFuncA type="discrete" tableValues="0 0 0 1 1 1"/></feComponentTransfer>
      </filter>
    </defs></svg>
    <div class="xpa">
      ${wall}
      <div class="xpa-main">
        <div class="xpa-strip"><span>No gods · no masters · no templates</span></div>
      </div>
      <div class="xpa-photo">
        ${staple}
        <div class="xpa-img" style="background-image:${ph2}"><b>${ini}</b>${strike}</div>
        <p class="xpa-cap">fig. 1 — no comment.</p>
      </div>
    </div>`;
  },

  // 03 is a handwritten set list on a pasted scrap: real markup for the title and the numbers.
  panels: {
    list(ctx) {
      const e = ctx.e;
      return `<div class="ab-list xp-sl"><p class="xp-sl-h" aria-hidden="true">set list</p><ul class="xp-sl-rows">${ctx.rows.map((r, i) => `<li class="ab-row">
      <span class="ab-row-n">${i + 1}.</span>
      <span class="ab-av" aria-hidden="true">${e(r[0][0])}</span>
      <span class="ab-row-name">${e(r[0])}</span>
      <span class="ab-row-status">${e(r[1])}</span>
      <span class="ab-row-bar" aria-hidden="true"><i style="width:${r[2]}%"></i></span>
      <span class="ab-row-pct">${r[2]}%</span>
    </li>`).join('')}</ul></div>`;
    },
  },

  materials: [
    { name: 'Ransom tile', css: 'background: #E9E3D0; color: #111111; font-size: .72–1.45em; padding: .04–.18em per side; transform: translateY(±.15em) rotate(±6deg); margin-left: -3px; /* each LETTER its own tile (face, ground, size, tilt, scissor edge), overlapping its neighbour; every 3rd–5th unit is a whole word cut from a magazine serif; one in five is a photo crop */' },
    { name: 'Wheatpaste sheet', css: 'background: {sheet}; color: {sheetInk}; filter: url(#xpn-torn) drop-shadow(3px 4px 0 rgba(0,0,0,.65)); transform: rotate(-.6deg); /* a torn paper sheet over the wall: fibrous torn edge, overlaps its neighbour by 8-24px, a safety pin or tape at one corner */' },
    { name: 'Fluoro', css: 'background: {fluoro}; color: #0a0a0a; /* one of the five Day-Glo inks snapped from the client primary; tile, highlighter swipe or button, never text on newsprint; the ONLY fluoro */' },
    { name: 'Marker mark-up', css: 'stroke: #111111 (on a scrap) or {fluoro} (on the wall); stroke-width: 3.2px; stroke-linecap: round; /* an imperfect double-loop circle = selected, two unequal crossing strokes = deleted, a scribble = removed */' },
    { name: 'Censor bar', css: 'background: #000000; color: transparent; /* a solid black bar over an eyes line or a status; never a blur */' },
    { name: 'Tape + staple', css: 'background: rgba(236,228,206,.55); border: 1px solid rgba(0,0,0,.15); width: 52px; height: 18px; transform: rotate(-33deg); /* translucent paper strip across a sheet corner, or a staple; never a client colour, never a paperclip */' },
    { name: 'Photo tile', css: 'background: one-bit halftone photo crop (toner on newsprint #D9D4C4); color: #E9E3D0; -webkit-text-stroke: .03em #111; /* one tile in five: the letter knocked out of a found photograph */' },
    { name: 'Rubber stamp', css: 'color: {stamp}; border: 2px solid {stamp}; box-shadow: inset 0 0 0 1px paper, inset 0 0 0 2.5px {stamp}; transform: rotate(-3deg); text-transform: uppercase; letter-spacing: .14em; /* statuses, kicker and badges: inked by hand, uneven, never a black label */' },
  ],

  rules: {
    do: [
      'Keep the fluoro the only hue: tape is translucent bone paper and stamps and labels are bone, never teal or yellow.',
      'Build every headline from violent ransom tiles: each letter its own face, ground, size (72–145%), tilt (up to 6 degrees), baseline and scissor-cut edge, overlapping; whole words cut from a magazine every few tiles; photo-crop tiles.',
      'Keep the wall dark and the sheets layered: torn edges, overlap of 8–24px, a pin or strip of tape, black type on every scrap.',
      'Make the interface by hand: cut-word tabs circled in marker, a marker tick for on, rubber-stamped statuses, a handwritten set list.',
      'Apply photocopy grain and threshold to images and scraps only; running UI text stays crisp and typewritten.',
    ],
    dont: [
      'Use a white page or a coherent single column as the main surface; that is Xerox, and the wall must collide.',
      'Set tiles in one face or one size, rotate past 6 degrees, or tilt every element at random.',
      'Add a second fluoro or a fluoro outside the Day-Glo five (pink, red, orange, yellow, green), stock splatter brushes, paperclips, skulls, chains or spikes.',
      'Reproduce Sex Pistols or Reid artwork, a flag, a Black Flag bar set or the Supreme box logo; re-make the technique with original content.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    // the Material slide shows a ransom specimen sheet instead of repeating the hero wall
    materialArt: ctx => xpSpecimen(ctx),
    marks: { do: '✓', dont: '✕' },
    principles: [
      ['A wall, not a page', 'Many sources overlap on a dark ground; nothing sits neatly.'],
      ['Every tile is its own face', 'Ransom headlines vary font, size, ground and tilt.'],
      ['One fluoro, used by hand', 'Marker circles and cross-outs carry state and emphasis.'],
    ],
    do: [
      'Build headlines from mismatched cut tiles.',
      'Use circles, cross-outs and censor bars for states.',
      'Snap the primary to one Day-Glo ink.',
    ],
    dont: [
      'Use a white page as the main surface.',
      'Rotate beyond six degrees or randomly.',
      'Use more than one fluoro.',
    ],
  },
});
})();
