/* 01 Soft Form — warm, graphic, tactile. Materials follow the
   soft-form-design skill: same-color raised/recessed surfaces lit from a
   fixed top-left light, an iridescent glass panel, a glossy primary. The art
   is a new composition built from those materials (not the reference's):
   a recessed well, a raised disc, a primary semicircle and a slim glass bar
   lens. Reference proportions: the approved Soft Form board (large tight
   headline, flat swatches, few large forms). */
registerAesthetic({
  key: 'soft-form', order: 1,
  name: 'Soft Form',
  descriptor: 'Warm · Graphic · Tactile',
  influences: 'Bauhaus / Neumorphism / Prism',
  summary: 'Quiet, tactile surfaces that look pressed into and lifted out of the same material.',
  motto: 'Precise structure. Soft edges.',
  kicker: 'Geometry with feeling',
  // Light is the recommended mode: every reference (neumorphism.io, EP-133, the
  // approved Soft Form board) sits on a pale mid-tone where the highlight reads.
  mode: 'light',
  slideShape: 'soft',
  // Raised / Recessed / Glass discs are the three materials themselves, so the
  // states row stays 'swatch'. The accent word is shaded text, not a band.
  labels: { material: 'Touch & depth', states: ['Raised', 'Recessed', 'Glass'] },
  // asym (7/5): the glass card leads, the instrument panel is the narrower column.
  layout: { hero: 'split', sections: 'asym' },
  type: { ui: 'sans', label: 'sans', display: 1.28 },
  highlight: 'ink',

  roles: {
    ink: {
      use: 'Headlines, body text, hairlines (as a tint) and the selected-segment fill',
      coverage: '15–20%',
    },
    primary: {
      use: 'The one glossy action per view and the "on" state of switches',
      never: 'Body text, flat decoration, a second CTA',
    },
  },

  // Light canvases are pulled slightly off white and very dark canvases are
  // lifted slightly: the paired highlight needs room to read on either.
  canvas(b) { return b.mix(b.ink, b.canvas, b.isDark ? 0.04 : 0.06); },

  tokens(t) {
    // Dark is the documented fallback: the highlight is lifted to 11% and raised
    // surfaces get a 1px top rim (css --sf-raised) so relief still reads.
    const hi = t.isDark ? 'rgba(255,255,255,0.11)' : 'rgba(255,255,255,0.79)';
    const lo = t.isDark ? 'rgba(0,0,0,0.53)' : t.alpha(t.mix('#000000', t.canvas, 0.25), 0.6);
    return {
      '--ab-hi': hi,
      '--ab-lo': lo,
      '--ab-rim': t.isDark ? 'rgba(255,255,255,0.44)' : 'rgba(255,255,255,0.85)',
      '--ab-gloss': t.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.5)',
      '--ab-canvas-a': t.alpha(t.canvas, 0.7),   // lens body: mutes the original beneath the refracted copy
      '--ab-type-pick-w': 600,
    };
  },

  art(ctx) {
    // One scene, drawn twice: once as the art and once, scaled and offset,
    // inside the lens (simulated refraction, clipped and decorative). Few, large
    // forms: a recessed well, a raised canvas disc off-centre inside it, a
    // primary semicircle, and a slim glass bar crossing the semicircle and the
    // well rim.
    const scene = '<i class="sfa-well"></i><i class="sfa-disc"></i><i class="sfa-semi"></i>';
    return `<div class="sfa"><div class="sfa-scene">${scene}</div>`
      + abLens(scene, { x: 61, y: 5, w: 15, h: 90, scale: 1.24, dx: 3, dy: 0, cls: 'sfa-lens' })
      + '</div>';
  },

  materials: [
    { name: 'Recessed well', css: 'background: {canvas}; border-radius: 50%; box-shadow: inset 9px 9px 20px {lo}, inset -9px -9px 20px {hi};' },
    { name: 'Raised control', css: 'background: {canvas}; box-shadow: 6px 6px 13px {lo}, -6px -6px 13px {hi};' },
    { name: 'Recessed field', css: 'background: {canvas}; box-shadow: inset 6px 6px 13px {lo}, inset -6px -6px 13px {hi}; border-radius: 12px;' },
    { name: 'Glass panel', css: 'background: linear-gradient(135deg, {gloss}, transparent 48%), {canvas}; border: 1px solid {rim}; border-radius: 24px; box-shadow: inset 1px 1px 2px rgba(255,255,255,.5), inset -1px -1px 2px rgba(255,255,255,.15), 6px 9px 20px {lo}, -4px -4px 12px {hi}; /* plus a 1.5px iridescent ring: white, cyan, lilac, peach */' },
    { name: 'Primary action', css: 'background: linear-gradient(180deg, rgba(255,255,255,.15), transparent 55%), {primary}; color: {onPrimary}; border: 1px solid rgba(255,255,255,.27); border-radius: 10px; box-shadow: inset 0 1px 1px rgba(255,255,255,.44), 3px 5px 9px rgba(0,0,0,.13);' },
    { name: 'Selected segment', css: 'background: {ink}; color: {canvas}; border-radius: 9px; box-shadow: 2px 3px 5px rgba(0,0,0,.13); /* sits in a recessed track, radius 12, padding 5 */' },
    { name: 'Glass circle', css: 'background: linear-gradient(135deg, rgba(255,255,255,.6), rgba(197,234,229,.18) 30%, rgba(215,190,243,.34) 62%, rgba(245,214,168,.35) 83%, rgba(255,255,255,.53)); border: 1px solid rgba(255,255,255,.44); border-radius: 50%; box-shadow: inset 2px 2px 3px rgba(255,255,255,.75), inset -2px -2px 4px rgba(197,173,235,.6); /* plus an inner ring 6px in with white top and left borders */' },
    { name: 'Recessed slider', css: 'track: 8px, radius 4, {canvas}, inset 3px 3px 6px {lo}, inset -3px -3px 6px {hi}; thumb: 22px raised {canvas} disc, 3px 3px 7px {lo}, -3px -3px 7px {hi}; the filled part of the track is {ink} at 55%.' },
    { name: 'Switch', css: 'track: recessed 50x29, radius 20, inset 3px 3px 6px {lo}, inset -3px -3px 6px {hi}; knob: linear-gradient(145deg, rgba(255,255,255,.7), transparent 55%) over {muted} (off) or {primary} (on), shadow 1px 2px 4px rgba(0,0,0,.2).' },
  ],

  rules: {
    do: [
      'Fill raised and recessed surfaces with the canvas color itself; the paired shadow and highlight make the form.',
      'Light everything from the top left, always: dark shadow down-right, light highlight up-left.',
      'Give each control one material: recessed for fields and tracks, raised for buttons, glossy for the one primary action.',
      'Keep dense rows and body text flat so the few tactile surfaces read.',
      'Keep color to the one primary action and the switch knob; progress, status and tags stay ink and canvas.',
    ],
    dont: [
      'Fill a raised element with a different color; that makes it a card, not Soft Form.',
      'Move the light with the pointer, scroll or time, or add idle shimmer.',
      'Use a plain frosted blur as glass; the iridescent rim must be visible.',
      'Add decorative circles or arcs to the product UI itself; keep geometry to the signature art.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    coverDisplay: 0.82,   // a smaller cover headline so the well keeps its size (one big object)
    principles: [
      ['One material, pressed and lifted', 'Surfaces share the canvas color; shadow and light make the form.'],
      ['Light always comes from top left', 'Dark shadow down-right, soft highlight up-left, everywhere.'],
      ['One glossy action per screen', 'Raised buttons, recessed fields, flat rows and body text.'],
    ],
    do: [
      'Fill raised and recessed surfaces with the canvas color.',
      'Light everything from the top left.',
      'Keep dense rows and body text flat.',
    ],
    dont: [
      'Fill a raised element with a different color.',
      'Move the light with pointer or scroll.',
      'Use a plain frosted blur as glass.',
    ],
  },
});
