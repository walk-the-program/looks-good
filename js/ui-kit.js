/* ---------------------------------------------------------------------
   ui-kit.js — the one component kit every app UI is built from.

   Shared contract between the Built view (the "UI kit" tab and the phone
   screens, js/see-built.js) and the AI brief (js/ai-brief.js). An aesthetic
   changes how each component LOOKS (colour, faces, edges, corners, shadow,
   texture). It never changes WHICH components exist, the phone type scale
   or the spacing. App screens are composed only of these components.

   Plain <script>, no modules. Globals: UI_KIT, UI_KIT_GLOSSARY, UI_KIT_PHONE, UI_KIT_SURFACES, UI_KIT_SCREENS,
   uiKitDanger, uiKitTone (UIK_COLOR is their private colour maths).
------------------------------------------------------------------------ */

/* Every component an app needs, in the order the kit and the brief show them. Together they cover every
   element in the NN/g glossary (UI_KIT_GLOSSARY below maps each glossary term to the items that build it).
   states: the states the Built "UI kit" tab draws and the brief specifies.
   ios: 'native:<SwiftUI view>' = use the system control, tinted with brand tokens only
   (iOS users expect its behaviour); 'custom' = draw it in the aesthetic's style.
   web: true = a website / desktop element (pointer, wide screens); App-only briefs leave it out. */
const UI_KIT = [
  { group: 'Actions', items: [
    { id: 'btn-primary', ios: 'custom', name: 'Primary button', use: 'The one main action on a screen.', states: ['rest', 'pressed', 'focus', 'disabled'] },
    { id: 'btn-secondary', ios: 'custom', name: 'Secondary button', use: 'The alternative next to a primary button.', states: ['rest', 'pressed', 'focus', 'disabled'] },
    { id: 'btn-text', ios: 'custom', name: 'Text button', use: 'Low-emphasis actions: Skip, Cancel, See all.', states: ['rest', 'pressed'] },
    { id: 'btn-destructive', ios: 'custom', name: 'Destructive button', use: 'Delete, remove, sign out.', states: ['rest', 'pressed'] },
    { id: 'btn-icon', ios: 'custom', name: 'Icon button', use: 'A single icon action in a top bar or row.', states: ['rest', 'pressed'] },
    { id: 'btn-split', ios: 'native:Menu(primaryAction:)', name: 'Split button', use: 'A default action plus a menu of related ones on an attached chevron.', states: ['rest', 'open'] },
    { id: 'fab', ios: 'custom', name: 'Floating button', use: 'The screen\'s main create action, floating above scrolling content.', states: ['rest', 'pressed'] },
    { id: 'link', ios: 'native:Link', name: 'Link', use: 'Text that goes to another page or opens a resource.', states: ['rest', 'pressed', 'focus'] },
    { id: 'icon', ios: 'native:Image(systemName:)', name: 'Icon', use: 'One line-icon set at fixed sizes, always paired with a label or an accessible name.', states: ['rest'] },
  ] },
  { group: 'Inputs', items: [
    { id: 'field', ios: 'custom', name: 'Text field', use: 'Single-line entry with a label above it.', states: ['rest', 'focus', 'error', 'disabled'] },
    { id: 'search', ios: 'native:.searchable', name: 'Search field', use: 'Search with a leading icon.', states: ['rest', 'focus'] },
    { id: 'select', ios: 'native:Picker / Menu', name: 'Select', use: 'Pick one value from a list.', states: ['rest', 'open'] },
    { id: 'combo', ios: 'native:.searchSuggestions', name: 'Combo box', use: 'Type a value or pick one of the suggestions that match.', states: ['rest', 'open'] },
    { id: 'listbox', ios: 'native:List(selection:)', name: 'Listbox', use: 'A visible list of options; pick one or several without opening anything.', states: ['single', 'multiple'] },
    { id: 'checkbox', ios: 'custom', name: 'Checkbox', use: 'Multi-select options.', states: ['off', 'on', 'disabled'] },
    { id: 'radio', ios: 'custom', name: 'Radio', use: 'Single choice from a short list.', states: ['off', 'on'] },
    { id: 'toggle', ios: 'native:Toggle', name: 'Toggle', use: 'An on/off setting that applies at once.', states: ['off', 'on', 'disabled'] },
    { id: 'segmented', ios: 'native:Picker(.segmented)', name: 'Segmented control', use: 'Switch between 2 to 4 views of the same content.', states: ['rest'] },
    { id: 'stepper', ios: 'native:Stepper', name: 'Input stepper', use: 'Raise or lower a small whole number one step at a time.', states: ['rest', 'minimum'] },
    { id: 'slider', ios: 'native:Slider', name: 'Slider', use: 'A value on a continuous range.', states: ['rest'] },
    { id: 'knob', ios: 'custom', name: 'Knob', use: 'A value on a range, turned like a dial: audio and other media controls.', states: ['rest'] },
  ] },
  { group: 'Pickers', items: [
    { id: 'date-field', ios: 'native:DatePicker(.compact)', name: 'Date picker', use: 'A date shown in a field; tapping it opens the calendar or wheels.', states: ['rest', 'focus'] },
    { id: 'calendar', ios: 'native:DatePicker(.graphical)', name: 'Calendar picker', use: 'A month grid for choosing a day or a range of days.', states: ['single', 'range'] },
    { id: 'wheel', ios: 'native:Picker(.wheel)', name: 'Wheel picker', use: 'Spinning columns of values with the choice in a centre band.', states: ['rest'] },
    { id: 'wheel-date', ios: 'native:DatePicker(.wheel)', name: 'Wheel-style date picker', use: 'Month, day and year as three wheels.', states: ['rest'] },
  ] },
  { group: 'Containers', items: [
    { id: 'card', ios: 'custom', name: 'Card', use: 'A boxed group of related content and its action.', states: ['rest'] },
    { id: 'list', ios: 'native:List (.insetGrouped)', name: 'List rows', use: 'Grouped rows: label, value, chevron or control.', states: ['rest', 'pressed'] },
    { id: 'accordion', ios: 'native:DisclosureGroup', name: 'Accordion', use: 'Stacked headings that each open to show their section.', states: ['closed', 'open'] },
    { id: 'carousel', ios: 'native:TabView(.page)', name: 'Carousel', use: 'A row of cards that swipes sideways, one page at a time.', states: ['rest'] },
    { id: 'matrix', ios: 'custom', name: '2D matrix', use: 'Rows of tiles: scroll down through rows, sideways within a row.', states: ['rest'] },
    { id: 'callout', ios: 'custom', name: 'Callout', use: 'An inline message: info, success, warning, error.', states: ['info', 'success', 'warning', 'error'] },
    { id: 'divider', ios: 'custom', name: 'Divider and section label', use: 'Separates and names groups of content.', states: ['rest'] },
  ] },
  { group: 'Overlays', items: [
    { id: 'overlay', ios: 'custom', name: 'Overlay', use: 'The dimmed layer behind anything modal; tapping it closes non-critical overlays.', states: ['rest'] },
    { id: 'dialog', ios: 'native:.alert', name: 'Dialog', use: 'A centred box that stops the task for a decision or a warning.', states: ['rest'] },
    { id: 'sheet', ios: 'native:.sheet / .confirmationDialog', name: 'Bottom sheet', use: 'A task or set of choices that slides up from the bottom.', states: ['rest'] },
    { id: 'side-sheet', ios: 'native:.inspector', name: 'Side sheet', use: 'Supporting content or filters that slide in from the side edge.', states: ['rest'] },
    { id: 'popover', ios: 'native:.popover', name: 'Popup', use: 'A small panel attached to the control that opened it.', states: ['rest'] },
    { id: 'popup-tip', ios: 'native:.popoverTip (TipKit)', name: 'Popup tip', use: 'A one-time hint pointing at a feature, with a way to dismiss it.', states: ['rest'] },
    { id: 'tooltip', ios: 'custom', name: 'Tooltip', use: 'A short label for a control, shown on hover, focus or long press.', states: ['rest'] },
    { id: 'lightbox', ios: 'custom', name: 'Lightbox', use: 'One image enlarged over a dark layer, with close and next.', states: ['rest'] },
  ] },
  { group: 'Navigation', items: [
    { id: 'topbar', ios: 'native:NavigationStack toolbar', name: 'Top bar', use: 'Screen title, back and one or two icon actions.', states: ['rest'] },
    { id: 'tabbar', ios: 'native:TabView', name: 'Tab bar', use: '3 to 5 top-level destinations at the bottom of a phone.', states: ['rest'] },
    { id: 'tabs', ios: 'custom', name: 'Tabs', use: 'In-page sections under a title.', states: ['rest'] },
    { id: 'navbar', ios: 'custom', web: true, name: 'Navigation bar', use: 'A website\'s top bar: logo, main sections and one action.', states: ['rest'] },
    { id: 'nav-menu', ios: 'native:NavigationSplitView sidebar', name: 'Navigation menu', use: 'A vertical list of destinations with the current one marked.', states: ['rest'] },
    { id: 'drawer', ios: 'custom', name: 'Drawer menu', use: 'Navigation hidden behind a menu button, sliding in from the side.', states: ['rest'] },
    { id: 'breadcrumbs', ios: 'custom', web: true, name: 'Breadcrumbs', use: 'The path from the home page to this one; every step but the last is a link.', states: ['rest'] },
    { id: 'anchor', ios: 'custom', web: true, name: 'Anchor links', use: 'An "On this page" list that jumps to sections of a long page.', states: ['rest'] },
    { id: 'back-top', ios: 'custom', web: true, name: 'Back-to-top button', use: 'Appears after a long scroll and returns to the top of the page.', states: ['rest'] },
    { id: 'scrollbar', ios: 'native:ScrollView indicators', name: 'Scrollbar', use: 'Shows where you are in content that scrolls, and drags it.', states: ['rest'] },
  ] },
  { group: 'Menus', items: [
    { id: 'dropdown-menu', ios: 'native:Menu', name: 'Dropdown menu', use: 'A button that opens a list of commands.', states: ['rest', 'open'] },
    { id: 'context-menu', ios: 'native:.contextMenu', name: 'Contextual menu', use: 'Actions for one item, on long press or right click.', states: ['rest'] },
    { id: 'submenu', ios: 'native:Menu (nested)', name: 'Submenu', use: 'A menu item that opens a second list of its own.', states: ['rest'] },
    { id: 'expandable-menu', ios: 'native:OutlineGroup', name: 'Expandable menu', use: 'Navigation items that open in place to show their children.', states: ['rest'] },
    { id: 'megamenu', ios: 'custom', web: true, name: 'Megamenu', use: 'A wide panel of grouped links under one navigation item.', states: ['rest'] },
    { id: 'menubar', ios: 'native:.commands', web: true, name: 'Menu bar', use: 'A row of menu titles across the top of a desktop app.', states: ['rest', 'open'] },
    { id: 'ribbon', ios: 'custom', web: true, name: 'Ribbon', use: 'A tabbed toolbar with commands in labelled groups.', states: ['rest'] },
    { id: 'pie-menu', ios: 'custom', name: 'Pie menu', use: 'Up to 6 actions in a ring around the press point.', states: ['rest'] },
  ] },
  { group: 'Feedback', items: [
    { id: 'badge', ios: 'custom', name: 'Badge and tag', use: 'Status, counts and categories.', states: ['neutral', 'accent'] },
    { id: 'progress', ios: 'native:ProgressView', name: 'Progress', use: 'A bar for known progress.', states: ['rest'] },
    { id: 'spinner', ios: 'native:ProgressView()', name: 'Spinner', use: 'Unknown wait under a few seconds.', states: ['rest'] },
    { id: 'skeleton', ios: 'native:.redacted(reason: .placeholder)', name: 'Skeleton screen', use: 'Blocks in the shape of the coming layout while content loads.', states: ['rest'] },
    { id: 'toast', ios: 'custom', name: 'Toast', use: 'A brief confirmation that disappears by itself.', states: ['rest'] },
    { id: 'empty', ios: 'native:ContentUnavailableView', name: 'Empty state', use: 'What to do when there is nothing here yet.', states: ['rest'] },
    { id: 'avatar', ios: 'custom', name: 'Avatar', use: 'A person or account: photo or initials.', states: ['rest'] },
  ] },
];

/* Every element in NN/g's "User-Interface Elements: Glossary" (nngroup.com/articles/ui-elements-glossary,
   2025-02-28), with the UI_KIT items that build it. Umbrella terms (Control, Menu, Picker ...) list
   every item of that kind. The UI kit tab shows this as a coverage table. */
const UI_KIT_GLOSSARY = [
  { term: '2D Matrix', ids: ['matrix'] },
  { term: 'Accordion', ids: ['accordion'] },
  { term: 'Anchor Link', aka: 'In-page link, jump link', ids: ['anchor'] },
  { term: 'Back-to-Top Button', ids: ['back-top'] },
  { term: 'Badge', ids: ['badge'] },
  { term: 'Bottom Sheet', ids: ['sheet'] },
  { term: 'Breadcrumbs', ids: ['breadcrumbs'] },
  { term: 'Button', ids: ['btn-primary', 'btn-secondary', 'btn-text', 'btn-destructive', 'btn-icon'] },
  { term: 'Calendar Picker', ids: ['calendar'] },
  { term: 'Card', ids: ['card'] },
  { term: 'Carousel', ids: ['carousel'] },
  { term: 'Checkbox', ids: ['checkbox'] },
  { term: 'Combo Box', ids: ['combo'] },
  { term: 'Container', ids: ['card', 'list', 'accordion', 'carousel', 'matrix', 'callout'] },
  { term: 'Contextual Menu', ids: ['context-menu'] },
  { term: 'Control', ids: ['btn-primary', 'field', 'checkbox', 'toggle', 'slider', 'stepper'] },
  { term: 'Date Picker', ids: ['date-field', 'calendar', 'wheel-date'] },
  { term: 'Dialog', ids: ['dialog'] },
  { term: 'Drawer Menu', ids: ['drawer'] },
  { term: 'Dropdown List', ids: ['select'] },
  { term: 'Dropdown Menu', aka: 'Pulldown menu, linear menu', ids: ['dropdown-menu'] },
  { term: 'Expandable Menu', ids: ['expandable-menu'] },
  { term: 'Floating Button', aka: 'Floating action button, FAB', ids: ['fab'] },
  { term: 'Icon', ids: ['icon'] },
  { term: 'Input Control', ids: ['field', 'search', 'select', 'combo', 'listbox', 'checkbox', 'radio', 'toggle', 'segmented', 'stepper', 'slider', 'knob'] },
  { term: 'Input Stepper', ids: ['stepper'] },
  { term: 'Knob', aka: 'Virtual knob', ids: ['knob'] },
  { term: 'Lightbox', ids: ['lightbox'] },
  { term: 'Link', aka: 'Hyperlink', ids: ['link'] },
  { term: 'Listbox', ids: ['listbox'] },
  { term: 'Megamenu', aka: 'Rectangular menu, square menu', ids: ['megamenu'] },
  { term: 'Menu', ids: ['dropdown-menu', 'context-menu', 'submenu', 'expandable-menu', 'megamenu', 'menubar', 'pie-menu', 'drawer', 'nav-menu'] },
  { term: 'Menu Bar', ids: ['menubar'] },
  { term: 'Navigation Bar', ids: ['navbar', 'topbar'] },
  { term: 'Navigation Menu', ids: ['nav-menu'] },
  { term: 'Overlay', ids: ['overlay', 'dialog', 'lightbox'] },
  { term: 'Picker', ids: ['date-field', 'calendar', 'wheel', 'wheel-date'] },
  { term: 'Pie Menu', aka: 'Radial menu', ids: ['pie-menu'] },
  { term: 'Popup', aka: 'Popover', ids: ['popover'] },
  { term: 'Popup Tip', ids: ['popup-tip'] },
  { term: 'Progress Bar', ids: ['progress'] },
  { term: 'Progress Indicator', ids: ['progress', 'spinner', 'skeleton'] },
  { term: 'Radio Button', ids: ['radio'] },
  { term: 'Range Control', aka: 'Continuous control', ids: ['slider', 'knob'] },
  { term: 'Ribbon', ids: ['ribbon'] },
  { term: 'Scrollbar', ids: ['scrollbar'] },
  { term: 'Segmented Button', aka: 'Segmented control', ids: ['segmented'] },
  { term: 'Side Sheet', aka: 'Drawer, flyout', ids: ['side-sheet'] },
  { term: 'Skeleton Screen', ids: ['skeleton'] },
  { term: 'Slider', ids: ['slider'] },
  { term: 'Snackbar', aka: 'Toast', ids: ['toast'] },
  { term: 'Spinner', aka: 'Loading spinner, activity indicator', ids: ['spinner'] },
  { term: 'Split Button', ids: ['btn-split'] },
  { term: 'State-Switch Control', ids: ['checkbox', 'radio', 'toggle', 'segmented'] },
  { term: 'Submenu', ids: ['submenu'] },
  { term: 'Tab Bar', aka: 'Tabs', ids: ['tabbar', 'tabs'] },
  { term: 'Textbox', aka: 'Text field, input field', ids: ['field', 'search'] },
  { term: 'Toggle', aka: 'Toggle switch, switch', ids: ['toggle'] },
  { term: 'Tooltip', ids: ['tooltip'] },
  { term: 'Wheel Picker', ids: ['wheel'] },
  { term: 'Wheel-Style Date Picker', ids: ['wheel-date'] },
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
    rule: 'Build every screen from the UI kit only. The brand shows up through colour, type, corners, edges, shadow and how each component is drawn. Never put the board\'s hero illustration, deck art, patterns, textures, decorative bands or header art into app screens. The logo appears at icon size in the top bar or on the welcome screen, nowhere else. Images appear only when they are content (a user photo, a product photo). Never introduce a colour that is not in the palette: destructive and status colours come from it too.',
  },
  web: {
    label: 'Website',
    kinds: ['landing'],
    rule: 'Marketing pages use the same UI kit for every control. The hero shows the product: a real screen built from the UI kit. The board\'s illustration is a style specimen for the brand board and deck; never put it on the website. Patterns only as quiet section backgrounds.',
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

/* Colour maths for uiKitDanger / uiKitTone (no dependency on js/color.js, so the tests can load this alone). */
const UIK_COLOR = (() => {
  const parse = v => {
    const s = String(v == null ? '' : v).trim();
    let m = /^#([0-9a-f]{3})$/i.exec(s);
    if (m) return m[1].split('').map(c => parseInt(c + c, 16));
    m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(s);
    if (m) return [0, 2, 4].map(i => parseInt(m[1].slice(i, i + 2), 16));
    m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(s);
    if (m) return [+m[1], +m[2], +m[3]];
    m = /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/i.exec(s);
    if (m) return [+m[1] * 255, +m[2] * 255, +m[3] * 255];
    return null;
  };
  const hex = c => '#' + c.map(x => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('');
  const lum = c => { const f = x => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const con = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const mix = (a, b, k) => a.map((x, i) => x + (b[i] - x) * k);   // k = share of b
  const hsl = c => {
    const [r, g, b] = c.map(x => x / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    if (!d) return { h: 0, s: 0, l };
    const s = d / (1 - Math.abs(2 * l - 1));
    let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60; if (h < 0) h += 360;
    return { h, s, l };
  };
  const hslToRgb = (h, s, l) => {
    l = Math.max(0, Math.min(1, l));
    const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return [f(0) * 255, f(8) * 255, f(4) * 255].map(Math.round);
  };
  const lab = c => {
    const f = x => { x /= 255; return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
    const [r, g, b] = c.map(f);
    const xyz = [(0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047, 0.2126 * r + 0.7152 * g + 0.0722 * b, (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883];
    const [X, Y, Z] = xyz.map(v => (v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116));
    return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)];
  };
  const dE = (a, b) => { const p = lab(a), q = lab(b); return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); };
  return { parse, hex, con, mix, hsl, hslToRgb, dE, lum };
})();

/* Destructive and error colour, from the palette only (no default red).
   pal: { primary, secondary, accent, ink, canvas } as CSS colour strings (#hex, rgb(), color(srgb ...)).
   A palette colour counts as reddish at hue <= 20 deg or >= 340 deg with HSL saturation >= 0.35; it is
   usable when it holds 3:1 on the canvas, shaded toward the ink by at most half if it must.
   Returns { role, color, text, on }:
     role  'primary' | 'secondary' | 'accent' when the palette has a usable reddish colour, else null
     color the fill / edge colour: the error colour `text` when the destructive button is filled, else the
           palette colour itself (or the ink when role is null)
     text  the one error colour (the brief's --error): the palette colour shaded toward the ink until it holds
           4.5:1 on the canvas and on the canvas tinted 6% toward the ink (the kit's panels); if no label then reaches 4.5:1 on it, its lightness moves (same hue)
     on    canvas, ink or white, whichever scores highest on `text`; always 4.5:1 when role is set
     fill  true only when that colour is distinct from the primary (not the primary role, Delta E > 10):
           destructive never looks like the main action, so otherwise it is an outline in `text`
   With no reddish colour, destructive is an outline button with an ink label and errors use the ink
   with a strong edge; the label and a confirmation sheet carry the meaning. */
function uiKitDanger(pal) {
  const { parse, hex, con, mix, hsl, hslToRgb, dE } = UIK_COLOR;
  const ink = parse(pal && pal.ink) || [17, 17, 17], canvas = parse(pal && pal.canvas) || [255, 255, 255];
  let best = null;
  ['primary', 'secondary', 'accent'].forEach(role => {
    const c = parse(pal && pal[role]);
    if (!c) return;
    const { h, s } = hsl(c);
    if (!(h <= 20 || h >= 340) || s < 0.35) return;
    let k = 0, use = c;
    while (con(use, canvas) < 3 && k < 0.5) { k += 0.05; use = mix(c, ink, k); }
    if (con(use, canvas) < 3) return;
    // the most colourful reddish role wins (chroma), then the one nearest pure red
    const chroma = (Math.max(...c) - Math.min(...c)) / 255, dist = Math.min(h, 360 - h);
    if (!best || chroma > best.chroma + 0.02 || (Math.abs(chroma - best.chroma) <= 0.02 && dist < best.dist)) best = { role, c: use, chroma, dist };
  });
  if (!best) return { role: null, color: hex(ink), text: hex(ink), on: hex(canvas), fill: false };
  // The error line sits on the kit's panels, which tint the canvas a few percent toward the ink: it must hold
  // 4.5:1 on the canvas and on that tinted ground (6%), or it slips under 4.5 on the panel it is drawn on.
  const ground = mix(canvas, ink, 0.06);
  const both = c => Math.min(con(c, canvas), con(c, ground));
  let t = best.c, k = 0;
  while (both(t) < 4.5 && k < 1) { k = Math.min(1, k + 0.05); t = mix(best.c, ink, k); }
  const pri = parse(pal && pal.primary);
  const fill = best.role !== 'primary' && !(pri && dE(best.c, pri) <= 10);
  // `t` is the one error colour (the brief's --error and the filled destructive button). Its label is the
  // best of canvas, ink or white; if none holds 4.5:1, the lightness moves (same hue) to the nearest value that
  // holds 4.5:1 both on the canvas and under its label.
  const ons = [canvas, ink, [255, 255, 255]];
  const labelOn = c => ons.reduce((a, b) => (con(b, c) > con(a, c) ? b : a));
  const ok = c => { c = c.map(Math.round); return both(c) >= 4.5 && con(labelOn(c), c) >= 4.5; };
  if (!ok(t)) {
    const { h, s, l } = hsl(t);
    let found = null;
    for (let j = 0.01; j <= 1.0001 && !found; j += 0.01) {
      for (const sign of [1, -1]) {
        const c = hslToRgb(h, s, l + sign * j);
        if (ok(c)) { found = c; break; }
      }
    }
    if (found) t = found;
  }
  t = t.map(Math.round);
  const on = labelOn(t);
  return { role: best.role, color: hex(fill ? t : best.c), text: hex(t), on: hex(on), fill };
}

/* A palette colour as a status tone: the colour itself for fills and tints, and `ico`, the same colour
   shaded toward the ink until it holds `floor`:1 on the canvas, or on a tint of `over` (0..1) of the
   colour over the canvas (icons, edges and text that carry meaning). */
function uiKitTone(color, pal, floor = 3, over = 0) {
  const { parse, hex, con, mix } = UIK_COLOR;
  const c = parse(color), ink = parse(pal && pal.ink) || [17, 17, 17], canvas = parse(pal && pal.canvas) || [255, 255, 255];
  if (!c) return { color: hex(ink), ico: hex(ink) };
  const ground = over ? mix(canvas, c, over) : canvas;   // `over`: the tone's share of a tint the mark sits on
  let t = c, k = 0;
  while (con(t, ground) < floor && k < 1) { k = Math.min(1, k + 0.05); t = mix(c, ink, k); }
  return { color: hex(c), ico: hex(t) };
}
