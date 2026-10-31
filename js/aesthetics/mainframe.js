/* 49 Mainframe — an operations-room look built on an 8px grid. Reference: the structure of
   enterprise design systems (a mini unit of 8px for every size and gap, layered greys instead of
   shadows, filled fields with a bottom rule, left-aligned button labels with the icon flush right).
   Our spin: an operations room. IBM Plex Sans for headings and body (light 300 for the big
   expressive headings, 600 for productive titles), IBM Plex Mono for labels, values and numbering.
   Ground is a near-white (dark: a cool grey-black); a component sits on the next layer up:
   canvas, layer 1 (canvas 4% toward the ink), layer 2 (8%). Radius is 0 everywhere except tags
   (full pill, the one exception). No shadows except overlays (sheet, dialog, toast).
   Primary is printed as a UI blue-or-brand tone that holds 4.6:1 under white text (dark: a lighter
   tone that holds it on the layers). The secondary button is filled with the ink.
   Board and website only: an original stripe raster (the brand initial cut by horizontal stripes
   of uneven pitch and width), a punch-card perforation hairline as the divider and a hanging mono
   numbering column ("01 —"). App screens (.sb-ab, the UI kit) carry none of it. */

/* ---------- stripe raster (board / deck art only) ---------- */

// Seeded PRNG: the same brand always gets the same stripes.
function mfRand(seed) {
  let a = (seed * 2654435761 + 40503) >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function mfHash(s) {
  let h = 2166136261;
  for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

// Stripes of UNEVEN pitch and width between y0 and y1. Pitches and widths are multiples of 4
// (the half unit of the 8px grid), but never one repeated bar: at least 5 distinct widths and at
// least 4 distinct pitches, 10 to 16 stripes, so it can never read as eight even bars.
// Returns [[y, height], ...].
function mfStripes(seed, y0, y1) {
  const PITCH = [8, 12, 16, 20, 24, 32, 40];
  for (let tries = 0; tries < 60; tries++) {
    const rnd = mfRand(seed + tries * 97);
    const out = [];
    let y = y0;
    while (y < y1 - 4) {
      const p = PITCH[Math.floor(rnd() * PITCH.length)];
      const h = Math.max(4, Math.round(p * (0.3 + rnd() * 0.5) / 4) * 4);
      out.push([y, Math.min(h, y1 - y)]);
      y += p;
    }
    const hs = new Set(out.map(s => s[1])), ps = new Set(out.slice(1).map((s, i) => s[0] - out[i][0]));
    if (out.length >= 10 && out.length <= 16 && hs.size >= 5 && ps.size >= 4) return out;
  }
  return [[y0, 8], [y0 + 16, 20], [y0 + 40, 4], [y0 + 52, 28], [y0 + 88, 12], [y0 + 108, 8], [y0 + 128, 32], [y0 + 168, 4], [y0 + 180, 16], [y0 + 204, 24]];
}

// The primary printed for the operations room. Light: pulled darker until white text holds 4.6:1
// and it holds 4.6:1 on layer 2. Dark: lifted until it holds 4.6:1 on layer 2 of the dark stack.
function mfPrimary(primary, dark, canvas, ink) {
  const h = hexToHsl(primary);
  const s = Math.max(30, Math.min(88, h.s));
  const l2 = slMix(ink, canvas, dark ? 0.1 : 0.08);
  if (dark) {
    let l = Math.max(h.l, 52), hex = hslToHex(h.h, s, l);
    while (contrastRatio(hex, l2) < 4.6 && l < 92) { l += 1; hex = hslToHex(h.h, s, l); }
    return hex;
  }
  let l = Math.min(h.l, 46), hex = hslToHex(h.h, s, l);
  while ((contrastRatio(hex, '#ffffff') < 4.6 || contrastRatio(hex, l2) < 4.6) && l > 6) { l -= 1; hex = hslToHex(h.h, s, l); }
  return hex;
}

let mfSeq = 0;

registerAesthetic({
  key: 'mainframe', order: 49,
  name: 'Mainframe',
  descriptor: 'Gridded · Layered · Operational',
  influences: 'Enterprise design systems / Control rooms / Punch cards',
  summary: 'An operations-room look on an 8px grid: layered greys instead of shadows, filled fields with a bottom rule, left-aligned buttons, Plex type and a stripe raster of uneven pitch.',
  motto: 'Grid first. One primary per view.',
  kicker: 'Operations view',
  mode: 'light',
  slideShape: 'minimal',
  labels: { material: 'Layers & controls', states: ['Rest', 'Hover', 'Pressed'], statesKind: 'button' },
  // Editable specimen copy (Brand > Advanced > Specimen copy).
  copy: {
    motto: { label: 'Motto', text: 'Grid first. One primary per view.' },
    kicker: { label: 'Kicker above the headline', text: 'Operations view' },
    state0: { label: 'State 1 name', text: 'Rest' },
    state1: { label: 'State 2 name', text: 'Hover' },
    state2: { label: 'State 3 name', text: 'Pressed' },
    artTitle: { label: 'Hero readout title', text: 'Queue status' },
    rowName0: { label: 'Hero readout row 1', text: 'Intake' },
    rowName1: { label: 'Hero readout row 2', text: 'In review' },
    rowName2: { label: 'Hero readout row 3', text: 'Shipped' },
    rowVal0: { label: 'Hero readout value 1', text: '128' },
    rowVal1: { label: 'Hero readout value 2', text: '64' },
    rowVal2: { label: 'Hero readout value 3', text: '32' },
    artCap: { label: 'Hero readout caption', text: 'Uneven pitch · even grid' },
    hdrNo: { label: 'List header: number', text: 'No.' },
    hdrItem: { label: 'List header: item', text: 'Item' },
    hdrState: { label: 'List header: state', text: 'State' },
    hdrDone: { label: 'List header: progress', text: 'Done' },
    layer0: { label: 'Layer sample 0', text: 'Layer 0 · Canvas' },
    layer1: { label: 'Layer sample 1', text: 'Layer 1 · Card' },
    layer2: { label: 'Layer sample 2', text: 'Layer 2 · Field' },
    fieldLabel: { label: 'Field sample label', text: 'Project name' },
    fieldValue: { label: 'Field sample value', text: 'Something good' },
    fieldHelp: { label: 'Field sample helper line', text: 'Letters and numbers only' },
    fieldErr: { label: 'Field sample error line', text: 'Name is already used' },
    btnLabel: { label: 'Button sample', text: 'Continue' },
    ghostLabel: { label: 'Text button sample', text: 'Cancel' },
    tagLabel: { label: 'Tag sample', text: 'Active' },
  },
  layout: { hero: 'split', palette: 'list', sections: 'two-col' },
  type: { ui: 'sans', label: 'mono', display: 1 },
  highlight: 'ink',
  cardFill: '--ab-layer1',

  roles: {
    canvas: {
      use: 'The ground, layer 0: a near-white (dark: a cool grey-black). Cards, panels, lists and sheets sit one layer up on layer 1 (canvas 4% toward the ink), and a field inside a card sits on layer 2 (8%)',
      never: 'Text, or a shadow: depth comes from the next layer, not from a shadow',
      coverage: '55–65%',
    },
    ink: {
      use: 'Headlines, body text, hairlines, the secondary button (filled ink with on-ink text) and the toast',
      never: 'The main action, or a large filled field in light mode',
      coverage: '15–20%',
    },
    primary: {
      use: 'The one main button per view, links, the focus ring, the selected nav bar and tab rule, the lead data series and progress fill',
      never: 'A second main button, body text under 16px that is not a link, card fills',
      coverage: '≈10%',
    },
    secondary: {
      use: 'Tags, the comparison data series, the tint behind a selected row and the avatar fill',
      never: 'The main action, body text, the page ground',
      coverage: '≈10%',
    },
    accent: {
      use: 'One spark: the highlighted word in a headline and the new-item count badge',
      never: 'Buttons, focus rings, body text, card fills',
      coverage: '≤3%',
    },
  },

  // Near-white with a trace of the brand hue in light; a cool grey-black in dark (hue pinned to
  // the blue-grey end, with a hint of the brand). Pure ground (state.pureBg) replaces it.
  canvas(b) {
    const h = b.hexToHsl(b.primary);
    if (b.isDark) return b.hslToHex(Math.round(h.h * 0.15 + 215 * 0.85), 9, 9);
    return b.hslToHex(h.h, h.s < 6 ? 3 : Math.min(8, h.s * 0.12), 97.5);
  },

  printPrimary(t) { return mfPrimary(t.primary, t.isDark, t.canvas, t.ink); },

  tokens(t, view) {
    const d = t.isDark;
    const pri = t.printPrimary;
    const layer1 = t.mix(t.ink, t.canvas, d ? 0.05 : 0.04);
    const layer2 = t.mix(t.ink, t.canvas, d ? 0.10 : 0.08);
    const layer3 = t.mix(t.ink, t.canvas, d ? 0.15 : 0.12);   // hover on layer 2
    // muted ink holds 4.6:1 on the canvas and on both layers (it is also the field's bottom rule, a UI edge)
    let muted = t.muted;
    for (let k = 0.1; k <= 1.001 && [t.canvas, layer1, layer2].some(g => t.contrast(muted, g) < 4.6); k += 0.1) muted = t.mix(t.ink, t.muted, k);
    const hair = t.mix(t.ink, t.canvas, d ? 0.22 : 0.2);
    // weights: IBM Plex Sans is bundled at 400 and 600 and its variable file serves 300 (css/aesthetics/mainframe.css
    // declares it); any other face gets its nearest published weight
    const hf = view && view.headingFont;
    const isPlex = hf && hf.name === 'IBM Plex Sans';
    const lightW = isPlex ? 300 : (typeof abWeightNear === 'function' ? abWeightNear(hf, 300) : 400);
    const midW = typeof abWeightNear === 'function' ? abWeightNear(hf, 600) : 600;
    // a tag: secondary tint with ink text; the accent tag keeps the accent
    const tagBg = t.mix(t.secondary, t.canvas, d ? 0.3 : 0.28);
    const tagInk = t.ink;
    return {
      '--ab-muted': muted,
      '--ab-layer1': layer1,
      '--ab-layer2': layer2,
      '--ab-layer3': layer3,
      '--ab-hair': hair,
      '--ab-primary-text': pri,
      '--ab-focus': pri,
      '--ab-pri-hover': d ? t.mix('#ffffff', pri, 0.12) : t.mix('#000000', pri, 0.12),
      '--ab-pri-press': d ? t.mix('#ffffff', pri, 0.24) : t.mix('#000000', pri, 0.26),
      '--ab-ink-hover': d ? t.mix('#000000', t.ink, 0.1) : t.mix('#ffffff', t.ink, 0.12),
      '--ab-ink-press': d ? t.mix('#000000', t.ink, 0.22) : t.mix('#ffffff', t.ink, 0.26),
      '--ab-tag-bg': tagBg,
      '--ab-tag-ink': tagInk,
      '--ab-shadow-ov': d
        ? `0 2px 6px ${t.alpha('#000000', 0.5)}, 0 16px 32px -8px ${t.alpha('#000000', 0.6)}`
        : `0 2px 6px ${t.alpha(t.ink, 0.12)}, 0 16px 32px -8px ${t.alpha(t.ink, 0.28)}`,
      '--ab-fig-w': lightW,
      '--ab-title-w': midW,
      '--ab-type-pick-w': lightW,
    };
  },

  // Hero art (board, deck cover): the brand initial cut by horizontal stripes of uneven pitch and
  // width over a ghost of the same raster, beside a hanging numbered mono readout and a punch-card
  // perforation row. Decorative; every value is also written as text.
  art(ctx) {
    const e = escapeHtml;
    const id = 'mfc' + (++mfSeq);
    const initial = String(ctx.initial || (ctx.brandName || 'B')).trim().charAt(0).toUpperCase() || 'B';
    const stripes = mfStripes(mfHash(ctx.brandName || initial), 32, 264);
    const ghost = stripes.map(s => `<rect x="24" y="${s[0]}" width="264" height="${s[1]}"/>`).join('');
    const clip = stripes.map(s => `<rect x="0" y="${s[0]}" width="320" height="${s[1]}"/>`).join('');
    const rows = [0, 1, 2].map(i => {
      const y = 92 + i * 56;
      return `<text class="mfa-no" x="320" y="${y}">${String(i + 1).padStart(2, '0')} —</text>
        <text class="mfa-name" x="320" y="${y + 20}">${abCopy(this, 'rowName' + i)}</text>
        <text class="mfa-val" x="504" y="${y + 20}" text-anchor="end">${abCopy(this, 'rowVal' + i)}</text>
        <path class="mfa-hair" d="M320 ${y + 32}H504"/>`;
    }).join('');
    let holes = '';
    for (let i = 0; i < 23; i++) holes += `<rect x="${320 + i * 8}" y="262" width="4" height="8"/>`;
    return `<div class="mfa">
      <svg class="mfa-svg" viewBox="0 0 520 296" aria-hidden="true" focusable="false">
        <defs><clipPath id="${id}">${clip}</clipPath></defs>
        <rect class="mfa-panel" x="0.5" y="0.5" width="519" height="295"/>
        <g class="mfa-ghost">${ghost}</g>
        <text class="mfa-letter" x="156" y="264" text-anchor="middle" clip-path="url(#${id})">${e(initial)}</text>
        <path class="mfa-hair" d="M304 24V272"/>
        <text class="mfa-title" x="320" y="48">${abCopy(this, 'artTitle')}</text>
        ${rows}
        <g class="mfa-holes">${holes}</g>
        <text class="mfa-cap" x="320" y="288">${abCopy(this, 'artCap')}</text>
      </svg>
    </div>`;
  },

  // 03 list on the board: a table with a header row on layer 2 (14px semibold) and mono values.
  panels: {
    list(ctx) {
      const e = ctx.e;
      const head = `<li class="mf-head" aria-hidden="true"><span class="mf-h-n">${abCopy(this, 'hdrNo')}</span><span class="mf-h-name">${abCopy(this, 'hdrItem')}</span><span class="mf-h-st">${abCopy(this, 'hdrState')}</span><span class="mf-h-bar">${abCopy(this, 'hdrDone')}</span><span class="mf-h-pct">%</span></li>`;
      const rows = ctx.rows.map((r, i) => `<li class="ab-row">
      <span class="ab-row-n">${String(i + 1).padStart(2, '0')}</span>
      <span class="ab-row-name">${e(r[0])}</span>
      <span class="ab-row-status">${e(r[1])}</span>
      <span class="ab-row-bar" aria-hidden="true"><i style="width:${r[2]}%"></i></span>
      <span class="ab-row-pct">${r[2]}%</span>
    </li>`).join('');
      return `<ul class="ab-list">${head}${rows}</ul>`;
    },
  },

  materials: [
    { name: 'Canvas (layer 0)', css: 'background: {canvas}; /* near-white, dark: cool grey-black; nothing sits directly on it except layer-1 components */' },
    { name: 'Layer 1 (cards, panels, lists, sheets)', css: 'background: {layer1}; border: 0; border-radius: 0; box-shadow: none; /* canvas shaded 4% toward the ink; a component takes the next layer up from what it sits on */' },
    { name: 'Layer 2 (fields on a card, table header)', css: 'background: {layer2}; /* canvas shaded 8% toward the ink; hover on it is {layer3} */' },
    { name: 'Field', css: 'background: {layer1}; border: 0; border-bottom: 1px solid {muted}; border-radius: 0; height: 48px; padding: 0 16px; /* on a card the fill is {layer2}; focus: 2px inset outline in {primaryText}; error: 2px inset outline in the error colour plus a helper line in it */' },
    { name: 'Main button', css: 'background: {primary}; color: {onPrimary}; border-radius: 0; min-height: 48px; padding: 0 16px; display: flex; justify-content: space-between; align-items: center; /* label left-aligned, icon flush right; hover {priHover}, pressed {priPress} */' },
    { name: 'Secondary button', css: 'background: {ink}; color: {canvas}; border-radius: 0; min-height: 48px; padding: 0 16px; /* filled ink with on-ink text; hover {inkHover}, pressed {inkPress} */' },
    { name: 'Tag', css: 'background: {tagBg}; color: {tagInk}; border-radius: 999px; padding: 0 8px; min-height: 24px; /* the one rounded element */' },
    { name: 'Overlay (sheet, dialog, toast)', css: 'box-shadow: {shadowOv}; /* the only shadow in the system */' },
  ],

  rules: {
    do: [
      'Build on the 8px grid: every size, gap and padding is a multiple of 8 (4 only for hairline fine-tuning).',
      'Let layers do the work of shadows: a component sits on the next layer up (canvas, layer 1, layer 2).',
      'Keep one primary button per view; the secondary is filled ink, the third level is text only.',
      'Set labels, values and numbering in IBM Plex Mono with tabular figures; set everything else in IBM Plex Sans.',
      'Show focus as a 2px inset outline in the primary, and errors as a 2px inset outline in the error colour plus a helper line.',
    ],
    dont: [
      'Put the stripe raster, perforation row or hanging numbering in the app; they are board and website art only.',
      'Round any corner except a tag, which is a full pill.',
      'Use a shadow on a card, field or button; only sheets, dialogs and the toast cast one.',
      'Set body copy in mono or label text in a weight below 400.',
    ],
  },

  deck: {
    // Material slide: the real components as specimens: the three layers, a field with its helper
    // line and error state, and a button pair with a tag. Pure HTML; styled in the css.
    materialArt(ctx) {
      return `<div class="mfm">
        <div class="mfm-layers" aria-hidden="true">
          <div class="mfm-l0"><span>${abCopy(this, 'layer0')}</span>
            <div class="mfm-l1"><span>${abCopy(this, 'layer1')}</span>
              <div class="mfm-l2"><span>${abCopy(this, 'layer2')}</span></div></div></div>
        </div>
        <div class="mfm-col">
          <div class="mfm-field"><span class="mfm-fl">${abCopy(this, 'fieldLabel')}</span><b class="mfm-fv">${abCopy(this, 'fieldValue')}</b><span class="mfm-fh">${abCopy(this, 'fieldHelp')}</span></div>
          <div class="mfm-field is-error"><span class="mfm-fl">${abCopy(this, 'fieldLabel')}</span><b class="mfm-fv">${abCopy(this, 'fieldValue')}</b><span class="mfm-fh">${abCopy(this, 'fieldErr')}</span></div>
        </div>
        <div class="mfm-col">
          <span class="mfm-btn is-primary"><span>${abCopy(this, 'btnLabel')}</span><i aria-hidden="true">→</i></span>
          <span class="mfm-btn is-ink"><span>${abCopy(this, 'btnLabel')}</span><i aria-hidden="true">→</i></span>
          <span class="mfm-ghost">${abCopy(this, 'ghostLabel')}</span>
          <span class="mfm-tag">${abCopy(this, 'tagLabel')}</span>
        </div>
      </div>`;
    },
    principles: [
      ['Grid first', 'Every size and gap is a multiple of the 8px unit.'],
      ['Layers, not shadows', 'A component sits on the next layer up from its ground.'],
      ['Mono for data', 'Labels, values and numbering in Plex Mono; the rest in Plex Sans.'],
    ],
    do: [
      'Keep one primary per view.',
      'Take the next layer up for each component.',
      'Set data and labels in mono.',
    ],
    dont: [
      'Round anything but a tag.',
      'Cast a shadow on a card.',
      'Put the stripe raster in the app.',
    ],
  },
});
