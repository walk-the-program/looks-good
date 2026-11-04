/* ---------------------------------------------------------------------
   build-pack.js — the "Build pack": ONE Markdown file, <brand>-build-pack.md, with everything an AI
   coding agent needs to rebuild this brand's UI and patterns faithfully: a prompt that says how to ingest
   and act on it (Part 0), the AI brief (Part 1), the design tokens (Part 2), the real CSS and reference
   markup that draw every UI kit component in the current style (Part 3), the screen layouts (Part 4), the
   patterns with their settings, SVG and generator code (Part 5), the logo (Part 6) and a checklist (Part 7).

   It sits beside the AI brief (js/ai-brief.js), which is unchanged: Copy for..., Download .md and
   Save + files stay as they are.

   Two halves:
     - DOM part  bpCollect(): renders the UI kit off-screen the way aibKitMeasure does (SeeBuilt.kitInto,
       light and dark), reads the document's stylesheets through the CSSOM and keeps every rule that matches
       an element of the kit (bpScan / bpBuildTree), cleans and pretty-prints the markup, resolves the
       custom properties the CSS uses, fetches the pattern source files. Returns plain data.
     - Pure part buildPackMarkdown(data): assembles the text from that data (no DOM, no globals), so the
       tests can feed it stub data. buildPackPrompt(info) is the short paste-in prompt.
   BuildPack.run(btn) is what the buttons call (brief page header, editor dock): the same gates as the
   brief's own exports, then generate, download, toast.

   Needs ai-brief.js (aibContext, aibKitGroups, aibCssLines, aibSwiftLines, aibPatternAssets,
   aibPatternBytes, aibPatternLine, aibLogoZipFiles, buildAiBriefChecked), see-built.js (SeeBuilt),
   ui-kit.js, patterns, brief-view.js (briefProductBlock), app.js (state, showToast, copyText,
   brandFileSlug). Plain <script>, no modules.
------------------------------------------------------------------------ */

/* ======================= pure helpers ======================= */

const BP_TARGET_LABEL = { web: 'Web', swiftui: 'SwiftUI', both: 'Web + SwiftUI' };
const BP_SURFACE_LABEL = { app: 'App', web: 'Website', both: 'App + Website' };

// A fenced block whose fence is longer than any backtick run inside it.
function bpFence(text, lang) {
  const runs = String(text).match(/`+/g) || [];
  const n = Math.max(3, ...runs.map(r => r.length + 1));
  const f = '`'.repeat(n);
  return f + (lang || '') + '\n' + String(text).replace(/\n+$/, '') + '\n' + f;
}

// Demote Markdown headings by `by` levels (never into a code fence).
function bpDemote(md, by) {
  let fence = false;
  return String(md).split('\n').map(l => {
    if (/^(`{3,}|~{3,})/.test(l)) { fence = !fence; return l; }
    if (fence) return l;
    return l.replace(/^(#{1,6})(\s)/, (m, h, s) => '#'.repeat(Math.min(6, h.length + by)) + s);
  }).join('\n');
}

// GitHub-style anchor for a heading.
function bpAnchor(h) {
  return String(h).toLowerCase().replace(/[^a-z0-9 -]/g, '').trim().replace(/ /g, '-');
}

// Split on a separator that is not inside (), [] or quotes.
function bpSplitTop(str, sep) {
  const out = [];
  let depth = 0, q = '', cur = '';
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (q) {
      cur += c;
      if (c === '\\') cur += str[++i] || '';
      else if (c === q) q = '';
      continue;
    }
    if (c === '"' || c === "'") { q = c; cur += c; continue; }
    if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    if (c === sep && depth === 0) { out.push(cur); cur = ''; continue; }
    cur += c;
  }
  if (cur.trim()) out.push(cur);
  return out.map(s => s.trim()).filter(Boolean);
}

// A selector the document can test against the kit: pseudo-elements and dynamic pseudo-classes stripped
// (::before matches its element; :hover / :focus-visible / :active match the element they style).
const BP_DYN = '(?:hover|active|focus-visible|focus-within|focus|visited|target)';
function bpProbe(sel) {
  let s = sel.replace(new RegExp(':not\\(\\s*:' + BP_DYN + '\\s*\\)', 'g'), '')
    .replace(/::?(?:before|after|marker|placeholder|selection|first-line|first-letter|backdrop|file-selector-button|-webkit-[\w-]+|-moz-[\w-]+)(?![\w-])(?:\([^)]*\))?/g, '')
    .replace(new RegExp(':' + BP_DYN + '(?![\\w-])', 'g'), '');
  if (/[\s>+~]$/.test(s) || !s.trim()) s += '*';
  return s.trim();
}

function bpIndent(text, pad) {
  return String(text).split('\n').map(l => (l ? pad + l : l)).join('\n');
}

// The Part 0 prompt's one-line description of the target.
function bpTargetWords(target) {
  return target === 'swiftui' ? 'SwiftUI (iOS)' : target === 'both' ? 'Web and SwiftUI' : 'Web (HTML and CSS)';
}

// The short paste-in prompt (for the "Copy build-pack prompt" button).
function buildPackPrompt(info) {
  const i = info || {};
  const brand = i.brandName || 'this brand';
  const surface = i.surface || 'app';
  const target = i.target || 'web';
  const style = i.styleName ? ` in the ${i.styleName} style` : '';
  const what = surface === 'web' ? 'website' : surface === 'both' ? 'app and website' : 'app';
  const where = target === 'swiftui' ? 'in SwiftUI' : target === 'both' ? 'for Web and SwiftUI' : 'for the web';
  const pats = surface === 'app' ? '' : ' Use patterns only where Part 1 allows.';
  return `Read BUILD-PACK.md in the project root. Follow Part 0 exactly, then build the ${brand} ${what} UI${style} ${where}: tokens from Part 2, every component from Part 3 with its CSS values ported exactly, screens from Part 4.${pats} Use no colour outside the tokens and no art in app screens. When you finish, report back what Part 0 asks for, including anything you could not match.`;
}

function bpKitItemsOf(data) {
  const appOnly = data.surface === 'app';
  return (data.kit && data.kit.groups ? data.kit.groups : [])
    .map(g => ({ group: g.group, items: (g.items || []).filter(it => !(appOnly && it.web)) }))
    .filter(g => g.items.length);
}

function bpIosLine(ios) {
  return /^native:/.test(ios || '') ? `Native view \`${ios.slice(7)}\`, tinted with the brand tokens` : 'Custom, drawn from the brand tokens and the CSS below';
}

// Collapse states whose reference markup is identical: [{ names: [..], html }]
function bpCollapseStates(states) {
  const out = [];
  (states || []).forEach(s => {
    const hit = out.find(o => o.html === s.html);
    if (hit) hit.names.push(s.name); else out.push({ names: [s.name], html: s.html });
  });
  return out;
}

const BP_PARTS = [
  'Part 0: How to use this file (prompt for the agent)',
  'Part 1: Brand brief',
  'Part 2: Design tokens',
  'Part 3: UI kit source',
  'Part 4: Screen layouts',
  'Part 5: Patterns',
  'Part 6: Logo',
  'Part 7: Verification checklist',
];

function bpPart0(data) {
  const web = data.target !== 'swiftui', swift = data.target !== 'web';
  const app = data.surface !== 'web', site = data.surface !== 'app';
  const pats = !!(data.patterns && data.patterns.items && data.patterns.items.length) && data.surface !== 'app';
  const name = data.brand.name, style = data.brand.styleName;
  const L = [];
  L.push(`## ${BP_PARTS[0]}`, '',
    'This section is addressed to you, the AI coding agent. Read it first and follow it exactly. It tells you what this file is, which part wins when two disagree, what to do in what order, and what to report when you finish.', '');
  L.push(`**What this file is.** The build pack for ${name}: ${BP_SURFACE_LABEL[data.surface]} UI, ${style} style, for ${bpTargetWords(data.target)}. It holds the brand brief (Part 1), the design tokens (Part 2), the real CSS and reference markup that draw every UI kit component (Part 3) and every screen layout (Part 4), ${pats ? 'the patterns with their settings, SVG and generator code (Part 5), ' : ''}the logo (Part 6) and a checklist you must pass (Part 7). Everything you need is here; do not redraw anything from memory and do not invent values this file does not give.`, '');
  L.push('**Authority order.** When two things in this file disagree, the earlier one wins:',
    '',
    '1. Part 1 brief rules: what is allowed, where, and why.',
    '2. Part 2 tokens: the only colours, type faces and spacing values you may use.',
    '3. Part 3 component CSS values (`kit.css`): every colour, size, radius, border, shadow and type setting of every component.',
    '4. Part 3 and Part 4 reference markup: illustrative. It shows structure and intent; class names are Looks Good\'s own, and the demo copy ("Brand refresh", "Maya Ortiz") is placeholder text.', '');
  L.push('**Steps.**', '');
  let n = 1;
  L.push(`${n++}. Save this file in the project root as \`BUILD-PACK.md\`, and read Part 1 completely before writing code.`);
  if (web && swift) L.push(`${n++}. Create the token files from Part 2 in the project's stack: \`tokens.css\` (CSS custom properties, light and dark) for the web target and \`Theme.swift\` for the SwiftUI target. Keep the token names; every colour in the project comes from them.`);
  else if (web) L.push(`${n++}. Create the token file from Part 2 (\`tokens.css\`: CSS custom properties, light and dark) in the project's stack (plain CSS, Tailwind theme, CSS modules). Keep the token names; every colour in the project comes from them.`);
  else L.push(`${n++}. Add \`Theme.swift\` from Part 2 to the app target. Every colour, font and shadow in the project comes from it.`);
  if (web) L.push(`${n++}. Build each UI kit component from Part 3 by porting the \`kit.css\` values exactly into the project's styling system. You may rename the Looks Good class names (\`ab-*\`, \`sb-k-*\`, \`sb-*\`) to the project's own conventions, but keep every value: colours, sizes, radii, borders, shadows, type, spacing and every state (rest, pressed, focus, disabled, open and so on). The selectors are scoped to the kit root described in Part 3; keep the same scoping or fold it into your own. The custom properties \`kit.css\` reads are resolved in Part 2.`);
  else L.push(`${n++}. Build each UI kit component from Part 3. \`kit.css\` is a specification of values (CSS pixels are points): read each component's colours, sizes, radii, borders, shadows, type and every state from it and draw it in SwiftUI with those values and the Theme.swift tokens.`);
  if (swift) L.push(`${n++}. For SwiftUI, Part 3 marks each component Native or Custom. Native rows: use the system control (\`Toggle\`, \`Picker\`, \`.searchable\` and so on), tinted with Theme.swift tokens only, and let the system supply its behaviour. Custom rows: draw them yourself from the Part 3 CSS values.`);
  L.push(`${n++}. Assemble screens from Part 4: each layout names its blocks in order, its rules, and gives the reference markup of the phone screen. Spacing, the 44pt tap target and the type scale come from Part 1 and do not change per screen.`);
  if (pats) L.push(`${n++}. Patterns: use them only as Part 1 allows (backgrounds and textures on the website; never in app screens). Regenerate each from the settings and generator code in Part 5, or use the SVG given there, unmodified. Never recolour or redraw them.`);
  else if (data.surface === 'app') L.push(`${n++}. Patterns are out of scope for this build: it is an App, and app screens carry no patterns or art.`);
  L.push(`${n++}. Place the logo from Part 6 at the sizes and positions Part 1 gives.`);
  L.push(`${n++}. Finish with the Part 7 checklist: go through every item, fix what fails, and do not call the work done until all of it passes.`, '');
  L.push('**Hard rules** (they repeat Part 1 on purpose).', '',
    '- No colour outside the tokens. No gradient, opacity or tint that is not derived from them as Part 1 says.',
    `- ${app ? 'No art and no patterns in app UI: app screens are built from the UI kit only. ' : ''}${site ? 'On a website, patterns are quiet backgrounds only, copy never sits on a pattern, and the board illustration is never used.' : ''}`.trim(),
    '- The demo copy in the reference markup ("Brand refresh", "Maya Ortiz" and the like) is placeholder: replace it with the product\'s real text, but keep the structure and length discipline.',
    '- Keep the 44pt minimum tap target and the phone type scale (sizes, line heights, weights) exactly as Part 1 gives them.',
    '- Match both light and dark exactly as the tokens define them; the dark palette is designed, not inverted.', '');
  L.push('**Report back** when you finish: (1) the files you created or changed; (2) which Part 7 items pass, and for any that do not, why; (3) every place you could not match a Part 3 value or a Part 1 rule, and what you used instead; (4) any placeholder copy you left in.', '');
  return L.join('\n');
}

function bpPart2(data) {
  const L = [`## ${BP_PARTS[2]}`, '',
    'These are the brand\'s tokens: use them as given, and use nothing else for colour, type or spacing. The first block is the same file "Save + files" writes; the last block holds the values of every custom property the Part 3 CSS reads, resolved on the kit root, so every `var(--x)` in Part 3 has a value here.', ''];
  const t = data.tokens || {};
  if (t.css) L.push('### tokens.css', '', bpFence(t.css, 'css'), '');
  if (t.swift) L.push('### Theme.swift', '', bpFence(t.swift, 'swift'), '');
  if (!t.css && !t.swift) L.push('No token file was generated for this target.', '');
  const v = data.vars;
  if (v && v.names && v.names.length) {
    L.push('### Resolved custom properties read by the kit CSS', '',
      `Set these on the kit root (the element carrying class \`ab sb-ab\`) before the Part 3 CSS applies. The first block is the ${v.primary} look; the second lists only the values that differ in ${v.other || 'the other mode'}, scoped by \`data-mode\`.`, '');
    const row = (m, only) => v.names.map(n => [n, (v.values[m] || {})[n]]).filter(([n, val]) => val && (!only || val !== (v.values[v.primary] || {})[n]))
      .map(([n, val]) => `  ${n}: ${val};`).join('\n');
    L.push(bpFence(`.ab.sb-ab {\n${row(v.primary)}\n}`, 'css'), '');
    if (v.other && v.values[v.other]) {
      const diff = row(v.other, true);
      if (diff) L.push(bpFence(`.ab.sb-ab[data-mode="${v.other}"] {\n${diff}\n}`, 'css'), '');
    }
    const code = list => list.map(n => '`' + n + '`').join(', ');
    if (v.local && v.local.length) L.push(`Set per element (in the markup's inline \`style\` or by a rule inside \`kit.css\`, not on the root): ${code(v.local)}.`, '');
    if (v.optional && v.optional.length) L.push(`Optional hooks this style does not set (each \`var()\` in \`kit.css\` carries its own fallback, so leave them unset): ${code(v.optional)}.`, '');
  }
  return L.join('\n');
}

function bpPart3(data) {
  const kit = data.kit || {};
  const L = [`## ${BP_PARTS[3]}`, '',
    'First comes `kit.css`: every CSS rule that draws the UI kit in this style, in cascade order, grouped by the file it came from. Then each component, with what it is for, its iOS treatment, its states and the reference markup of every state. Port the CSS values exactly; treat the markup as illustrative.', ''];
  const r = kit.root;
  if (r) {
    L.push('### Kit root', '',
      'Every selector in `kit.css` is scoped to this root. Rename or fold the scope into your own, but keep the same attributes\' meaning (`data-ae` is the style, `data-mode` is light or dark).', '',
      bpFence(`<${r.tag} class="${r.classes}"${Object.keys(r.attrs || {}).map(k => ` ${k}="${String(r.attrs[k]).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`).join('')}>\n  <!-- a component's reference markup goes here -->\n</${r.tag}>`, 'html'), '');
  }
  L.push('### kit.css', '');
  if (kit.css) L.push(`${kit.ruleCount || 0} rules from ${(kit.sources || []).length} files: ${(kit.sources || []).map(s => '`' + s + '`').join(', ')}.`, '', bpFence(kit.css, 'css'), '');
  else L.push('No kit CSS could be read from the document.', '');
  bpKitItemsOf(data).forEach(g => {
    L.push(`### ${g.group}`, '');
    g.items.forEach(it => {
      L.push(`#### ${it.name} (\`${it.id}\`)`, '', `Use: ${it.use}`, '');
      const meta = [];
      if (data.target !== 'web') meta.push(`- iOS: ${bpIosLine(it.ios)}`);
      meta.push(`- States: ${(it.states || []).map(s => s.name).join(', ') || 'rest'}`);
      if (it.terms && it.terms.length) meta.push(`- Glossary terms covered: ${it.terms.join(', ')}`);
      if (it.web) meta.push('- Website / desktop element (a pointer or wide-screen control)');
      L.push(...meta, '');
      bpCollapseStates(it.states).forEach(b => {
        const names = b.names.join(', ');
        L.push(b.names.length > 1 ? `State: ${names} (identical markup)` : `State: ${names}`, '', bpFence(b.html, 'html'), '');
      });
    });
  });
  return L.join('\n');
}

function bpPart4(data) {
  const L = [`## ${BP_PARTS[4]}`, '',
    'These are the screen patterns every screen is assembled from. Each lists its blocks top to bottom, its rules, and the reference markup of the 390 x 844 phone screen (the device frame is only a presentation aid). Build screens from the Part 3 components in this order and keep the rules.', ''];
  const sc = data.screens || (data.kit && data.kit.screens) || [];
  if (!sc.length) L.push('No screen layouts were drawn.', '');
  sc.forEach(s => {
    L.push(`### ${s.name} (\`${s.id}\`)`, '', `Use: ${s.use}`, '', `Blocks, top to bottom: ${(s.blocks || []).map(b => '`' + b + '`').join(', ')}`, '');
    if (s.rules && s.rules.length) L.push('Rules:', '', ...s.rules.map(x => `- ${x}`), '');
    if (s.html) L.push(bpFence(s.html, 'html'), '');
  });
  return L.join('\n');
}

function bpPart5(data) {
  const P = data.patterns;
  const L = [`## ${BP_PARTS[5]}`, ''];
  if (data.surface === 'app') return L.concat(['Not included: this build is for an App, and app screens carry no patterns or art.', '']).join('\n');
  if (!P || !P.items || !P.items.length) return L.concat(['No patterns are pinned for this brand, so there is nothing to build here.', '']).join('\n');
  L.push('The patterns this brief allows. For each: how it may be used, the exact settings, the SVG itself when the family draws vectors, and the generator code. Use the SVG as given, or regenerate it by calling the generator with the settings; either way never recolour or redraw it, and keep copy on a solid canvas plate.', '');
  L.push('### Generator code', '',
    'Load `js/patterns/engine.js` first, then the family files below, as plain scripts (they attach to `window.Patterns`). A pattern is drawn with `Patterns.renderSVG(key, params, inks, seed, { width, height })`, `Patterns.tileSVG(key, params, inks, seed, 160)` for a seamless tile, or `Patterns.render(canvas, key, params, inks, seed, { width, height, dpr: 1 })` for raster.', '');
  const src = (path, text, error) => {
    if (text == null) return [`\`${path}\`: source could not be fetched${error ? ' (' + error + ')' : ''}. Get it from the Looks Good repository.`, ''];
    return ['<details>', `<summary><code>${path}</code> (${Math.round(text.length / 1024)} KB)</summary>`, '', bpFence(text, 'js'), '', '</details>', ''];
  };
  if (P.engine) L.push(...src(P.engine.path, P.engine.text, P.engine.error));
  (P.families || []).forEach(f => L.push(...src(f.path, f.text, f.error)));
  P.items.forEach((p, i) => {
    L.push(`### Pattern ${i + 1}: ${p.familyName} (\`${p.file}\`)`, '', p.usage, '');
    L.push('Settings:', '', bpFence(JSON.stringify(p.settings, null, 2), 'json'), '');
    L.push(`Generator: family \`${p.familyKey}\` in \`${p.familyFile || 'js/patterns/families/'}\` (above), using the engine functions in \`js/patterns/engine.js\`.`, '');
    if (p.svg) L.push(`SVG (save as \`${p.file}\`):`, '', bpFence(p.svg, 'svg'), '');
    else L.push(`This family draws raster art: the PNG comes from "Save brief + files" (\`${p.file}\`), and the generator code above regenerates it from the settings.`, '');
  });
  return L.join('\n');
}

function bpPart6(data) {
  const L = [`## ${BP_PARTS[6]}`, ''];
  const lg = data.logo || {};
  if (!lg.files || !lg.files.length) return L.concat(['This brand has no vector logo to inline. Use the logo files from "Save brief + files" and place them as Part 1 says.', '']).join('\n');
  L.push('The logo as vector source. Save each file as named and place it at the sizes and positions Part 1 gives; do not recolour, stretch or redraw it.', '');
  lg.files.forEach(f => L.push(`### ${f.name}`, '', bpFence(f.svg, 'svg'), ''));
  if (lg.note) L.push(lg.note, '');
  return L.join('\n');
}

function bpPart7(data) {
  const app = data.surface !== 'web', site = data.surface !== 'app', swift = data.target !== 'web';
  const items = [
    'Every colour in the code is a token from Part 2: search for hex values, `rgb(`, `hsl(` and named colours outside the token file and remove them.',
    'Every component in every state matches its Part 3 values: colours, sizes, radii, borders, shadows, type and spacing (rest, pressed, focus, disabled, open and the rest of each state list).',
    'Tap targets are 44pt or larger for everything tappable; buttons, fields and rows use the Part 1 heights.',
    'Type uses only the faces and the phone type scale from Part 1 (sizes, line heights, weights, case, tracking).',
    'Light and dark both work and use the designed values; nothing is inverted by a filter.',
    'Text contrast is 4.5:1 or better (3:1 for large text and icons), checked on the real backgrounds in both modes.',
    'Keyboard focus is visible on every control and uses the focus treatment from Part 3.',
    'Motion respects reduced motion: with `prefers-reduced-motion` on, animation stops or shortens as Part 1 says.',
  ];
  if (app) items.push('No art, pattern, texture or decorative band appears in any app screen; the logo is used only where Part 1 puts it.');
  if (site) items.push('Patterns appear only where Part 1 and Part 5 allow, as quiet backgrounds, with copy on a solid canvas plate.');
  if (swift) items.push('SwiftUI: Native components are the system controls tinted with Theme.swift tokens; Custom components are drawn from the Part 3 values.');
  items.push('Screens follow the Part 4 block order and rules; placeholder copy has been replaced.');
  return [`## ${BP_PARTS[7]}`, '', 'Go through every item before you report back. An unchecked item means the work is not finished.', '', ...items.map(x => `- [ ] ${x}`), ''].join('\n');
}

// The whole pack from collected data (pure).
function buildPackMarkdown(data) {
  const d = Object.assign({ target: 'web', surface: 'app' }, data);
  d.brand = Object.assign({ name: 'Brand', styleName: 'Style' }, d.brand);
  const L = [`# ${d.brand.name} build pack`, '',
    `Everything an AI coding agent needs to rebuild the ${d.brand.name} ${BP_SURFACE_LABEL[d.surface].toLowerCase()} UI in the ${d.brand.styleName} style for ${bpTargetWords(d.target)}: the brief, the design tokens, the real code that draws the UI kit and screens${d.surface === 'app' ? '' : ', the patterns'} and the logo, with a prompt at the top that says how to use it. Generated by Looks Good.`, ''];
  L.push('## Contents', '', ...BP_PARTS.map((p, i) => `${i + 1}. [${p}](#${bpAnchor(p)})`), '');
  L.push(bpPart0(d));
  L.push(`## ${BP_PARTS[1]}`, '', 'The full AI brief for this brand, unchanged apart from its headings being one step deeper. It holds the rules: colours and where each is used, type, shape, states, motion, accessibility and what is allowed where. Where anything in this file conflicts with it, the brief wins.', '', bpDemote(d.briefMd || '', 2).replace(/\n+$/, ''), '');
  L.push(bpPart2(d), bpPart3(d), bpPart4(d), bpPart5(d), bpPart6(d), bpPart7(d));
  return L.join('\n').replace(/\n{3,}/g, '\n\n').replace(/\n*$/, '\n');
}

/* ======================= DOM part ======================= */

function bpKind(rule) { return (rule && rule.constructor && rule.constructor.name) || ''; }

function bpSheetName(sheet) {
  if (sheet.href) { try { return new URL(sheet.href).pathname.replace(/^\//, ''); } catch (e) { return sheet.href; } }
  return 'inline <style>';
}

// Is `probe` true of the kit root itself, or of a spec / screen container or anything inside one?
function bpInScope(containers, probe) {
  for (const c of containers) {
    if (c.self && c.el.matches(probe)) return true;
    if (c.deep && c.el.querySelector(probe)) return true;
  }
  return false;
}

// Marks, in `matched` (Map rule -> Set of selector strings), every style rule with a selector that matches the kit.
function bpScan(rootEl, containers, matched, cache, stats) {
  const visit = rules => {
    for (const rule of Array.from(rules)) {
      const k = bpKind(rule);
      if (k === 'CSSStyleRule') {
        let info = cache.get(rule);
        if (!info) { info = bpSplitTop(rule.selectorText, ',').map(sel => ({ sel, probe: bpProbe(sel) })); cache.set(rule, info); }
        for (const it of info) {
          let ok = false;
          try { ok = (rootEl.matches(it.probe) || !!rootEl.querySelector(it.probe)) && bpInScope(containers, it.probe); } catch (e) { stats.badSelectors++; continue; }
          if (ok) { let s = matched.get(rule); if (!s) matched.set(rule, s = new Set()); s.add(it.sel); }
        }
      } else if (k === 'CSSImportRule') {
        try { if (rule.styleSheet) visit(rule.styleSheet.cssRules); } catch (e) { stats.skippedSheets++; }
      } else if (rule.cssRules && k !== 'CSSKeyframesRule' && k !== 'CSSFontFaceRule') visit(rule.cssRules);
    }
  };
  Array.from(document.styleSheets).forEach(sh => {
    if (sh.disabled) return;
    let rules;
    try { rules = sh.cssRules; } catch (e) { stats.skippedSheets++; return; }
    visit(rules);
  });
}

// Matched rules (+ the groups around them) of one list of rules, as a small tree.
function bpTree(rules, cache, matched) {
  const out = [];
  Array.from(rules).forEach(rule => {
    const k = bpKind(rule);
    if (k === 'CSSStyleRule') {
      const set = matched.get(rule);
      if (!set) return;
      const sels = (cache.get(rule) || []).filter(i => set.has(i.sel)).map(i => i.sel);
      out.push({ t: 'r', sels, decls: bpSplitTop(rule.style.cssText, ';').map(d => d + ';') });
    } else if (k === 'CSSKeyframesRule') out.push({ t: 'n', name: rule.name, text: rule.cssText });
    else if (k === 'CSSPropertyRule') out.push({ t: 'n', name: rule.name, text: rule.cssText, prop: true });
    else if (k === 'CSSImportRule') { try { if (rule.styleSheet) out.push(...bpTree(rule.styleSheet.cssRules, cache, matched)); } catch (e) { /* cross-origin import */ } }
    else if (rule.cssRules && k !== 'CSSFontFaceRule' && k !== 'CSSPageRule') {
      const kids = bpTree(rule.cssRules, cache, matched);
      if (kids.length) out.push({ t: 'g', prelude: rule.cssText.slice(0, rule.cssText.indexOf('{')).trim(), kids });
    }
  });
  return out;
}

// Keeps keyframes / @property that something emitted refers to, prunes empty groups, counts rules, prints.
function bpPrint(tree, state) {
  const walkText = (nodes, f) => nodes.forEach(n => { if (n.t === 'r') f(n); else if (n.t === 'g') walkText(n.kids, f); });
  let all = '', anim = '';
  walkText(tree, n => n.decls.forEach(d => { all += d + '\n'; if (/^animation/.test(d)) anim += d + '\n'; }));
  const word = (text, name) => new RegExp('(^|[^\\w-])' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^\\w-])').test(text);
  const prune = nodes => nodes.map(n => (n.t === 'g' ? Object.assign({}, n, { kids: prune(n.kids) }) : n))
    .filter(n => (n.t === 'r') || (n.t === 'g' && n.kids.length) || (n.t === 'n' && word(n.prop ? all : anim, n.name)));
  const kept = prune(tree);
  const print = nodes => nodes.map(n => {
    if (n.t === 'r') { state.rules++; return `${n.sels.join(',\n')} {\n${n.decls.map(d => '  ' + d).join('\n')}\n}`; }
    if (n.t === 'n') return n.text;
    return `${n.prelude} {\n${bpIndent(print(n.kids).join('\n\n'), '  ')}\n}`;
  });
  return print(kept).join('\n\n');
}

// The editor's own chrome (scrollbars, text inputs, ::selection, editor tokens) matches kit elements by accident
// and means nothing outside this app: left out of kit.css. Its two rules the kit relies on are written out below.
const BP_SKIP_SHEETS = ['css/styles.css'];
const BP_BASELINE = `/* ===== baseline (from css/styles.css) ===== */
*,
::before,
::after {
  box-sizing: border-box;
}

@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}`;

// kit.css from the matched rules: one block per stylesheet file, in cascade order.
function bpBuildCss(cache, matched) {
  const state = { rules: 2 }, parts = [BP_BASELINE], sources = ['baseline'];
  Array.from(document.styleSheets).forEach(sh => {
    if (sh.disabled) return;
    let rules;
    try { rules = sh.cssRules; } catch (e) { return; }
    const name = bpSheetName(sh);
    if (BP_SKIP_SHEETS.includes(name)) return;
    const text = bpPrint(bpTree(rules, cache, matched), state);
    if (!text) return;
    sources.push(name);
    parts.push(`/* ===== ${name} ===== */\n${text}`);
  });
  return { css: parts.join('\n\n'), ruleCount: state.rules, sources };
}

function bpEsc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function bpAttr(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;'); }
const BP_VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

// Attributes worth keeping: no ids, no data-sb* plumbing; data-* only when the CSS reads it (or it names an icon).
function bpAttrs(el, keep) {
  return Array.from(el.attributes).filter(a => {
    if (a.name === 'id' || /^data-sb/.test(a.name)) return false;
    if (/^data-/.test(a.name)) return a.name === 'data-i' || keep(a.name);
    return true;
  }).map(a => ` ${a.name}="${bpAttr(a.value)}"`).join('');
}

function bpCompact(n, keep) {
  if (n.nodeType === 3) return bpEsc(n.textContent);
  if (n.nodeType !== 1) return '';
  const tag = n.localName;
  if (BP_VOID.has(tag)) return `<${tag}${bpAttrs(n, keep)}>`;
  return `<${tag}${bpAttrs(n, keep)}>${Array.from(n.childNodes).map(c => bpCompact(c, keep)).join('')}</${tag}>`;
}

// Pretty-printed markup of the child nodes of `el` (an svg stays on one line).
function bpPretty(el, keep) {
  const out = [];
  const go = (n, pad) => {
    if (n.nodeType === 3) { const t = n.textContent.replace(/\s+/g, ' ').trim(); if (t) out.push(pad + bpEsc(t)); return; }
    if (n.nodeType !== 1) return;
    const tag = n.localName, open = `<${tag}${bpAttrs(n, keep)}>`;
    if (tag === 'svg') { out.push(pad + bpCompact(n, keep)); return; }
    if (BP_VOID.has(tag)) { out.push(pad + open); return; }
    const kids = Array.from(n.childNodes).filter(c => (c.nodeType === 1) || (c.nodeType === 3 && c.textContent.trim()));
    if (!kids.length) out.push(`${pad}${open}</${tag}>`);
    else if (kids.every(c => c.nodeType === 3)) out.push(`${pad}${open}${bpEsc(kids.map(c => c.textContent).join('').replace(/\s+/g, ' ').trim())}</${tag}>`);
    else { out.push(pad + open); kids.forEach(c => go(c, pad + '  ')); out.push(`${pad}</${tag}>`); }
  };
  Array.from(el.childNodes).forEach(c => go(c, ''));
  return out.join('\n');
}

// The kit rendered off-screen, like aibKitMeasure does. The caller removes `host`.
async function bpRenderKit(mode) {
  const host = document.createElement('div');
  host.className = 'sb-view';
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = 'position:fixed;left:-20000px;top:0;width:1200px;visibility:hidden;pointer-events:none;display:block;contain:layout style;';
  document.body.appendChild(host);
  const page = SeeBuilt.kitInto(host, { mode });
  if (!page) { host.remove(); throw new Error('The UI kit could not be drawn'); }
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  return { host, page, root: page.closest('.sb-ab') || page };
}

const BP_SRC_CACHE = {};
async function bpFetchSource(path) {
  if (path in BP_SRC_CACHE) return BP_SRC_CACHE[path];
  let r;
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    r = { path, text: await res.text() };
  } catch (err) { r = { path, text: null, error: String((err && err.message) || err) }; }
  if (r.text != null) BP_SRC_CACHE[path] = r;
  return r;
}

// Everything Part 5 needs: per pinned pattern the usage line, settings, SVG; plus the source files.
async function bpCollectPatterns(ctx, state0) {
  const assets = aibPatternAssets(state0);
  if (!assets.length) return { items: [], families: [], engine: null };
  const scripts = Array.from(document.scripts).map(s => s.getAttribute('src') || '');
  const famPaths = scripts.filter(s => /js\/patterns\/families\/[^/]+\.js$/.test(s));
  const enginePath = scripts.find(s => /js\/patterns\/engine\.js$/.test(s)) || 'js/patterns/engine.js';
  const famSrc = await Promise.all(famPaths.map(bpFetchSource));
  const keyFile = {};
  famSrc.forEach(f => { if (f.text) { const re = /\.register\(\s*\{\s*key:\s*'([^']+)'/g; let m; while ((m = re.exec(f.text))) keyFile[m[1]] = f.path; } });
  const items = [];
  for (const a of assets) {
    const { entry, f, t } = a;
    let bytes = null, svg = null;
    try { bytes = await aibPatternBytes(a); } catch (err) { console.warn('build pack: pattern failed', entry.key, err); }
    if (bytes && a.kind === 'svg') svg = new TextDecoder().decode(bytes);
    const inks = Patterns.inksFor(t, entry.colorway, { tints: !!(entry.params && entry.params.tints) });
    items.push({
      familyKey: entry.key, familyName: f.name, familyFile: keyFile[entry.key] || null, file: a.name,
      usage: aibPatternLine(ctx, a),
      settings: { key: entry.key, colorway: entry.colorway, seed: entry.seed, use: a.use, params: entry.params || {}, inks: Patterns.finalInks(entry.key, entry.params, inks), output: a.kind === 'svg' ? (f.seamless ? 'seamless 160px tile (Patterns.tileSVG)' : '1600x900 drawing (Patterns.renderSVG)') : 'PNG (Patterns.render)' },
      svg,
    });
  }
  const usedFiles = Array.from(new Set(items.map(i => i.familyFile).filter(Boolean)));
  const families = famSrc.filter(f => usedFiles.includes(f.path));
  items.filter(i => !i.familyFile).forEach(i => families.push({ path: `js/patterns/families/ (the file that registers "${i.familyKey}")`, text: null, error: 'could not find it among the page scripts' }));
  return { items, families, engine: await bpFetchSource(enginePath) };
}

// All the raw data the pack is made of. opts.briefMd: the brief already built by the caller.
async function bpCollect(opts) {
  opts = opts || {};
  if (typeof state === 'undefined' || typeof SeeBuilt === 'undefined' || typeof SeeBuilt.kitInto !== 'function') throw new Error('The UI kit is not available');
  const st = state;
  const ctx = aibContext(st, {});
  const briefMd = opts.briefMd != null ? opts.briefMd : buildAiBriefChecked(st).md;
  const groups = aibKitGroups(ctx);
  const ids = new Set(groups.flatMap(g => g.items.map(i => i.id)));
  const modes = ctx.only ? [ctx.mode] : [ctx.mode, ctx.mode === 'dark' ? 'light' : 'dark'];

  // 1. render the kit in each mode and mark every rule that matches it
  const cache = new WeakMap(), matched = new Map(), stats = { badSelectors: 0, skippedSheets: 0 };
  const rendered = [];
  try {
    for (const m of modes) {
      const r = await bpRenderKit(m);
      rendered.push(r);
      const specs = Array.from(r.root.querySelectorAll('.sb-k-cell')).filter(c => ids.has(c.dataset.k)).flatMap(c => Array.from(c.querySelectorAll('.sb-k-spec')));
      const scrs = Array.from(r.root.querySelectorAll('.sb-k-layout[data-scr] .sb-k-scr'));
      const containers = [{ el: r.root, self: true, deep: false }].concat(specs.concat(scrs).map(el => ({ el, self: true, deep: true })));
      bpScan(r.root, containers, matched, cache, stats);
      r.specs = specs;
    }
    const built = bpBuildCss(cache, matched);
    const keep = n => built.css.indexOf(n) >= 0;

    // 2. markup (primary mode), screens, custom-property values
    const first = rendered[0], root = first.root;
    const kit = { css: built.css, ruleCount: built.ruleCount, sources: built.sources, groups: [], screens: [] };
    kit.root = { tag: root.localName, classes: root.className, attrs: {} };
    Array.from(root.attributes).filter(a => /^data-/.test(a.name)).forEach(a => { kit.root.attrs[a.name] = a.value; });
    kit.groups = groups.map(g => ({
      group: g.group,
      items: g.items.map(it => {
        const cell = root.querySelector(`.sb-k-cell[data-k="${it.id}"]`);
        const states = cell ? Array.from(cell.querySelectorAll('.sb-k-state')).map(s => {
          const spec = s.querySelector('.sb-k-spec');
          return spec ? { name: ((s.querySelector('.sb-k-slabel') || {}).textContent || 'rest').trim(), html: bpPretty(spec, keep) } : null;
        }).filter(Boolean) : [];
        const terms = (typeof UI_KIT_GLOSSARY !== 'undefined' ? UI_KIT_GLOSSARY : []).filter(x => x.ids.includes(it.id)).map(x => x.term);
        return { id: it.id, name: it.name, use: it.use, ios: it.ios, web: !!it.web, states, terms };
      }),
    }));
    kit.screens = (typeof UI_KIT_SCREENS !== 'undefined' ? UI_KIT_SCREENS : []).map(s => {
      const scr = root.querySelector(`.sb-k-layout[data-scr="${s.id}"] .sb-k-scr`);
      return { id: s.id, name: s.name, use: s.use, rules: s.rules || [], blocks: s.blocks || [], html: scr ? bpPretty({ childNodes: [scr] }, keep) : '' };
    });

    // custom properties the CSS or the markup reads
    const used = new Set();
    let m;
    const re = /var\(\s*(--[\w-]+)/g;
    while ((m = re.exec(built.css))) used.add(m[1]);
    const inline = /(--[\w-]+)\s*:/g;
    const styleText = kit.groups.flatMap(g => g.items.flatMap(i => i.states.map(s => s.html))).concat(kit.screens.map(s => s.html)).join('\n');
    const sre = /style="([^"]*)"/g;
    while ((m = sre.exec(styleText))) { let n; while ((n = inline.exec(m[1]))) used.add(n[1]); }
    const names = Array.from(used).sort();
    const values = {};
    rendered.forEach((r, i) => {
      const cs = getComputedStyle(r.specs[0] || r.root);
      values[modes[i]] = {};
      names.forEach(n => { const v = cs.getPropertyValue(n).trim(); if (v) values[modes[i]][n] = v; });
    });
    const declared = new Set();
    const dre = /(--[\w-]+)\s*:/g;
    while ((m = dre.exec(built.css + '\n' + styleText))) declared.add(m[1]);
    const unset = names.filter(n => !values[modes[0]][n]);
    const vars = { names, values, primary: modes[0], other: modes[1] || null, local: unset.filter(n => declared.has(n)), optional: unset.filter(n => !declared.has(n)) };

    // 3. tokens, patterns, logo
    const surface = ctx.surface;
    const tokens = {
      css: ctx.web ? aibCssLines(ctx, true).filter(l => !/^```/.test(l)).join('\n') + '\n' : null,
      swift: ctx.swift ? aibSwiftLines(ctx).join('\n') + '\n' : null,
    };
    const patterns = surface === 'app' ? null : await bpCollectPatterns(ctx, st);
    const lz = await aibLogoZipFiles(st);
    const logoFiles = lz.files.filter(f => /\.svg$/i.test(f.name) && typeof f.data === 'string').map(f => ({ name: f.name, svg: f.data }));
    const logo = { files: logoFiles, note: lz.plan && !logoFiles.length ? 'The logo is a raster image: it comes from "Save brief + files".' : '' };

    return {
      brand: { name: ctx.brandName || (st.content && st.content.brandName) || 'Brand', styleName: ctx.def.name, styleKey: ctx.def.key, slug: typeof brandFileSlug === 'function' ? brandFileSlug() : 'brand' },
      target: ctx.target, surface, modes, briefMd, tokens, vars, kit, patterns, logo, stats,
    };
  } finally {
    rendered.forEach(r => r.host.remove());
  }
}

/* ======================= the buttons' entry points ======================= */

(function () {
  if (typeof window === 'undefined') return;
  let running = false;
  const toast = m => { if (typeof showToast === 'function') showToast(m); };
  const buttons = () => Array.from(document.querySelectorAll('[data-bp-build]'));

  // Generates the pack text for the live state (no gates, no download).
  async function build(opts) {
    const data = await bpCollect(opts);
    return { md: buildPackMarkdown(data), data };
  }

  // Same gates as the brief's own exports, then generate, download and say so.
  async function run(btn) {
    if (running) return null;
    const checked = buildAiBriefChecked(state);
    const blocked = typeof briefProductBlock === 'function' ? briefProductBlock(checked.issues) : null;
    if (blocked) { toast(blocked.message); return null; }
    if (!aibLintConfirm(checked.issues)) return null;
    running = true;
    buttons().forEach(b => { b.disabled = true; });
    if (btn) btn.setAttribute('aria-busy', 'true');
    toast('Building the build pack...');
    try {
      const { md, data } = await build({ briefMd: checked.md });
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.brand.slug}-build-pack.md`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 20000);
      toast(`Build pack downloaded (${Math.max(1, Math.round(blob.size / 1024))} KB)`);
      return md;
    } catch (err) {
      console.error('build pack failed', err);
      toast('Could not build the pack');
      return null;
    } finally {
      running = false;
      buttons().forEach(b => { b.disabled = false; });
      if (btn) btn.removeAttribute('aria-busy');
    }
  }

  function promptText() {
    let ctx = null;
    try { ctx = aibContext(state, { noProbe: true }); } catch (err) { /* fall back to the stored choices */ }
    return buildPackPrompt({
      brandName: ctx ? ctx.brandName : (state.content && state.content.brandName),
      styleName: ctx ? ctx.def.name : '',
      target: ctx ? ctx.target : aibGetTarget(state),
      surface: ctx ? ctx.surface : aibGetSurface(state),
    });
  }

  function copyPrompt() {
    return copyText(promptText())
      .then(() => toast('Build-pack prompt copied'))
      .catch(() => toast('Clipboard blocked. Try again from the app window'));
  }

  window.BuildPack = { build, run, promptText, copyPrompt, collect: bpCollect, markdown: buildPackMarkdown, prompt: buildPackPrompt, isRunning: () => running };
})();
