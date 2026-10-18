/* ---------------------------------------------------------------------
   ui-kit.js — the one component kit every app UI is built from.

   Shared contract between the Built view (the "UI kit" tab and the phone
   screens, js/see-built.js) and the AI brief (js/ai-brief.js). An aesthetic
   changes how each component LOOKS (colour, faces, edges, corners, shadow,
   texture). It never changes WHICH components exist, the phone type scale
   or the spacing. App screens are composed only of these components.

   Plain <script>, no modules. Globals: UI_KIT, UI_KIT_PHONE, UI_KIT_SURFACES, UI_KIT_SCREENS.
------------------------------------------------------------------------ */

/* Every component an app needs, in the order the kit and the brief show them.
   states: the states the Built "UI kit" tab draws and the brief specifies.
   ios: 'native:<SwiftUI view>' = use the system control, tinted with brand tokens only
   (iOS users expect its behaviour); 'custom' = draw it in the aesthetic's style. */
const UI_KIT = [
  { group: 'Actions', items: [
    { id: 'btn-primary', ios: 'custom', name: 'Primary button', use: 'The one main action on a screen.', states: ['rest', 'pressed', 'disabled'] },
    { id: 'btn-secondary', ios: 'custom', name: 'Secondary button', use: 'The alternative next to a primary button.', states: ['rest', 'pressed', 'disabled'] },
    { id: 'btn-text', ios: 'custom', name: 'Text button', use: 'Low-emphasis actions: Skip, Cancel, See all.', states: ['rest', 'pressed'] },
    { id: 'btn-destructive', ios: 'custom', name: 'Destructive button', use: 'Delete, remove, sign out.', states: ['rest', 'pressed'] },
    { id: 'btn-icon', ios: 'custom', name: 'Icon button', use: 'A single icon action in a top bar or row.', states: ['rest', 'pressed'] },
  ] },
  { group: 'Inputs', items: [
    { id: 'field', ios: 'custom', name: 'Text field', use: 'Single-line entry with a label above it.', states: ['rest', 'focus', 'error', 'disabled'] },
    { id: 'search', ios: 'native:.searchable', name: 'Search field', use: 'Search with a leading icon.', states: ['rest', 'focus'] },
    { id: 'select', ios: 'native:Picker / Menu', name: 'Select', use: 'Pick one value from a list.', states: ['rest', 'open'] },
    { id: 'checkbox', ios: 'custom', name: 'Checkbox', use: 'Multi-select options.', states: ['off', 'on'] },
    { id: 'radio', ios: 'custom', name: 'Radio', use: 'Single choice from a short list.', states: ['off', 'on'] },
    { id: 'toggle', ios: 'native:Toggle', name: 'Toggle', use: 'An on/off setting that applies at once.', states: ['off', 'on'] },
    { id: 'segmented', ios: 'native:Picker(.segmented)', name: 'Segmented control', use: 'Switch between 2 to 4 views of the same content.', states: ['rest'] },
    { id: 'slider', ios: 'native:Slider', name: 'Slider', use: 'A value on a continuous range.', states: ['rest'] },
  ] },
  { group: 'Containers', items: [
    { id: 'card', ios: 'custom', name: 'Card', use: 'A boxed group of related content and its action.', states: ['rest'] },
    { id: 'list', ios: 'native:List (.insetGrouped)', name: 'List rows', use: 'Grouped rows: label, value, chevron or control.', states: ['rest', 'pressed'] },
    { id: 'callout', ios: 'custom', name: 'Callout', use: 'An inline message: info, success, warning, error.', states: ['info', 'success', 'warning', 'error'] },
    { id: 'sheet', ios: 'native:.sheet / .confirmationDialog', name: 'Sheet / dialog', use: 'A focused task or confirmation over the screen.', states: ['rest'] },
    { id: 'divider', ios: 'custom', name: 'Divider and section label', use: 'Separates and names groups of content.', states: ['rest'] },
  ] },
  { group: 'Navigation', items: [
    { id: 'topbar', ios: 'native:NavigationStack toolbar', name: 'Top bar', use: 'Screen title, back and one or two icon actions.', states: ['rest'] },
    { id: 'tabbar', ios: 'native:TabView', name: 'Tab bar', use: '3 to 5 top-level destinations at the bottom of a phone.', states: ['rest'] },
    { id: 'tabs', ios: 'custom', name: 'Tabs', use: 'In-page sections under a title.', states: ['rest'] },
  ] },
  { group: 'Feedback', items: [
    { id: 'badge', ios: 'custom', name: 'Badge and tag', use: 'Status, counts and categories.', states: ['neutral', 'accent'] },
    { id: 'progress', ios: 'native:ProgressView', name: 'Progress', use: 'A bar for known progress.', states: ['rest'] },
    { id: 'toast', ios: 'custom', name: 'Toast', use: 'A brief confirmation that disappears by itself.', states: ['rest'] },
    { id: 'empty', ios: 'native:ContentUnavailableView', name: 'Empty state', use: 'What to do when there is nothing here yet.', states: ['rest'] },
    { id: 'avatar', ios: 'custom', name: 'Avatar', use: 'A person or account: photo or initials.', states: ['rest'] },
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

/* Five screen patterns every app is assembled from. blocks: top to bottom, each an UI_KIT id
   (or 'title' / 'body' / 'section' for type roles). Spacing comes from UI_KIT_PHONE. */
const UI_KIT_SCREENS = [
  { id: 'onboarding', name: 'Onboarding', use: 'First run: what the app does and one way in.',
    blocks: ['topbar', 'title', 'body', 'list', 'btn-primary', 'btn-text'],
    rules: ['One Large title and one sentence of body; at most 3 feature rows.', 'Content block centred between the top bar and the actions.', 'Primary button and one text button pinned above the home indicator.', 'No illustration, pattern or art: the brand shows in type, colour and components.'] },
  { id: 'list', name: 'List', use: 'A home or index screen: many items, one tap to open.',
    blocks: ['topbar', 'title', 'search', 'segmented', 'section', 'list', 'tabbar'],
    rules: ['Large title that collapses into the top bar on scroll.', 'Search and filters sit above the first section, never inside rows.', 'Rows are 52pt minimum with one line of title and one of detail; trailing value or chevron.', 'The list scrolls under the tab bar and ends above it; nothing hides behind it.'] },
  { id: 'detail', name: 'Detail', use: 'One item: its facts and what you can do with it.',
    blocks: ['topbar', 'title', 'badge', 'card', 'section', 'list', 'btn-primary'],
    rules: ['Back button and at most two icon actions in the top bar.', 'Title, status badge, then one summary card with the key numbers.', 'Secondary facts as label/value rows in a grouped list.', 'One primary action, at the bottom or in the top bar, never both.'] },
  { id: 'form', name: 'Form', use: 'Create or edit something.',
    blocks: ['topbar', 'title', 'field', 'field', 'select', 'toggle', 'callout', 'btn-primary'],
    rules: ['Labels above fields; one column; 16pt between fields, 28pt between groups.', 'Errors appear under the field in the error colour, plus one callout at the top on submit.', 'Primary action names the result ("Save", "Create invoice"), disabled until valid.', 'Keyboard never covers the focused field or the primary action.'] },
  { id: 'settings', name: 'Settings', use: 'Preferences and account.',
    blocks: ['topbar', 'title', 'section', 'list', 'toggle', 'section', 'list', 'btn-destructive'],
    rules: ['Grouped lists with small uppercase or tracked section labels.', 'Each row is a label plus one control: toggle, value with chevron, or nothing.', 'Changes apply at once; no Save button.', 'Destructive action alone in the last group.'] },
];
