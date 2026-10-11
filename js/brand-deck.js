/* ---------------------------------------------------------------------
   brand-deck.js — the "Brand deck": nine 16:9 brand-guideline slides rendered
   inside the selected aesthetic.

   Every slide is its own `.ab.ab-slide[data-ae]` root at a fixed design size of
   1280x720, built from the same parts as the board (abBoardParts in
   js/aesthetic-board.js), so each aesthetic's scoped CSS applies unchanged and
   switching aesthetic restyles the deck exactly like the board. A slide card
   shrinks the 1280x720 slide to its grid cell with CSS zoom (as Compare does).
   css/brand-deck.css holds the neutral slide styles.

   Extension points (for other scripts loaded after this one):
   - DECK_SLIDES: the ordered slide list. Push or splice
     { key, title, name?, foot?, pattern?, build(P, state, def, t) -> body HTML },
     or call registerDeckSlide(slide, afterKey). Page numbers, the grid, PNG
     export, Download all and the PDF follow the list; nothing else to wire.
   - deckPatternHook: set to function (P, slideKey) -> HTML. Its output is laid
     behind the content of every slide whose `pattern` flag is true (cover and
     closing). A no-op until something assigns it.
   - deckStageHook: set to function (P, state, def, t) -> HTML. The Material
     slide's stage shows that markup instead of the signature art when the
     aesthetic sets `def.deck = { materialStage: 'pattern' }`. Falls back to the
     art while unset or when it returns ''.

   Also holds the small colour/size helpers the board and the library tiles
   use (slMix, slVisible, slFit, slRadius, brandFileSlug). Plain <script>.
------------------------------------------------------------------------ */

/* ---------------- shared helpers ---------------- */

// Flat mix of two hex colors — `amount` (0-1) of `hex` over `base`.
// Precomputed instead of using color-mix() so html2canvas exports match.
function slMix(hex, base, amount) {
  const a = hexToRgb(hex);
  const b = hexToRgb(base);
  const chan = (x, y) => {
    const v = Math.round(y + (x - y) * amount);
    return Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0');
  };
  return `#${chan(a.r, b.r)}${chan(a.g, b.g)}${chan(a.b, b.b)}`;
}

// First candidate color that is actually legible on `bg`, else `fallback`.
function slVisible(bg, candidates, minRatio, fallback) {
  for (const c of candidates) {
    if (c && contrastRatio(c, bg) >= minRatio) return c;
  }
  return fallback;
}

// Type that can't overflow: pick a cqw size from the copy's own length.
// Two constraints — the longest word has to fit its line, and the whole
// string has to fit the line budget. `widthPct` is the text column's width in cqw.
function slFit(text, opts) {
  const { max, min, widthPct, lines = 2, glyph = 0.56 } = opts;
  const s = String(text == null ? '' : text).trim();
  if (!s) return max;
  const words = s.split(/\s+/);
  const longest = words.reduce((m, w) => Math.max(m, w.length), 1);
  const wordLines = words.length === 1 ? lines : 1;
  const byWord = (widthPct * wordLines) / (glyph * longest);
  const byTotal = (widthPct * lines) / (glyph * s.length);
  return Math.round(Math.max(min, Math.min(max, byWord, byTotal)) * 100) / 100;
}

// Shape presets can carry exotic radius values (organic blob corners);
// only a plain length makes sense where a plain radius is needed.
function slRadius(value, fallback) {
  const v = String(value == null ? '' : value).trim();
  return /^\d+(\.\d+)?(px|rem|em)$/.test(v) ? v : fallback;
}

// "Aster & Co." -> "aster-co", for export filenames.
function brandFileSlug() {
  const n = (typeof state !== 'undefined' && state.content && state.content.brandName) || '';
  return n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'brand';
}

// "Aster & Co." -> "asterandco", for the closing slide's contact line.
function bdMailSlug(name) {
  const s = String(name == null ? '' : name).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '');
  return (s || 'brand').slice(0, 22);
}

/* ---------------- slide registry ---------------- */

const DECK_W = 1280;
const DECK_H = 720;

// Optional: function (P, slideKey) -> HTML laid behind the content of slides
// flagged `pattern: true`. Null (no-op) until another script sets it.
let deckPatternHook = null;

// Optional: function (P, state, def, t) -> stage HTML for the Material slide
// (see `def.deck.materialStage`). Null until another script sets it.
let deckStageHook = null;

// Cover headline sizing (D1): start at min(132px, 11.5cqw) x the aesthetic's
// display scale, shrink in 4% steps only until the hero copy fits, never below 64px.
const BD_COVER_START = Math.min(132, 0.115 * 1280);
const BD_COVER_MIN_PX = 64;
const BD_COVER_SOFT_PX = 88;          // x display scale: the headline gives up this much before the art box shrinks
const BD_COVER_MIN_SCALE = 0.98;
const BD_COVER_EMERGENCY_PX = 40;     // below the 64px floor only when the cover cannot otherwise reach 0.85

function bdPatternHtml(P, key) {
  if (typeof deckPatternHook !== 'function') return '';
  const html = deckPatternHook(P, key);
  return html ? `<div class="ab-deck-pattern" aria-hidden="true">${html}</div>` : '';
}

// Insert a slide after another (by key), or at the end.
function registerDeckSlide(slide, afterKey) {
  const at = DECK_SLIDES.findIndex(s => s.key === slide.key);
  if (at >= 0) { DECK_SLIDES[at] = slide; return slide; }
  const after = afterKey ? DECK_SLIDES.findIndex(s => s.key === afterKey) : -1;
  if (after >= 0) DECK_SLIDES.splice(after + 1, 0, slide); else DECK_SLIDES.push(slide);
  return slide;
}

/* ---------------- slide content helpers ---------------- */

// A rule sentence as { head, tail }: split at its first clause break (; : - , ) after
// the first few characters. Fallback for aesthetics without hand-written deck copy
// (def.deck.principles / do / dont): the deck wants short lines, the rules are sentences.
function bdRuleParts(rule) {
  const text = String(rule || '').replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim().replace(/\.$/, '');
  const at = text.slice(10).search(/[;:]| — |, /);
  if (at < 0) return { head: text, tail: '' };
  const cut = at + 10;
  return { head: text.slice(0, cut), tail: text.slice(cut).replace(/^(?:[;:,]| — )\s*/, '') };
}

// At most `max` words, no trailing punctuation or joining word, first letter capital.
function bdWords(text, max) {
  let w = String(text || '').split(' ').filter(Boolean).slice(0, max);
  while (w.length > 3 && /^(?:a|an|the|and|or|of|to|for|with|on|in|at|by|is|are)$/i.test(w[w.length - 1])) w.pop();
  const s = w.join(' ').replace(/[\s,;:—-]+$/, '').replace(/\.$/, '');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Three principles as [title, line]: hand-written in def.deck.principles
// (title <= 6 words, line <= 12), else the first three do-rules shortened.
function bdPrinciples(def) {
  const own = def.deck && def.deck.principles;
  if (Array.isArray(own) && own.length) return own.slice(0, 3).map(p => [String(p[0] || ''), String(p[1] || '')]);
  return ((def.rules && def.rules.do) || []).slice(0, 3).map(r => {
    const x = bdRuleParts(r);
    return [bdWords(x.head, 6), x.tail ? bdWords(x.tail, 12) + '.' : ''];
  });
}

// Three short do / don't lines (<= 10 words): def.deck.do / dont, else the rules shortened.
function bdRuleLines(def, kind) {
  const own = def.deck && def.deck[kind];
  if (Array.isArray(own) && own.length) return own.slice(0, 3).map(String);
  return ((def.rules && def.rules[kind]) || []).slice(0, 3).map(r => bdWords(bdRuleParts(r).head, 10) + '.');
}

// "Primary tile (main action)" -> "Primary tile": the deck lists names, the board explains them.
function bdMatName(name) {
  return String(name || '').replace(/\s*\([^)]*\)/g, '').trim();
}

// One element out of a board part's markup (the board's seg / cta / toggle / states).
function bdPart(html, selector) {
  const t = document.createElement('template');
  t.innerHTML = html;
  const el = t.content.querySelector(selector);
  return el ? el.outerHTML : '';
}

// Base px for a motto-sized headline, stepped down as the line gets longer.
function bdMottoPx(text, base) {
  const n = String(text || '').trim().length;
  return Math.round(base * (n <= 20 ? 1 : n <= 30 ? 0.86 : 0.72));
}

function bdGrade(ratio) {
  return ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA large' : 'Low';
}

/* ---------------- the nine slides ---------------- */

const DECK_SLIDES = [
  {
    key: 'cover', title: 'Cover', pattern: true,
    build(P, state, def) {
      const year = new Date().getFullYear();
      return `<div class="ab-deck-cover">
        ${P.hero()}
        <div class="ab-labelrow ab-deck-cover-meta"><span class="ab-label">Brand guidelines</span><span class="ab-label">${escapeHtml(def.name)}</span><span class="ab-label">${year}</span></div>
      </div>`;
    },
  },
  {
    key: 'principles', title: 'Principles',
    build(P, state, def) {
      const e = escapeHtml;
      const items = bdPrinciples(def).map((p, i) => `<li class="ab-deck-principle">
          <span class="ab-label"><i class="ab-n">${String(i + 1).padStart(2, '0')}</i></span>
          <div><h3 class="ab-deck-ptitle">${e(p[0])}</h3>${p[1] ? `<p class="ab-deck-pline">${e(p[1])}</p>` : ''}</div>
        </li>`).join('');
      return `<div class="ab-deck-principles">
        <div class="ab-deck-lead">
          <p class="ab-label ab-deck-kick">How ${e(P.copy.brandName)} looks and feels</p>
          <h2 class="ab-headline ab-deck-h" style="--dk-fs:${bdMottoPx(def.motto, 70)}px">${abHeadline(def.motto)}</h2>
          <p class="ab-deck-desc">${e(def.summary || def.descriptor)}</p>
        </div>
        <ol class="ab-deck-plist">${items}</ol>
      </div>`;
    },
  },
  {
    key: 'color', title: 'Color system',
    build(P, state, def, t) {
      const e = escapeHtml;
      const order = AB_ROLE_ORDER;
      const nums = order.map(k => abCoverageNum((P.roles[k] || {}).coverage));
      const sws = order.map(k => {
        const r = P.roles[k] || {};
        return `<div class="ab-deck-sw" data-role="${k}">
          <span class="ab-deck-swc" style="background:${t[k]}"></span>
          <p class="ab-deck-swrole">${e(r.label || k)}</p>
          <p class="ab-deck-swjob">${e(bdWords(r.job || '', 4))}</p>
          <p class="ab-deck-swhex">${e(t[k].toUpperCase())}</p>
        </div>`;
      }).join('');
      const bar = order.map((k, i) => `<span class="ab-deck-seg" data-role="${k}" style="flex:${nums[i]};background:${t[k]}"></span>`).join('');
      const legend = order.map(k => `<span class="ab-deck-key"><i style="background:${t[k]}"></i>${e((P.roles[k] || {}).label || k)}</span>`).join('');
      const actionInk = def.ctaFill === 'ink';
      const pairs = [
        { name: 'Text', fg: t.ink, bg: t.canvas },
        actionInk ? { name: 'Action', fg: t.canvas, bg: t.ink } : { name: 'Action', fg: t.onPrimary, bg: t.primary },
        { name: 'Highlight', fg: t.accentInk, bg: t.canvas },
      ].map(p => {
        const ratio = contrastRatio(p.fg, p.bg);
        return `<div class="ab-deck-pair">
          <span class="ab-deck-pchip" style="background:${p.bg};color:${p.fg}">Aa</span>
          <div><p class="ab-deck-pname">${e(p.name)}</p><p class="ab-deck-pratio"><b>${ratio.toFixed(1)}:1</b> ${bdGrade(ratio)}</p></div>
        </div>`;
      }).join('');
      return `<div class="ab-deck-color">
        <div class="ab-deck-sws">${sws}</div>
        <div class="ab-deck-lower">
          <div class="ab-deck-ratio">
            <p class="ab-label">Proportion</p>
            <div class="ab-deck-bar">${bar}</div>
            <div class="ab-deck-legend">${legend}</div>
          </div>
          <div class="ab-deck-pairs">
            <p class="ab-label">Contrast</p>
            <div class="ab-deck-pairrow">${pairs}</div>
          </div>
        </div>
      </div>`;
    },
  },
  {
    key: 'typography', title: 'Typography',
    build(P, state, def) {
      const e = escapeHtml;
      const ty = state.typography || {};
      const hsz = ty.headingSize || 44;
      const bsz = ty.bodySize || 16;
      const disp = abTypeFor(def).display || 1;
      const scale = [
        { name: 'Display', px: Math.min(72, Math.round(hsz * 1.6 * disp)), face: 'h', sample: 'Good design' },
        { name: 'Heading', px: Math.min(44, hsz), face: 'h', sample: 'Good design feels alive' },
        { name: 'Body', px: Math.min(20, bsz), face: 'b', sample: 'Type, color and material, set in one place.' },
      ].map(s => `<li class="ab-deck-scale" data-face="${s.face}">
          <span class="ab-label">${s.name}<i> · ${s.px}px</i></span>
          <span class="ab-deck-sample${s.face === 'h' ? ' ab-headline' : ''}" style="--dk-fs:${s.px}px">${s.sample}</span>
        </li>`).join('');
      return `<div class="ab-deck-type">
        <div class="ab-deck-faces">
          <div class="ab-deck-face" data-face="h">
            <p class="ab-label">Heading</p>
            <p class="ab-deck-aa ab-headline" style="--dk-fs:120px">Aa</p>
            <p class="ab-deck-fname" style="font-family:var(--ab-font-h)">${e(state.headingFont.name)}</p>
          </div>
          <div class="ab-deck-face" data-face="b">
            <p class="ab-label">Body</p>
            <p class="ab-deck-aa" style="--dk-fs:96px;font-family:var(--ab-font-b)">Aa</p>
            <p class="ab-deck-fname" style="font-family:var(--ab-font-b)">${e(state.bodyFont.name)}</p>
          </div>
        </div>
        <div class="ab-deck-scalecol">
          <div class="ab-labelrow"><span class="ab-label">Type scale</span></div>
          <ul class="ab-deck-scales">${scale}</ul>
        </div>
      </div>`;
    },
  },
  {
    key: 'interface', title: 'Interface',
    build(P) {
      const card = P.card();
      const panel = P.panel();
      const cell = (name, inner) => `<div class="ab-deck-cell">
          <p class="ab-label ab-deck-cellname">${name}</p>
          <div class="ab-deck-cellbody">${inner}</div>
        </div>`;
      const states = bdPart(panel, '.ab-states');
      return `<div class="ab-deck-ui">
        <div class="ab-deck-uirow">
          ${cell('Segmented control', bdPart(card, '.ab-seg'))}
          ${cell('Primary action', bdPart(card, '.ab-cta'))}
          ${cell('Toggle', bdPart(panel, '.ab-toggle'))}
        </div>
        ${states ? `<div class="ab-deck-uistates">${states}</div>` : ''}
      </div>`;
    },
  },
  {
    key: 'material', title: 'Material & graphics',
    build(P, state, def, t) {
      const e = escapeHtml;
      const mats = (def.materials || []).slice(0, 4).map((m, i) => `<li class="ab-deck-mat">
          <span class="ab-label"><i class="ab-n">${String(i + 1).padStart(2, '0')}</i><span>${e(bdMatName(m.name))}</span></span>
        </li>`).join('');
      const patternStage = (def.deck && def.deck.materialStage === 'pattern' && typeof deckStageHook === 'function')
        ? deckStageHook(P, state, def, t) : '';
      const stage = patternStage
        ? `<div class="ab-deck-stage" data-stage="pattern" data-hero="${P.layout.hero}">${patternStage}</div>`
        : `<div class="ab-deck-stage" data-hero="${P.layout.hero}"><div class="ab-art" aria-hidden="true">${P.art()}</div></div>`;
      return `<div class="ab-deck-material">
        ${stage}
        <div class="ab-deck-matcol">
          <div class="ab-labelrow"><span class="ab-label">${e(P.labels.material)}</span></div>
          <ul class="ab-deck-mats">${mats}</ul>
        </div>
      </div>`;
    },
  },
  {
    key: 'product', title: 'In product',
    build(P) {
      const e = escapeHtml;
      const nav = ['Overview', 'Projects', 'Assets'].map((n, i) =>
        `<li class="ab-deck-nav${i === 1 ? ' is-on' : ''}"><span class="ab-label">${e(n)}</span></li>`).join('');
      const roles = ['primary', 'secondary', 'accent'];
      const rows = AB_ROWS.map((r, i) => `<li class="ab-deck-row">
          <i class="ab-deck-dot" role="img" aria-label="${e(r[1])}" title="${e(r[1])}" style="background:var(--ab-${roles[i]})"></i>
          <span class="ab-deck-rname">${e(r[0])}</span>
          <span class="ab-deck-rpct">${r[2]}%</span>
        </li>`).join('');
      const stage = AB_STAGES.Design;
      return `<div class="ab-deck-app">
        <aside class="ab-deck-side">
          <div class="ab-brand">${P.brand}</div>
          <ul class="ab-deck-navlist">${nav}</ul>
        </aside>
        <div class="ab-deck-screen">
          <div class="ab-deck-screenhead">
            <h3 class="ab-deck-screentitle ab-headline">Projects</h3>
            <span class="ab-deck-chip">3 active</span>
          </div>
          <div class="ab-deck-screenbody">
            <ul class="ab-deck-rows">${rows}</ul>
            <div class="ab-deck-ctacard">
              <h4 class="ab-deck-ctatitle">${e(stage[0])}</h4>
              <p class="ab-deck-ctaline">${e(stage[1])}</p>
              ${bdPart(P.card(), '.ab-cta')}
            </div>
          </div>
        </div>
      </div>`;
    },
  },
  {
    key: 'dodont', title: "Do and don't",
    build(P, state, def) {
      const e = escapeHtml;
      const col = (kind, list) => `<section class="ab-deck-col" data-kind="${kind}">
          <div class="ab-labelrow"><span class="ab-label">${kind === 'do' ? 'Do' : "Don't"}</span></div>
          <ul class="ab-deck-rules">${list.map(r => `<li class="ab-deck-rule"><span class="ab-deck-mark" aria-hidden="true">${kind === 'do' ? '✓' : '✕'}</span><p>${e(r)}</p></li>`).join('')}</ul>
        </section>`;
      return `<div class="ab-deck-dodont">${col('do', bdRuleLines(def, 'do'))}${col('dont', bdRuleLines(def, 'dont'))}</div>`;
    },
  },
  {
    key: 'closing', title: 'Closing', pattern: true, foot: 'closing',
    build(P, state, def) {
      const e = escapeHtml;
      return `<div class="ab-deck-closing">
        <div class="ab-deck-closemain">
          <div class="ab-brand ab-deck-wordmark">${P.brand}</div>
          <h2 class="ab-headline ab-deck-h" style="--dk-fs:${bdMottoPx(def.motto, 104)}px">${abHeadline(def.motto)}</h2>
          <p class="ab-deck-desc">${e(def.descriptor)}</p>
        </div>
        <div class="ab-deck-contact">
          <p class="ab-label">Questions about the brand</p>
          <p class="ab-deck-mail">hello@${e(bdMailSlug(P.copy.brandName))}.com</p>
        </div>
      </div>`;
    },
  },
];

/* ---------------- markup ---------------- */

function bdSlideHtml(state, def, slide, index, total) {
  const P = abBoardParts(state, def);
  // Container radius for deck panels follows the aesthetic's shape preset.
  P.style += `;--dk-r:${slRadius(state.shapePreset && state.shapePreset.radiusLg, '12px')}`;
  const n = String(index + 1).padStart(2, '0');
  const count = String(total).padStart(2, '0');
  const body = slide.build(P, state, def, P.t);
  const foot = `<footer class="ab-foot ab-slide-foot"><span class="ab-motto"><i class="ab-dot" aria-hidden="true"></i>${escapeHtml(def.name)}</span><span class="ab-infl">${slide.foot === 'closing' ? escapeHtml(def.influences) : `${n} / ${count}`}</span></footer>`;
  return `${P.rootOpen('ab-slide', ` data-slide="${slide.key}"`)}
  ${slide.pattern ? bdPatternHtml(P, slide.key) : ''}
  <div class="ab-in ab-slide-in">
    ${P.head('Brand guidelines / ', slide.title)}
    <div class="ab-rule"></div>
    <div class="ab-slide-body">${body}</div>
    ${foot}
  </div>
</section>`;
}

function bdCardHtml(state, def, slide, index, total) {
  const n = String(index + 1).padStart(2, '0');
  return `<div class="slide-card deck-card" data-slide="${slide.key}">
    <div class="deck-frame" inert>${bdSlideHtml(state, def, slide, index, total)}</div>
    <div class="slide-card-foot">
      <span>${n} · ${escapeHtml(slide.title)}</span>
      <button type="button" class="btn btn-ghost btn-small" data-deck-png="${slide.key}">Download PNG</button>
    </div>
  </div>`;
}

/* ---------------- fitting ---------------- */

// Vertical overflow of a slide's body (the slide root clips, so measure the body).
function bdBodyOverflows(root) {
  const body = root.querySelector('.ab-slide-body');
  return !!body && body.scrollHeight > body.clientHeight + 1;
}

// Principles and Closing headlines scale with the container, so a long tagline
// or an aesthetic with a big display scale can outgrow 720px. Shrink --ab-hs
// (every headline size multiplies it) down to a floor, then let bdScaleToFit
// take over. The cover has its own pass (bdFitCover).
function bdFitHeadline(root) {
  if (!root.dataset.hs0) root.dataset.hs0 = root.style.getPropertyValue('--ab-hs') || '1';
  const base = parseFloat(root.dataset.hs0) || 1;
  let hs = base;
  root.style.setProperty('--ab-hs', String(hs));
  const floor = base * 0.5;
  for (let i = 0; i < 30 && hs > floor && bdBodyOverflows(root); i++) {
    hs *= 0.94;
    root.style.setProperty('--ab-hs', hs.toFixed(3));
  }
}

// Cover: the headline is the statement, so set its size first and fit second.
// Start at min(132px, 11.5cqw) x the aesthetic's display scale (inline
// !important: the aesthetics size their hero headline with their own rules),
// shrink in 4% steps only until the hero copy fits, never below 64px. If the
// slide would still need a scale under 0.85, shrink the art box in 8% steps;
// bdScaleToFit then scales the cover only as a last resort (floor 0.85).
// scrollWidth also counts decoration that bleeds on purpose (a highlight band
// that runs on). True when every line of text sits inside the copy's column,
// so only the decoration overflows.
function bdCopyTextInside(copy) {
  const edge = copy.getBoundingClientRect().right + 1;
  return [...copy.children].every(el => {
    if (el.getBoundingClientRect().width < 4) return true;   // a visually-hidden headline (the art draws it)
    const r = document.createRange();
    r.selectNodeContents(el);
    return [...r.getClientRects()].every(l => l.width < 1 || l.right <= edge);
  });
}

function bdCoverCopyFits(root) {
  const copy = root.querySelector('.ab-hero-copy');
  if (!copy) return true;
  if (copy.scrollWidth > copy.clientWidth + 1 && !bdCopyTextInside(copy)) return false;
  // Scene hero: the copy is laid over the art, so it has to stay inside it.
  const art = root.querySelector('.ab-hero .ab-art');
  if (root.dataset.hero === 'scene' && art) {
    const mb = parseFloat(getComputedStyle(copy).marginBottom) || 0;
    if (copy.offsetHeight + mb > art.offsetHeight - 16) return false;
  }
  return true;
}

// The poster hero parks its art in a corner and pads the hero so the art clears
// the copy. On the cover keep the art clear of the copy's text lines (with an
// 24px air gap) the cheap way first: the smallest bottom padding (8px steps, up
// to the stylesheet's own). If the art sits beside the text instead, narrow
// the copy so its lines wrap short of the art. Returns false when it still collides.
function bdCoverClearArt(root) {
  const hero = root.querySelector('.ab-hero');
  const art = hero && hero.querySelector('.ab-art');
  if (!hero || !art || root.dataset.hero !== 'poster') return true;
  const kids = [...hero.querySelectorAll('.ab-hero-copy > *')];
  const z = root.offsetWidth ? root.getBoundingClientRect().width / root.offsetWidth : 1;   // CSS zoom of the card
  kids.forEach(el => { el.style.maxWidth = ''; });
  hero.style.paddingBottom = '';
  const max = parseFloat(getComputedStyle(hero).paddingBottom) || 0;
  const hits = () => {
    const a = art.getBoundingClientRect();
    return kids.some(el => {
      const r = document.createRange();
      r.selectNodeContents(el);
      return [...r.getClientRects()].some(l => l.width > 1 && l.height > 1 && l.left < a.right - 2 && l.right + 24 * z > a.left && l.top < a.bottom - 2 && l.bottom > a.top + 2);
    });
  };
  const pads = () => {
    for (let pad = 0; pad <= max; pad += 8) {
      hero.style.paddingBottom = pad + 'px';
      if (!hits()) return true;
    }
    hero.style.paddingBottom = '';
    return !hits();
  };
  if (pads()) return true;
  const left = art.getBoundingClientRect().left;
  kids.forEach(el => {
    const w = (left - 24 * z - el.getBoundingClientRect().left) / z;
    if (w > 240) el.style.maxWidth = Math.floor(w) + 'px';
  });
  return pads();
}

// Scale the cover's content would need to fit its body (1 = fits as is).
function bdCoverNeed(root) {
  if (!bdCoverClearArt(root)) return 0;
  const body = root.querySelector('.ab-slide-body');
  const wrap = body && body.firstElementChild;
  if (!wrap) return 1;
  wrap.style.transform = '';
  return wrap.scrollHeight > wrap.clientHeight + 1 ? wrap.clientHeight / wrap.scrollHeight : 1;
}

// A centered hero normally stacks the statement above a wide art stage. On the
// cover the two sit side by side instead (css/brand-deck.css, [data-cover-side]),
// unless the aesthetic lays its copy over the art (same grid cell) or the art is
// tall (it carries the statement): then the art is the page and stays where it is.
function bdCoverSide(root) {
  delete root.dataset.coverSide;
  if (root.dataset.hero !== 'centered') return;
  const copy = root.querySelector('.ab-hero-copy');
  const art = root.querySelector('.ab-hero .ab-art');
  if (!copy || !art) return;
  const c = copy.getBoundingClientRect();
  const a = art.getBoundingClientRect();
  const w = Math.min(c.right, a.right) - Math.max(c.left, a.left);
  const h = Math.min(c.bottom, a.bottom) - Math.max(c.top, a.top);
  const overlap = w > 0 && h > 0 ? (w * h) / Math.max(1, Math.min(c.width * c.height, a.width * a.height)) : 0;
  // Only a wide, short stage (Aurora's window) gives up its row; a tall art is the page.
  if (overlap < 0.2 && art.offsetWidth && art.offsetHeight / art.offsetWidth < 0.6) root.dataset.coverSide = '1';
}

function bdFitCover(root) {
  const hl = root.querySelector('.ab-hero .ab-headline');
  if (!hl) return;
  hl.style.removeProperty('font-size');
  const art0 = root.querySelector('.ab-hero .ab-art');
  if (art0) { art0.style.maxWidth = ''; art0.style.width = ''; }
  delete root.dataset.coverFlat;
  const hero0 = root.querySelector('.ab-hero');
  if (hero0 && getComputedStyle(hero0).display === 'contents') root.dataset.coverFlat = '1';
  bdCoverSide(root);
  const display = parseFloat(root.style.getPropertyValue('--ab-display')) || 1;
  const start = Math.max(BD_COVER_MIN_PX, BD_COVER_START * display);
  let fs = start;
  const setFs = v => hl.style.setProperty('font-size', v.toFixed(1) + 'px', 'important');
  const shrinkTo = floor => {
    for (let i = 0; i < 40 && fs > floor && bdCoverNeed(root) < BD_COVER_MIN_SCALE; i++) {
      fs = Math.max(floor, fs * 0.96);
      setFs(fs);
    }
  };
  setFs(fs);
  // 1. headline: only as far as the copy needs to stay inside its column.
  for (let i = 0; i < 40 && fs > BD_COVER_MIN_PX && !bdCoverCopyFits(root); i++) {
    fs = Math.max(BD_COVER_MIN_PX, fs * 0.96);
    setFs(fs);
  }
  // 2. too tall for the 0.85 floor: shrink the headline, but only down to a
  //    statement size, then the art box in 8% steps (the scene hero's copy
  //    sits inside the art, so there it is left alone), then the headline on to 64px.
  shrinkTo(Math.min(fs, Math.max(BD_COVER_MIN_PX, BD_COVER_SOFT_PX * display)));
  const art = root.querySelector('.ab-hero .ab-art');
  if (art) {
    art.style.maxWidth = '';
    art.style.width = '';
    if (root.dataset.hero !== 'scene') {
      let w = art.offsetWidth;
      const minW = Math.max(96, w * 0.4);
      for (let i = 0; i < 16 && w * 0.92 >= minW && bdCoverNeed(root) < BD_COVER_MIN_SCALE; i++) {
        w *= 0.92;
        art.style.maxWidth = Math.round(w) + 'px';
        if (root.dataset.hero === 'poster') art.style.width = Math.round(w) + 'px';
      }
    }
  }
  shrinkTo(BD_COVER_MIN_PX);
  // 4. An art-led hero (copy in a card on the art, a poster-size stage) that
  //    still needs a scale under 0.85 at the 64px floor: give up the floor
  //    rather than the 0.85 (never below 40px), then let bdScaleToFit scale the rest.
  const fsKeep = fs;
  const needKeep = bdCoverNeed(root);
  shrinkTo(BD_COVER_EMERGENCY_PX);
  if (fs < fsKeep && bdCoverNeed(root) < needKeep + 0.05) { fs = fsKeep; setFs(fs); }   // the headline was not the problem
  root.dataset.coverClear = bdCoverClearArt(root) ? '1' : '0';
  root.dataset.coverFs = fs.toFixed(1);
}

// Last resort for any slide whose body is still taller than its box (a long
// brand name, an aesthetic with heavy chrome): scale the slide's content down
// uniformly. A transform, not zoom, so html2canvas exports it faithfully.
// bdFitCover works to keep the cover at 0.85 or above (headline, then art box);
// only a hero that cannot get there falls through to a lower scale rather than
// clipping. The applied scale is left on the root as data-fit-scale.
function bdScaleToFit(root) {
  const body = root.querySelector('.ab-slide-body');
  const wrap = body && body.firstElementChild;
  if (!wrap) return;
  wrap.style.transform = '';
  wrap.style.transformOrigin = '';
  root.dataset.fitScale = '1';
  const avail = wrap.clientHeight;
  const need = wrap.scrollHeight;
  if (!avail || need <= avail + 1) return;
  const cover = root.dataset.slide === 'cover';
  const s = Math.max(0.4, avail / need);   // never clip
  // A scale this close to 1 saves under 3% (the body's own bottom padding absorbs it) and
  // costs a rendering artifact: background-clip:text with a repeating tile (Y2K Chrome's
  // chrome headline) paints a ghost copy of a word above the first line at a near-1 scale.
  if (s >= 0.97) return;
  wrap.style.transformOrigin = cover ? '50% 0' : '0 0';
  wrap.style.transform = `scale(${s.toFixed(4)})`;
  root.dataset.fitScale = s.toFixed(3);
}

// The Material slide shows the art at its own aspect ratio inside a stage; the
// ratio lives in each aesthetic's CSS, so size the art box from the computed value.
function bdFitStage(root) {
  const stage = root.querySelector('.ab-deck-stage');
  const art = stage && stage.querySelector('.ab-art');
  if (!art) return;
  stage.style.removeProperty('--dk-art-w');
  const ar = getComputedStyle(art).aspectRatio;
  const m = String(ar).match(/([\d.]+)\s*(?:\/\s*([\d.]+))?/);
  const ratio = m ? parseFloat(m[1]) / (m[2] ? parseFloat(m[2]) : 1) : 1;
  const sw = stage.clientWidth;
  const sh = stage.clientHeight;
  if (!sw || !sh || !ratio) return;
  let w = Math.floor(Math.min(sw, sh * ratio));
  stage.style.setProperty('--dk-art-w', w + 'px');
  // Some art hangs parts of itself past its own box (a floating card, a sticker). Those
  // parts count towards the stage's scroll size, so shrink the art until they fit too.
  // Not below 75% of the first size: art that is itself taller than its box (a specimen
  // page set in a tall face) would otherwise collapse into a narrow, word-breaking layout.
  const w0 = w;
  for (let i = 0; i < 5; i++) {
    const over = Math.max(stage.scrollHeight / sh, stage.scrollWidth / sw);
    if (over <= 1.005 || w <= w0 * 0.75) break;
    w = Math.max(Math.floor(w0 * 0.75), Math.floor(w / over * 0.99));
    stage.style.setProperty('--dk-art-w', w + 'px');
  }
}

// One-line type samples (the type scale) shrink until they sit inside their cell.
function bdFitSamples(root) {
  root.querySelectorAll('.ab-deck-scale[data-face="h"] .ab-deck-sample').forEach(el => {
    const fs0 = parseFloat(el.style.getPropertyValue('--dk-fs')) || 32;
    let fs = fs0;
    for (let i = 0; i < 12 && el.scrollWidth > el.clientWidth + 1; i++) {
      fs *= 0.93;
      el.style.setProperty('--dk-fs', fs.toFixed(1) + 'px');
    }
    // The label states the size that is actually shown.
    const note = fs < fs0 && el.closest('.ab-deck-scale').querySelector('.ab-label i');
    if (note) note.textContent = ` · ${Math.round(fs)}px`;
  });
}

// Some aesthetics set the headline colour for the hero's scene (liquid glass is
// white-on-photo). Deck headings sit on the slide canvas: where the inherited
// colour would not read there, fall back to ink. Gradient/clipped text fills
// (transparent) are the aesthetic's own and are left alone.
function bdLegibleHeadings(root) {
  const canvas = root.style.getPropertyValue('--ab-canvas').trim();
  if (!/^#[0-9a-f]{6}$/i.test(canvas)) return;
  root.querySelectorAll('.ab-deck-h, .ab-deck-aa.ab-headline, .ab-deck-sample.ab-headline, .ab-deck-screentitle').forEach(el => {
    el.style.color = '';
    const cs = getComputedStyle(el);
    if (cs.webkitTextFillColor === 'rgba(0, 0, 0, 0)') return;
    const m = cs.color.match(/\d+(\.\d+)?/g);
    if (!m || m.length < 3) return;
    const hex = '#' + m.slice(0, 3).map(n => Math.round(Number(n)).toString(16).padStart(2, '0')).join('');
    const alpha = m.length > 3 ? Number(m[3]) : 1;
    if (alpha < 0.5 || contrastRatio(hex, canvas) < 3) el.style.color = 'var(--ab-ink)';
  });
}

// Nothing on a slide is smaller than 12px (tracked uppercase labels: 11px). The
// aesthetics size their labels for a 900px board (micrographics sets 8px mono on
// purpose); at 1280x720 that is unreadable, so lift any text under the floor.
// Parents are visited before children, so em-based children follow.
const BD_MIN_TEXT = 12;
function bdMinText(root, floor) {
  // `floor` (the 12px floor divided by the fit scale) applies inside the scaled wrapper only.
  const body = root.querySelector('.ab-slide-body');
  const wrap = body && body.firstElementChild;
  root.querySelectorAll('.ab-slide-in *').forEach(el => {
    const min = floor && wrap && wrap.contains(el) ? floor : BD_MIN_TEXT;
    if (el.closest('[aria-hidden="true"], .ab-deck-pattern, svg') || el.tagName === 'INPUT') return;
    if (![...el.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim())) return;
    el.style.removeProperty('font-size');
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    if (parseFloat(cs.fontSize) < min) el.style.setProperty('font-size', min.toFixed(2) + 'px', 'important');
  });
}

// A brand name that is one very long word cannot wrap: shrink it until it fits (floor 12px).
function bdFitBrandName(root) {
  root.querySelectorAll('.ab-wordmark').forEach(el => {
    el.style.removeProperty('font-size');
    let fs = parseFloat(getComputedStyle(el).fontSize) || 16;
    for (let i = 0; i < 24 && fs > 12 && el.scrollWidth > el.clientWidth + 1; i++) {
      fs = Math.max(12, fs * 0.94);
      el.style.setProperty('font-size', fs.toFixed(1) + 'px', 'important');
    }
  });
}

function bdFitDeck(grid) {
  grid.querySelectorAll('.ab-slide').forEach(root => {
    const key = root.dataset.slide;
    bdLegibleHeadings(root);
    bdMinText(root);
    bdFitBrandName(root);
    if (key === 'typography') bdFitSamples(root);
    if (key === 'cover') bdFitCover(root);
    else if (key === 'principles' || key === 'closing') bdFitHeadline(root);
    if (key === 'material') bdFitStage(root);
    bdScaleToFit(root);
    // A slide that still had to scale down shrinks its small text with it: lift the
    // text inside the scaled wrapper once so it reads at 12px after the scale (one
    // step, not a loop: bigger text asks for a smaller scale), and fit again.
    const sc = parseFloat(root.dataset.fitScale) || 1;
    if (sc < 0.97) {
      bdMinText(root, BD_MIN_TEXT / sc);
      bdScaleToFit(root);
    }
    bdBleedBands(root);
  });
}

// A highlight band that runs on (Raw Brutalist) is drawn as a pseudo-element
// sized by --ab-hl-bleed: the distance from the highlight's right edge to the
// slide content's (the fitted wrapper), in the content's own (unzoomed, unscaled) px. The board's fixed
// 100cqw would run past the slide's column and overflow it.
function bdBleedBands(root) {
  const bands = root.querySelectorAll('.ab-hl');
  const body = root.querySelector('.ab-slide-body');
  const wrap = body && body.firstElementChild;
  if (!bands.length || !wrap) return;
  const rr = wrap.getBoundingClientRect();
  const zoom = root.offsetWidth ? root.getBoundingClientRect().width / root.offsetWidth : 1;
  const s = parseFloat(root.dataset.fitScale) || 1;
  bands.forEach(el => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--ab-hl-bleed', Math.max(0, (rr.right - r.right) / (zoom * s)).toFixed(1) + 'px');
  });
}

/* ---------------- render (deferred) ---------------- */

let bdDirty = true;
let bdVisible = false;
let bdTimer = null;
let bdObserver = null;
let bdBuilt = false;

function bdZoomCards(grid) {
  grid.querySelectorAll('.deck-card').forEach(card => {
    const frame = card.querySelector('.deck-frame');
    const w = card.clientWidth;
    if (frame && w) frame.style.zoom = (w / DECK_W).toFixed(4);
  });
}

// Build every slide now (synchronously). Normally called from the idle callback.
function renderBrandDeckNow() {
  const grid = document.getElementById('deckGrid');
  if (!grid) return;
  bdDirty = false;
  const def = aestheticByKey(state.aesthetic);
  setBoardFonts(grid);
  const s = Object.assign({}, state, { content: effectiveContent() });
  const slides = DECK_SLIDES;
  grid.innerHTML = slides.map((slide, i) => bdCardHtml(s, def, slide, i, slides.length)).join('');
  bdBuilt = true;
  bdZoomCards(grid);
  bdFitDeck(grid);
  const desc = document.getElementById('deckDesc');
  if (desc) desc.textContent = `${numberWord(slides.length)} guideline slides in the ${def.name} language.`;
}

function numberWord(n) {
  return ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'][n] || String(n);
}

// Trailing delay before a rebuild. A color drag fires render() every few ms and
// each rebuild re-renders ~9 pattern images, so wait until the edit settles.
const BD_REBUILD_DELAY_MS = 400;
function bdSchedule() {
  clearTimeout(bdTimer);
  bdTimer = setTimeout(() => {
    const run = () => { if (bdDirty && bdVisible) renderBrandDeckNow(); };
    if (window.requestIdleCallback) requestIdleCallback(run, { timeout: 400 }); else run();
  }, BD_REBUILD_DELAY_MS);
}

// Called from render(): marks the deck stale and rebuilds it when the Brand deck
// section is near the viewport (or on the next visibility change). Cheap when off-screen.
function renderBrandDeck() {
  bdDirty = true;
  if (bdVisible) bdSchedule();
}

function initBrandDeck() {
  const section = document.getElementById('deckSection');
  const grid = document.getElementById('deckGrid');
  if (!section || !grid) return;
  if ('IntersectionObserver' in window) {
    bdObserver = new IntersectionObserver(entries => {
      bdVisible = entries.some(en => en.isIntersecting);
      if (bdVisible && bdDirty) bdSchedule();
    }, { rootMargin: '600px 0px' });
    bdObserver.observe(section);
  } else {
    bdVisible = true;
    bdSchedule();
  }
  if (window.ResizeObserver) new ResizeObserver(() => bdZoomCards(grid)).observe(grid);
  // Webfonts arrive after the first build: re-fit once they have.
  if (document.fonts && document.fonts.addEventListener) {
    document.fonts.addEventListener('loadingdone', () => { if (bdBuilt) bdFitDeck(grid); });
  }
  grid.addEventListener('click', async e => {
    const btn = e.target.closest('[data-deck-png]');
    if (!btn) return;
    btn.disabled = true;
    try {
      await downloadDeckSlidePng(btn.dataset.deckPng);
      if (typeof showToast === 'function') showToast('PNG downloaded');
    } catch (err) {
      if (typeof showToast === 'function') showToast('PNG export failed');
    } finally {
      btn.disabled = false;
    }
  });
  wireDeckButton('downloadAllSlides', 'Downloading…', async () => {
    for (let i = 0; i < DECK_SLIDES.length; i++) {
      await downloadDeckSlidePng(DECK_SLIDES[i].key);
      await new Promise(r => setTimeout(r, 300));
    }
    if (typeof showToast === 'function') showToast('All slide PNGs downloaded');
  }, 'PNG export failed');
  wireDeckButton('downloadDeckPdf', 'Building PDF…', async () => {
    const pdf = await buildBrandDeckPdf();
    pdf.save(`${brandFileSlug()}-brand-deck.pdf`);
    if (typeof showToast === 'function') showToast('Deck PDF downloaded');
  }, 'PDF export failed');
}

function wireDeckButton(id, busyText, action, failText) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    const label = btn.textContent;
    btn.textContent = busyText;
    try {
      await action();
    } catch (err) {
      if (typeof showToast === 'function') showToast(failText);
    } finally {
      btn.textContent = label;
      btn.disabled = false;
    }
  });
}

/* ---------------- export ---------------- */

// Rasterize one slide from an off-screen 1280x720 clone (not the zoomed card),
// so the output is exact regardless of the grid cell size. Returns the canvas.
async function rasterizeDeckSlide(key, scale) {
  if (bdDirty || !bdBuilt) renderBrandDeckNow();
  const live = document.querySelector(`#deckGrid .ab-slide[data-slide="${key}"]`);
  if (!live) throw new Error('Slide not found: ' + key);
  const host = document.createElement('div');
  host.className = 'deck-export-host';
  const clone = live.cloneNode(true);
  host.appendChild(clone);
  document.body.appendChild(host);
  try {
    if (document.fonts && document.fonts.ready) {
      try { await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]); } catch (err) { /* proceed */ }
    }
    await new Promise(r => setTimeout(r, 50));
    return await html2canvas(clone, {
      // Opaque slide canvas: a transparent background occasionally left see-through
      // corner pixels, which the PDF's JPEG pages turn black.
      scale: scale || 2, backgroundColor: getComputedStyle(clone).getPropertyValue('--ab-canvas').trim() || '#ffffff', useCORS: true,
      width: DECK_W, height: DECK_H, windowWidth: DECK_W, windowHeight: DECK_H, scrollX: 0, scrollY: 0,
      onclone: (doc, el) => bdSanitizeClone(doc, el),
    });
  } finally {
    host.remove();
  }
}

// html2canvas 1.4.1 throws on `color(srgb r g b / a)`, which is how the browser
// reports a color-mix(in srgb, ...) result (the aesthetics use it for hairlines
// and tints). In the clone it renders from, rewrite those values to rgba(): inline
// for the element itself, through a generated rule for ::before / ::after.
const BD_COLOR_PROPS = ['color', 'background-color', 'background-image', 'border-top-color', 'border-right-color',
  'border-bottom-color', 'border-left-color', 'outline-color', 'box-shadow', 'text-shadow', 'text-decoration-color',
  'caret-color', 'column-rule-color', 'filter', '-webkit-text-fill-color', '-webkit-text-stroke-color', 'fill', 'stroke'];

function bdSrgbToRgba(value) {
  return value.replace(/color\(srgb\s+([\d.e+-]+)\s+([\d.e+-]+)\s+([\d.e+-]+)(?:\s*\/\s*([\d.e+-]+%?))?\s*\)/g, (m, r, g, b, a) => {
    const c = x => Math.max(0, Math.min(255, Math.round(parseFloat(x) * 255)));
    const alpha = a == null ? 1 : (String(a).endsWith('%') ? parseFloat(a) / 100 : parseFloat(a));
    return `rgba(${c(r)}, ${c(g)}, ${c(b)}, ${Math.round(alpha * 1000) / 1000})`;
  });
}

// html2canvas also throws on pseudo-elements of <input> (the switch's knob is
// .ab-switch::before). In the clone, swap each checkbox for a plain span that
// carries the input's computed styles, with its ::before / ::after as real child
// spans, so the knob is drawn and the parser never sees an input pseudo.
function bdFlattenSwitches(doc, root) {
  const win = doc.defaultView;
  const copy = (target, cs) => {
    for (let i = 0; i < cs.length; i++) target.style.setProperty(cs[i], cs.getPropertyValue(cs[i]));
  };
  root.querySelectorAll('input[type="checkbox"]').forEach(input => {
    const span = doc.createElement('span');
    copy(span, win.getComputedStyle(input));
    span.style.display = 'block';
    ['::before', '::after'].forEach(pseudo => {
      const cs = win.getComputedStyle(input, pseudo);
      if (!cs.content || cs.content === 'none' || cs.content === 'normal' || cs.display === 'none') return;
      const kid = doc.createElement('span');
      copy(kid, cs);
      kid.style.content = 'none';
      span.appendChild(kid);
    });
    input.replaceWith(span);
  });
}

// Split a CSS list on its top-level commas (not the ones inside rgb(), url(), ...).
function bdSplitList(value) {
  const out = [];
  let depth = 0;
  let cur = '';
  let quote = '';
  for (const ch of value) {
    if (quote) { if (ch === quote) quote = ''; cur += ch; continue; }
    if (ch === '"' || ch === "'") { quote = ch; cur += ch; continue; }
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

// CSS repeats a shorter background-size / position / repeat list to cover every
// image layer; html2canvas indexes the lists directly and crashes. Expand them.
const BD_LAYER_PROPS = ['background-size', 'background-position', 'background-repeat', 'background-origin', 'background-clip'];
function bdLayerFixes(cs) {
  const fixes = [];
  const imgs = cs.getPropertyValue('background-image');
  if (!imgs || imgs === 'none') return fixes;
  const n = bdSplitList(imgs).length;
  if (n < 2) return fixes;
  BD_LAYER_PROPS.forEach(prop => {
    const list = bdSplitList(cs.getPropertyValue(prop));
    if (list.length && list.length < n) {
      fixes.push([prop, Array.from({ length: n }, (_, i) => list[i % list.length]).join(', ')]);
    }
  });
  return fixes;
}

// html2canvas cannot parse calc() inside background-position / -size (it crashes
// reading the token). Resolve them to px against the element's padding box,
// following the spec: a percentage position is of (box - image size).
function bdPx(token, box, img, isPos) {
  const t = token.trim();
  const m = t.match(/^calc\(\s*(-?[\d.]+)%\s*([+-])\s*([\d.]+)px\s*\)$/);
  if (m) return (parseFloat(m[1]) / 100) * (isPos ? box - img : box) + (m[2] === '-' ? -1 : 1) * parseFloat(m[3]);
  if (t.endsWith('%')) return (parseFloat(t) / 100) * (isPos ? box - img : box);
  const px = parseFloat(t);
  return isNaN(px) ? (isPos ? 0 : box) : px;
}

function bdCalcFixes(cs) {
  const pos = cs.getPropertyValue('background-position');
  const size = cs.getPropertyValue('background-size');
  if (pos.indexOf('calc(') < 0 && size.indexOf('calc(') < 0) return [];
  const bw = parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
  const bh = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
  let w = parseFloat(cs.width) || 0;
  let h = parseFloat(cs.height) || 0;
  if (cs.boxSizing !== 'border-box') { w += parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + bw; h += parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) + bh; }
  w -= bw; h -= bh;   // padding box
  const sizes = bdSplitList(size).map(entry => {
    const parts = entry.split(/\s+(?![^(]*\))/);
    const sw = parts[0] === 'auto' ? w : bdPx(parts[0], w, w, false);
    const sh = (parts[1] || 'auto') === 'auto' ? h : bdPx(parts[1], h, h, false);
    return [sw, sh];
  });
  const positions = bdSplitList(pos).map((entry, i) => {
    const parts = entry.split(/\s+(?![^(]*\))/);
    const [sw, sh] = sizes[i % sizes.length] || [w, h];
    return `${Math.round(bdPx(parts[0], w, sw, true) * 100) / 100}px ${Math.round(bdPx(parts[1] || '0px', h, sh, true) * 100) / 100}px`;
  });
  const out = [['background-position', positions.join(', ')]];
  if (size.indexOf('calc(') >= 0) out.push(['background-size', sizes.map(([sw, sh]) => `${sw}px ${sh}px`).join(', ')]);
  return out;
}

// Gradient-filled text (background-clip: text with a transparent fill) renders
// as a solid gradient box in html2canvas. Give it a plain fill instead: its own
// colour when that reads on the slide canvas, else ink.
function bdFlattenClippedText(doc, root) {
  const win = doc.defaultView;
  const canvas = (root.style.getPropertyValue('--ab-canvas') || '').trim();
  const ink = (root.style.getPropertyValue('--ab-ink') || '').trim() || '#000000';
  [root, ...root.querySelectorAll('*')].forEach(el => {
    const cs = win.getComputedStyle(el);
    const clip = cs.getPropertyValue('background-clip') + ' ' + cs.getPropertyValue('-webkit-background-clip');
    if (clip.indexOf('text') < 0) return;
    let solid = ink;
    const m = cs.color.match(/\d+(\.\d+)?/g);
    if (m && m.length >= 3 && (m.length < 4 || Number(m[3]) > 0.5)) {
      const hex = '#' + m.slice(0, 3).map(n => Math.round(Number(n)).toString(16).padStart(2, '0')).join('');
      if (!/^#[0-9a-f]{6}$/i.test(canvas) || contrastRatio(hex, canvas) >= 3) solid = hex;
    }
    el.style.setProperty('background-image', 'none', 'important');
    el.style.setProperty('-webkit-text-fill-color', solid, 'important');
    el.style.setProperty('color', solid, 'important');
  });
}

// A scene hero (Liquid Glass) lays its copy over the art in the same grid cell,
// and the browser paints the copy on top. html2canvas orders the positioned art
// above a static sibling, so the copy vanished from the PNG/PDF. In the clone,
// lift the copy above the art and drop the text-shadow glow (a blur it cannot
// draw: it comes out as a grey smear on the white text).
function bdLiftSceneCopy(doc, root) {
  if (root.dataset.hero !== 'scene') return;
  root.querySelectorAll('.ab-hero-copy').forEach(copy => {
    copy.style.setProperty('position', 'relative', 'important');
    copy.style.setProperty('z-index', '5', 'important');
    copy.style.setProperty('text-shadow', 'none', 'important');
    copy.querySelectorAll('*').forEach(el => el.style.setProperty('text-shadow', 'none', 'important'));
  });
}

// html2canvas draws a blurred box-shadow with a negative spread (the soft "lifted tile"
// shadows) as a grey rectangle that ignores the border radius. In the clone, drop those
// layers: a flat tile exports cleanly, a square grey halo does not.
function bdShadowFixes(cs) {
  const bs = cs.getPropertyValue('box-shadow');
  if (!bs || bs === 'none') return [];
  const layers = bdSplitList(bs);
  const keep = layers.filter(layer => {
    const nums = layer.replace(/(?:rgba?|color)\([^)]*\)/g, ' ').match(/-?[\d.]+px/g) || [];
    return !(nums.length >= 4 && parseFloat(nums[3]) < 0 && parseFloat(nums[2]) > 0);
  });
  return keep.length === layers.length ? [] : [['box-shadow', keep.length ? bdSrgbToRgba(keep.join(', ')) : 'none']];
}

function bdSanitizeClone(doc, root) {
  const win = doc.defaultView;
  if (!win) return;
  bdLiftSceneCopy(doc, root);
  bdFlattenSwitches(doc, root);
  bdFlattenClippedText(doc, root);
  const rules = [];
  let n = 0;
  [root, ...root.querySelectorAll('*')].forEach(el => {
    [null, '::before', '::after'].forEach(pseudo => {
      const cs = win.getComputedStyle(el, pseudo);
      const fixes = [];
      BD_COLOR_PROPS.forEach(prop => {
        const v = cs.getPropertyValue(prop);
        if (v && v.indexOf('color(') >= 0) fixes.push([prop, bdSrgbToRgba(v)]);
      });
      bdShadowFixes(cs).forEach(f => { const at = fixes.findIndex(x => x[0] === f[0]); if (at >= 0) fixes.splice(at, 1); fixes.push(f); });
      bdLayerFixes(cs).forEach(f => fixes.push(f));
      bdCalcFixes(cs).forEach(f => fixes.push(f));
      if (!fixes.length) return;
      if (!pseudo) {
        fixes.forEach(([prop, v]) => el.style.setProperty(prop, v, 'important'));
      } else {
        const id = el.getAttribute('data-bdx') || 'x' + (++n);
        el.setAttribute('data-bdx', id);
        rules.push(`[data-bdx="${id}"]${pseudo}{${fixes.map(([prop, v]) => `${prop}:${v} !important`).join(';')}}`);
      }
    });
  });
  if (rules.length) {
    const st = doc.createElement('style');
    st.textContent = rules.join('\n');
    doc.head.appendChild(st);
  }
}

function bdSaveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function downloadDeckSlidePng(key) {
  const idx = DECK_SLIDES.findIndex(s => s.key === key);
  const canvas = await rasterizeDeckSlide(key, 2);
  const name = `${brandFileSlug()}-${String(idx + 1).padStart(2, '0')}-${key}.png`;
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) return reject(new Error('toBlob failed'));
      bdSaveBlob(blob, name);
      resolve();
    });
  });
}

// jsPDF document, landscape 1280x720 px pages, one JPEG per slide. Returned
// unsaved so callers can inspect it; the Download PDF button saves it.
async function buildBrandDeckPdf(scale) {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [DECK_W, DECK_H], hotfixes: ['px_scaling'] });
  for (let i = 0; i < DECK_SLIDES.length; i++) {
    const canvas = await rasterizeDeckSlide(DECK_SLIDES[i].key, scale || 2);
    if (i > 0) pdf.addPage([DECK_W, DECK_H], 'landscape');
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, DECK_W, DECK_H);
  }
  return pdf;
}

document.addEventListener('DOMContentLoaded', initBrandDeck);
