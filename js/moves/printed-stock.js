/* Moves for printed paper stock: a perforated tear line, a rubber-stamped label, a stamped-ink control material and
   a card edge with a tear-off strip. Generic and parameterised; every selector is scoped under S. */
(function () {
'use strict';

const num = (def, range) => ({ kind: 'number', default: def, range });
const ROLE_VAR = {
  primary: '--ab-primary', secondary: '--ab-secondary', accent: '--ab-accent', ink: '--ab-ink',
  canvas: '--ab-canvas', line: '--ab-line', muted: '--ab-muted', tint: '--ab-pri-tint',
};
const ON_VAR = {
  primary: '--ab-on-primary', secondary: '--ab-on-secondary', accent: '--ab-on-accent',
  ink: '--ab-canvas', canvas: '--ab-ink', tint: '--ab-ink', line: '--ab-ink', muted: '--ab-canvas',
};
const ROLES = Object.keys(ROLE_VAR);
const role = r => `var(${ROLE_VAR[r] || '--ab-ink'})`;
/* a role colour pulled toward ink so it reads as printed ink, not a screen colour */
const dulled = (r, pct) => `color-mix(in srgb, ${role(r)} ${100 - pct}%, var(--ab-ink))`;
/* one row of round perforation holes as a background layer: [image, size] */
/* printed ink as a hex: the role pulled toward ink by dull%, then nudged toward `toward` until `against` reads at 4.6:1 */
const printedInk = (t, roleName, dull, against, toward) => {
  const base = t[roleName] || t.primary;
  let c = t.mix(t.ink, base, dull / 100);
  for (let i = 0; i < 40 && t.contrast(c, against) < 4.6; i++) c = t.mix(toward, c, 0.1);
  return c;
};
const holes = (hole, pitch, colour) => ({
  image: `radial-gradient(circle at 50% 50%, ${colour} 0 ${hole / 2}px, transparent ${hole / 2 + 0.6}px)`,
  size: `${pitch}px ${hole}px`,
});

registerMove({
  id: 'tear-line', libraryId: null,
  what: 'Board: a perforated tear line of round holes, with an optional caps caption, across the bottom of the hero and/or above the footer.',
  category: 'structure', tier: 'recipe',
  params: {
    where:  { kind: 'enum', default: 'both', options: ['hero', 'footer', 'both'] },
    pitch:  num(14, [8, 30]),      // px between holes
    hole:   num(5, [2, 9]),        // px, hole diameter
    mix:    num(60, [20, 100]),    // % ink in the hole colour (rest is canvas)
    label:  { kind: 'text', default: '' },   // caption set on the line, empty for none
    size:   num(9, [7, 13]),       // px, caption size
  },
  css(S, p) {
    const h = holes(p.hole, p.pitch, `color-mix(in srgb, var(--ab-ink) ${p.mix}%, var(--ab-canvas))`);
    const line = sel => `${sel} { content: ""; position: absolute; left: 0; right: 0; height: ${p.hole}px; background-image: ${h.image}; background-size: ${h.size}; background-repeat: repeat-x; pointer-events: none; }`;
    const cap = sel => p.label ? `${sel} { content: ${JSON.stringify(p.label)}; position: absolute; left: 50%; transform: translate(-50%, -50%); padding: 0 10px; background: var(--ab-canvas); font: 600 ${p.size}px/1 var(--ab-font-label, monospace); letter-spacing: 0.18em; text-transform: uppercase; color: var(--ab-muted); white-space: nowrap; pointer-events: none; }` : '';
    let out = '';
    if (p.where !== 'footer') out += `${S} .ab-hero { position: relative; }
${line(`${S} .ab-hero::after`)}
${S} .ab-hero::after { bottom: 0; }
${cap(`${S} .ab-hero::before`)}
${p.label ? `${S} .ab-hero::before { bottom: ${p.hole / 2}px; top: auto; }` : ''}
`;
    if (p.where !== 'hero') out += `${S} .ab-foot { position: relative; }
${line(`${S} .ab-foot::before`)}
${S} .ab-foot::before { top: ${-p.hole / 2}px; }
`;
    return out;
  },
});

registerMove({
  id: 'stamped-label', libraryId: null,
  what: 'Board: sets the hero kicker as a rubber-stamped label: double ink frame, bold caps, a slight tilt, multiply ink and a worn, speckled edge.',
  category: 'structure', tier: 'recipe',
  params: {
    tone:   { kind: 'enum', default: 'primary', options: ROLES },   // stamp ink role
    dull:   num(35, [0, 70]),      // % ink mixed into the stamp ink so it reads as printed
    tilt:   num(-2, [-8, 8]),      // degrees
    frame:  num(2, [1, 4]),        // px, each of the two frame lines
    pad:    num(8, [4, 20]),       // px, vertical padding (sides are twice this)
    tracking: num(0.16, [0, 0.4]), // em
    wear:   num(0.5, [0, 1]),      // share of the stamp lost to wear speckle
  },
  tokens(t, p) {
    return { '--ab-label-ink': printedInk(t, p.tone, p.dull, t.canvas, t.ink) };
  },
  css(S, p) {
    const ink = `var(--ab-label-ink, ${dulled(p.tone, p.dull)})`;
    const g = Math.round(p.frame);
    const dot = (x, y, r) => `radial-gradient(circle at ${x}% ${y}%, transparent 0 ${r}px, #000 ${r + 0.7}px)`;
    const worn = p.wear > 0
      ? `mask-image: ${dot(14, 30, 1.2 + p.wear)}, ${dot(66, 70, 1 + p.wear * 1.2)}, ${dot(40, 15, 0.8 + p.wear)}; -webkit-mask-image: ${dot(14, 30, 1.2 + p.wear)}, ${dot(66, 70, 1 + p.wear * 1.2)}, ${dot(40, 15, 0.8 + p.wear)};
  mask-size: 23px 17px, 31px 29px, 19px 13px; -webkit-mask-size: 23px 17px, 31px 29px, 19px 13px; mask-composite: intersect; -webkit-mask-composite: source-in;`
      : '';
    return `${S} .ab-kicker { display: inline-block; justify-self: start; width: fit-content; padding: ${p.pad}px ${p.pad * 2}px; color: ${ink}; border: ${g}px solid ${ink}; box-shadow: inset 0 0 0 ${g + 2}px var(--ab-canvas), inset 0 0 0 ${g * 2 + 2}px ${ink}; font-weight: 700; letter-spacing: ${p.tracking}em; text-transform: uppercase; transform: rotate(${p.tilt}deg); transform-origin: left center; mix-blend-mode: multiply; ${worn} }`;
  },
});

registerMove({
  id: 'ink-stamp', libraryId: null,
  what: 'Material: a control printed in one flat dulled ink with an inner keyline, caps text and a speckled worn finish; no shadow.',
  category: 'material', tier: 'recipe',
  params: {
    fill:     { kind: 'enum', default: 'primary', options: ROLES },   // ink role
    dull:     num(35, [0, 70]),    // % ink mixed in so the fill reads as printed, not as a screen colour
    keyline:  num(1, [1, 3]),      // px, inner keyline
    inset:    num(4, [2, 8]),      // px between the edge and the keyline
    wear:     num(0.18, [0, 0.5]), // share of canvas speckled over the fill
    tracking: num(0.12, [0, 0.3]), // em
  },
  tokens(t, p) {
    /* the text colour is whichever of canvas and ink reads better on the dulled fill; the fill moves away from it until 4.6:1 */
    let fill = t.mix(t.ink, t[p.fill] || t.primary, p.dull / 100);
    const on = t.contrast(fill, t.canvas) >= t.contrast(fill, t.ink) ? t.canvas : t.ink;
    const away = on === t.canvas ? t.ink : t.canvas;
    for (let i = 0; i < 40 && t.contrast(fill, on) < 4.6; i++) fill = t.mix(away, fill, 0.1);
    return { '--ab-stamp-fill': fill, '--ab-stamp-on': on };
  },
  material: {
    name: 'ink-stamp',
    css(S, sel, p) {
      const ink = `var(--ab-stamp-fill, ${dulled(p.fill, p.dull)})`;
      const speck = `color-mix(in srgb, var(--ab-stamp-on, var(--ab-canvas)) ${Math.round(p.wear * 100)}%, transparent)`;
      const dot = (x, y, r) => `radial-gradient(circle at ${x}% ${y}%, ${speck} 0 ${r}px, transparent ${r + 0.6}px)`;
      const bg = p.wear > 0 ? `${dot(18, 35, 1.1)}, ${dot(70, 62, 0.9)}, ${dot(44, 12, 1)}, ${dot(88, 25, 0.8)}` : 'none';
      return `${sel} { background-color: ${ink}; background-image: ${bg}; background-size: 21px 15px, 27px 19px, 17px 23px, 31px 13px; color: var(--ab-stamp-on, var(--ab-canvas)); border: 2px solid ${ink}; box-shadow: inset 0 0 0 ${p.inset}px ${ink}, inset 0 0 0 ${p.inset + p.keyline}px var(--ab-stamp-on, var(--ab-canvas)); text-transform: uppercase; letter-spacing: ${p.tracking}em; font-weight: 700; }`;
    },
  },
});

registerMove({
  id: 'tear-edge', libraryId: null,
  what: 'Material: a framed paper surface whose bottom edge carries a row of perforation holes, like a tear-off strip.',
  category: 'material', tier: 'recipe',
  params: {
    width:  num(2, [1, 6]),         // px, ink frame
    fill:   { kind: 'enum', default: 'canvas', options: ROLES },
    pitch:  num(12, [8, 30]),       // px between holes
    hole:   num(4, [2, 8]),         // px, hole diameter
    offset: num(8, [3, 30]),        // px from the bottom edge to the hole row
    mix:    num(55, [20, 100]),     // % ink in the hole colour
  },
  material: {
    name: 'tear-edge',
    css(S, sel, p) {
      const h = holes(p.hole, p.pitch, `color-mix(in srgb, var(--ab-ink) ${p.mix}%, ${role(p.fill)})`);
      return `${sel} { background-color: ${role(p.fill)}; color: var(--ab-ink); border: ${p.width}px solid var(--ab-ink); box-shadow: none; background-image: ${h.image}; background-size: ${h.size}; background-position: 0 calc(100% - ${p.offset}px); background-repeat: repeat-x; padding-bottom: ${p.offset + p.hole + 12}px; }`;
    },
  },
});

})();
