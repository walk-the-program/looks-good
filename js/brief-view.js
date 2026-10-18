/* ---------------------------------------------------------------------
   brief-view.js — the AI brief as a designed document ("View brief").

   Show.brief() opens a full-window page that renders the same brief
   buildAiBrief(state) (js/ai-brief.js) copies as Markdown: a cover, the five
   colour jobs as large swatches, type specimens in the real faces, component
   do and don't cards, the patterns in the brief drawn with the pattern engine,
   shape and material rules, and every text section typeset.

   The page itself is in the app's neutral UI style. The brand's colours and
   fonts appear only inside the specimen plates.

   Top bar: Copy for Claude Code / Cursor / v0 (the same Markdown, with a
   one-line preface for that tool; clipboard only, nothing is sent anywhere),
   Download .md, Save + files (.zip), Close. Esc closes.

   The second half of this file is the sidebar's "Copy AI brief" front end
   (AiBriefCopy): the Web | SwiftUI | Both picker, the resolve-before-copy
   panel (aibCheck in ai-brief.js) and "Save brief + files".

   Needs ai-brief.js, aesthetic-board.js, color-roles.js, patterns, app.js
   (state, copyText, showToast, escapeHtml, brandFileSlug). Plain script.
------------------------------------------------------------------------ */

window.Show = window.Show || {};

(function () {
  const esc = s => escapeHtml(s);

  const TOOLS = [
    { id: 'claude', label: 'Claude Code', preface: 'Build from this brand brief. Save it as BRAND.md in the project root and follow it for every interface change.' },
    { id: 'cursor', label: 'Cursor', preface: 'Use this brand brief as a project rule for all interface work. Do not add colors or fonts it does not list.' },
    { id: 'v0', label: 'v0', preface: 'Design the interface using only the colors, fonts and rules in this brand brief.' },
  ];

  let root = null, scroller = null, docEl = null;
  let isOpen = false, opener = null, prevBodyOverflow = '';
  let currentMd = '';
  let renderToken = 0;

  /* ---------------- tiny Markdown renderer (the brief's own subset) ---------------- */

  const HEX_RE = /#[0-9a-fA-F]{6}\b/g;

  function inline(raw) {
    const dot = h => `<i class="bv-dot" style="background:${h}"></i>`;
    const hx = h => `<span class="bv-hx">${dot(h)}${h}</span>`;
    const plain = s => esc(s)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(HEX_RE, hx);
    return String(raw == null ? '' : raw).split('`').map((part, i) => {
      if (i % 2 === 1) return `<code>${esc(part).replace(HEX_RE, hx)}</code>`;
      return plain(part);
    }).join('');
  }

  function splitRow(line) {
    const cells = [];
    let cur = '';
    const s = line.trim().replace(/^\|/, '').replace(/\|$/, '');
    for (let i = 0; i < s.length; i++) {
      if (s[i] === '\\' && s[i + 1] === '|') { cur += '|'; i++; }
      else if (s[i] === '|') { cells.push(cur.trim()); cur = ''; }
      else cur += s[i];
    }
    cells.push(cur.trim());
    return cells;
  }

  function mdBlocks(lines) {
    const out = [];
    let para = [], list = null;
    const flushPara = () => { if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = []; } };
    const flushList = () => { if (list) { out.push(`<${list.tag}>${list.items.map(x => `<li>${inline(x)}</li>`).join('')}</${list.tag}>`); list = null; } };
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^```/.test(line)) {
        flushPara(); flushList();
        const body = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) body.push(lines[i++]);
        out.push(`<pre><code>${esc(body.join('\n'))}</code></pre>`);
        continue;
      }
      const hd = /^(#{1,4})\s+(.*)$/.exec(line);
      if (hd) {
        flushPara(); flushList();
        const lvl = Math.min(6, hd[1].length + 2);
        out.push(`<h${lvl}>${inline(hd[2])}</h${lvl}>`);
        continue;
      }
      if (/^\|/.test(line) && /^\|[\s:|-]+\|\s*$/.test(lines[i + 1] || '')) {
        flushPara(); flushList();
        const head = splitRow(line);
        i += 2;
        const rows = [];
        while (i < lines.length && /^\|/.test(lines[i])) rows.push(splitRow(lines[i++]));
        i--;
        out.push(`<div class="bv-table-wrap"><table><thead><tr>${head.map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
        continue;
      }
      const ul = /^[-*]\s+(.*)$/.exec(line), ol = /^\d+\.\s+(.*)$/.exec(line);
      if (ul || ol) {
        flushPara();
        const tag = ul ? 'ul' : 'ol';
        if (!list || list.tag !== tag) { flushList(); list = { tag, items: [] }; }
        list.items.push((ul || ol)[1]);
        continue;
      }
      if (!line.trim()) { flushPara(); flushList(); continue; }
      flushList();
      para.push(line.trim());
    }
    flushPara(); flushList();
    return out.join('');
  }

  // Splits the brief into its "## " sections (outside code fences).
  function parseSections(md) {
    const sections = [];
    let cur = null, fence = false;
    md.split('\n').forEach(line => {
      if (/^```/.test(line)) fence = !fence;
      const m = !fence && /^## (.*)$/.exec(line);
      if (m) { cur = { title: m[1].trim(), lines: [] }; sections.push(cur); }
      else if (cur) cur.lines.push(line);
    });
    return sections;
  }
  const findSection = (secs, prefix) => secs.find(s => s.title.toLowerCase().indexOf(prefix.toLowerCase()) === 0);

  // The lines under a "### heading" inside a section, up to the next "###".
  function subBlock(lines, headPrefix) {
    const at = lines.findIndex(l => l.indexOf('### ' + headPrefix) === 0);
    if (at < 0) return null;
    let end = lines.length;
    for (let i = at + 1; i < lines.length; i++) if (/^### /.test(lines[i])) { end = i; break; }
    return { head: lines.slice(at, at + 1)[0], body: lines.slice(at + 1, end), before: lines.slice(0, at), after: lines.slice(end) };
  }

  /* ---------------- data helpers ---------------- */

  const dot = (hex, cls) => `<i class="bv-dot${cls ? ' ' + cls : ''}" style="background:${hex}"></i>`;

  function coverageNumber(str) {
    const nums = String(str || '').match(/\d+(?:\.\d+)?/g);
    if (!nums) return 10;
    const v = nums.slice(0, 2).map(Number);
    return v.length === 2 ? (v[0] + v[1]) / 2 : v[0];
  }

  function tokenMap(t, extras) {
    const map = {};
    AIB_TOKEN_ROWS.forEach(([name, field]) => { if (t[field] != null) map[name] = t[field]; });
    if (t.printed) { map['--primary-print'] = t.printPrimary; map['--on-primary-print'] = t.onPrimary; }
    Object.keys(extras || {}).forEach(k => { const v = String(extras[k]).trim(); if (AIB_HEX.test(v)) map[k] = v; });
    return map;
  }

  /* ---------------- section builders (HTML strings) ---------------- */

  function sectionShell(id, num, title, intro, body) {
    return `<section class="bv-sec" id="bv-${id}" aria-labelledby="bv-${id}-h">
      <header class="bv-sec-head">
        <span class="bv-num" aria-hidden="true">${num}</span>
        <div><h2 id="bv-${id}-h">${esc(title)}</h2>${intro ? `<p class="bv-intro">${esc(intro)}</p>` : ''}</div>
      </header>
      ${body}
    </section>`;
  }

  // Font stacks carry double quotes ("Fraunces", Georgia, serif); inside a double-quoted
  // style="" attribute they would end it, so they are written with single quotes.
  const ff = f => String((f && f.css) || 'inherit').replace(/"/g, "'");

  function plateStyle(t, state, font) {
    return `background:${t.canvas};color:${t.ink};--bv-line:${t.line};--bv-muted:${t.muted};${font ? `font-family:${ff(font === 'h' ? state.headingFont : state.bodyFont)};` : ''}`;
  }

  function coverHtml(ctx) {
    const { state, def, t, roles, brandName, tagline, probe } = ctx;
    const mode = t.isDark ? 'Dark' : 'Light';
    const strip = AIB_ROLE_ORDER.map(k => `<span style="background:${t[k]}" title="${esc(roles[k].label)} ${t[k]}"></span>`).join('');
    const hf = state.headingFont, bf = state.bodyFont;
    const hStyle = probe ? `text-transform:${probe.h.tt};letter-spacing:${probe.h.ls}em;${probe.h.style !== 'normal' ? 'font-style:' + probe.h.style + ';' : ''}` : '';
    const hw = abWeightNear(hf, +(probe && probe.h.weight) || state.typography.headingWeight);
    const PRI = t.printed ? t.printPrimary : t.primary;
    const ctaBg = def.ctaFill === 'ink' ? t.ink : PRI;
    const ctaFg = def.ctaFill === 'ink' ? t.canvas : t.onPrimary;
    const logo = state.logoDataUrl ? `<img class="bv-plate-logo" src="${esc(state.logoDataUrl)}" alt="" />` : '';
    const toc = [['colour', 'Colour'], ['type', 'Type'], ['components', 'Components'], ['patterns', 'Patterns'], ['shape', 'Shape and materials'], ['text', 'Full text']]
      .map(([id, name], i) => `<li><a href="#bv-${id}" data-bv-go="${id}"><span>0${i + 1}</span>${esc(name)}</a></li>`).join('');
    return `<section class="bv-cover" aria-label="Cover">
      <div class="bv-cover-main">
        <p class="bv-eyebrow">Brand brief</p>
        <h1 class="bv-title">${esc(brandName)}</h1>
        <p class="bv-tag">${esc(tagline)}</p>
        <dl class="bv-facts">
          <div><dt>Aesthetic</dt><dd>${esc(def.name)}${def.classicOf ? ' (Classic)' : ''}</dd></div>
          <div><dt>Mode</dt><dd>${mode}</dd></div>
          <div><dt>Type</dt><dd>${esc(hf.name)}${bf.name !== hf.name ? ' and ' + esc(bf.name) : ''}</dd></div>
        </dl>
        <p class="bv-lede">${esc(def.summary || def.descriptor || '')}</p>
        ${def.motto ? `<p class="bv-motto">${esc(def.motto)}</p>` : ''}
        <nav class="bv-toc" aria-label="Contents"><ol>${toc}</ol></nav>
      </div>
      <figure class="bv-plate bv-cover-plate" style="${plateStyle(t, state, 'b')}" aria-label="The brand, set in its own colours and fonts">
        <div class="bv-plate-top">${logo}<span class="bv-plate-kicker" style="color:${t.muted}">${esc(def.name)}</span></div>
        <div class="bv-plate-name" style="font-family:${ff(hf)};font-weight:${hw};${hStyle}">${esc(brandName)}</div>
        <p class="bv-plate-tag" style="color:${t.muted}">${esc(tagline)}</p>
        <div class="bv-plate-row">
          <span class="bv-plate-btn" style="background:${ctaBg};color:${ctaFg}">Get started</span>
          <span class="bv-plate-btn is-ghost" style="border-color:${t.secondary};color:${t.ink}">Learn more</span>
        </div>
        <div class="bv-plate-strip">${strip}</div>
      </figure>
    </section>`;
  }

  function colourHtml(ctx) {
    const { t, roles, extras } = ctx;
    // budget bar
    const nums = AIB_ROLE_ORDER.map(k => coverageNumber(roles[k].coverage));
    const sum = nums.reduce((a, b) => a + b, 0) || 1;
    const bar = AIB_ROLE_ORDER.map((k, i) => `<span style="flex:${(nums[i] / sum * 100).toFixed(2)} 1 0;background:${t[k]}"><b style="color:${pickReadableText(t[k])}">${esc(roles[k].label)}<em>${esc(roles[k].coverage)}</em></b></span>`).join('');
    const cards = AIB_ROLE_ORDER.map(k => {
      const r = roles[k];
      const fg = pickReadableText(t[k]);
      return `<article class="bv-role bv-role-${k}">
        <div class="bv-swatch" style="background:${t[k]};color:${fg}">
          <span class="bv-swatch-role">${esc(r.label)}</span>
          <span class="bv-swatch-hex">${esc(String(t[k]).toUpperCase())}</span>
        </div>
        <h3>${esc(r.job)} <span>${esc(r.coverage)}</span></h3>
        <dl>
          <div><dt>Use for</dt><dd>${esc(r.use)}</dd></div>
          <div><dt>Never for</dt><dd>${esc(r.never)}</dd></div>
        </dl>
      </article>`;
    }).join('');

    // derived tokens
    const seenRole = new Set(AIB_ROLE_ORDER);
    const rows = [];
    AIB_TOKEN_ROWS.forEach(([name, field, roleKey]) => {
      if (roleKey && seenRole.has(roleKey)) return;
      const hex = t[field] != null ? t[field] : ctx.state.colors[field];
      if (!hex) return;
      rows.push([name, hex, AIB_DERIVED_JOB[field] || '']);
    });
    if (t.printed) rows.push(['--primary-print', t.printPrimary, AIB_DERIVED_JOB.printPrimary], ['--on-primary-print', t.onPrimary, AIB_DERIVED_JOB.onPrintPrimary]);
    const chip = ([name, hex, job]) => `<li class="bv-token"><span class="bv-token-sw" style="background:${hex}"></span><div><code>${esc(name)}</code><b>${esc(String(hex).toUpperCase())}</b>${job ? `<span>${esc(job.split('. ')[0].replace(/\.$/, ''))}</span>` : ''}</div></li>`;
    const extraRows = Object.keys(extras || {}).map(name => [name, String(extras[name]).trim(), 'Used by the materials below']).filter(r => AIB_HEX.test(r[1]));

    // contrast
    const pairs = [
      ['Ink on canvas', t.ink, t.canvas], ['Muted on canvas', t.muted, t.canvas],
      ['Primary label', t.onPrimary, t.printed ? t.printPrimary : t.primary],
      ['Secondary label', t.onSecondary, t.secondary], ['Accent label', t.onAccent, t.accent],
      ['Highlight word', t.accentInk, t.canvas],
    ];
    const contrast = pairs.map(([name, fg, bg]) => {
      const ratio = contrastRatio(fg, bg), grade = aibGrade(ratio);
      return `<li class="bv-contrast"><span class="bv-aa" style="background:${bg};color:${fg}" aria-hidden="true">Aa</span><div><b>${esc(name)}</b><span>${ratio.toFixed(2)}:1 · <i class="${grade === 'FAIL' ? 'is-fail' : ''}">${esc(grade)}</i></span></div></li>`;
    }).join('');

    const body = `<div class="bv-budget" role="img" aria-label="Colour budget per view">${bar}</div>
      <div class="bv-roles">${cards}</div>
      <h3 class="bv-sub">Derived tokens</h3>
      <ul class="bv-tokens">${rows.map(chip).join('')}</ul>
      ${extraRows.length ? `<details class="bv-more"><summary>${esc(ctx.def.name)} material colours (${extraRows.length})</summary><ul class="bv-tokens">${extraRows.map(chip).join('')}</ul></details>` : ''}
      <h3 class="bv-sub">Contrast</h3>
      <ul class="bv-contrasts">${contrast}</ul>`;
    return sectionShell('colour', '01', 'Colour', 'Five jobs, one colour each. Every other colour in the brief is derived from these, and every hex is final.', body);
  }

  function typeHtml(ctx) {
    const { state, def, t, probe, sections, brandName, tagline } = ctx;
    const hf = state.headingFont, bf = state.bodyFont, ty = state.typography;
    const hw = abWeightNear(hf, +(probe && probe.h.weight) || ty.headingWeight);
    const bw = abWeightNear(bf, +(probe && probe.b.weight) || ty.bodyWeight);
    const hStyle = probe ? `text-transform:${probe.h.tt};letter-spacing:${probe.h.ls}em;${probe.h.style !== 'normal' ? 'font-style:' + probe.h.style + ';' : ''}` : '';
    const bSize = probe ? Math.max(14, Math.min(19, probe.b.size)) : 16;
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', lower = 'abcdefghijklmnopqrstuvwxyz', nums = '0123456789 &!?%$@';
    const hWeights = [400, 500, 600, 700].filter(w => abWeightNear(hf, w) === w);
    const weightsRow = w => w.length > 1 ? `<div class="bv-weights" style="font-family:${ff(hf)}">${w.map(x => `<span style="font-weight:${x}">${x}</span>`).join('')}</div>` : '';
    const heading = `<figure class="bv-plate bv-spec" style="${plateStyle(t, state)}">
      <figcaption><span>Heading</span><b style="color:${t.ink}">${esc(hf.name)}</b><em>${esc(hf.category)}, weight ${hw}</em></figcaption>
      <div class="bv-spec-aa" style="font-family:${ff(hf)};font-weight:${hw};${hStyle}">Aa</div>
      <div class="bv-spec-line" style="font-family:${ff(hf)};font-weight:${hw};${hStyle}">${esc(brandName)}</div>
      <div class="bv-spec-glyphs" style="font-family:${ff(hf)};font-weight:${hw};${hStyle}">${upper}<br>${lower}<br>${nums}</div>
      ${weightsRow(hWeights)}
    </figure>`;
    const body = `<figure class="bv-plate bv-spec" style="${plateStyle(t, state)}">
      <figcaption><span>Body</span><b style="color:${t.ink}">${esc(bf.name)}</b><em>${esc(bf.category)}, weight ${bw}</em></figcaption>
      <div class="bv-spec-aa" style="font-family:${ff(bf)};font-weight:${bw}">Aa</div>
      <p class="bv-spec-copy" style="font-family:${ff(bf)};font-weight:${bw};font-size:${bSize}px;color:${t.ink}">${esc(/[.!?]$/.test(tagline) ? tagline : tagline + '.')} Every page starts from a quiet canvas, so the one thing that matters is easy to find and easy to read.</p>
      <p class="bv-spec-copy is-muted" style="font-family:${ff(bf)};font-weight:${bw};font-size:${Math.max(12, bSize - 3)}px;color:${t.muted}">Captions, hints and placeholder text step back to the muted tone.</p>
      <div class="bv-spec-glyphs" style="font-family:${ff(bf)};font-weight:${bw}">${lower}<br>${nums}</div>
    </figure>`;
    const typ = findSection(sections, 'Type');
    const facts = typ ? mdBlocks(typ.lines) : '';
    const rec = '';
    return sectionShell('type', '02', 'Type', 'The two faces, set the way the board sets them.',
      `<div class="bv-specs">${heading}${body}</div><div class="bv-md bv-facts-md">${facts}</div>${rec}`);
  }

  function componentsHtml(ctx) {
    const { state, def, t, sections, extras, probe } = ctx;
    const PRI = t.printed ? t.printPrimary : t.primary;
    const inkBorder = AIB_INK_BORDER.includes(def.classicOf || def.key);
    const cta = def.ctaFill === 'ink' ? { bg: t.ink, fg: t.canvas } : { bg: PRI, fg: t.onPrimary };
    const hlKind = aibHighlightKind(def);
    const hlWord = hlKind === 'band'
      ? `<span style="background:${t.accent};color:${t.onAccent};padding:0 .25em">people</span>`
      : `<span style="color:${hlKind === 'custom' ? t.accentInk : t.accentInk}">people</span>`;
    const edge = inkBorder ? t.ink : t.line;
    const rad = probe && probe.radius ? probe.radius : {};
    const rb = rad.button ? `border-radius:${rad.button};` : '', rf = rad.field ? `border-radius:${rad.field};` : '';
    const demo = (label, html, note) => `<div class="bv-demo"><div class="bv-demo-stage">${html}</div><span>${esc(label)}</span>${note ? `<em>${esc(note)}</em>` : ''}</div>`;
    const stage = `<div class="bv-plate bv-comp-plate" style="${plateStyle(t, state, 'b')}">
      ${demo('Main button', `<span class="bv-c-btn" style="${rb}background:${cta.bg};color:${cta.fg};${inkBorder ? 'border:2px solid ' + t.ink : ''}">Start free</span>`, def.ctaFill === 'ink' ? 'ink fill, canvas label' : 'one per view')}
      ${demo('Secondary button', `<span class="bv-c-btn is-ghost" style="${rb}border-color:${t.secondary};color:${t.ink}">See how</span>`, 'secondary outline')}
      ${demo('Input, resting', `<span class="bv-c-input" style="${rf}border-color:${edge};color:${t.muted}">Email address</span>`)}
      ${demo('Input, focus', `<span class="bv-c-input" style="${rf}border-color:${PRI};color:${t.ink};box-shadow:0 0 0 3px ${t.mix(PRI, t.canvas, 0.6)}">hello@brand</span>`)}
      ${demo('Tag', `<span class="bv-c-tag" style="background:${t.secondary};color:${t.onSecondary}">Seasonal</span>`)}
      ${demo('Badge', `<span class="bv-c-tag" style="background:${t.accent};color:${t.onAccent}">New</span>`, 'accent, sparingly')}
      ${demo('Highlight word', `<span class="bv-c-hl" style="font-family:${ff(state.headingFont)};color:${t.ink}">Made for ${hlWord}</span>`, 'one per view')}
      ${demo('Toggle, on', `<span class="bv-c-toggle" style="background:${PRI}"><i style="background:${t.onPrimary}"></i></span>`)}
      ${demo('Selected row', `<span class="bv-c-row" style="${rf}background:${t.secTint};border-left:2px solid ${PRI};color:${t.ink}">Studio plan</span>`)}
      ${demo('Progress', `<span class="bv-c-bar" style="background:${t.line}"><i style="background:${PRI}"></i><i class="is-2" style="background:${t.secondary}"></i></span>`, 'second series: secondary')}
    </div>`;

    const rules = def.rules || {};
    const card = (txt, kind) => `<li class="bv-rule is-${kind}"><span class="bv-rule-mark" aria-hidden="true">${kind === 'do'
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>'
      : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>'}</span><p>${esc(txt)}</p></li>`;
    const dos = (rules.do || []).map(x => card(x, 'do')).join('');
    const donts = (rules.dont || []).map(x => card(x, 'dont')).join('');

    const where = findSection(sections, 'Colors');
    let hard = '';
    if (where) {
      const bullets = where.lines.filter(l => /^- /.test(l));
      if (bullets.length) hard = `<h3 class="bv-sub">Colour rules</h3><div class="bv-md bv-hard">${mdBlocks(bullets)}</div>`;
    }
    const map = findSection(sections, 'Components');
    const mapHtml = map ? `<details class="bv-more"><summary>Component colour map, every element and its tokens</summary><div class="bv-md">${mdBlocks(map.lines)}</div></details>` : '';

    return sectionShell('components', '03', 'Components', 'How the colours land on real controls, and the rules that keep them honest. Shown flat, in the brand colours.',
      `${stage}
      <div class="bv-dd">
        <div><h3 class="bv-sub is-do">Do</h3><ul class="bv-rules">${dos || '<li class="bv-empty">No rules listed.</li>'}</ul></div>
        <div><h3 class="bv-sub is-dont">Don't</h3><ul class="bv-rules">${donts || '<li class="bv-empty">No rules listed.</li>'}</ul></div>
      </div>
      ${hard}${mapHtml}`);
  }

  // Pattern entries to draw: the ones in the brief, else the aesthetic's suite.
  function patternEntries(state, def) {
    const pinned = PatternPins.normalizeList(state.patterns);
    if (pinned.length) return { pinned: true, list: pinned };
    const suite = typeof blendSuite === 'function' ? blendSuite(def) : Patterns.suiteFor(def.key);
    const list = suite.map(s => {
      const en = PatternPins.normalize({ key: s.key, params: Object.assign(Patterns.defaults(s.key), s.params), colorway: s.colorway, seed: PatternPins.SUITE_SEED });
      if (!en) return null;
      const tone = [s.tone, en.params && en.params.tone].find(x => x != null && isFinite(x));
      if (tone != null && tone !== 1) en.params = Object.assign({}, en.params, { tone: Math.max(0, Math.min(1, Number(tone))) });
      return Object.assign(en, { label: s.name });
    }).filter(Boolean);
    return { pinned: false, list };
  }

  function patternsHtml(ctx) {
    const { state, def } = ctx;
    if (typeof Patterns === 'undefined' || typeof PatternPins === 'undefined' || typeof Patterns.suiteFor !== 'function') {
      return sectionShell('patterns', '04', 'Patterns', '', '<p class="bv-empty">The pattern engine is not loaded.</p>');
    }
    const { pinned, list } = patternEntries(state, def);
    const cwWord = v => ((Patterns.E.COLORWAYS.find(c => c.value === v) || {}).label || v);
    const tiles = list.map((e, i) => {
      const f = Patterns.list().find(x => x.key === e.key) || {};
      const use = e.use || PatternPins.defaultUse(e.key);
      const rule = (AIB_USE_RULES[use] || AIB_USE_RULES.hero).rule.replace(/`/g, '');
      const name = e.label || f.name || e.key;
      return `<article class="bv-pat">
        <canvas class="bv-pat-cv" data-i="${i}" width="480" height="270" aria-label="${esc(name)} pattern" role="img"></canvas>
        <div class="bv-pat-meta">
          <h3>${esc(name)}</h3>
          <p class="bv-pat-chips"><span>${esc(PatternPins.useLabel(use))}</span><span>${esc(cwWord(e.colorway))}</span><span>${f.vector ? 'Vector' : 'Raster'}${f.seamless ? ', seamless' : ''}</span>${pinned ? `<span>Seed ${esc(e.seed)}</span>` : ''}</p>
          ${pinned ? `<p class="bv-pat-rule">${esc(rule)}</p>` : `<p class="bv-pat-rule">${esc(f.blurb || '')}</p>`}
        </div>
      </article>`;
    }).join('');
    const intro = pinned
      ? `${list.length === 1 ? 'The pattern' : 'The ' + list.length + ' patterns'} chosen for this brand. Each is rebuilt exactly from its seed, with the inks and placement rule written into the brief.`
      : 'No patterns have been added to the brief yet. These are the families that suit this aesthetic; add the ones you like from the Patterns view and they appear here and in the copied brief.';
    ctx.patternList = list;
    return sectionShell('patterns', '04', 'Patterns', intro, `<div class="bv-pats${pinned ? '' : ' is-suite'}">${tiles}</div>`);
  }

  function shapeHtml(ctx) {
    const { state, def, t, probe, sections } = ctx;
    const PRI = t.printed ? t.printPrimary : t.primary;
    let shapes = '';
    if (probe && probe.radius) {
      const r = probe.radius;
      const box = (label, radius, style, extraCls) => radius == null ? '' : `<div class="bv-shape"><span class="bv-shape-box ${extraCls || ''}" style="border-radius:${radius};${style}"></span><b>${esc(label)}</b><code>${esc(radius)}</code></div>`;
      shapes = `<div class="bv-plate bv-shapes" style="${plateStyle(t, state)}">
        ${box('Cards', r.card, `background:${t.canvas};border:1px solid ${t.ink};opacity:.9`)}
        ${box('Buttons', r.button, `background:${def.ctaFill === 'ink' ? t.ink : PRI}`, 'is-wide')}
        ${box('Fields', r.field, `background:${t.canvas};border:1px solid ${t.muted}`, 'is-wide')}
        ${box('Swatches', r.swatch, `background:${t.accent}`)}
      </div>`;
    }
    const modeLine = `<p class="bv-shape-note">Mode: ${t.isDark ? 'dark' : 'light'}. Canvas is the ${t.isDark ? 'dark' : 'light'} neutral and ink is the ${t.isDark ? 'light' : 'dark'} neutral.${state.pureBg ? ' Pure ' + (t.isDark ? 'black' : 'white') + ' background.' : ''}</p>`;
    const mat = findSection(sections, 'Shape and materials');
    let cards = '';
    if (mat) {
      const items = mat.lines.map(l => /^- \*\*(.+?)\*\*:\s*(.*)$/.exec(l)).filter(Boolean);
      if (items.length) {
        cards = `<h3 class="bv-sub">Materials</h3><ul class="bv-mats">${items.map(m => `<li><b>${esc(m[1])}</b><code>${esc(m[2])}</code></li>`).join('')}</ul>`;
      }
    }
    const notes = def.typeNotes ? (Array.isArray(def.typeNotes) ? def.typeNotes : [def.typeNotes]) : [];
    const notesHtml = notes.length ? `<h3 class="bv-sub">Type notes</h3><ul class="bv-notes">${notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : '';
    return sectionShell('shape', '05', 'Shape and materials', 'The corners the board really draws, and the surface recipes to apply as written.', `${shapes}${modeLine}${cards}${notesHtml}`);
  }

  function textHtml(ctx) {
    // Sections already drawn above (colour, type, components, shape, do and don't) are skipped here.
    const skip = ['Colors', 'Components', 'Type', 'Shape and materials', "Do and don't"];
    const keep = ctx.sections.filter(s => !skip.includes(s.title));
    const html = keep.map(s => {
      const long = /^(Patterns|Tokens \(CSS\)|Theme\.swift)$/.test(s.title);
      return `<details class="bv-acc"${long ? '' : ' open'}><summary><span>${esc(s.title)}</span></summary><div class="bv-md">${mdBlocks(s.lines)}</div></details>`;
    }).join('');
    const head = `<div class="bv-md bv-lede-md">${mdBlocks(ctx.leadLines)}</div>`;
    return sectionShell('text', '06', 'The full text', 'Everything below is in the copied brief, word for word.',
      `${head}<div class="bv-acc-tools"><button type="button" class="bv-link" data-bv-act="expand">Expand all</button><button type="button" class="bv-link" data-bv-act="collapse">Collapse all</button></div>${html}`);
  }

  /* ---------------- build + open ---------------- */

  function build() {
    const view = abView(state);
    const st = view.state, def = view.def;
    const t = boardTokens(st, def);
    const md = buildAiBrief(state);
    currentMd = md;
    const sections = parseSections(md);
    const lead = md.split('\n');
    const leadLines = [];
    for (let i = 1; i < lead.length && !/^## /.test(lead[i]); i++) leadLines.push(lead[i]);
    const ctx = {
      state: st, def, t, md, sections, leadLines,
      roles: colorRolesFor(st),
      extras: abTokens(def, t, st),
      brandName: aibBrandName(st),
      tagline: String(aibContent(st).tagline).trim(),
      probe: aibProbeBoard(st, def),
    };
    docEl.innerHTML = [coverHtml(ctx), colourHtml(ctx), typeHtml(ctx), componentsHtml(ctx), patternsHtml(ctx), shapeHtml(ctx), textHtml(ctx)].join('') +
      `<footer class="bv-foot">Made with Branding Designer. Colours, fonts and rules above are final; nothing here is sent anywhere.</footer>`;
    drawPatterns(ctx);
    root.querySelector('.bv-bar-brand').textContent = ctx.brandName;
  }

  // Draw the pattern tiles one at a time so opening never blocks on a heavy raster family.
  function drawPatterns(ctx) {
    const token = ++renderToken;
    const list = ctx.patternList || [];
    const cvs = Array.from(docEl.querySelectorAll('.bv-pat-cv'));
    const tokens = boardTokens(ctx.state, ctx.def);
    let i = 0;
    const next = () => {
      if (token !== renderToken || i >= cvs.length) return;
      const cv = cvs[i], e = list[Number(cv.dataset.i)];
      i++;
      if (e) {
        try {
          const inks = Patterns.inksFor(tokens, e.colorway, { tints: !!(e.params && e.params.tints) });
          Patterns.render(cv, e.key, e.params, inks, e.seed, { width: 480, height: 270, dpr: 2, setStyle: false });
        } catch (err) { console.warn('brief view: pattern failed', e.key, err); }
      }
      setTimeout(next, 0);
    };
    setTimeout(next, 30);
  }

  function ensureDom() {
    if (root) return;
    root = document.createElement('div');
    root.className = 'bv';
    root.id = 'briefView';
    root.hidden = true;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'Brand brief');
    const copyBtns = TOOLS.map(tool => `<button type="button" class="bv-btn" data-bv-copy="${tool.id}" title="Copy the brief for ${esc(tool.label)}"><span class="bv-pre">Copy for </span><span class="bv-lab">${esc(tool.label)}</span></button>`).join('');
    root.innerHTML = `<header class="bv-bar">
        <div class="bv-bar-title"><b>Brand brief</b><span class="bv-bar-brand"></span></div>
        <div class="bv-bar-actions" role="group" aria-label="Copy the brief">${copyBtns}
          <button type="button" class="bv-btn is-quiet" data-bv-act="download" title="Download the brief as a Markdown file">Download .md</button>
          <button type="button" class="bv-btn is-quiet" data-bv-act="zip" title="Download BRIEF.md, the token files and the pattern files as one .zip">Save + files</button>
        </div>
        <button type="button" class="bv-close" data-bv-act="close" aria-label="Close brief" title="Close (Esc)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
          <span>Close</span>
        </button>
      </header>
      <div class="bv-scroll" tabindex="-1"><article class="bv-doc" aria-label="Brand brief document"></article></div>`;
    document.body.appendChild(root);
    scroller = root.querySelector('.bv-scroll');
    docEl = root.querySelector('.bv-doc');
    root.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeydown, true);
  }

  /* ---------------- actions ---------------- */

  function flash(btn, text) {
    if (!btn) return;
    const lab = btn.querySelector('.bv-lab') || btn;
    if (btn._orig == null) btn._orig = lab.textContent;
    lab.textContent = text;
    btn.classList.add('is-done');
    clearTimeout(btn._t);
    btn._t = setTimeout(() => { lab.textContent = btn._orig; btn._orig = null; btn.classList.remove('is-done'); }, 1600);
  }

  function copyFor(toolId, btn) {
    const tool = TOOLS.find(x => x.id === toolId);
    if (!tool) return;
    const text = tool.preface + '\n\n' + buildAiBrief(state);
    copyText(text)
      .then(() => { showToast('Brief copied for ' + tool.label + (window.AiBriefCopy ? window.AiBriefCopy.pendingNote() : '')); flash(btn, 'Copied'); })
      .catch(() => showToast('Clipboard blocked. Try again from the app window'));
  }

  function download() {
    const blob = new Blob([buildAiBrief(state)], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${typeof brandFileSlug === 'function' ? brandFileSlug() : 'brand'}-brand-brief.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Brief downloaded');
  }

  function onClick(e) {
    const copyBtn = e.target.closest('[data-bv-copy]');
    if (copyBtn) return copyFor(copyBtn.dataset.bvCopy, copyBtn);
    const go = e.target.closest('[data-bv-go]');
    if (go) {
      e.preventDefault();
      const target = docEl.querySelector('#bv-' + go.dataset.bvGo);
      if (target) {
        const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const bar = root.querySelector('.bv-bar').offsetHeight;
        scroller.scrollTo({ top: target.offsetTop - bar - 8, behavior: reduce ? 'auto' : 'smooth' });
      }
      return;
    }
    const act = e.target.closest('[data-bv-act]');
    if (!act) return;
    const a = act.dataset.bvAct;
    if (a === 'close') close(true);
    else if (a === 'download') download();
    else if (a === 'zip') { if (window.AiBriefCopy) window.AiBriefCopy.save({ skipCheck: true }); }
    else if (a === 'expand' || a === 'collapse') docEl.querySelectorAll('.bv-acc').forEach(d => { d.open = a === 'expand'; });
  }

  function onKeydown(e) {
    if (!isOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); return close(true); }
    if (e.key !== 'Tab') return;
    const f = Array.from(root.querySelectorAll('button, summary, a[href]')).filter(el => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1], active = document.activeElement;
    if (e.shiftKey && (active === first || active === scroller)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    else if (!root.contains(active)) { e.preventDefault(); first.focus(); }
  }

  function open(from) {
    if (typeof buildAiBrief !== 'function' || typeof state === 'undefined') return null;
    ensureDom();
    if (isOpen) return root;
    if (typeof PatternCart !== 'undefined' && PatternCart.isOpen && PatternCart.isOpen()) PatternCart.close(false);
    opener = from || document.activeElement;
    try { build(); } catch (err) {
      console.error('brief view failed', err);
      docEl.innerHTML = '<p class="bv-empty" style="padding:48px 0">The brief could not be drawn. Use Copy AI brief instead.</p>';
    }
    isOpen = true;
    root.hidden = false;
    document.body.classList.add('has-dialog');
    prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    scroller.scrollTop = 0;
    root.classList.remove('is-in');
    void root.offsetWidth;
    root.classList.add('is-in');
    scroller.focus({ preventScroll: true });
    return root;
  }

  function close(restoreFocus) {
    if (!isOpen) return;
    isOpen = false;
    renderToken++;
    root.hidden = true;
    document.body.classList.remove('has-dialog');
    document.body.style.overflow = prevBodyOverflow;
    if (restoreFocus && opener && opener.focus && document.contains(opener)) opener.focus({ preventScroll: true });
  }

  function wire() {
    const btn = document.getElementById('viewBrief');
    if (btn) btn.addEventListener('click', () => open(btn));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire); else wire();

  window.Show.brief = open;
  window.Show.brief.close = () => close(false);
  window.Show.brief.isOpen = () => isOpen;
  window.Show.brief.text = () => buildAiBrief(state);
})();

/* ---------------------------------------------------------------------
   AiBriefCopy — the sidebar's "Copy AI brief", in front of app.js's own handler.

   - Injects, around #copyAiBrief: the Building picker (App | Website | Both, see
     aibSetSurface) and the Web | SwiftUI | Both picker (each stored per brand
     name in localStorage, see aibSetTarget), the resolve panel, and "Save brief + files".
   - A capture-phase click listener takes the Copy click first (stopImmediatePropagation),
     runs aibCheck(state) and either copies (buildAiBrief) or lists each problem with
     one-click fixes and a "Copy anyway".
   - "Save brief + files" writes BRIEF.md, tokens.css / Theme.swift and patterns/* as a
     store-only .zip (aibFiles + aibZip in ai-brief.js).
------------------------------------------------------------------------ */

window.AiBriefCopy = (function () {
  const $ = id => document.getElementById(id);
  const esc = s => escapeHtml(s);
  const toast = m => { if (typeof showToast === 'function') showToast(m); };
  let panel = null, targetBox = null, surfaceBox = null, saveBtn = null;
  let pendingKind = null;
  let lastCount = 0;

  const targetLabel = () => (AIB_TARGETS.find(x => x.value === aibGetTarget(state)) || AIB_TARGETS[0]).label;

  /* ---------------- injected UI ---------------- */

  function build() {
    const copy = $('copyAiBrief');
    if (!copy || $('aibTarget')) return;
    const foot = copy.parentNode;
    panel = document.createElement('div');
    panel.id = 'aibResolve';
    panel.className = 'aibc-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'Fix before copying the brief');
    panel.setAttribute('aria-live', 'polite');
    targetBox = document.createElement('div');
    targetBox.id = 'aibTarget';
    targetBox.className = 'aibc-row';
    targetBox.innerHTML = `<span class="aibc-label" id="aibTargetLabel">Build for</span>
      <div class="segmented aibc-seg" role="radiogroup" aria-labelledby="aibTargetLabel">${AIB_TARGETS.map(t =>
        `<label title="${t.value === 'web' ? 'CSS variables' : t.value === 'swiftui' ? 'A Swift theme: Color, Font, shadows, button styles' : 'Both blocks in one brief'}"><input type="radio" name="aibTargetSel" value="${t.value}" /> ${esc(t.label)}</label>`).join('')}</div>`;
    surfaceBox = document.createElement('div');
    surfaceBox.id = 'aibSurface';
    surfaceBox.className = 'aibc-row';
    surfaceBox.innerHTML = `<span class="aibc-label" id="aibSurfaceLabel">Building</span>
      <div class="segmented aibc-seg" role="radiogroup" aria-labelledby="aibSurfaceLabel">${(typeof AIB_SURFACES !== 'undefined' ? AIB_SURFACES : []).map(t =>
        `<label title="${t.value === 'app' ? 'A phone app: the UI kit only, no board art or patterns' : t.value === 'web' ? 'A website: the UI kit plus hero art and patterns' : 'An app and its website: the kit, with art and patterns marked website-only'}"><input type="radio" name="aibSurfaceSel" value="${t.value}" /> ${esc(t.label)}</label>`).join('')}</div>`;
    saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.id = 'saveAiBriefFiles';
    saveBtn.className = 'btn btn-ghost btn-block aibc-save';
    saveBtn.title = 'Download BRIEF.md, the token files and the brief\'s pattern files as one .zip';
    saveBtn.innerHTML = '<svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M21 21H3"/></svg>Save brief + files';
    foot.insertBefore(panel, copy);
    foot.insertBefore(surfaceBox, copy);
    foot.insertBefore(targetBox, copy);
    foot.insertBefore(saveBtn, copy.nextSibling);
    targetBox.addEventListener('change', e => {
      if (e.target && e.target.name === 'aibTargetSel' && e.target.checked) { aibSetTarget(state, e.target.value); hidePanel(); }
    });
    surfaceBox.addEventListener('change', e => {
      if (e.target && e.target.name === 'aibSurfaceSel' && e.target.checked) { aibSetSurface(state, e.target.value); hidePanel(); }
    });
    saveBtn.addEventListener('click', () => run('save'));
    panel.addEventListener('click', onPanelClick);
    panel.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); hidePanel(); copy.focus(); } });
    syncTarget();
  }

  function syncTarget() {
    if (surfaceBox && typeof aibGetSurface === 'function') {
      const sv = aibGetSurface(state);
      surfaceBox.querySelectorAll('input[name="aibSurfaceSel"]').forEach(r => { r.checked = r.value === sv; });
    }
    if (!targetBox) return;
    const v = aibGetTarget(state);
    targetBox.querySelectorAll('input[name="aibTargetSel"]').forEach(r => { r.checked = r.value === v; });
  }

  /* ---------------- resolve panel ---------------- */

  let shown = [];

  function showPanel(issues, kind) {
    shown = issues;
    pendingKind = kind;
    const verb = kind === 'save' ? 'save' : 'copy';
    panel.innerHTML = `<div class="aibc-head"><b>Fix before you ${verb}</b><button type="button" class="aibc-x" data-aibc="close" aria-label="Close">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>
      <p class="aibc-lede">${issues.length === 1 ? 'The brief would contradict itself here.' : 'The brief would contradict itself in ' + issues.length + ' places.'}</p>
      <ul class="aibc-list">${issues.map((it, i) => `<li class="aibc-issue">
        <span class="aibc-text">${esc(it.text)}</span>
        <span class="aibc-fixes">${it.fixes.map((f, j) => f.hint
          ? `<span class="aibc-hint">${esc(f.hint)}</span>`
          : `<button type="button" class="btn btn-small aibc-fix" data-aibc="fix" data-i="${i}" data-j="${j}">${esc(f.label)}</button>`).join('')}</span>
      </li>`).join('')}</ul>
      <button type="button" class="btn btn-ghost btn-small aibc-any" data-aibc="any">${kind === 'save' ? 'Save anyway' : 'Copy anyway'}</button>`;
    panel.hidden = false;
    const first = panel.querySelector('.aibc-fix') || panel.querySelector('.aibc-any');
    if (first) first.focus({ preventScroll: true });
    panel.scrollIntoView({ block: 'nearest' });
  }

  function hidePanel() {
    if (!panel) return;
    panel.hidden = true;
    panel.innerHTML = '';
    shown = [];
    pendingKind = null;
  }

  function onPanelClick(e) {
    const b = e.target.closest('[data-aibc]');
    if (!b) return;
    const act = b.dataset.aibc;
    if (act === 'close') return hidePanel();
    if (act === 'any') { const k = pendingKind; hidePanel(); return act2(k); }
    if (act === 'fix') {
      const it = shown[Number(b.dataset.i)];
      const fix = it && it.fixes[Number(b.dataset.j)];
      if (!fix) return;
      const kind = pendingKind;
      try { fix.run(); } catch (err) { console.warn('brief fix failed', err); }
      run(kind);   // check again; if nothing is left, this copies
    }
  }

  /* ---------------- actions ---------------- */

  function check() {
    try { return aibCheck(state); } catch (err) { console.warn('brief check failed', err); return []; }
  }

  function patternNote() {
    const app = typeof aibGetSurface === 'function' && aibGetSurface(state) === 'app';
    const n = typeof PatternPins !== 'undefined' && !app ? PatternPins.list().length : 0;
    return n ? `, with ${n} ${n === 1 ? 'pattern' : 'patterns'}` : '';
  }

  function doCopy() {
    const text = buildAiBrief(state);
    return copyText(text)
      .then(() => toast(`AI brief copied for ${targetLabel()}${patternNote()}`))
      .catch(() => toast('Clipboard blocked. Try again from the app window'));
  }

  function bytesToBlob(bytes) { return new Blob([bytes], { type: 'application/zip' }); }

  async function doSave() {
    saveBtn.disabled = true;
    try {
      const files = await aibFiles(state);
      const blob = bytesToBlob(aibZip(files));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${typeof brandFileSlug === 'function' ? brandFileSlug() : 'brand'}-brief.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 20000);
      toast(`Saved the brief and ${files.length - 1} ${files.length === 2 ? 'file' : 'files'} for ${targetLabel()}`);
      return files;
    } catch (err) {
      console.error('save brief + files failed', err);
      toast('Could not save the files');
      return null;
    } finally {
      saveBtn.disabled = false;
    }
  }

  function act2(kind) { return kind === 'save' ? doSave() : doCopy(); }

  // opts.skipCheck: go straight to the action (the brief page's own button).
  function run(kind, opts) {
    syncTarget();
    const issues = opts && opts.skipCheck ? [] : check();
    lastCount = issues.length;
    if (issues.length) { showPanel(issues, kind); return null; }
    hidePanel();
    return act2(kind);
  }

  // For callers with no panel (the pattern tray, the brief page's copy buttons): copy as is and
  // say, in the toast, when the checks found something.
  function pendingNote() {
    const n = check().length;
    return n ? ` (${n} unresolved ${n === 1 ? 'check' : 'checks'}: use Copy AI brief in the sidebar to review)` : '';
  }

  function wire() {
    build();
    document.addEventListener('click', e => {
      const b = e.target.closest && e.target.closest('#copyAiBrief');
      if (!b) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      run('copy');
    }, true);
    setInterval(syncTarget, 1500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire); else wire();

  return {
    copy: opts => run('copy', opts),
    save: opts => run('save', opts),
    check, pendingNote,
    lastCount: () => lastCount,
    isPanelOpen: () => !!(panel && !panel.hidden),
  };
})();
