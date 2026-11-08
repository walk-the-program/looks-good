/* Moves for printed-paper details: an ink keyline on every palette chip, and a tear-off coupon strip for the foot of
   the deck cover. Generic and parameterised; every selector is scoped under S. */
(function () {
'use strict';

const num = (def, range) => ({ kind: 'number', default: def, range });

registerMove({
  id: 'swatch-keyline', libraryId: null,
  what: 'Board: gives every palette chip a solid ink keyline, so a chip the colour of the page still reads as a printed swatch.',
  category: 'structure', tier: 'recipe',
  params: {
    width: num(1, [1, 4]),     // px
    mix:   num(100, [30, 100]),// % ink in the keyline (rest is canvas)
  },
  css(S, p) {
    return `${S} .ab-swatches[data-kind] .ab-chip { box-shadow: 0 0 0 ${p.width}px color-mix(in srgb, var(--ab-ink) ${p.mix}%, var(--ab-canvas)); }`;
  },
});

registerMove({
  id: 'coupon-foot', libraryId: null,
  what: 'Board: replaces the deck cover\'s pattern band with a tear-off coupon strip: a perforated top edge and a centred caps line of text.',
  category: 'structure', tier: 'recipe',
  params: {
    text:   { kind: 'text', default: 'Detach and keep' },   // caps line printed on the coupon
    height: num(96, [48, 132]),    // px, coupon height (the band is 132px)
    pitch:  num(14, [8, 30]),      // px between perforation holes
    hole:   num(5, [2, 9]),        // px, hole diameter
    size:   num(13, [10, 20]),     // px, text size
    tracking: num(0.22, [0, 0.4]), // em
  },
  css(S, p) {
    const A = `${S}.ab-slide[data-slide="cover"] > .ab-deck-pattern`;
    const holes = `radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--ab-ink) 60%, var(--ab-canvas)) 0 ${p.hole / 2}px, transparent ${p.hole / 2 + 0.6}px)`;
    return `${A} > * { display: none; }
${A}::after { content: ${JSON.stringify(p.text)}; position: absolute; left: 0; right: 0; bottom: 0; height: ${p.height}px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; padding-top: ${p.hole}px; background-image: ${holes}; background-size: ${p.pitch}px ${p.hole}px; background-repeat: repeat-x; background-position: 0 0; background-color: color-mix(in srgb, var(--ab-ink) 7%, transparent); border-top: 0; font: 700 ${p.size}px/1.2 var(--ab-font-label, monospace); letter-spacing: ${p.tracking}em; text-transform: uppercase; color: var(--ab-ink); text-align: center; }
${S}.ab-slide[data-slide="cover"]:has(> .ab-deck-pattern > .pt-deck-band) > .ab-in.ab-slide-in { padding-bottom: ${p.height + 26}px; }`;
  },
});

})();
