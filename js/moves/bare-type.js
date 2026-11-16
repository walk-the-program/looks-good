/* Moves for type-only interfaces: one sets the case and tracking of every label, tab and button, the other presses a control
   by fading it instead of filling it. Generic and parameterised; every selector is scoped under S. */
(function () {
'use strict';

const num = (def, range) => ({ kind: 'number', default: def, range });
const en = (d, options) => ({ kind: 'enum', default: d, options });

// Every class that sets a label, tab, segment or button caption in the board, the Built kit and the app screens.
const LABELS = ['.ab-label', '.ab-kicker', '.ab-eyebrow', '.ab-fieldlabel', '.ab-type-role', '.ab-type-k', '.sb-k-slabel', '.ps-eyebrow', '.ps-tiles-cap', '.sb-k-tb-title', '.sb-k-tb-t', '.ab-brand', '.sb-k-cardtitle'];
const CONTROLS = ['.ab-cta', '.ab-seg-btn', '.ab-type-apply', '.sb-k-textbtn', '.sb-k-btn', '.sb-k-btn2', '.sb-k-tabs [role="tab"]', '.sb-tab', '.sb-k-link'];

registerMove({
  id: 'label-case', libraryId: null,
  what: 'Sets the letter case and tracking of every label, tab, segment and button caption, so a look can drop tracked capitals everywhere.',
  category: 'type', tier: 'recipe',
  params: {
    labels:   en('none', ['none', 'uppercase', 'lowercase', 'capitalize']),  // case of section labels and field labels
    controls: en('none', ['none', 'uppercase', 'lowercase', 'capitalize']),  // case of buttons, tabs and segments
    tracking: num(0, [0, 0.3]),                                              // em, letter-spacing on all of them
  },
  css(S, p) {
    const sel = list => list.map(c => `${S} ${c}`).join(', ');
    return `${sel(LABELS)} { text-transform: ${p.labels} !important; letter-spacing: ${p.tracking}em !important; }
${sel(CONTROLS)} { text-transform: ${p.controls} !important; letter-spacing: ${p.tracking}em !important; }`;
  },
});

registerMove({
  id: 'press-fade', libraryId: null,
  what: 'State: a pressed control keeps its shape and fades to a lower opacity, with no fill, shadow or movement.',
  category: 'state', tier: 'recipe',
  params: { opacity: num(0.7, [0.3, 0.95]) },
  state: {
    name: 'press-fade',
    css(S, sel, p, ctx) {
      return `${ctx.ON.press(sel)} { opacity: ${p.opacity}; background: none !important; box-shadow: none !important; transform: none; filter: none; }`;
    },
  },
});

registerMove({
  id: 'bare-edge', libraryId: null,
  what: 'Sets the side padding of pinned button captions and of the app window title bar, and can drop the divider inside a split button, so bare-text controls sit on the content edge.',
  category: 'structure', tier: 'recipe',
  params: {
    buttonPad: num(0, [0, 32]),   // px, left and right padding of button captions
    titlePad:  num(16, [0, 48]),  // px, left and right padding of the window title bar (window controls and tools)
    splitRule: { kind: 'bool', default: true },  // keep the divider between a split button's action and its chevron
  },
  css(S, p) {
    return `${S} .ps-pb :is(.ab-cta, .sb-k-btn, .sb-k-btn2, .sb-k-textbtn, .ab-type-apply) { padding-left: ${p.buttonPad}px !important; padding-right: ${p.buttonPad}px !important; }
${S} .ps-mac-title { padding-left: ${p.titlePad}px !important; padding-right: ${p.titlePad}px !important; }${p.splitRule ? '' : `
${S} .sb-k-split > .sb-k-split-more { border-left-color: transparent !important; }`}`;
  },
});

})();
