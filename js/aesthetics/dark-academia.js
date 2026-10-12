/* 40 Dark Academia — bookish, candlelit, inked. References (docs/research/round6.md §4): the
   Long Room at Trinity College (lettered bays, a barrel of spines), Penguin Clothbound Classics
   (one foil-stamped emblem on coloured cloth), bookplates / ex libris, library catalogue cards,
   rubrication and marginalia, wax seals, Diptyque and Cire Trudon labels, Pinterest 2026
   Poetcore / Pen Pals.

   Mechanism.
   - A pool of lamp light on paper inside a dark oak room. The board is the oak (a warm radial
     vignette from one lamp, faint long grain); every piece of reading text sits on a paper leaf
     (#EFE6D2, ink #2A2018) with a double rule, a dog-ear or foxing. On the wood, text appears only
     as gilt small caps (tooling), never as body copy.
   - Hero: a title leaf (running head, the headline in the Fell types with a raised rubricated
     initial and the last word in italic rubric, a fleuron, an italic imprint, one pencil note in
     the margin) beside a shelf of book spines drawn procedurally: client primary and secondary as
     book cloths (darkened to L 25-35%, chroma down ~20%) among calf, morocco and vellum, raised
     bands, gilt rules, lettering pieces with real generic titles, one leaning volume, a ribbon
     hanging over the shelf edge and the brand's own volume pulled forward with its name in gilt.
   - Components are book objects: spines as the segmented control (the chosen one drawn up from
     the shelf), a cloth-bound button with a gilt inset rule and a manicule, a wax-seal toggle in a
     paper groove, a typed field on a ruled line with a fountain-pen focus, a catalogue card for
     the list (typed call numbers, a red rule, a punched hole), cloth / gilt / sealed swatches.
   - Colour: oak, paper, ink, gilt (lines only) and pencil are fixed. Primary and secondary are
     cloths; the accent is the wax (any colour of wax is real) and the rubric when it holds 3:1 on
     paper, else oxblood. No blackletter, no skulls, no quills.
   The deck's Material stage shows a second art variant (an ex libris bookplate with a laurel and
   the monogram), so the cover's shelf is not repeated. */

const DA = {
  oak: '#1E1712', paper: '#EFE6D2', ink: '#2A2018', gilt: '#B08D57', giltLite: '#D9BC86', pencil: '#5E5448',
  oxblood: '#7A1F1F', pen: '#1C2A44', calf: '#7A5233', morocco: '#3A2620', vellum: '#CFC0A0', navy: '#1F2A3D',
  bottle: '#21382A', black: '#17130F', tan: '#8A6440',
};
let daSeq = 0;

function daHash(s) {
  let h = 2166136261 >>> 0;
  for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}
function daRand(seed) {
  let a = (seed >>> 0) || 1;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const daF = n => (Math.round(n * 100) / 100).toString();
function daFace(name) { return (typeof FONTS !== 'undefined' && FONTS.find(f => f.name === name)) || null; }

// A brand colour as book cloth: lightness held to 25-34%, chroma down ~20%, then darkened until
// the gilt lettering reads on it.
function daCloth(hex) {
  const { h, s, l } = hexToHsl(hex);
  let L = Math.max(25, Math.min(34, l * 0.62));
  let out = hslToHex(h, Math.min(s * 0.8, 62), L);
  for (let i = 0; i < 12 && contrastRatio(out, DA.giltLite) < 4.6; i++) { L -= 2; out = hslToHex(h, Math.min(s * 0.8, 62), L); }
  return out;
}
// The wax: the accent, deepened to a cast-wax value (yellow becomes gold wax, pale green a green wax).
function daWax(hex) {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex(h, Math.max(s, 45), Math.max(30, Math.min(l, 42)));
}
// Rubric (initials, ¶, the red rule): the accent if it holds 3:1 on paper, else oxblood.
function daRubric(t) {
  const { s } = hexToHsl(t.accent);
  return (contrastRatio(t.accent, DA.paper) >= 3 && s >= 30) ? t.accent : DA.oxblood;
}

// Titles for the lettering pieces: real, generic words (never lorem ipsum).
const DA_TITLES = ['ODES', 'ESSAYS', 'LETTERS', 'VOL. II', 'NOTES', 'POEMS', 'III', 'INDEX', 'IV', 'TALES', 'ATLAS', 'VOL. I'];

function daShelf(ctx, id, rnd) {
  const t = ctx.t;
  const c1 = daCloth(t.primary), c2 = daCloth(t.secondary);
  const rub = daRubric(t);
  const st = ctx.state || {};
  const hFace = String((st.headingFont && st.headingFont.css) || 'Georgia, serif').replace(/'/g, '"');
  const name = escapeHtml(String(ctx.brandName || 'Ex Libris').trim().toUpperCase());
  const ini = escapeHtml(ctx.initial || '·');
  const W = 240, base = 168;
  const cloths = [DA.calf, c1, DA.morocco, DA.vellum, c2, DA.navy, c1, DA.tan, DA.bottle, c2, DA.black, DA.calf, c1, DA.oxblood];
  let books = '', x = 14, i = 0;
  const brandAt = 6;
  const shadowsTo = [];
  while (x < W - 30 && i < 14) {
    const brand = i === brandAt;
    const w = brand ? 27 : 11 + Math.floor(rnd() * 11);
    const h = brand ? 132 : 92 + Math.floor(rnd() * 46);
    const col = brand ? c1 : cloths[i % cloths.length];
    const y = base - h;
    const vel = col === DA.vellum;
    const gilt = vel ? '#8A6A3A' : DA.gilt;
    let b = '';
    b += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.4" fill="${col}"/>`;
    // linen / leather grain
    b += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id}lin)" opacity="${vel ? 0.25 : 0.55}"/>`;
    const banded = !brand && (rnd() < 0.55 || col === DA.calf || col === DA.morocco);
    if (banded) {
      const n = 4 + Math.floor(rnd() * 2);
      const top = y + 10, span = h - 22;
      for (let k = 0; k < n; k++) {
        const by = top + (span * k) / (n - 1);
        b += `<rect x="${x}" y="${daF(by - 1.2)}" width="${w}" height="2.4" fill="#000" opacity=".35"/><rect x="${x}" y="${daF(by - 1.4)}" width="${w}" height="1" fill="#fff" opacity=".16"/>`;
        b += `<path d="M${x + 1} ${daF(by - 2.6)}H${x + w - 1}M${x + 1} ${daF(by + 2.2)}H${x + w - 1}" stroke="${gilt}" stroke-width=".35" opacity=".85"/>`;
      }
      // lettering piece between band 1 and 2
      const ly = top + span / (n - 1) * 0.5 - 6;
      const lab = rnd() < 0.5 ? DA.oxblood : DA.black;
      const title = DA_TITLES[Math.floor(rnd() * DA_TITLES.length)];
      if (w >= 13) {
        b += `<rect x="${x + 1.5}" y="${daF(ly)}" width="${w - 3}" height="12" fill="${col === lab ? DA.morocco : lab}"/><rect x="${x + 2.2}" y="${daF(ly + 0.7)}" width="${w - 4.4}" height="10.6" fill="none" stroke="${DA.gilt}" stroke-width=".3"/>`;
        b += `<text x="${daF(x + w / 2)}" y="${daF(ly + 7.8)}" text-anchor="middle" font-family="Georgia, serif" font-size="${Math.min(3.6, (w - 5) / (title.length * 0.62)).toFixed(2)}" letter-spacing=".2" fill="${DA.giltLite}">${title}</text>`;
      }
    } else if (!brand) {
      // cloth spine: two gilt rules top and bottom, a small gilt emblem, a vertical title
      b += `<path d="M${x + 1} ${y + 7}H${x + w - 1}M${x + 1} ${y + 9}H${x + w - 1}M${x + 1} ${base - 9}H${x + w - 1}M${x + 1} ${base - 7}H${x + w - 1}" stroke="${gilt}" stroke-width=".4"/>`;
      if (w >= 12 && h > 100) {
        const title = DA_TITLES[Math.floor(rnd() * DA_TITLES.length)];
        b += `<text transform="translate(${daF(x + w / 2 + 1.3)} ${y + 16}) rotate(90)" font-family="Georgia, serif" font-size="3.7" letter-spacing=".9" fill="${vel ? '#6E5230' : DA.giltLite}">${title}</text>`;
      }
      b += `<path d="M${daF(x + w / 2)} ${base - 18}l1.6 2.2-1.6 2.2-1.6-2.2z" fill="${gilt}"/>`;
    } else {
      // the brand's own volume, pulled forward: brighter, gilt panels, the name in gilt, the monogram
      const fs = Math.min(8.2, (h - 50) / Math.max(4, name.length * 0.68));
      b += `<path d="M${x + 1.5} ${y + 8}H${x + w - 1.5}M${x + 1.5} ${y + 10.5}H${x + w - 1.5}M${x + 1.5} ${base - 10.5}H${x + w - 1.5}M${x + 1.5} ${base - 8}H${x + w - 1.5}" stroke="${DA.gilt}" stroke-width=".5"/>`;
      b += `<rect x="${x + 3}" y="${y + 15}" width="${w - 6}" height="${h - 44}" fill="none" stroke="${DA.gilt}" stroke-width=".45"/><rect x="${x + 4.4}" y="${y + 16.4}" width="${w - 8.8}" height="${h - 46.8}" fill="none" stroke="${DA.gilt}" stroke-width=".25"/>`;
      b += `<text transform="translate(${daF(x + w / 2 + fs * 0.34)} ${y + 21}) rotate(90)" font-family='${hFace}' font-size="${daF(fs)}" letter-spacing=".6" fill="${DA.giltLite}" textLength="${daF(Math.min(h - 56, name.length * fs * 0.72))}" lengthAdjust="spacingAndGlyphs">${name}</text>`;
      b += `<circle cx="${daF(x + w / 2)}" cy="${base - 19}" r="5.4" fill="none" stroke="${DA.gilt}" stroke-width=".45"/><text x="${daF(x + w / 2)}" y="${base - 16.6}" text-anchor="middle" font-family='${hFace}' font-size="7" fill="${DA.giltLite}">${ini}</text>`;
    }
    // round spine shading: dark edges, a lamp highlight at a quarter
    b += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.4" fill="url(#${id}cyl)"/>`;
    if (brand) {
      books += `<g transform="translate(-1.5 7) scale(1)" filter="url(#${id}lift)">${b}</g>`;
      shadowsTo.push(x);
    } else books += b;
    x += w + (rnd() < 0.2 ? 0.6 : 0.2);
    i++;
  }
  // the leaning volume at the end of the row
  const lw = 14, lh = 116, lx = x + 2;
  const lean = `<g transform="rotate(-14 ${lx + lw} ${base})"><rect x="${lx}" y="${base - lh}" width="${lw}" height="${lh}" rx="1.4" fill="${DA.bottle}"/><rect x="${lx}" y="${base - lh}" width="${lw}" height="${lh}" fill="url(#${id}lin)" opacity=".55"/>
      <path d="M${lx + 1} ${base - lh + 7}H${lx + lw - 1}M${lx + 1} ${base - lh + 9}H${lx + lw - 1}M${lx + 1} ${base - 8}H${lx + lw - 1}" stroke="${DA.gilt}" stroke-width=".4"/>
      <text transform="translate(${lx + lw / 2 + 1.3} ${base - lh + 16}) rotate(90)" font-family="Georgia, serif" font-size="3.7" letter-spacing=".9" fill="${DA.giltLite}">SONNETS</text>
      <rect x="${lx}" y="${base - lh}" width="${lw}" height="${lh}" rx="1.4" fill="url(#${id}cyl)"/></g>`;
  // a ribbon bookmark over the shelf edge from the brand book
  const rx = (shadowsTo[0] || 120) + 18;
  const ribbon = `<path d="M${rx} ${base + 5} l0 17 l-2 -2.4 l-2 2.4 l0 -17z" fill="${rub}"/><path d="M${rx - 4} ${base + 5}h4" stroke="#000" stroke-width=".5" opacity=".3"/>`;
  return `<svg class="da-scene" viewBox="0 0 ${W} 196" xmlns="http://www.w3.org/2000/svg" role="presentation" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="${id}lamp" cx=".16" cy="-.05" r="1.05"><stop offset="0" stop-color="#FFD596" stop-opacity=".34"/><stop offset=".45" stop-color="#FFB45E" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
      <linearGradient id="${id}cyl" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset=".18" stop-color="#000" stop-opacity=".05"/><stop offset=".32" stop-color="#fff" stop-opacity=".16"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset=".85" stop-color="#000" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></linearGradient>
      <pattern id="${id}lin" width="2.2" height="2.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 1.1H2.2" stroke="#fff" stroke-width=".35" opacity=".14"/></pattern>
      <linearGradient id="${id}plank" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#7A5636"/><stop offset=".14" stop-color="#5A3E28"/><stop offset="1" stop-color="#2E2016"/></linearGradient>
      <filter id="${id}lift" x="-40%" y="-10%" width="180%" height="120%"><feDropShadow dx="2.6" dy="1.4" stdDeviation="1.6" flood-color="#000" flood-opacity=".6"/></filter>
    </defs>
    <rect width="${W}" height="196" fill="#120D0A"/>
    <path d="M0 26H${W}" stroke="#000" stroke-width="2" opacity=".5"/>
    ${books}${lean}
    <rect x="0" y="${base}" width="${W}" height="14" fill="url(#${id}plank)"/>
    <rect x="0" y="${base}" width="${W}" height="1" fill="#A07A50" opacity=".55"/>
    <rect x="0" y="${base + 14}" width="${W}" height="14" fill="#0E0A07"/>
    ${ribbon}
    <rect width="${W}" height="196" fill="url(#${id}lamp)"/>
  </svg>`;
}

// The Material slide variant: an ex libris bookplate, monogram inside a laurel on an engraved oval.
function daPlate(ctx, id) {
  const t = ctx.t;
  const st = ctx.state || {};
  const hFace = String((st.headingFont && st.headingFont.css) || 'Georgia, serif').replace(/'/g, '"');
  const name = escapeHtml(String(ctx.brandName || '').trim().toUpperCase());
  const ini = escapeHtml(ctx.initial || '·');
  const rub = daRubric(t);
  const leaf = (cx, cy, a, s) => `<ellipse cx="0" cy="0" rx="${daF(4.6 * s)}" ry="${daF(1.7 * s)}" transform="translate(${daF(cx)} ${daF(cy)}) rotate(${daF(a)})" fill="${DA.ink}"/>`;
  // two laurel branches rising from the bottom of the oval, leaves in pairs along each arc
  let wreath = '';
  const R = 39, cx = 120, cy = 104;
  for (let k = 0; k < 12; k++) {
    const phi = (102 + k * 12.5) * Math.PI / 180;
    const s = 1.05 - k * 0.035;
    for (const side of [-1, 1]) {
      const py = cy + Math.sin(phi) * R;
      const tx = side < 0 ? cx + Math.cos(phi) * R : cx - Math.cos(phi) * R;
      const tang = side < 0 ? (phi * 180 / Math.PI + 90) : (90 - phi * 180 / Math.PI);
      const nx = side < 0 ? Math.cos(phi) : -Math.cos(phi), ny = Math.sin(phi);
      wreath += leaf(tx + nx * 3.2, py + ny * 3.2, tang + 35 * (side < 0 ? 1 : -1), s) + leaf(tx - nx * 3.2, py - ny * 3.2, tang - 35 * (side < 0 ? 1 : -1), s);
    }
  }
  wreath += `<path d="M${cx - 7} ${cy + R + 2} Q${cx} ${cy + R - 3} ${cx + 7} ${cy + R + 2}" fill="none" stroke="${DA.ink}" stroke-width=".8"/>`;
  return `<svg class="da-plate" viewBox="0 0 240 196" xmlns="http://www.w3.org/2000/svg" role="presentation">
    <defs><pattern id="${id}hatch" width="1.6" height="1.6" patternUnits="userSpaceOnUse" patternTransform="rotate(-38)"><path d="M0 .8H1.6" stroke="${DA.ink}" stroke-width=".42"/></pattern>
    <clipPath id="${id}oval"><ellipse cx="120" cy="104" rx="31" ry="34"/></clipPath>
    <filter id="${id}sh" x="-10%" y="-10%" width="120%" height="125%"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#000" flood-opacity=".55"/></filter></defs>
    <rect width="240" height="196" fill="#120D0A"/>
    <g filter="url(#${id}sh)"><rect x="56" y="12" width="128" height="172" fill="${DA.paper}"/></g>
    <rect x="63" y="19" width="114" height="158" fill="none" stroke="${DA.ink}" stroke-width=".9"/>
    <rect x="66.2" y="22.2" width="107.6" height="151.6" fill="none" stroke="${DA.ink}" stroke-width=".4"/>
    <text x="120" y="44" text-anchor="middle" font-family='${hFace}' font-size="11" letter-spacing="3.2" fill="${DA.ink}">EX LIBRIS</text>
    <path d="M100 51H140" stroke="${DA.ink}" stroke-width=".4"/>
    <g clip-path="url(#${id}oval)"><rect x="80" y="64" width="80" height="80" fill="url(#${id}hatch)" opacity=".5"/></g>
    <ellipse cx="120" cy="104" rx="31" ry="34" fill="none" stroke="${DA.ink}" stroke-width=".6"/>
    ${wreath}
    <circle cx="120" cy="104" r="17" fill="${DA.paper}"/>
    <text x="120" y="113.5" text-anchor="middle" font-family='${hFace}' font-size="27" fill="${rub}">${ini}</text>
    <path d="M120 142.5l2 2.6-2 2.6-2-2.6z" fill="${DA.ink}"/>
    <text x="120" y="160" text-anchor="middle" font-family='${hFace}' font-size="${daF(Math.min(8.4, 92 / Math.max(6, name.length * 0.7)))}" letter-spacing="1.6" fill="${DA.ink}">${name}</text>
    <text x="120" y="169" text-anchor="middle" font-family='${hFace}' font-size="5" font-style="italic" fill="${DA.pencil}">his liber est</text>
  </svg>`;
}

function daHeadlineHtml(text) {
  const e = escapeHtml;
  const s = String(text || '').trim();
  if (!s) return '';
  const m = s.match(/^([\s\S]*?)([^\s]+?)([.,;:!?…]*)$/);
  const head = m ? m[1] : '';
  const last = m ? m[2] : s;
  const tail = m ? m[3] : '';
  const chars = Array.from(head);
  // the raised rubricated initial is the first letter of the line (or of the last word when the line is one word)
  if (chars.length) {
    return `<span class="da-ini">${e(chars[0])}</span>${e(chars.slice(1).join(''))}<i class="ab-hl da-it">${e(last)}</i>${e(tail)}`;
  }
  const lc = Array.from(last);
  return `<span class="da-ini">${e(lc[0])}</span><i class="ab-hl da-it">${e(lc.slice(1).join(''))}</i>${e(tail)}`;
}

registerAesthetic({
  key: 'dark-academia', order: 40,
  name: 'Dark Academia',
  descriptor: 'Bookish · Candlelit · Inked',
  influences: 'Old libraries / Bookbinding / Collegiate type',
  summary: 'A pool of lamp light on a paper page in a dark oak room, built from book objects.',
  motto: 'Rubricate, don\'t decorate.',
  kicker: 'After hours in the stacks',
  mode: 'dark',
  slideShape: 'classic',
  labels: { material: 'Binding', states: ['Cloth', 'Gilt', 'Sealed'], statesKind: 'swatch' },
  layout: { hero: 'split', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'body', label: 'body', display: 0.86 },
  highlight: 'custom',
  highlightNote: 'The highlighted (last) word is set in the heading face\'s true italic in the rubric colour, and the headline opens with a raised rubricated initial; the rubric is the accent when it holds 3:1 on paper, else oxblood. Always on a paper leaf, never on the dark wood.',
  cardFill: '--da-paper',

  roles: {
    canvas: {
      use: 'The dark oak room under one lamp (a warm radial vignette); a frame around paper, never a surface for reading text',
      never: 'Body text, cards without a paper leaf, or flat black',
      coverage: '≈45%',
    },
    ink: {
      use: 'Ink on the paper leaves (headlines, body, ruled lines); on the wood only small gilt capitals',
      never: 'Long text set straight on the wood, or a cold grey',
      coverage: '≈15%',
    },
    primary: {
      use: 'Book cloth: the brand volume, the selected spine and the one cloth-bound button (darkened to L 25–35%, chroma down about a fifth)',
      never: 'Paper, text, rules or a bright flat fill',
      coverage: '≈10%',
    },
    secondary: {
      use: 'The second cloth: other spines on the shelf, one swatch, the catalogue card\'s progress ribbon',
      never: 'The main action or text',
      coverage: '≈8%',
    },
    accent: {
      use: 'Wax (the seal toggle, the Sealed state) and the rubric: the raised initial, the italic last word and the red rule, when it holds 3:1 on paper; otherwise the rubric falls back to oxblood',
      never: 'Fills, buttons, body text or gold haloes',
      coverage: '≤3%',
    },
  },

  // Dark oak in dark mode; the reading room by day (a tan paper ground) in light mode.
  canvas(b) {
    return b.isDark ? b.mix(DA.oak, b.canvas, 0.82) : b.mix('#E4D8BF', b.canvas, 0.78);
  },

  tokens(t) {
    const d = t.isDark;
    const c1 = daCloth(t.primary), c2 = daCloth(t.secondary);
    const rub = daRubric(t);
    const wax = daWax(t.accent);
    const paper = d ? DA.paper : '#F7F1E2';
    return {
      '--da-paper': paper,
      '--da-paper2': d ? '#E6DBC2' : '#EEE5D0',
      '--da-ink': DA.ink,
      '--da-pencil': DA.pencil,
      '--da-gilt': DA.gilt,
      '--da-label': d ? '#D4B47E' : '#5A4632',
      '--da-label-dim': d ? '#B39A70' : '#6A5640',
      '--da-cloth': c1,
      '--da-cloth2': c2,
      '--da-rubric': rub,
      '--da-wax': wax,
      '--da-wax-hi': t.mix('#ffffff', wax, 0.3),
      '--da-wax-lo': t.mix('#000000', wax, 0.4),
      '--da-pen': DA.pen,
      '--da-lamp': d ? t.mix('#FFCB80', t.canvas, 0.1) : t.mix('#FFF6E0', t.canvas, 0.5),
      '--da-dark': d ? t.mix('#000000', t.canvas, 0.45) : t.mix('#5A4632', t.canvas, 0.14),
      '--ab-line': d ? 'rgba(176, 141, 87, 0.42)' : 'rgba(90, 70, 50, 0.32)',
      '--ab-muted': d ? '#B39A70' : '#6A5640',
      '--ab-ink': d ? '#E9DFC8' : DA.ink,
      '--ab-type-pick-w': '400',
    };
  },

  headline(ctx, text) { return daHeadlineHtml(text); },

  art(ctx) {
    if (typeof window !== 'undefined' && window.loadFontFamily) {
      ['Courier Prime', 'Caveat'].forEach(n => { const f = daFace(n); if (f) window.loadFontFamily(f); });
    }
    const id = `da${++daSeq}`;
    const rnd = daRand(daHash(String(ctx.brandName || 'brand') + '|da'));
    return `<div class="da-art">${daShelf(ctx, id, rnd)}${daPlate(ctx, id + 'p')}</div>`;
  },

  materials: [
    { name: 'Paper leaf', css: 'background: {daPaper}; color: {daInk}; box-shadow: 0 10px 30px rgba(0,0,0,.45); /* every reading surface; a double rule (1px + .5px, 3px apart), a 14px dog-ear or 3-5 foxing spots at 6% */' },
    { name: 'Book cloth', css: 'background: {daCloth}; background-image: repeating-linear-gradient(45deg, rgba(255,255,255,.06) 0 1px, transparent 1px 3px); border-radius: 3px; color: #D9BC86; /* the one button: a 1px gilt rule inset 3px, small-caps gilt label, a manicule */' },
    { name: 'Gilt tooling', css: 'color: #D9BC86; border-color: #B08D57; /* lines, spine titles, folios and small capitals only; never a fill, never a halo */' },
    { name: 'Wax seal', css: 'background: radial-gradient(circle at 35% 30%, {daWaxHi}, {daWax} 55%, {daWaxLo}); border-radius: 48% 52% 50% 50%; /* the Sealed state and the toggle knob; one per view */' },
    { name: 'Rubric', css: 'color: {daRubric}; /* the raised initial, the italic last word, ¶ and § marks and the catalogue card\'s red rule; >= 3:1 on paper */' },
    { name: 'Catalogue card', css: 'background: {daPaper2}; font-family: "Courier Prime", monospace; border-top: 2px solid {daRubric}; /* typed call numbers, faint ruled lines, a punched hole at the bottom centre */' },
  ],

  rules: {
    do: [
      'Set every line of reading text on a paper leaf; on the dark wood use only small gilt capitals.',
      'Rubricate: one raised initial and one italic word in the rubric per page, everything else in ink.',
      'Build components from book objects: spines, cloth bindings, catalogue cards, bookplates and wax seals.',
      'Light the page from one lamp, add small-caps running heads, folio numbers and fleurons between sections.',
    ],
    dont: [
      'Add skulls, ravens, candles everywhere or quill clip-art; this is a library, not a costume.',
      'Set long text on the dark wood or tint everything sepia until the contrast goes muddy.',
      'Use blackletter or gold fills and haloes (that is the gothic and the sacred, not the library).',
      'Fill with lorem ipsum: use real, generic words (Ex Libris, Liber I, Caput III).',
    ],
  },

  deck: {
    principles: [
      ['A lamp-lit page in the dark', 'Light pools on paper; the room stays dark wood.'],
      ['Rubricate, don\'t decorate', 'One oxblood initial or seal marks the page.'],
      ['Books are the interface', 'Spines, cards and plates are the components.'],
    ],
    do: [
      'Set body text on paper leaves, never on dark wood.',
      'Use one oxblood drop cap or seal per slide.',
      'Add small-caps running heads and folio numbers.',
    ],
    dont: [
      'Add skulls, ravens or quill clip-art.',
      'Use blackletter; this is a library.',
      'Sepia-tint everything into mud.',
    ],
    coverDisplay: 0.8,
  },
});
