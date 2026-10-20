/* 27 Corporate Vandalism — official, hijacked, deadpan. Two hands: the corporation's
   spotless surface (the client palette, a plain grotesk, procurement forms, PO numbers,
   asset tags, rubber stamps) and, on top of it, the vandal's foreign mark in a different
   technology and at a different angle. References: Barbara Kruger's red bars over found
   images, Brandalism's swapped ads in real frames, Holzer's truisms in corporate signage,
   Off-White's literal labels (used at most twice).

   Mechanism. The palette and type split into THEIRS and OURS: the client colours are the
   corporation's (shell, header bars, CTA); the vandal set is fixed (hazard red #E10600,
   safety yellow #FFD400, black, white) and a fixed bold-oblique face (Jost, synthetic
   oblique) that the client cannot select. One foreign mark per view, on top:
     hero      a Kruger bar over the small, bored official headline (def.headline), at
               display scale: the hijack is big, the official copy is small
     notice    a vinyl sticker slapped over the corporation's logo strip, peeled at a corner
     01 card   a Dymo label-maker strip stuck over the CTA label
     03 list   a marker strike through one official word, with a handwritten replacement
   The phrase on the bar is picked by brand from a short pool, so it never changes on
   re-render. Redaction bars belong to the bureaucracy (the notice), not to the vandal. */
(function () {
const HAZARD = '#E10600';
const SAFETY = '#FFD400';
const CV_KEY = 'corporate-vandalism';   // abCopy key for the plain functions and hooks below (js/aesthetics/registry.js)
const cvCp = k => abCopy(CV_KEY, k);
const CV_BARS_KEYS = ['bar1', 'bar2', 'bar3', 'bar4'];   // the Kruger bar lines, picked by hash of the headline
function cvHash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function cvVandalFace() { return '"Jost", "Futura", "Century Gothic", sans-serif'; }

// barcode bars: widths 1/2/3 px from a fixed pattern (deterministic, no random)
const CV_BARS = '2 1 3 1 1 2 3 1 2 2 1 3 1 1 2 1 3 2 1 1 3 1 2 1 1 2 3 1 2 1 1 3 2 1 2 1 3 1 1 2';

function cvBarcode() {
  // alternate bar / gap: bars from even entries, gaps from odd ones
  const w = CV_BARS.split(' ').map(Number);
  let x = 0, rects = '';
  w.forEach((n, i) => { if (i % 2 === 0) rects += `<rect x="${x}" y="0" width="${n}" height="22"/>`; x += n; });
  return `<svg class="cva-bc" viewBox="0 0 ${x} 22" preserveAspectRatio="none" aria-hidden="true" focusable="false"><g fill="#000">${rects}</g></svg>`;
}

registerAesthetic({
  key: 'corporate-vandalism', order: 27,
  name: 'Corporate Vandalism',
  descriptor: 'Official · Hijacked · Deadpan',
  influences: 'Kruger / Brandalism / Holzer / Off-White',
  summary: 'A spotless corporate shell, and on top of it one foreign mark per view: a red bar, a label-maker strip, a slapped sticker, a marker strike.',
  motto: 'Everything is fine. Please initial here.',
  kicker: 'Pending review',
  mode: 'light',
  slideShape: 'minimal',
  labels: { material: 'Compliance', states: ['Approved', 'Flagged', 'Redacted'], statesKind: 'button' },
  // Editable specimen copy (Brand > Advanced > Specimen copy); text matches motto / kicker / labels.states above.
  // Warm entries swap the deadpan bite for a gentler office joke. {co} {re} in fine1 and {brand} in asset are filled in.
  copy: {
    motto: { label: 'Motto', text: 'Everything is fine. Please initial here.' },
    kicker: { label: 'Kicker above the headline', text: 'Pending review' },
    state0: { label: 'State 1 name', text: 'Approved' },
    state1: { label: 'State 2 name', text: 'Flagged', warm: 'Noted' },
    state2: { label: 'State 3 name', text: 'Redacted', warm: 'Filed' },
    bar1: { label: 'Headline bar line 1', text: 'Feelings not included', warm: 'Feelings welcome here' },
    bar2: { label: 'Headline bar line 2', text: 'Nobody approved this', warm: 'Someone approved this' },
    bar3: { label: 'Headline bar line 3', text: 'Alive costs extra', warm: 'Alive is included' },
    bar4: { label: 'Headline bar line 4', text: 'Your feelings, our asset', warm: 'Your feelings, our care' },
    stkVoid: { label: 'Void sticker word', text: 'VOID', warm: 'COPY' },
    stkSub: { label: 'Void sticker sub-line', text: 'where feelings', warm: 'where it counts' },
    memo: { label: 'Memo classification line', text: 'MEMO // FOR INTERNAL FEELINGS ONLY', warm: 'MEMO // FOR FRIENDLY EYES ONLY' },
    title: { label: 'Notice title', text: 'Notice of Compliance Review' },
    ref: { label: 'Notice reference line', text: 'Ref. 2291-B \u00b7 Page 1 of 1 \u00b7 Please retain' },
    fine1: { label: 'Fine print ({co}, {re})', text: 'Pursuant to Section 4.2, all feelings remain the property of {co} and may be {re} without notice.', warm: 'Pursuant to Section 4.2, all feelings remain the property of {co} and may be {re} with a kind word.' },
    fineCo: { label: 'Fine print: redacted word 1', text: 'the Company' },
    fineRe: { label: 'Fine print: redacted word 2', text: 'reassigned' },
    redact1: { label: 'Redacted line 1', text: 'Section 4.2(c) applies to every feeling the Subscriber has had.' },
    redact2: { label: 'Redacted line 2', text: 'Permitted feelings: mild interest, polite surprise, boredom.', warm: 'Permitted feelings: interest, delight, surprise, joy.' },
    fine2: { label: 'Fine print line 2', text: 'Unlisted feelings are deemed alive.' },
    warning: { label: 'Warning line', text: 'Warning: contains 14% opinion', warm: 'Note: contains 14% opinion' },
    initial: { label: 'Signature line', text: 'Initial here' },
    rcptHead: { label: 'Receipt heading', text: 'Receipt' },
    rcptL1: { label: 'Receipt line 1', text: 'Good design x1' },
    rcptL2: { label: 'Receipt line 2', text: 'Feeling (alive) x1' },
    rcptL3: { label: 'Receipt line 3', text: 'Tax on feelings 7%', warm: 'Tip for feelings 7%' },
    rcptTotal: { label: 'Receipt total label', text: 'Total' },
    rcptDue: { label: 'Receipt amount due', text: 'Amount due: one (1) apology', warm: 'Amount due: one (1) smile' },
    stripCard: { label: 'Card header strip', text: 'Notice 2291-B \u00b7 Form 7' },
    stripPanel: { label: 'Panel header strip', text: 'Form 7 \u00b7 Part 2' },
    terms: { label: 'Card footnote', text: '\u2020 Terms apply. Terms are subject to change, including this sentence.' },
    never: { label: 'Struck-word note', text: 'never' },
    asset: { label: 'Asset tag ({brand})', text: 'Property of {brand} \u00b7 Do not remove' },
    stampDo: { label: 'Do stamp (deck)', text: 'Approved' },
    stampDont: { label: 'Don\'t stamp (deck)', text: 'Rejected', warm: 'Revised' },
  },
  layout: { hero: 'split', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'body', label: 'mono', display: 1.14 },
  highlight: 'custom',
  highlightNote: 'The official headline is small, regular and plain (no highlight). On top of it the vandal applies a Kruger bar: hazard red #E10600, white bold-oblique type at display scale, 2–4 words, tilted about 2 degrees.',

  roles: {
    canvas: {
      use: 'THEIRS. The corporation\'s page: pure white in light mode, #000 in dark mode (never cream), flat white paper for the notice',
      never: 'Text, gradients, soft shadows or rounded cards',
      coverage: '65–75%',
    },
    ink: {
      use: 'THEIRS. Headlines, body, 1px square borders, PO numbers, the redaction bars of the notice (the bureaucracy\'s own censor)',
      never: 'Decoration or large background fields in light mode',
      coverage: '15–20%',
    },
    primary: {
      use: 'THEIRS. The official shell, pristine and boring: the announcement bar, the notice header strip, the main button. Where the primary is within 25 degrees of the hazard red the shell goes ink with a 3px primary underline',
      never: 'The vandal layer (red bar, sticker, label strip, marker), body text, a second CTA',
      coverage: '≈8–10%',
    },
    secondary: {
      use: 'THEIRS. The progress track and the pattern second band. The form panel is a neutral grey; the receipt is plain white thermal paper',
      never: 'Buttons, the vandal layer, body text, form-panel tints',
      coverage: '≈8–10%',
    },
    accent: {
      use: 'THEIRS, held back: it shows in the palette only. OURS (fixed, never client colours): hazard red #E10600, safety yellow #FFD400, black, white, and a bold-oblique vandal face',
      never: 'Buttons, borders, the vandal layer',
      coverage: '≤3%',
    },
  },

  // White page / black page: the shell must be as flat and neutral as a form.
  canvas(b) { return b.isDark ? b.mix('#000000', b.canvas, 0.94) : b.mix('#ffffff', b.canvas, 0.92); },

  // The official headline, small and bored, with the vandal's Kruger bar applied over it.
  headline(ctx, text) {
    const e = escapeHtml;
    const bar = cvCp(CV_BARS_KEYS[cvHash(String(ctx.brandName || '') + '|' + String(text || '')) % CV_BARS_KEYS.length]);
    return `<span class="cvh-o">${e(text)}</span><span class="cvh-k"><span>${bar}</span></span>`;
  },

  tokens(t, view) {
    const st = view || (typeof state !== 'undefined' ? state : null);
    const hf = st && st.headingFont;
    const hw = abWeight(hf, 900);
    const d = t.isDark;
    const grey = '#84898E';
    // the hazard red must stay the only red on the page: a primary near it turns the official shell ink
    const ph = hexToHsl(t.printPrimary || t.primary), hz = hexToHsl(HAZARD);
    const collide = typeof hueDiff === 'function' && hueDiff(ph.h, hz.h) < 25 && ph.s >= 45 && ph.l > 15 && ph.l < 85;
    const shell = collide ? t.ink : t.printPrimary || t.primary;
    // small text must hold 4.5:1 on the tinted form / sidebar surfaces too, not just the canvas: the muted grey, the rest-state
    // grey and the primary used as text are shaded toward ink until they do (the framework's defaults stop at 3:1 / canvas-only)
    const formBg = t.mix(t.ink, t.canvas, d ? 0.1 : 0.05);
    const lift = c => { let r = c; for (let k = 1; k <= 20 && t.contrast(r, formBg) < 4.6; k++) r = t.mix(c, t.ink, k * 0.05); return r; };
    return {
      '--ab-muted': lift(t.muted),
      '--ab-primary-text': lift(t.primaryText),
      '--ab-type-pick-w': hw,
      '--cv-hw': hw,
      '--ab-hazard': HAZARD,
      '--ab-safety': SAFETY,
      '--cv-paper': d ? '#F2F2F0' : '#FFFFFF',
      '--cv-bd': d ? t.mix(t.ink, t.canvas, 0.5) : t.ink,
      '--cv-rest': lift(t.contrast(grey, t.canvas) >= 4.5 ? grey : t.muted),
      '--cv-receipt': '#FFFFFF', // thermal paper: white in both modes
      '--ab-receipt': '#FFFFFF',
      '--cv-form': d ? t.mix(t.ink, t.canvas, 0.1) : t.mix(t.ink, t.canvas, 0.05),
      '--cv-shell': shell,
      '--cv-on-shell': collide ? t.canvas : t.onPrimary,
      '--cv-ul': collide ? (t.printPrimary || t.primary) : 'transparent',
      '--cv-vandal': cvVandalFace(),
      '--cv-bw': abWeight(st && st.bodyFont, 600),
      // small form labels (state names, status line) sit on the form tint: 70% ink, not the 4.5:1-on-canvas muted
      '--cv-small': t.mix(t.ink, d ? t.mix(t.ink, t.canvas, 0.1) : t.mix(t.ink, t.canvas, 0.05), 0.7),
      '--ab-tr': (hf && { condensed: 0.4, heavy: 0.4, wide: 0.3, techno: 0.3 }[hf.cls]) ?? 1,
    };
  },

  art(ctx) {
    const e = escapeHtml;
    // the vandal's fixed face (never client-selectable)
    if (typeof window !== 'undefined' && window.loadFontFamily && typeof FONTS !== 'undefined') { const j = FONTS.find(f => f.name === 'Jost'); if (j) window.loadFontFamily(j); }
    const name = e(String(ctx.brandName || '').trim());
    const R = s => `<span class="cva-r">${s}</span>`;
    const warn = `<svg viewBox="0 0 16 14" width="13" height="12" aria-hidden="true" focusable="false"><path d="M8 0.8 15.4 13.4H0.6Z" fill="none" stroke="#fff" stroke-width="1.3" stroke-linejoin="miter"/><path d="M8 5v4M8 10.4v1.4" stroke="#fff" stroke-width="1.5"/></svg>`;
    return `<div class="cva">
      <div class="cva-doc">
        <div class="cva-bar"><i>${e(ctx.initial)}</i><b>${name}</b><span>FORM 27-B</span></div>
        <span class="cva-stk" aria-hidden="true"><b>${cvCp('stkVoid')}</b><i>${cvCp('stkSub')}</i></span>
        <div class="cva-body">
          <p class="cva-class">${cvCp('memo')}</p>
          <p class="cva-title">${cvCp('title')}</p>
          <p class="cva-ref">${cvCp('ref')}</p>
          <p class="cva-fine">${cvCp('fine1').replace('{co}', () => R(cvCp('fineCo'))).replace('{re}', () => R(cvCp('fineRe')))}</p>
          <div class="cva-rr"><div class="cva-rx cva-rx1">${cvCp('redact1')}</div><i>(b)(6)</i></div>
          <div class="cva-rr"><div class="cva-rx">${cvCp('redact2')}</div><i>(b)(7)(C)</i></div>
          <p class="cva-fine">${cvCp('fine2')}</p>
          <div class="cva-warn">${warn}<span>${cvCp('warning')}</span></div>
          <div class="cva-sign"><span>${cvCp('initial')}</span><i></i></div>
        </div>
      </div>
      <div class="cva-rw"><div class="cva-rcpt">
        <p class="cva-rh">${cvCp('rcptHead')}</p>
        <p class="cva-rl"><span>${cvCp('rcptL1')}</span><b>0.00</b></p>
        <p class="cva-rl"><span>${cvCp('rcptL2')}</span><b>0.00</b></p>
        <p class="cva-rl"><span>${cvCp('rcptL3')}</span><b>0.00</b></p>
        <p class="cva-rl cva-rt"><span>${cvCp('rcptTotal')}</span><b>0.00</b></p>
        <p class="cva-rn">${cvCp('rcptDue')}</p>
        ${cvBarcode()}
      </div></div>
    </div>`;
  },

  // Real markup for the corporation's form furniture (header strips, the card's footnote), the PO
  // list with its asset tag, and the vandal's marker strike through one official word.
  panels: {
    card: ctx => ctx.parts.cardBase()
      .replace(/^(\s*<div class="ab-card">)/, (m, g1) => `${g1}<p class="cv-strip">${cvCp('stripCard')}</p>`)
      .replace(/<\/div>\s*$/, () => `<p class="cv-fine">${cvCp('terms')}</p></div>`),
    panel: ctx => ctx.parts.panelBase().replace(/^(\s*<div class="ab-panel">)/, (m, g1) => `${g1}<p class="cv-strip">${cvCp('stripPanel')}</p>`),
    list(ctx) {
      const e = ctx.e;
      const name = String(ctx.brandName || '').trim().toUpperCase();
      return `<div class="ab-list cv-po"><ul class="cv-rows">${ctx.rows.map((r, i) => {
        const w = String(r[0]).split(' ');
        const label = i === 2 && w.length > 1
          ? `<s>${e(w[0])}</s> ${e(w.slice(1).join(' '))}<span class="cv-never" aria-hidden="true">${cvCp('never')}</span>`
          : e(r[0]);
        return `<li class="ab-row">
      <span class="ab-row-n">PO-229${i + 1}-B</span>
      <span class="ab-av" aria-hidden="true">${e(r[0][0])}</span>
      <span class="ab-row-name">${label}</span>
      <span class="ab-row-status">${e(r[1])}</span>
      <span class="ab-row-bar" aria-hidden="true"><i style="width:${r[2]}%"></i></span>
      <span class="ab-row-pct">${r[2]}%</span>
    </li>`;
      }).join('')}</ul><p class="cv-asset">${cvCp('asset').replace('{brand}', () => e(name))}</p></div>`;
    },
  },

  materials: [
    { name: 'Kruger bar', css: 'background: #E10600; color: #FFFFFF; font: italic 600 8cqw/1.1 Jost, Futura, sans-serif; text-transform: uppercase; box-decoration-break: clone; transform: rotate(-2deg); /* the vandal\'s mark over the official headline: 2–4 words at display scale; the official headline under it stays small and regular */' },
    { name: 'Label-maker strip', css: 'background: #111111; color: #FFFFFF; font: 700 11px ui-monospace, Menlo, monospace; letter-spacing: .18em; text-shadow: 0 1px 0 rgba(0,0,0,.6); transform: rotate(-3deg); /* embossed Dymo tape stuck over a button label */' },
    { name: 'Sticker slap', css: 'background: #FFD400; color: #111111; box-shadow: 0 0 0 1px #FFFFFF; transform: rotate(8deg); /* vinyl sticker over the corporation\'s logo, a hard white keyline, one corner peeled back */' },
    { name: 'Marker strike', css: 'stroke: #E10600; stroke-width: 3px; /* a line through one official word, with the replacement handwritten above it */' },
    { name: 'Redaction bar', css: 'background: {ink}; color: transparent; /* the bureaucracy\'s own censor: real text set transparent, so the bar is exactly the width of the word; on the notice only */' },
    { name: 'Official shell', css: 'background: {primary}; color: {onPrimary}; border-radius: 0; font: 600 12px ui-monospace, Menlo, monospace; text-transform: uppercase; /* THEIRS: header strips, the main button, the announcement bar; flat, square, mundane copy */' },
    { name: 'Asset tag', css: 'border: 1px solid {ink}; font: 600 9px ui-monospace, Menlo, monospace; /* PROPERTY OF <BRAND> · DO NOT REMOVE, PO numbers (PO-2291-B), SKU tags and approved / rejected stamps: procurement vocabulary */' },
    { name: 'Receipt strip', css: 'background: #FFFFFF; color: #1a1a1a; font: 11px ui-monospace, Menlo, monospace; /* sawtooth top and bottom edge, dashed rules, TOTAL line, a barcode */' },
  ],

  rules: {
    do: [
      'Leave the shell spotless (white or #000, 1px ink borders, no radius, no shadow, mundane copy); apply exactly one foreign mark per view, on top.',
      'Make the mark a second technology at a second angle: a Kruger bar, a label-maker strip, a slapped sticker or a marker strike.',
      'Split everything into theirs and ours: the client palette and grotesk are the corporation\'s; hazard red, safety yellow, black, white and a bold oblique are the vandal\'s.',
      'Reverse the scale: the official headline is small and bored, the hijack is display size.',
    ],
    dont: [
      'Recolour the vandal layer with client colours, or let the client choose the vandal face.',
      'Quote another studio\'s house marks (numbered drop indexes, "???" rows, "!!!" chips).',
      'Label more than two parts in quotes; one literal label per object is the joke, six is a tic.',
      'Use rounded cards, gradients or soft shadows on the shell.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    coverDisplay: 0.78,   // a smaller cover start size keeps the taller notice at its natural width (it re-stacks when its box narrows)
    // Do / Don't marks are the corporation's own rubber stamps
    marks: (ctx, kind) => `<span class="cv-stamp" data-kind="${kind}">${kind === 'do' ? cvCp('stampDo') : cvCp('stampDont')}</span>`,
    principles: [
      ['Two hands', 'Their spotless shell; our mark on top of it.'],
      ['Theirs and ours', 'Client colours run the shell; hazard red and safety yellow are fixed.'],
      ['Small official, big hijack', 'The headline is bored; the red bar shouts.'],
    ],
    do: [
      'Leave the shell spotless.',
      'Apply exactly one foreign mark per view.',
      'Keep the vandal colours fixed.',
    ],
    dont: [
      'Recolour the vandal layer.',
      'Quote another studio\'s marks.',
      'Label more than two parts.',
    ],
  },
});
})();
