/* ---------------------------------------------------------------------
   ui-kit.js — the one component kit every app UI is built from.

   Shared contract between the Built view (the "UI kit" tab and the phone
   screens, js/see-built.js) and the AI brief (js/ai-brief.js). An aesthetic
   changes how each component LOOKS (colour, faces, edges, corners, shadow,
   texture). It never changes WHICH components exist, the phone type scale
   or the spacing. App screens are composed only of these components.

   Plain <script>, no modules. Globals: UI_KIT, UI_KIT_PHONE, UI_KIT_SURFACES.
------------------------------------------------------------------------ */

/* Every component an app needs, in the order the kit and the brief show them.
   states: the states the Built "UI kit" tab draws and the brief specifies. */
const UI_KIT = [
  { group: 'Actions', items: [
    { id: 'btn-primary', name: 'Primary button', use: 'The one main action on a screen.', states: ['rest', 'pressed', 'disabled'] },
    { id: 'btn-secondary', name: 'Secondary button', use: 'The alternative next to a primary button.', states: ['rest', 'pressed', 'disabled'] },
    { id: 'btn-text', name: 'Text button', use: 'Low-emphasis actions: Skip, Cancel, See all.', states: ['rest', 'pressed'] },
    { id: 'btn-destructive', name: 'Destructive button', use: 'Delete, remove, sign out.', states: ['rest', 'pressed'] },
    { id: 'btn-icon', name: 'Icon button', use: 'A single icon action in a top bar or row.', states: ['rest', 'pressed'] },
  ] },
  { group: 'Inputs', items: [
    { id: 'field', name: 'Text field', use: 'Single-line entry with a label above it.', states: ['rest', 'focus', 'error', 'disabled'] },
    { id: 'search', name: 'Search field', use: 'Search with a leading icon.', states: ['rest', 'focus'] },
    { id: 'select', name: 'Select', use: 'Pick one value from a list.', states: ['rest', 'open'] },
    { id: 'checkbox', name: 'Checkbox', use: 'Multi-select options.', states: ['off', 'on'] },
    { id: 'radio', name: 'Radio', use: 'Single choice from a short list.', states: ['off', 'on'] },
    { id: 'toggle', name: 'Toggle', use: 'An on/off setting that applies at once.', states: ['off', 'on'] },
    { id: 'segmented', name: 'Segmented control', use: 'Switch between 2 to 4 views of the same content.', states: ['rest'] },
    { id: 'slider', name: 'Slider', use: 'A value on a continuous range.', states: ['rest'] },
  ] },
  { group: 'Containers', items: [
    { id: 'card', name: 'Card', use: 'A boxed group of related content and its action.', states: ['rest'] },
    { id: 'list', name: 'List rows', use: 'Grouped rows: label, value, chevron or control.', states: ['rest', 'pressed'] },
    { id: 'callout', name: 'Callout', use: 'An inline message: info, success, warning, error.', states: ['info', 'success', 'warning', 'error'] },
    { id: 'sheet', name: 'Sheet / dialog', use: 'A focused task or confirmation over the screen.', states: ['rest'] },
    { id: 'divider', name: 'Divider and section label', use: 'Separates and names groups of content.', states: ['rest'] },
  ] },
  { group: 'Navigation', items: [
    { id: 'topbar', name: 'Top bar', use: 'Screen title, back and one or two icon actions.', states: ['rest'] },
    { id: 'tabbar', name: 'Tab bar', use: '3 to 5 top-level destinations at the bottom of a phone.', states: ['rest'] },
    { id: 'tabs', name: 'Tabs', use: 'In-page sections under a title.', states: ['rest'] },
  ] },
  { group: 'Feedback', items: [
    { id: 'badge', name: 'Badge and tag', use: 'Status, counts and categories.', states: ['neutral', 'accent'] },
    { id: 'progress', name: 'Progress', use: 'A bar for known progress.', states: ['rest'] },
    { id: 'toast', name: 'Toast', use: 'A brief confirmation that disappears by itself.', states: ['rest'] },
    { id: 'empty', name: 'Empty state', use: 'What to do when there is nothing here yet.', states: ['rest'] },
    { id: 'avatar', name: 'Avatar', use: 'A person or account: photo or initials.', states: ['rest'] },
  ] },
];

/* Phone layout and type, in points at the 390 x 844 reference screen.
   The aesthetic picks the faces (display face for titles, body face for the rest),
   weights, case and tracking. These sizes do not change per aesthetic. */
const UI_KIT_PHONE = {
  screen: { w: 390, h: 844 },
  margin: 20,          // side margin of every screen
  grid: 8,             // spacing comes from 4, 8, 12, 16, 20, 24, 32, 40, 48
  spacing: [4, 8, 12, 16, 20, 24, 32, 40, 48],
  tapTarget: 44,       // minimum hit area for anything tappable
  buttonHeight: 52,
  fieldHeight: 48,
  rowHeight: 52,
  cardPadding: 20,
  sectionGap: 28,
  tabBarHeight: 83,    // including the home-indicator area
  type: [
    // role, size, line height, face ('display' | 'body'), weight
    { role: 'Large title', size: 34, line: 41, face: 'display', weight: 700 },
    { role: 'Title', size: 28, line: 34, face: 'display', weight: 700 },
    { role: 'Title 2', size: 22, line: 28, face: 'display', weight: 650 },
    { role: 'Headline', size: 17, line: 22, face: 'body', weight: 600 },
    { role: 'Body', size: 17, line: 24, face: 'body', weight: 400 },
    { role: 'Callout', size: 16, line: 22, face: 'body', weight: 400 },
    { role: 'Subhead', size: 15, line: 20, face: 'body', weight: 400 },
    { role: 'Footnote', size: 13, line: 18, face: 'body', weight: 400 },
    { role: 'Caption', size: 12, line: 16, face: 'body', weight: 500 },
    { role: 'Tab label', size: 10, line: 12, face: 'body', weight: 600 },
  ],
};

/* What each kind of surface may use. App surfaces get the kit and nothing else. */
const UI_KIT_SURFACES = {
  app: {
    label: 'App UI',
    kinds: ['mobile', 'settings', 'dashboard'],
    rule: 'Build every screen from the UI kit only. The brand shows up through colour, type, corners, edges, shadow and how each component is drawn. Never put the board\'s hero illustration, deck art, patterns, textures, decorative bands or header art into app screens. The logo appears at icon size in the top bar or on the welcome screen, nowhere else. Images appear only when they are content (a user photo, a product photo).',
  },
  web: {
    label: 'Website',
    kinds: ['landing'],
    rule: 'Marketing pages use the same UI kit for every control, and may add the hero illustration and patterns in the hero and section bands.',
  },
};
