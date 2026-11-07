/* Moves for a room lit by one fixed lamp: a lighting cast that ignores the client colour, a film-rebate frame
   material and a headline underline. Generic and parameterised. Loaded by index.html at startup (and by dev/move-lab/lab.js in the lab). */
(function () {
'use strict';

const num = (def, range) => ({ kind: 'number', default: def, range });

registerMove({
  id: 'fixed-lamp-cast', libraryId: null,
  what: 'Casts one fixed lamp colour over canvas, ink, rules and muted text, independent of the client primary, plus an optional soft wash on the board.',
  category: 'colour', tier: 'generator',
  params: {
    lamp:       { kind: 'colour', default: '#ff4a1f' },  // the lamp colour (hex), never derived from the primary
    canvasMix:  num(0.1, [0, 0.4]),   // share of the lamp mixed into the canvas
    inkMix:     num(0.16, [0, 0.5]),  // share of the lamp mixed into the ink (text, borders)
    wash:       num(0.14, [0, 0.5]),  // board only: strength of the lamp wash from the top-right corner
  },
  tokens(t, p) {
    const canvas = t.mix(p.lamp, t.canvas, p.canvasMix);
    const ink = t.mix(p.lamp, t.ink, p.inkMix);
    let toward = 0.4, muted = t.mix(canvas, ink, toward);
    while (toward > 0 && t.contrast(muted, canvas) < 4.6) { toward = Math.max(0, toward - 0.025); muted = t.mix(canvas, ink, toward); }
    return { '--ab-canvas': canvas, '--ab-ink': ink, '--ab-muted': muted, '--ab-line': t.mix(canvas, ink, 0.85), '--ab-lamp': p.lamp };
  },
  css(S, p) {
    if (!p.wash) return '';
    return `${S} { background-image: radial-gradient(ellipse 70% 38% at 88% 0%, color-mix(in srgb, var(--ab-lamp) ${Math.round(p.wash * 100)}%, transparent), transparent 72%); background-repeat: no-repeat; }`;
  },
});

registerMove({
  id: 'film-frame', libraryId: null,
  what: 'Material: a hairline-framed cell with a perforated rebate strip along its top and bottom edge, like a film frame.',
  category: 'material', tier: 'recipe',
  params: {
    rebate: num(9, [4, 18]),      // px, height of each strip
    hole:   num(4, [2, 8]),       // px, height of a perforation
    pitch:  num(14, [8, 30]),     // px between perforations
    band:   num(14, [0, 40]),     // % ink mixed into the strip colour
  },
  material: {
    name: 'film-frame',
    css(S, sel, p) {
      const strip = `color-mix(in srgb, var(--ab-ink) ${p.band}%, var(--ab-canvas))`;
      const holes = `repeating-linear-gradient(90deg, var(--ab-canvas) 0 ${Math.round(p.pitch * 0.45)}px, transparent ${Math.round(p.pitch * 0.45)}px ${p.pitch}px)`;
      const off = Math.round((p.rebate - p.hole) / 2);
      return `${sel} {
  background-color: var(--ab-canvas); color: var(--ab-ink); border: 1px solid var(--ab-line); box-shadow: none;
  padding-top: ${p.rebate + 12}px; padding-bottom: ${p.rebate + 12}px;
  background-image: ${holes}, ${holes}, linear-gradient(${strip}, ${strip}), linear-gradient(${strip}, ${strip});
  background-size: 100% ${p.hole}px, 100% ${p.hole}px, 100% ${p.rebate}px, 100% ${p.rebate}px;
  background-position: 0 ${off}px, 0 calc(100% - ${off}px), 0 0, 0 100%;
  background-repeat: no-repeat;
}`;
    },
  },
});

registerMove({
  id: 'highlight-underline', libraryId: null,
  what: 'Underlines the headline highlight word with a role-colour rule; the word itself keeps whatever colour the highlight move gave it.',
  category: 'type', tier: 'recipe',
  params: {
    width:  num(6, [1, 16]),   // px
    offset: num(6, [0, 20]),   // px below the baseline
    colour: { kind: 'enum', default: 'primary', options: ['primary', 'secondary', 'accent', 'ink', 'line'] },
  },
  css(S, p) {
    return `${S} .ab-hl { text-decoration: underline; text-decoration-color: var(--ab-${p.colour}); text-decoration-thickness: ${p.width}px; text-underline-offset: ${p.offset}px; text-decoration-skip-ink: none; }`;
  },
});

})();
