/* 53 Patchbay — a modular-synth patch bay. Reference: the dark node-graph workflow editors of
   current creative tools (ideas only: no assets, names or marks). Our spin: the brand colours are
   the cables and ports. Rounded dark cards with hairline edges are the modules; coloured status
   dots and small name-tag chips carry the palette; one white pill (light mode: an ink pill) is the
   single main action, with grey pills beside it; numbers are set in a mono face.

   Colour. The ground is a near-black neutral (dark, the default mode) or a pale grey (light); cards
   are a step lighter (dark) or white (light). Every colour a port, a dot or a tag uses is the
   brand primary / secondary / accent pushed (toward black or white, the least it can) until it
   holds 3:1 on the ground AND on the card, with its label on it at 4.5:1. The main action is
   filled with the ink (ctaFill 'ink'), not the primary.

   Board and website only: the hero art is a code-drawn node graph. Four modules hold the brand
   initial, the brand name, two mono read-outs and a preview block, joined by smooth bezier cables
   in the brand colours, a soft glow behind the output module, a faint dot grid, two name-tag chips
   with cursors, floating pill toolbars and a mono read-out. App screens (.sb-ab, .sb-kit) draw none
   of it: no dot grid, no glow, no wires, no texture. Cards, a title row with a status dot, pill
   toolbars, the ink pill, grey pills, name-tag chips and mono numerals only. */
(function () {
const PB_KEY = 'patchbay';   // abCopy key for the plain functions below (js/aesthetics/registry.js)
let pbSeq = 0;               // unique SVG ids per rendered board (compare grid, deck)

const pbCR = (a, b) => (typeof contrastRatio === 'function' ? contrastRatio(a, b) : 21);
const pbMix = (a, b, k) => (typeof slMix === 'function' ? slMix(a, b, k) : a);
const pbOn = bg => (typeof pickReadableText === 'function' ? pickReadableText(bg) : (pbCR('#ffffff', bg) >= pbCR('#141414', bg) ? '#ffffff' : '#141414'));
const pbBest = bg => Math.max(pbCR('#ffffff', bg), pbCR('#141414', bg));

// The card colour for a token set: a step lighter than the near-black ground, or white on the pale grey one.
const pbCard = t => (t.isDark ? pbMix(t.ink, t.canvas, 0.055) : '#ffffff');

// A colour pushed toward black or white (whichever is further from the first bg) until it holds `floor`:1 on every bg.
function pbHold(hex, bgs, floor) {
  const ok = c => bgs.every(b => pbCR(c, b) >= floor);
  if (ok(hex)) return hex;
  const to = pbCR(bgs[0], '#000000') > pbCR(bgs[0], '#ffffff') ? '#000000' : '#ffffff';
  let c = hex;
  for (let k = 0.04; k <= 1.0001 && !ok(c); k += 0.04) c = pbMix(to, hex, k);
  return c;
}

// A port / dot / tag colour: 3:1 on every bg AND a label (white or near-black) on it at 4.5:1.
// A mid-tone that fails the label is nudged the shortest way toward black or white that keeps both.
function pbTone(hex, bgs) {
  const c = pbHold(hex, bgs, 3.1);
  if (pbBest(c) >= 4.5) return c;
  for (let k = 0.03; k <= 0.7; k += 0.03) {
    for (const to of ['#000000', '#ffffff']) {
      const n = pbMix(to, c, k);
      if (bgs.every(b => pbCR(n, b) >= 3.1) && pbBest(n) >= 4.5) return n;
    }
  }
  return c;
}

// The three beds a port colour has to read on: ground, card, the inset field inside a card.
function pbBeds(t) {
  const card = pbCard(t);
  return [t.canvas, card, pbMix(t.ink, card, t.isDark ? 0.06 : 0.045)];
}

// ---- the node graph (board / deck art) ----

// A smooth cable between two ports: a cubic bezier that leaves and enters horizontally.
function pbWire(x1, y1, x2, y2) {
  const d = Math.max(10, Math.min(60, (x2 - x1) * 0.5));
  return `M${x1} ${y1}C${x1 + d} ${y1} ${x2 - d} ${y2} ${x2} ${y2}`;
}

// A name tag: a rounded chip with the bottom-left corner squared, beside a small cursor arrow whose tip is (x, y).
function pbNameTag(x, y, label, cls) {
  const e = escapeHtml;
  const w = Math.round(String(label).length * 6.6 + 16), h = 19, cx = x + 8, cy = y + 13, r = 6;
  const chip = `M${cx + 1} ${cy}H${cx + w - r}Q${cx + w} ${cy} ${cx + w} ${cy + r}V${cy + h - r}Q${cx + w} ${cy + h} ${cx + w - r} ${cy + h}H${cx}V${cy + r}Q${cx} ${cy} ${cx + 1} ${cy}Z`;
  const cur = `M${x} ${y}L${x} ${y + 14}L${x + 3.8} ${y + 10.6}L${x + 6.6} ${y + 16.4}L${x + 8.8} ${y + 15.4}L${x + 6.1} ${y + 9.8}L${x + 11} ${y + 9.6}Z`;
  return `<g class="pba-tag ${cls}"><path class="pba-cur" d="${cur}"/><path class="pba-chip" d="${chip}"/><text class="pba-tagt" x="${cx + 8}" y="${cy + 13}">${e(label)}</text></g>`;
}

// The brand name fitted into a module: truncated, and sized so it stays inside ~118 units.
function pbFitName(name) {
  const s = String(name || '').trim();
  const shown = Array.from(s).length > 18 ? Array.from(s).slice(0, 17).join('') + '…' : s;
  const n = Math.max(6, Array.from(shown).length);
  return { shown, size: Math.max(11, Math.min(24, Math.round(118 / (0.6 * n)))) };
}

registerAesthetic({
  key: 'patchbay', order: 53,
  name: 'Patchbay',
  descriptor: 'Modular · Nocturnal · Wired',
  influences: 'Node-graph editors / Modular synth patch bays / Multiplayer cursors',
  summary: 'A dark patch bay: rounded modules with hairline edges, brand-colour cables and ports, name-tag chips, and one white pill for the main action.',
  motto: 'Wire it up. Share it.',   // = copy.motto.text
  kicker: 'Patch bay',              // = copy.kicker.text
  mode: 'dark',
  slideShape: 'refined',
  ctaFill: 'ink',   // the main action is the white (light mode: ink) pill; the brand colours are the cables and ports
  labels: { material: 'Cables & modules', states: ['Rest', 'Hover', 'Pressed'], statesKind: 'button' },
  // Editable specimen copy (Brand > Advanced > Specimen copy).
  copy: {
    motto: { label: 'Motto', text: 'Wire it up. Share it.', warm: 'Connect it. Share it.' },
    kicker: { label: 'Kicker above the headline', text: 'Patch bay' },
    state0: { label: 'State 1 name', text: 'Rest' },
    state1: { label: 'State 2 name', text: 'Hover' },
    state2: { label: 'State 3 name', text: 'Pressed' },
    nodeIn: { label: 'Graph: first module title', text: 'input' },
    nodeMix: { label: 'Graph: second module title', text: 'mix' },
    nodeName: { label: 'Graph: third module title', text: 'name' },
    nodeOut: { label: 'Graph: output module title', text: 'output' },
    paramA: { label: 'Graph: first read-out label', text: 'gain' },
    paramB: { label: 'Graph: second read-out label', text: 'blend' },
    tag1: { label: 'Graph: first name tag', text: 'Mira' },
    tag2: { label: 'Graph: second name tag', text: 'Jun' },
    barA: { label: 'Graph: toolbar item 1', text: 'Graph' },
    barB: { label: 'Graph: toolbar item 2', text: 'Edit' },
    pillMain: { label: 'Graph: white pill label', text: 'Share' },
    pillSecondary: { label: 'Graph: grey pill label', text: 'Preview' },
    readout: { label: 'Graph: corner read-out', text: 'x 128   y 64   z 1.0' },
  },
  layout: { hero: 'split', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'sans', label: 'body', display: 1 },
  highlight: 'ink',
  cardFill: '--ab-pb-card',

  roles: {
    canvas: {
      use: 'The ground: a near-black neutral in dark mode, a pale grey in light mode. Cards sit a step above it; the dot grid of the hero graph is drawn on it',
      never: 'Text, a card fill, or a tint of the brand colours',
      coverage: '45–60%',
    },
    ink: {
      use: 'Headlines, body text, the fill of the one main action (the white pill in dark mode, an ink pill in light; the canvas colour is its label) and every hairline as a tint',
      never: 'More than one filled pill on a view',
      coverage: '20–25%',
    },
    primary: {
      use: 'The first cable and port colour: the status dot in a card title, the selected check, the switch "on", the slider and progress fill, the focus ring and the brand initial module of the hero graph. Pushed until it holds 3:1 on the ground and on a card',
      never: 'The main action fill, body text, a card fill',
      coverage: '≈10–15%',
    },
    secondary: {
      use: 'The second cable and port colour and a name-tag chip fill; pushed until it holds 3:1 on the ground and a label on it holds 4.5:1',
      never: 'The main action, body text, a ground',
      coverage: '≈8–10%',
    },
    accent: {
      use: 'The third cable and port colour and the second name-tag chip; the one loud tag per view',
      never: 'Body text, a card fill, the main action',
      coverage: '≤5%',
    },
  },

  // Ground: near-black (dark, the default) or pale grey (light), a whisper of the brand neutral's hue.
  canvas(b) {
    const h = b.hexToHsl(b.canvas);
    return b.isDark ? b.hslToHex(h.h, Math.min(h.s, 10), 6.5) : b.hslToHex(h.h, Math.min(h.s, 8), 94.5);
  },

  // The primary is printed as the nearest colour that holds 3:1 on the ground, the card and an inset field,
  // with a 4.5:1 label on it; a primary that already does is left alone.
  printPrimary(t) { return pbTone(t.primary, pbBeds(t)); },

  tokens(t, st) {
    const d = t.isDark, ink = t.ink, ground = t.canvas;
    const card = pbCard(t);
    const beds = pbBeds(t);
    const inset = beds[2];                                         // a field or a toolbar track inside a card
    const grey = pbMix(ink, card, d ? 0.13 : 0.09);                // the grey pill, the selected segment, an icon button
    const greyHi = pbMix(ink, card, d ? 0.19 : 0.14);              // grey pill, hover / pressed
    const pri = t.printPrimary;
    const sec = pbTone(t.secondary, beds), acc = pbTone(t.accent, beds);
    // muted: 4.6:1 on every bed text can sit on (ground, card, inset field, grey pill, hovered grey pill)
    const textBeds = [ground, card, inset, grey, greyHi];
    let muted = t.muted;
    for (let k = 0.1; k <= 1.001 && textBeds.some(b => t.contrast(muted, b) < 4.6); k += 0.1) muted = t.mix(ink, t.muted, k);
    // field / unselected-control edge: the ink pulled toward the card until it holds 3:1 on every bed
    let edge = t.mix(ink, card, 0.55);
    for (let k = 0.55; k <= 1.001 && beds.some(b => t.contrast(edge, b) < 3.1); k += 0.05) edge = t.mix(ink, card, k);
    const hf = st && st.headingFont;
    const hw = typeof abWeightNear === 'function' ? abWeightNear(hf, 600) : 600;
    return {
      '--ab-muted': muted,
      '--ab-line': pbMix(ink, ground, d ? 0.13 : 0.12),            // decorative hairline (card edge, dividers)
      '--ab-pb-hair': pbMix(ink, ground, d ? 0.13 : 0.12),
      '--ab-pb-edge': edge,                                        // 3:1 edge of a field, checkbox or selected segment
      '--ab-pb-card': card,
      '--ab-pb-inset': inset,
      '--ab-pb-grey': grey, '--ab-pb-grey-hi': greyHi,
      '--ab-pb-pri': pri, '--ab-pb-on-pri': pbOn(pri),
      '--ab-pb-sec': sec, '--ab-pb-on-sec': pbOn(sec),
      '--ab-pb-acc': acc, '--ab-pb-on-acc': pbOn(acc),
      '--ab-pb-ink-hover': pbMix(ink, ground, 0.86),               // the main pill, hover
      '--ab-pb-ink-press': pbMix(ink, ground, 0.74),               // the main pill, pressed
      '--ab-hw': hw,
      '--ab-type-pick-w': hw,
    };
  },

  // Hero art (board, deck cover): a node graph drawn in SVG. Four modules (the brand initial, a pair of
  // mono read-outs, the brand name, a glowing output holding a preview block) joined by bezier cables in
  // the three brand colours, over a faint dot grid. Two name tags with cursors, pill toolbars and a mono
  // read-out sit in the corners. No motion.
  art(ctx) {
    const e = escapeHtml;
    const id = 'pba' + (++pbSeq);
    const c = k => abCopy(this, k);
    const nm = pbFitName(ctx.brandName);
    const init = e(ctx.initial);
    // modules: x, y, w, h
    const A = { x: 24, y: 118, w: 120, h: 126 };
    const B = { x: 196, y: 38, w: 146, h: 94 };
    const C = { x: 196, y: 228, w: 146, h: 94 };
    const D = { x: 410, y: 72, w: 130, h: 214 };
    const dotsRow = (m, col) => `<circle class="pba-dot ${col}" cx="${m.x + 16}" cy="${m.y + 20}" r="3.6"/>`;
    const title = (m, col, key) => `${dotsRow(m, col)}<text class="pba-t" x="${m.x + 28}" y="${m.y + 24}">${c(key)}</text>`;
    const card = m => `<rect class="pba-card" x="${m.x}" y="${m.y}" width="${m.w}" height="${m.h}" rx="14"/>`;
    // ports: [x, y, colour]
    const aO1 = [A.x + A.w, A.y + 52, 'p1'], aO2 = [A.x + A.w, A.y + 92, 'p2'];
    const bIn = [B.x, B.y + 46, 'p1'], bOut = [B.x + B.w, B.y + 46, 'p3'];
    const cIn = [C.x, C.y + 46, 'p2'], cOut = [C.x + C.w, C.y + 46, 'p1'];
    const dIn1 = [D.x, D.y + 50, 'p3'], dIn2 = [D.x, D.y + 150, 'p1'];
    const wires = [[aO1, bIn, 'p1'], [aO2, cIn, 'p2'], [bOut, dIn1, 'p3'], [cOut, dIn2, 'p1']];
    const wireSvg = wires.map(([a, b, col]) => {
      const p = pbWire(a[0], a[1], b[0], b[1]);
      return `<path class="pba-wire-under" d="${p}"/><path class="pba-wire ${col}" d="${p}"/>`;
    }).join('');
    const ports = [aO1, aO2, bIn, bOut, cIn, cOut, dIn1, dIn2]
      .map(p => `<circle class="pba-port ${p[2]}" cx="${p[0]}" cy="${p[1]}" r="4.6"/>`).join('');
    const param = (m, row, key, val) => `<text class="pba-pk" x="${m.x + 16}" y="${m.y + 56 + row * 22}">${c(key)}</text><text class="pba-pv" x="${m.x + m.w - 16}" y="${m.y + 56 + row * 22}" text-anchor="end">${val}</text>`;
    const prevX = D.x + 12, prevY = D.y + 36, prevW = D.w - 24, prevH = 118;
    const toolIcons = [[200, 'sq'], [232, 'ci'], [264, 'tr']].map(([x, k]) => {
      const y = 355;
      if (k === 'sq') return `<rect class="pba-ico" x="${x - 5}" y="${y - 5}" width="10" height="10" rx="2.5"/>`;
      if (k === 'ci') return `<circle class="pba-ico" cx="${x}" cy="${y}" r="5.5"/>`;
      return `<path class="pba-ico" d="M${x - 5.5} ${y + 5}L${x} ${y - 5.5}L${x + 5.5} ${y + 5}Z"/>`;
    }).join('');
    return `<div class="pba">
      <svg class="pba-svg" viewBox="0 0 560 384" role="img" aria-label="${e(ctx.brandName)}" focusable="false">
        <defs>
          <pattern id="${id}d" width="16" height="16" patternUnits="userSpaceOnUse"><circle class="pba-grid" cx="8" cy="8" r="0.95"/></pattern>
          <radialGradient id="${id}g" cx="50%" cy="50%" r="50%"><stop offset="0" class="pba-glow" stop-opacity="0.62"/><stop offset="0.55" class="pba-glow" stop-opacity="0.2"/><stop offset="1" class="pba-glow" stop-opacity="0"/></radialGradient>
        </defs>
        <rect class="pba-bg" width="560" height="384"/>
        <rect width="560" height="384" fill="url(#${id}d)"/>
        <circle cx="${D.x + D.w / 2}" cy="${D.y + D.h / 2}" r="170" fill="url(#${id}g)"/>
        ${wireSvg}
        ${card(A)}${title(A, 'p1', 'nodeIn')}
        <text class="pba-big" x="${A.x + A.w / 2}" y="${A.y + 96}" text-anchor="middle">${init}</text>
        ${card(B)}${title(B, 'p3', 'nodeMix')}${param(B, 0, 'paramA', '0.64')}${param(B, 1, 'paramB', '0.30')}
        ${card(C)}${title(C, 'p2', 'nodeName')}
        <text class="pba-name" x="${C.x + 16}" y="${C.y + 70}" style="font-size:${nm.size}px">${e(nm.shown)}</text>
        ${card(D)}${title(D, 'p1', 'nodeOut')}
        <rect class="pba-prev" x="${prevX}" y="${prevY}" width="${prevW}" height="${prevH}" rx="10"/>
        <text class="pba-prevt" x="${prevX + prevW / 2}" y="${prevY + prevH / 2 + 22}" text-anchor="middle">${init}</text>
        <text class="pba-pk" x="${D.x + 16}" y="${D.y + D.h - 22}">${c('paramA')}</text><text class="pba-pv" x="${D.x + D.w - 16}" y="${D.y + D.h - 22}" text-anchor="end">1.0</text>
        ${ports}
        ${pbNameTag(168, 158, abCopyRaw(this, 'tag1'), 't2')}${pbNameTag(352, 246, abCopyRaw(this, 'tag2'), 't3')}
        <rect class="pba-bar" x="20" y="14" width="124" height="28" rx="14"/>
        <circle class="pba-dot p1" cx="36" cy="28" r="3.6"/><text class="pba-bt" x="46" y="32">${c('barA')}</text><text class="pba-bt pba-bt-m" x="102" y="32">${c('barB')}</text>
        <rect class="pba-pill-g" x="374" y="14" width="86" height="28" rx="14"/><text class="pba-pill-gt" x="417" y="32.5" text-anchor="middle">${c('pillSecondary')}</text>
        <rect class="pba-pill-w" x="468" y="14" width="68" height="28" rx="14"/><text class="pba-pill-wt" x="502" y="32.5" text-anchor="middle">${c('pillMain')}</text>
        <rect class="pba-bar" x="176" y="338" width="208" height="34" rx="17"/>
        ${toolIcons}
        <rect class="pba-sel" x="288" y="342" width="62" height="26" rx="13"/><text class="pba-bt" x="319" y="359" text-anchor="middle">${c('barB')}</text>
        <text class="pba-read" x="540" y="378" text-anchor="end">${c('readout')}</text>
      </svg>
    </div>`;
  },

  materials: [
    { name: 'Ground', css: 'background: {canvas}; /* near-black (dark, the default) or pale grey (light); cards sit one step above it; no grid, glow or texture in the app */' },
    { name: 'Module (card)', css: 'background: {pbCard}; border: 1px solid {pbHair}; border-radius: 14px; box-shadow: none; /* dark: the ink at 5.5% over the canvas; light: white. A title row: an 8px status dot in a port colour, then a 15-17px 600 title */' },
    { name: 'Main pill', css: 'background: {ink}; color: {canvas}; border-radius: 999px; min-height: 52px; /* the one white (light mode: ink) pill; hover {pbInkHover}, pressed {pbInkPress} and scale 0.98 */' },
    { name: 'Grey pill', css: 'background: {pbGrey}; color: {ink}; border-radius: 999px; /* secondary action and icon button; hover {pbGreyHi}; no outline */' },
    { name: 'Pill toolbar', css: 'background: {pbInset}; border: 1px solid {pbHair}; border-radius: 999px; padding: 3px; /* the segmented control: the selected segment fills {pbGrey} with a 1px {pbEdge} ring and the ink label; the others set the label in {muted} */' },
    { name: 'Name tag', css: 'background: {pbSec} | {pbAcc} | {pbPri}; color: {pbOnSec} | {pbOnAcc} | {pbOnPri}; border-radius: 7px 7px 7px 2px; font: 600 12px mono; /* a small chip with the bottom-left corner squared, like a cursor label; the tag component (badge, count, status) */' },
    { name: 'Port dot', css: 'background: {pbPri} | {pbSec} | {pbAcc}; width: 8px; height: 8px; border-radius: 50%; /* the status dot in a card title, an avatar ring; each colour holds 3:1 on the ground and on a card */' },
    { name: 'Field', css: 'background: {pbInset}; border: 1px solid {pbEdge}; border-radius: 10px; color: {ink}; /* focus: border and a 1px ring in {pbPri}; error: the error colour; numbers in the mono face */' },
  ],

  rules: {
    do: [
      'Draw every surface as a dark rounded module: a step above the ground, a 1px hairline, a 14px corner, no shadow.',
      'Start a card with a small title row: a status dot in one of the brand colours, then the title.',
      'Use exactly one white (light mode: ink) pill as the main action on a view; secondary actions are grey pills with no outline.',
      'Carry the palette in dots and name tags: small chips with a coloured fill, a squared bottom-left corner and a label that holds 4.5:1.',
      'Set numbers, counts and read-outs in the mono face with tabular figures.',
    ],
    dont: [
      'Put the dot grid, the glow, the cables or any texture in the app; they belong to the hero graph on the board.',
      'Fill the main pill with the brand colour; the brand colours are the cables, ports and tags.',
      'Use a second white pill, a shadow, a gradient or a blur on a module.',
      'Set text in a port colour; text is the ink, the muted token or an on-colour.',
    ],
  },

  deck: {
    principles: [
      ['Modules on a dark bay', 'Rounded cards with hairline edges, one step above a near-black ground.'],
      ['Colour is the cable', 'The brand colours live in ports, dots, tags and the wires between modules.'],
      ['One white pill', 'A single filled pill is the action; everything else is grey or hairline.'],
    ],
    do: [
      'Keep modules rounded, hairlined and flat.',
      'Let ports, dots and name tags carry the colour.',
      'Use one white pill per view.',
    ],
    dont: [
      'Fill the main pill with a brand colour.',
      'Add shadows, gradients or blur to cards.',
      'Draw the dot grid or cables in the app.',
    ],
  },
});
})();
