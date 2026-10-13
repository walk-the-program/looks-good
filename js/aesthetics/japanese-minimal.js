/* 39 Japanese Minimal — quiet, precise, spacious product UI. References (docs/research/round6.md §3):
   Kenya Hara's "emptiness" as a material, Muji's flat fields and small labels, Naoto Fukasawa's
   "without thought" restraint, and the plain, dense-but-calm digital systems of Japanese public
   and corporate sites.

   Mechanism.
   - Ground: a warm off-white (near #F7F6F3) or a near-black in dark mode. Never pure white.
   - Ma: most of every surface is empty. Content sits on one strict grid, aligned to shared columns.
   - Lines: 1px hairline rules only. No shadows, textures, brush strokes, ensō or gold.
   - Type: a small, even gothic for UI and body (the brand's sans). A mincho (the brand's serif or
     Shippori Mincho) is used once per view, for the emphasised headline word, and nowhere else.
   - Colour: the client primary becomes the one plain rectangular action (2px corners, fill) and
     the selected state. The accent is a restrained tone of the primary, used as a single small
     hinomaru dot (a circle, as on a Japanese flag or a company seal) per view.
   Hero: a large field of space with a precise grid of thin lines, one small circle on a grid
   intersection, and a vertical label. No illustration. */

const JM = {
  ground: '#F7F6F3', night: '#161615', ink: '#1C1C1A', inkDark: '#ECEBE6',
};

// Ink: near-black, pulled a little toward the brand ink. Dark mode: near-white.
function jmInk(t) {
  return t.isDark ? t.mix(JM.inkDark, t.ink, 0.7) : t.mix(JM.ink, t.ink, 0.7);
}

// The hinomaru dot: a restrained tone of the client primary, at least 3:1 on the canvas.
function jmDot(t) {
  const { h, s, l } = hexToHsl(t.primary);
  const sat = Math.min(s, 62);
  const step = t.isDark ? 2 : -2;
  let ll = t.isDark ? Math.max(l, 52) : Math.min(l, 50);
  let out = hslToHex(h, sat, ll);
  for (let i = 0; i < 40 && contrastRatio(out, t.canvas) < 3; i++) {
    ll = Math.max(4, Math.min(96, ll + step));
    out = hslToHex(h, sat, ll);
  }
  return out;
}

function jmFaces(ctx) {
  const st = ctx.state || {};
  return {
    h: String((st.headingFont && st.headingFont.css) || 'Helvetica, Arial, sans-serif').replace(/'/g, '"'),
    b: String((st.bodyFont && st.bodyFont.css) || 'sans-serif').replace(/'/g, '"'),
  };
}

// Headline: small, regular weight, left-aligned on a strict column. The last word is the one
// emphasis in the view: it keeps the ink colour and is set in the mincho stack (no colour fill).
function jmHeadlineHtml(text) {
  const e = escapeHtml;
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '';
  const last = words[words.length - 1];
  const m = last.match(/^(.*?)([.,;:!?…]*)$/);
  const word = m && m[1] ? m[1] : last;
  const tail = m && m[1] ? m[2] : '';
  const body = words.slice(0, -1);
  const total = words.join(' ').length;
  const budget = Math.max(12, Math.ceil(total / (total > 30 ? 2 : 1)));
  const lines = [];
  let cur = [];
  body.forEach(w => {
    if (cur.length && (cur.join(' ') + ' ' + w).length > budget) { lines.push(cur); cur = []; }
    cur.push(e(w));
  });
  cur.push(`<span class="ab-hl jm-em">${e(word)}</span>${e(tail)}`);
  lines.push(cur);
  return lines.map(ln => `<span class="jm-ln">${ln.join(' ')}</span>`).join('');
}

// The hero: a field of space with a precise grid of hairlines, one dot on an intersection and
// a vertical label. Coordinates on a 200 x 176 box; the grid is 32 units per cell.
function jmHeroSvg(ctx) {
  const t = ctx.t;
  const ink = jmInk(t);
  const dot = jmDot(t);
  const f = jmFaces(ctx);
  const cols = [24, 56, 88, 120, 152, 184];
  const rows = [24, 56, 88, 120, 152];
  let g = '';
  cols.forEach(x => { g += `<path d="M${x} 24V152"/>`; });
  rows.forEach(y => { g += `<path d="M24 ${y}H184"/>`; });
  return `<div class="jm-art"><svg class="jm-scene" viewBox="0 0 200 176" xmlns="http://www.w3.org/2000/svg" role="presentation">
      <g stroke="${t.alpha(ink, 0.3)}" stroke-width=".5" fill="none">${g}</g>
      <path d="M24 152H184" stroke="${t.alpha(ink, 0.6)}" stroke-width=".5" fill="none"/>
      <circle cx="120" cy="88" r="5" fill="${dot}"/>
      <text x="197" y="152" font-family='${f.b}' font-size="5.2" letter-spacing="1.1" fill="${ink}" opacity=".7" transform="rotate(-90 197 152)">JAPANESE MINIMAL</text>
    </svg></div>`;
}

// The deck's Material slide: three specimens of the UI rules (hairline, one plain action, one dot).
function jmSpecimenSvg(ctx) {
  const t = ctx.t;
  const ink = jmInk(t);
  const dot = jmDot(t);
  const f = jmFaces(ctx);
  const cap = (x, s) => `<text x="${x}" y="134" text-anchor="middle" font-family='${f.b}' font-size="6.4" letter-spacing="1.3" fill="${ink}">${s}</text>`;
  return `<div class="jm-art"><svg class="jm-set" viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg" role="presentation">
      <path d="M20 40H100" stroke="${ink}" stroke-width=".5"/>
      <path d="M20 60H100" stroke="${t.alpha(ink, 0.45)}" stroke-width=".5"/>
      <path d="M20 80H100" stroke="${t.alpha(ink, 0.25)}" stroke-width=".5"/>
      <rect x="130" y="34" width="40" height="22" rx="2" fill="${t.primary}"/>
      <circle cx="250" cy="45" r="6" fill="${dot}"/>
      ${cap(60, 'HAIRLINE 1PX')}${cap(150, 'PLAIN ACTION')}${cap(250, 'ONE DOT')}
    </svg></div>`;
}

registerAesthetic({
  key: 'japanese-minimal', order: 39,
  name: 'Japanese Minimal',
  descriptor: 'Quiet · Precise · Spacious',
  influences: 'Kenya Hara / Muji / Naoto Fukasawa',
  summary: 'Ma as the material: a warm off-white ground, a strict grid, hairline rules and one small dot of colour.',
  motto: 'Less, placed exactly.',
  kicker: 'Less, measured',
  mode: 'light',
  slideShape: 'minimal',
  labels: { material: 'Control', states: ['Rest', 'Focus', 'Done'], statesKind: 'swatch' },
  layout: { hero: 'split', palette: 'list', sections: 'two-col' },
  type: { ui: 'sans', label: 'sans', display: 0.8 },
  highlight: 'custom',
  highlightNote: 'The highlighted word keeps the ink colour and is set in a mincho (serif) at regular weight. No colour fill, no band, no underline, and no dot in the headline; the single hinomaru dot belongs to the hero art.',
  cardFill: '--ab-jm-card',

  roles: {
    canvas: {
      use: 'Warm off-white (near #F7F6F3) as the ground; about three quarters of every surface stays empty',
      never: 'Pure white, a tint of the brand colour, texture or grain',
      coverage: '≈75%',
    },
    ink: {
      use: 'Near-black for headings, body text, rules and the hairlines (as a tint)',
      never: 'Bold display weights, large dark fills or thick rules',
      coverage: '≈12%',
    },
    primary: {
      use: 'The one plain rectangular action (2px corners, filled), the selected segment’s underline, the focus ring and the progress fill',
      never: 'Body text, decorative fills, shadows, or more than one action per view',
      coverage: '≈6%',
    },
    secondary: {
      use: 'Quiet structure: a tonal tag, the selected list row and the progress track',
      never: 'The main action, body text or the page background',
      coverage: '≈5%',
    },
    accent: {
      use: 'The hinomaru dot: one small circle per view, drawn in a restrained tone of the primary',
      never: 'Fills, buttons, rules, text, or more than one dot per view',
      coverage: '≤1%',
    },
  },

  // Warm off-white in light mode, a near-black ground in dark mode; never a pure neutral.
  canvas(b) {
    return b.isDark ? b.mix(JM.night, b.canvas, 0.8) : b.mix(JM.ground, b.canvas, 0.8);
  },

  tokens(t, st) {
    const view = st || (typeof state !== 'undefined' ? state : {}) || {};
    if (typeof window !== 'undefined' && window.loadFontFamily && typeof FONTS !== 'undefined') {
      const mincho = FONTS.find(f => f.name === 'Shippori Mincho');
      if (mincho) window.loadFontFamily(mincho);
    }
    const d = t.isDark;
    const ink = jmInk(t);
    const card = d ? t.mix('#ffffff', t.canvas, 0.04) : t.mix('#ffffff', t.canvas, 0.5);
    return {
      '--ab-ink': ink,
      // muted text must hold 4.6:1 on the canvas; if the mix does not, fall back to the ink itself
      '--ab-muted': (t.contrast(t.mix(ink, t.canvas, d ? 0.8 : 0.66), t.canvas) >= 4.6) ? t.mix(ink, t.canvas, d ? 0.8 : 0.66) : ink,
      '--ab-line': t.alpha(ink, d ? 0.3 : 0.22),
      '--ab-jm-card': card,
      '--ab-jm-dot': jmDot(t),
      // the accent row shows the dot's own hex (the dot follows the primary, not the client accent)
      '--jm-accent-hex': JSON.stringify(jmDot(t).toUpperCase()),
      '--ab-type-pick-w': '400',
      // the selected segment's weight, from the weights the UI face really has (font-synthesis is off)
      '--jm-ui-mid': abWeight(view.bodyFont || view.headingFont, 500),
    };
  },

  headline(ctx, text) { return jmHeadlineHtml(text); },

  art(ctx) { return jmHeroSvg(ctx); },

  materials: [
    { name: 'Ground', css: 'background: {canvas}; /* warm off-white, never pure white; no texture, no grain, no shadows */' },
    { name: 'Plain action', css: 'background: {primary}; color: {onPrimary}; border-radius: 2px; font-size: 12px; letter-spacing: .08em; /* one per view; hover darkens one step, focus shows a 2px ring in the primary */' },
    { name: 'Hairline rule', css: 'height: 1px; background: {line}; /* the only divider; rows and sections are separated by 1px rules, never boxes */' },
    { name: 'Hinomaru dot', css: 'background: {jmDot}; border-radius: 50%; /* one small circle per view, on a grid intersection or beside a state */' },
    { name: 'Grid', css: 'columns: 6 equal; gutters: 32px; /* every block aligns to the same columns; text left-aligned */' },
  ],

  rules: {
    do: [
      'Leave about three quarters of every surface empty; align content to one visible grid.',
      'Set headings small, regular weight, left-aligned; use the mincho for the single emphasis word only.',
      'Separate rows and sections with 1px hairline rules.',
      'Use one plain rectangular action per view with 2px corners; keep one hinomaru dot per view.',
    ],
    dont: [
      'Add textures, brush strokes, ensō, gold, tea bowls or any ornament.',
      'Use shadows, gradients, pill shapes or heavy borders.',
      'Set headings in bold or fill large areas with brand colour.',
      'Add more than one accent dot or a second action in a view.',
    ],
  },

  deck: {
    principles: [
      ['Ma is the material', 'Empty space does the work that colour and ornament usually do.'],
      ['One grid, kept strictly', 'Every block sits on the same columns and the same baseline.'],
      ['One dot, rarely', 'A single small accent circle is the only colour outside the action.'],
    ],
    do: [
      'Leave at least half of each slide empty.',
      'Align everything to one visible grid with 1px hairline rules.',
      'Use one small accent dot per slide, never more.',
    ],
    dont: [
      'Add textures, brush strokes, ensō, gold or tea-bowl imagery.',
      'Use shadows, gradients or pill-shaped controls.',
      'Set headings in bold or fill large areas with colour.',
    ],
    materialArt: ctx => jmSpecimenSvg(ctx),
    marks: (ctx, kind) => `<i class="jm-mk" data-k="${kind === 'do' ? 'do' : 'dont'}"></i>`,
    coverDisplay: 0.8,
  },
});
