/* 27 Corporate Vandalism — official, hijacked, deadpan. MSCHF's numbered index and
   store pages, Off-White's quotation-mark labelling, Holzer-style redaction bars and
   the receipt: a sincere, tidy interface with ONE thing quietly wrong per screen.

   Mechanism. The shell is pristine procurement software: flat, square, white (or #000),
   the client's primary as the "official" colour (notice header strip, main button).
   The vandal layer is FIXED and never takes client colours: black redaction bars, a
   flat hazard-red warning label, safety-yellow "!!!" chip, a mono receipt. Redaction
   bars are real text set transparent on black, so each bar is exactly as wide as the
   word it hides. No rotation, no tape, no grain (that is Xerox / Xerox Punk).
   The hero art is "the hijacked notice": a form document with a primary header strip,
   plausible fine print with three redactions, a red warning label and a receipt strip
   with an absurd, deadpan total. The headline's last word is wrapped in literal
   quotation marks and a dagger footnote mark (the footer resolves the footnote). */
(function () {
const HAZARD = '#D40F14';
const SAFETY = '#FFD500';

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
  influences: 'MSCHF / Procurement software / Off-White labelling',
  summary: 'A spotless corporate shell with exactly one thing quietly wrong: a redaction bar, a warning label, an absurd receipt.',
  motto: 'Everything is fine. Please initial here.',
  kicker: 'Pending review',
  mode: 'light',
  slideShape: 'minimal',
  labels: { material: 'Compliance', states: ['Approved', 'Flagged', 'Redacted'], statesKind: 'button' },
  layout: { hero: 'split', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'body', label: 'mono', display: 1.14 },
  highlight: 'custom',
  highlightNote: 'The last word keeps the headline ink and is wrapped in literal straight quotation marks followed by a superscript dagger footnote mark; no colour, no band, no underline. The quotes and dagger are part of the style and the footer footnote answers it.',

  roles: {
    canvas: {
      use: 'The page: pure white in light mode, #000 in dark mode (never cream or tinted), with flat white "paper" for the notice. The vandal layer is fixed and never takes client colours: black #000, white, hazard red #D40F14, safety yellow #FFD500',
      never: 'Text, gradients, soft shadows or rounded cards',
      coverage: '65–75%',
    },
    ink: {
      use: 'Headlines, body, 1px square borders, the numbered index, and the black redaction bars (exact width of the word hidden)',
      never: 'Decoration or large background fields in light mode',
      coverage: '15–20%',
    },
    primary: {
      use: 'The official shell, kept pristine and boring: the notice header strip, the main button fill and the active index item',
      never: 'The vandal layer (warning labels, redaction, the receipt), body text, a second CTA',
      coverage: '≈8–10%',
    },
    secondary: {
      use: 'Receipt and form paper: the receipt tint, form-panel fills and the progress track',
      never: 'Buttons, warning labels, body text',
      coverage: '≈8–10%',
    },
    accent: {
      use: 'The single tiny official notice: the announcement bar above the header, and nothing else',
      never: 'Buttons, borders, warning labels, headline words; hazard colours are fixed',
      coverage: '≤3%',
    },
  },

  // White page / black page: the shell must be as flat and neutral as a form.
  canvas(b) { return b.isDark ? b.mix('#000000', b.canvas, 0.94) : b.mix('#ffffff', b.canvas, 0.92); },

  tokens(t) {
    const hf = typeof state !== 'undefined' && state && state.headingFont;
    const ws = String((hf && hf.weights) || '400').split(';').map(Number).filter(Boolean);
    const le = ws.filter(x => x <= 900);
    const hw = le.length ? Math.max(...le) : Math.min(...ws);
    const d = t.isDark;
    const grey = '#84898E';
    return {
      '--ab-type-pick-w': hw,
      '--cv-hw': hw,
      '--ab-hazard': HAZARD,
      '--ab-safety': SAFETY,
      '--cv-paper': d ? '#F2F2F0' : '#FFFFFF',
      '--cv-bd': d ? t.mix(t.ink, t.canvas, 0.5) : t.ink,
      '--cv-rest': t.contrast(grey, t.canvas) >= 4.5 ? grey : t.muted,
      '--cv-receipt': t.mix(t.secondary, '#ffffff', 0.22),
      '--ab-receipt': t.mix(t.secondary, '#ffffff', 0.22),
      '--cv-form': d ? t.mix(t.secondary, t.canvas, 0.16) : t.mix(t.secondary, t.canvas, 0.14),
      '--ab-tr': (hf && { condensed: 0.4, heavy: 0.4, wide: 0.3, techno: 0.3 }[hf.cls]) ?? 1,
    };
  },

  art(ctx) {
    const e = escapeHtml;
    const name = e(String(ctx.brandName || '').trim());
    const R = s => `<span class="cva-r">${s}</span>`;
    const warn = `<svg viewBox="0 0 16 14" width="13" height="12" aria-hidden="true" focusable="false"><path d="M8 0.8 15.4 13.4H0.6Z" fill="none" stroke="#fff" stroke-width="1.3" stroke-linejoin="miter"/><path d="M8 5v4M8 10.4v1.4" stroke="#fff" stroke-width="1.5"/></svg>`;
    return `<div class="cva">
      <div class="cva-doc">
        <div class="cva-bar"><i>${e(ctx.initial)}</i><b>${name}</b><span>FORM 27-B</span></div>
        <div class="cva-body">
          <p class="cva-title">Notice of Compliance Review</p>
          <p class="cva-ref">Ref. 2291-B · Page 1 of 1 · Please retain</p>
          <p class="cva-fine">Pursuant to Section 4.2, the Subscriber agrees that all feelings, whether expressed or implied, remain the property of ${R('the Company')} and may be ${R('reassigned')} without notice. Section ${R('4.2(c)')} applies. Any feeling not listed in Schedule 4 shall be deemed alive.</p>
          <div class="cva-warn">${warn}<span>Warning: contains 14% opinion</span></div>
          <div class="cva-sign"><span>Initial here</span><i></i></div>
        </div>
      </div>
      <div class="cva-rcpt">
        <p class="cva-rh">Receipt</p>
        <p class="cva-rl"><span>Good design x1</span><b>0.00</b></p>
        <p class="cva-rl"><span>Feeling (alive) x1</span><b>0.00</b></p>
        <p class="cva-rl"><span>Tax on feelings 7%</span><b>0.00</b></p>
        <p class="cva-rl cva-rt"><span>Total</span><b>0.00</b></p>
        <p class="cva-rn">Amount due: one (1) apology</p>
        ${cvBarcode()}
      </div>
    </div>`;
  },

  materials: [
    { name: 'Redaction bar', css: 'background: {ink}; color: transparent; /* real text set transparent, so the bar is exactly the width of the word it hides; height is the cap height plus about 2px; on a paper panel in dark mode. Keep some words unredacted so the sentence still parses. Reveal on select: color {canvas}. */' },
    { name: 'Warning label', css: 'background: {hazard}; color: #ffffff; box-shadow: inset 0 0 0 2px {hazard}, inset 0 0 0 3px #ffffff; font: 700 10px ui-monospace, Menlo, monospace; text-transform: uppercase; letter-spacing: .06em; /* fixed hazard red, flat, square, never rotated; copy is oddly precise ("contains 14% opinion") */' },
    { name: 'Safety chip', css: 'background: {safety}; color: #000000; font: 700 10px ui-monospace, Menlo, monospace; padding: 1px 5px; /* the "!!!" chip in the header, fixed yellow */' },
    { name: 'Notice header strip', css: 'background: {primary}; color: {onPrimary}; font: 600 10px ui-monospace, Menlo, monospace; letter-spacing: .1em; text-transform: uppercase; /* the official shell: the only large use of the client primary */' },
    { name: 'Receipt strip', css: 'background: {receipt}; color: #000000; font: 11px ui-monospace, Menlo, monospace; border-top: 1px dashed {ink}; /* zigzag top and bottom edge, dashed rules, TOTAL line, a barcode of 1/2/3px bars */' },
    { name: 'Official button', css: 'background: {primary}; color: {onPrimary}; border-radius: 0; font: 600 12px ui-monospace, Menlo, monospace; letter-spacing: .08em; text-transform: uppercase; /* mundane copy ("Continue"); hover underlines; pressed inverts to {ink} on {canvas} */' },
    { name: 'Announcement bar', css: 'background: {accent}; color: {onAccent}; font: 600 10px ui-monospace, Menlo, monospace; letter-spacing: .08em; text-transform: uppercase; /* one line above the header, the only use of the client accent */' },
  ],

  rules: {
    do: [
      'Keep the shell flat, square and tidy: white or #000 page, 1px ink borders, no radius, no shadow, mundane button copy.',
      'Add exactly one intrusion per screen: a redaction bar of exact word width, a red warning label, or an absurd receipt line.',
      'Write fine print that parses as legal prose (sections, schedules, dagger footnotes); the footnotes should be the longest text on the page.',
      'Name components in straight quotation marks and set the index in mono caps: grey at rest, ink on hover or select.',
    ],
    dont: [
      'Rotate, tape, grain or distress anything; mess belongs to Xerox and Xerox Punk, the shell here must be tidy.',
      'Recolour the hazard layer with client colours; warning red, safety yellow and black stay fixed.',
      'Use rounded cards, gradients or soft shadows; the register is flat procurement software.',
      'Repeat the gag on every element, or fill it with lorem ipsum or a real company or brand.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['One intrusion per screen', 'The shell stays sincere; a single element is quietly wrong.'],
      ['Fixed vandal palette', 'Black, white and hazard red never take the client colours.'],
      ['Plausible fine print', 'Deadpan needs real syntax, so every footnote reads as legal.'],
    ],
    do: [
      'Keep the brand shell tidy and flat.',
      'Redact words with exact-width black bars.',
      'Add one absurd receipt or footnote.',
    ],
    dont: [
      'Rotate, tape or distress anything.',
      'Use rounded cards or soft shadows.',
      'Repeat the gag on every screen.',
    ],
  },
});
})();
