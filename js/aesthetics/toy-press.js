/* 47 Toy Press — chunky, pressable, playful. Reference: the big pressable buttons of friendly
   learning apps. Our spin is a toy-keycap kit: EVERY pressable (the main key, secondary keys,
   icon keys, segments, checkboxes, the switch knob, tabs, a pressed list row) sits on a solid
   "lip" of its own darker shade, 4px under big keys and 3px under small controls. Pressed =
   the control drops by the lip depth and the lip collapses to 0 in 80 ms.
   The primary key's lip is the PRIMARY shaded darker (same hue, never black). Secondary keys,
   fields and the switch track take the edge colour (ink mixed into the canvas until it holds
   3:1). Cards are flat trays: a 2px line border with a 4px bottom border, no shadow at all.
   Never a blurred shadow, never a gradient, never a pure-black lip.
   Light mode is the home look (the brand canvas). Dark mode: a deep canvas tinted from the brand
   hue; faces lift a step, lips stay darker than their faces.
   Board and website only: a composition of chunky keycaps and stacked toy blocks, one keycap
   carrying the brand initial. App screens carry no art: they are the components and nothing else. */

// A lip: the same hue, clearly darker, never pure black. Lightness drops by 9..24 points.
function tpLip(hex) {
  const h = hexToHsl(hex);
  const drop = Math.max(9, Math.min(24, h.l * 0.4));
  const l = h.l <= 14 ? Math.max(h.l * 0.55, 2.5) : Math.max(h.l - drop, 3);
  // light faces (a cream knob) keep their hue but lose saturation, so the lip reads as a shade, not a tan
  const sat = h.l > 80 ? h.s * 0.75 : Math.min(100, h.s + (h.s > 4 ? 6 : 0));
  return hslToHex(h.h, sat, l);
}

// Pressable key for the art: a lip rect shifted down by `depth`, the face over it.
function tpKey(cls, x, y, w, h, r, depth) {
  return `<g class="tpa-k ${cls}"><rect class="tpa-lip" x="${x}" y="${y + depth}" width="${w}" height="${h}" rx="${r}"/><rect class="tpa-face" x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/></g>`;
}

registerAesthetic({
  key: 'toy-press', order: 47,
  name: 'Toy Press',
  descriptor: 'Chunky · Pressable · Playful',
  influences: 'Learning-app buttons / Keyboard keycaps / Toy blocks',
  summary: 'A toy-keycap kit: every control sits on a solid lip of its own darker shade, and the lip squashes flat when you press it.',
  motto: 'Made to be pressed.',
  kicker: 'Go on, press it',
  mode: 'light',
  slideShape: 'soft',
  labels: { material: 'Keys & lips', states: ['Rest', 'Hover', 'Pressed'], statesKind: 'button' },
  // Editable specimen copy (Brand > Advanced > Specimen copy).
  copy: {
    motto: { label: 'Motto', text: 'Made to be pressed.', warm: 'Made to be enjoyed.' },
    kicker: { label: 'Kicker above the headline', text: 'Go on, press it', warm: 'Take a look around' },
    state0: { label: 'State 1 name', text: 'Rest' },
    state1: { label: 'State 2 name', text: 'Hover' },
    state2: { label: 'State 3 name', text: 'Pressed' },
    matKey: { label: 'Material slide: main key label', text: 'Keep going' },
    matKeyCap: { label: 'Material slide: main key caption', text: 'Main key, 4px lip' },
    matSecond: { label: 'Material slide: secondary key label', text: 'Not now' },
    matSecondCap: { label: 'Material slide: secondary key caption', text: 'Secondary key, edge lip' },
    matCard: { label: 'Material slide: tray title', text: 'Weekly goal' },
    matCardCap: { label: 'Material slide: tray caption', text: '7 of 10 done' },
    matBadge: { label: 'Material slide: badge', text: 'New' },
    matPressed: { label: 'Material slide: pressed caption', text: 'Pressed, lip gone' },
  },
  layout: { hero: 'split', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'body', label: 'body', display: 1 },
  highlight: 'custom',
  highlightNote: 'The word is set in the primary with a hard 3px text lip: text-shadow 0 3px 0 in the primary shaded darker (no blur). When the primary is under 3:1 on the canvas the word is ink on a primary marker strip and the lip is dropped.',
  cardFill: '--ab-surface',

  roles: {
    canvas: {
      use: 'The page, and the face of cards, secondary keys, fields and list rows (in dark mode a step lifted)',
      never: 'Text, or the lip of anything',
      coverage: '55–65%',
    },
    ink: {
      use: 'Headlines, body text, icons, and the label of every secondary key',
      never: 'A large filled field in light mode, or any lip',
      coverage: '15–20%',
    },
    primary: {
      use: 'The one main key per screen with its own darker lip, the headline highlight word, the progress fill, switch "on", checked boxes, the selected segment and tab',
      never: 'Body text, a second main key on one screen, card fills',
      coverage: '≈10–15%',
    },
    secondary: {
      use: 'Badges and sticker pills, avatar fills, the stacked blocks in the art, the tint behind a picked row',
      never: 'The main key, body text, the page background',
      coverage: '≈10%',
    },
    accent: {
      use: 'One spark: the "new" badge, the dot on a tab, the small focal toy in the art',
      never: 'Buttons, body text, borders, card fills',
      coverage: '≤4%',
    },
  },

  // Light: the brand canvas as it is. Dark: a deep canvas tinted from the brand hue (a navy for a
  // blue brand), dark enough that lips and faces both stay visible against it.
  canvas(b) {
    if (!b.isDark) return b.canvas;
    const h = b.hexToHsl(b.primary);
    if (h.s < 10) return b.hslToHex(b.hexToHsl(b.canvas).h, 12, 13);
    return b.hslToHex(h.h, Math.max(20, Math.min(34, h.s * 0.45)), 13);
  },

  tokens(t, view) {
    const d = t.isDark;
    const pri = t.primary;
    const surface = d ? t.mix(t.ink, t.canvas, 0.07) : t.canvas;             // card, secondary key, row face
    const surface2 = d ? t.mix(t.ink, t.canvas, 0.12) : t.mix(t.ink, t.canvas, 0.045);   // field bed, tracks
    // muted text sits on the canvas, the card and the field bed
    let muted = t.muted;
    for (let k = 0.1; k <= 1.001 && [t.canvas, surface, surface2].some(g => t.contrast(muted, g) < 4.6); k += 0.1) muted = t.mix(t.ink, t.muted, k);
    // the edge: border and lip of secondary keys, fields, boxes, the switch track. Ink into canvas until 3:1 on all grounds.
    let edge = t.mix(t.ink, t.canvas, 0.3);
    for (let k = 0.3; k <= 0.95 && [t.canvas, surface, surface2].some(g => t.contrast(edge, g) < 3.05); k += 0.02) edge = t.mix(t.ink, t.canvas, k);
    const lip = tpLip(pri);                                                   // the primary key's lip
    const priHi = t.mix('#ffffff', pri, 0.3);                                 // progress highlight strip
    let priHover = t.mix('#ffffff', pri, 0.12);                               // hover: a lighter face, only while the label still reads
    if (t.contrast(t.onPrimary, priHover) < Math.min(4.5, t.contrast(t.onPrimary, pri))) priHover = pri;
    const mid = t.mix(pri, t.canvas, d ? 0.45 : 0.55);                        // the middle block in the art
    const knob = d ? t.ink : t.canvas;
    const trackOff = edge;
    const disFace = d ? t.mix(t.ink, t.canvas, 0.14) : t.mix(t.ink, t.canvas, 0.1);
    // sticker pills: a secondary tint with ink text (>= 4.6:1)
    let tagBg = t.mix(t.secondary, surface, 0.4);
    for (const a of [0.36, 0.3, 0.24, 0.18, 0.12]) { if (t.contrast(t.ink, tagBg) >= 4.6) break; tagBg = t.mix(t.secondary, surface, a); }
    // the headline highlight: the primary with a hard text lip when it holds 3:1 on the canvas, else ink on a marker
    const priOk = t.contrast(pri, t.canvas) >= 3;
    // a primary that is under 3:1 on the canvas (a pale yellow in light, a near-black in dark) gets a 2px edge: its own lip shade, else the edge colour
    const priBd = priOk ? pri : (t.contrast(lip, t.canvas) >= 3 ? lip : edge);
    // muted text on the picked-row / selected-tab tint
    let mutedTag = muted;
    for (let k = 0.1; k <= 1.001 && t.contrast(mutedTag, tagBg) < 4.6; k += 0.1) mutedTag = t.mix(t.ink, muted, k);
    const hf = view && view.headingFont;
    const hw = typeof abWeightNear === 'function' ? abWeightNear(hf, 700) : 700;
    return {
      '--ab-muted': muted,
      '--ab-surface': surface,
      '--ab-surface-2': surface2,
      '--ab-surface2': surface2,   // alias: the brief's material placeholder {surface2} resolves to this name
      '--ab-edge': edge,
      '--ab-edge-lip': tpLip(edge),
      '--ab-lip': lip,
      '--ab-pri-hi': priHi,
      '--ab-pri-hover': priHover,
      '--ab-mid': mid,
      '--ab-mid-lip': tpLip(mid),
      '--ab-sec-lip': tpLip(t.secondary),
      '--ab-acc-lip': tpLip(t.accent),
      '--ab-ink-lip': tpLip(t.ink),
      '--ab-knob': knob,
      '--ab-knob-lip': tpLip(knob),
      '--ab-track-off': trackOff,
      '--ab-track': t.mix(t.ink, surface, d ? 0.18 : 0.1),
      '--ab-dis-face': disFace,
      '--ab-dis-lip': tpLip(disFace),
      '--ab-tag-bg': tagBg,
      '--ab-muted-tag': mutedTag,
      '--ab-pri-bd': priBd,
      '--ab-primary-text': priOk ? pri : t.ink,
      '--ab-hl': priOk ? pri : t.ink,
      '--ab-hl-lip': priOk ? lip : 'transparent',
      '--ab-hl-mark': priOk ? 'transparent' : pri,
      '--ab-hw': hw,
      '--ab-type-pick-w': hw,
    };
  },

  // Hero art (board, deck cover): a house of stacked toy blocks beside a big keycap carrying the
  // brand initial, two small keys on the right, short "pressed" ticks over the big key. Flat shapes,
  // each on its own lip, in the palette only. Website / board art; never in the app.
  art(ctx) {
    const e = escapeHtml;
    const ini = e(ctx.initial || (ctx.brandName || 'B').trim().charAt(0).toUpperCase() || 'B');
    const D = 10;
    // toy-block house: base (secondary) / middle (primary tint) / roof (accent)
    const base = tpKey('tpa-sec', 36, 226, 176, 80, 18, D);
    const holes = [80, 124, 168].map(x => `<circle class="tpa-hole" cx="${x}" cy="266" r="9"/>`).join('');
    const mid = tpKey('tpa-mid', 62, 146, 124, 80, 16, D);
    const arch = '<path class="tpa-hole tpa-hole-m" d="M104 226 V196 a20 20 0 0 1 40 0 V226 Z"/>';
    const roofPts = '92,148 156,148 124,98';
    const roof = `<g class="tpa-k tpa-acc"><polygon class="tpa-lip" points="${roofPts}" transform="translate(0 ${D})"/><polygon class="tpa-face" points="${roofPts}"/></g>`;
    // the big keycap: skirt (lip colour), top face, a dish with a rim, the initial
    const cap = `<g class="tpa-k tpa-pri tpa-cap"><rect class="tpa-lip" x="236" y="146" width="176" height="164" rx="38"/>
      <rect class="tpa-face" x="250" y="124" width="148" height="128" rx="32"/>
      <rect class="tpa-dish" x="266" y="140" width="116" height="96" rx="24"/>
      <text class="tpa-ini" x="324" y="214" text-anchor="middle">${ini}</text></g>`;
    const ticks = '<path class="tpa-tick" d="M292 104 l-8 -20 M324 98 v-24 M356 104 l8 -20"/>';
    // two small keys: surface key with an enter arrow, accent key with a plus
    const keyA = tpKey('tpa-surf', 428, 214, 70, 70, 18, 8);
    const arrow = '<path class="tpa-glyph" d="M479 234 v16 h-28 M460 242 l-9 8 l9 8"/>';
    const keyB = tpKey('tpa-acc', 436, 126, 62, 62, 16, 8);
    const plus = '<path class="tpa-glyph tpa-glyph-on" d="M467 142 v30 M452 157 h30"/>';
    return `<svg class="tpa" viewBox="0 60 520 280" aria-hidden="true" focusable="false">
      <rect class="tpa-ground" x="16" y="318" width="488" height="14" rx="7"/>
      ${base}${holes}${mid}${arch}${roof}
      ${cap}
      ${ticks}${keyA}${arrow}${keyB}${plus}
      <circle class="tpa-dot tpa-dot-s" cx="218" cy="112" r="6"/><circle class="tpa-dot tpa-dot-i" cx="418" cy="104" r="5"/>
    </svg>`;
  },

  materials: [
    { name: 'Main key', css: 'background: {primary}; color: {onPrimary}; border-radius: 16px; min-height: 52px; box-shadow: 0 4px 0 {lip}; /* the lip is the primary shaded darker: --lip. Hover {priHover}. Pressed: transform: translateY(4px); box-shadow: 0 0 0 {lip}; 80 ms */' },
    { name: 'Secondary key', css: 'background: {surface}; color: {ink}; border: 2px solid {edge}; border-radius: 16px; min-height: 52px; box-shadow: 0 4px 0 {edge}; /* pressed: translateY(4px), shadow 0 */' },
    { name: 'Card (flat tray)', css: 'background: {surface}; border: 2px solid {line}; border-bottom-width: 4px; border-radius: 16px; box-shadow: none; /* no shadow at all; the thick bottom edge is the tray */' },
    { name: 'Field', css: 'background: {surface2}; border: 2px solid {edge}; border-radius: 14px; color: {ink}; /* focus: border and a 2px outline in the primary */' },
    { name: 'Chunky progress', css: 'height: 14px; border-radius: 999px; background: {track}; /* fill: {primary}, with a 4px strip of {priHi} across its top third */' },
    { name: 'Sticker badge', css: 'background: {tagBg}; color: {ink}; border: 2px solid {canvas}; border-radius: 999px; padding: 2px 10px; /* new/count badge: {accent} fill with {onAccent} text */' },
    { name: 'Switch and checkbox', css: 'background: {trackOff}; box-shadow: 0 3px 0 {edgeLip}; /* on: {primary} with a 3px {lip} lip; the knob is {knob} on its own 3px lip */' },
  ],

  rules: {
    do: [
      'Put every pressable on a solid lip of its own darker shade: 4px under keys, 3px under segments, boxes, knobs and tabs. One lip depth per size, everywhere.',
      'On press, move the control down by the lip depth and collapse the lip to 0 in 80 ms; release brings it back.',
      'Shade the primary key\'s own hue for its lip; secondary keys, fields and the switch track take the edge colour.',
      'Keep one main key per screen; everything else is a secondary key or a text button.',
      'Round corners at 14–16px, pills for badges, sentence-case labels in the rounded face. Cards are flat trays: 2px line border, 4px bottom.',
    ],
    dont: [
      'Blur a shadow, use a gradient or colour a lip pure black.',
      'Put the keycap and toy-block art, or any texture, in the app; it belongs on the board and the website.',
      'Use the secondary colour for the primary key\'s lip, or mix lip depths on one screen.',
      'Set labels in uppercase or tracked capitals, or use serif, mono or condensed faces.',
    ],
  },

  deck: {
    // Material slide: the kit as specimens: a main key at rest next to a pressed one (lip gone), a
    // secondary key, and a tray with chunky progress and a badge.
    materialArt(ctx) {
      const e = ctx.e || escapeHtml;
      return `<div class="tpm">
        <div class="tpm-col">
          <button type="button" class="tpm-key" tabindex="-1">${abCopy(this, 'matKey')}</button>
          <span class="tpm-cap">${abCopy(this, 'matKeyCap')}</span>
        </div>
        <div class="tpm-col">
          <button type="button" class="tpm-key is-pressed" tabindex="-1">${abCopy(this, 'matKey')}</button>
          <span class="tpm-cap">${abCopy(this, 'matPressed')}</span>
        </div>
        <div class="tpm-col">
          <button type="button" class="tpm-key tpm-second" tabindex="-1">${abCopy(this, 'matSecond')}</button>
          <span class="tpm-cap">${abCopy(this, 'matSecondCap')}</span>
        </div>
        <div class="tpm-tray">
          <div class="tpm-trayhead"><b>${abCopy(this, 'matCard')}</b><span class="tpm-badge">${abCopy(this, 'matBadge')}</span></div>
          <div class="tpm-bar"><i style="width:70%"></i></div>
          <span class="tpm-cap">${abCopy(this, 'matCardCap')}</span>
        </div>
      </div>`;
    },
    principles: [
      ['Everything has a lip', 'A solid, darker shade of the same colour sits under every key.'],
      ['Pressed means flat', 'The control drops by its lip and the lip collapses, fast.'],
      ['Flat trays, no blur', 'Cards are bordered trays; shadows are never blurred.'],
    ],
    do: [
      'Give each key its own lip.',
      'Collapse the lip on press.',
      'Keep one main key per screen.',
    ],
    dont: [
      'Blur shadows or use gradients.',
      'Put art in the app.',
      'Set labels in capitals.',
    ],
  },
});
