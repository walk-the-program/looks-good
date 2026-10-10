/* ---------------------------------------------------------------------
   aesthetic-board.js — the "Design language board".

   One function (boardHtml) builds the board for a (state, aesthetic) pair,
   so the main board and every Compare-all tile come from the same markup.
   Aesthetic files (js/aesthetics/<key>.js) only contribute art, extra
   CSS variables and descriptors; their look lives in css/aesthetics/.

   Depends on color.js / slide-mocks.js (slMix, slVisible) and app.js
   (state, effectiveContent, escapeHtml, chooseAesthetic, ...), all called at
   render time, so load order only needs this file before app.js.
   Plain <script>, no modules.
------------------------------------------------------------------------ */

/* ---------------- tokens ---------------- */

function abAlpha(hex, a) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

// Derived colors are computed here and nowhere else (the AI brief prints
// these exact hexes). `def.canvas(base)` may return an adjusted canvas hex
// (e.g. Soft Form lifts very dark canvases); everything derives from that.
function boardTokens(state, def) {
  const c = state.colors;
  const isDark = state.bgMode === 'dark';
  let canvas = isDark ? c.neutralDark : c.neutralLight;
  const ink = isDark ? c.neutralLight : c.neutralDark;
  if (def && typeof def.canvas === 'function') {
    const adjusted = def.canvas({
      canvas, ink, isDark, primary: c.primary, secondary: c.secondary, accent: c.accent,
      mix: slMix, hexToHsl, hslToHex,
    });
    if (adjusted) canvas = adjusted;
  }
  // muted = ink moved 40% toward canvas, then pulled back toward ink until
  // small labels stay readable (>= 4.5:1).
  let toward = 0.4;
  let muted = slMix(canvas, ink, toward);
  while (toward > 0.05 && contrastRatio(muted, canvas) < 4.5) {
    toward -= 0.05;
    muted = slMix(canvas, ink, toward);
  }
  const t = {
    canvas, ink, muted,
    line: slMix(canvas, ink, 0.85),
    primary: c.primary, onPrimary: pickReadableText(c.primary),
    secondary: c.secondary, onSecondary: pickReadableText(c.secondary),
    accent: c.accent, onAccent: pickReadableText(c.accent),
    priTint: slMix(c.primary, canvas, 0.12),
    secTint: slMix(c.secondary, canvas, 0.16),
    isDark,
    // Legible-as-text versions of the two hue colors (accent falls back to
    // primary, then ink, when it would vanish on the canvas).
    accentText: slVisible(canvas, [c.accent, c.primary], 3, ink),
    primaryText: slVisible(canvas, [c.primary], 3, ink),
    // true when the accent itself is under 3:1 on the canvas: .ab-hl then gets
    // a marker treatment (ink text on an accent band) instead of accent text.
    accentLow: contrastRatio(c.accent, canvas) < 3,
    mix: slMix,
    alpha: abAlpha,
    contrast: contrastRatio,
    readable: pickReadableText,
  };
  return t;
}

function boardRoles(state, def) {
  const forDef = Object.assign({}, state, { aesthetic: def.key });
  if (typeof colorRolesFor === 'function') return colorRolesFor(forDef);
  // Minimal fallback built from the plan's universal roles table; replaced by
  // js/color-roles.js when that file is loaded.
  const base = {
    canvas: { label: 'Canvas', job: 'Page & panels', coverage: '60–70%' },
    ink: { label: 'Ink', job: 'Text & lines', coverage: '15–20%' },
    primary: { label: 'Primary', job: 'Main action', coverage: '≈10%' },
    secondary: { label: 'Secondary', job: 'Tags & support', coverage: '≈10–15%' },
    accent: { label: 'Accent', job: 'One spark', coverage: '≤5%' },
  };
  const over = def.roles || {};
  const out = {};
  Object.keys(base).forEach(k => { out[k] = Object.assign({}, base[k], over[k]); });
  return out;
}

function abInitial(name) {
  const ch = Array.from(String(name || '').trim().replace(/^[^\p{L}\p{N}]+/u, ''))[0];
  return (ch || '·').toUpperCase();
}

// Brand tagline as headline HTML with the last word wrapped in .ab-hl.
function abHeadline(tagline) {
  const text = String(tagline || '').trim();
  const m = text.match(/^([\s\S]*?)([^\s]+?)([.,;:!?…]*)$/);
  if (!m) return escapeHtml(text);
  return `${escapeHtml(m[1])}<span class="ab-hl">${escapeHtml(m[2])}</span>${escapeHtml(m[3])}`;
}

function abHeadlineScale(tagline) {
  const n = String(tagline || '').trim().length;
  return n <= 22 ? 1 : n <= 40 ? 0.86 : n <= 60 ? 0.72 : 0.6;
}

function boardVars(t, state, def, tagline) {
  const ty = state.typography || {};
  const hs = Math.min(1.25, Math.max(0.8, (ty.headingSize || 44) / 44));
  const vars = {
    '--ab-canvas': t.canvas, '--ab-ink': t.ink, '--ab-muted': t.muted, '--ab-line': t.line,
    '--ab-primary': t.primary, '--ab-on-primary': t.onPrimary,
    '--ab-secondary': t.secondary, '--ab-on-secondary': t.onSecondary,
    '--ab-accent': t.accent, '--ab-on-accent': t.onAccent,
    '--ab-pri-tint': t.priTint, '--ab-sec-tint': t.secTint,
    '--ab-accent-text': t.accentText, '--ab-primary-text': t.primaryText,
    '--ab-font-h': `var(--font-heading, ${state.headingFont.css})`,
    '--ab-font-b': `var(--font-body, ${state.bodyFont.css})`,
    '--ab-hl-scale': abHeadlineScale(tagline),
    '--ab-hs': hs,
  };
  if (typeof def.tokens === 'function') Object.assign(vars, def.tokens(t));
  return vars;
}

/* ---------------- shared art helper ---------------- */

// Simulated refraction (not real optics): a lens that holds a clipped,
// slightly scaled and offset duplicate of the scene beneath it. Coordinates
// are percentages of the art box. Blur alone is not refraction, so glass
// aesthetics pair this with their backdrop-filter.
function abLens(sceneHtml, o) {
  const ox = o.x + o.w / 2;
  const oy = o.y + o.h / 2;
  const sceneStyle = `left:${(-o.x / o.w) * 100}%;top:${(-o.y / o.h) * 100}%;`
    + `width:${(100 / o.w) * 100}%;height:${(100 / o.h) * 100}%;`
    + `transform-origin:${ox}% ${oy}%;`
    + `transform:translate(${o.dx || 0}%,${o.dy || 0}%) scale(${o.scale || 1.15})`;
  return `<div class="ab-lens ${o.cls || ''}" style="left:${o.x}%;top:${o.y}%;width:${o.w}%;height:${o.h}%">`
    + `<div class="ab-lens-scene" style="${sceneStyle}">${sceneHtml}</div></div>`;
}

/* ---------------- markup ---------------- */

const AB_STAGES = {
  Design: ['Your next good idea.', 'A little structure. Room to play.'],
  Build: ['Give it shape.', 'Details that feel good to use.'],
  Launch: ['Ready for the world.', 'Make the first impression count.'],
};
const AB_ROWS = [
  ['Brand refresh', 'In review', 72],
  ['Launch site', 'Building', 45],
  ['Spring campaign', 'Planned', 10],
];
const AB_ROLE_ORDER = ['canvas', 'ink', 'primary', 'secondary', 'accent'];

let abSeq = 0;

function boardHtml(state, def) {
  const t = boardTokens(state, def);
  const copy = effectiveContent();
  const ctx = {
    t, key: def.key, state,
    brandName: copy.brandName, tagline: copy.tagline,
    initial: abInitial(copy.brandName), logoDataUrl: state.logoDataUrl,
  };
  const roles = boardRoles(state, def);
  const vars = boardVars(t, state, def, copy.tagline);
  const style = Object.entries(vars).map(([k, v]) => `${k}:${String(v).replace(/"/g, "'")}`).join(';');
  const uid = 'ab' + (++abSeq);
  const labels = def.labels || { material: 'Touch & depth', states: ['One', 'Two', 'Three'] };
  const e = escapeHtml;

  const brand = state.logoDataUrl
    ? `<img class="ab-logo" src="${state.logoDataUrl}" alt="${e(copy.brandName)}" />`
    : `<span class="ab-mark" aria-hidden="true"><span>${e(ctx.initial)}</span></span><span class="ab-wordmark">${e(copy.brandName)}</span>`;

  const swatches = AB_ROLE_ORDER.map(k => {
    const r = roles[k] || {};
    const hex = t[k];
    return `<div class="ab-swatch" data-role="${k}">
      <span class="ab-chip" style="background:${hex}"></span>
      <b class="ab-sw-role">${e(r.label || k)}</b>
      <span class="ab-sw-job">${e(r.job || '')}${r.coverage ? ' · ' + e(r.coverage) : ''}</span>
      <code class="ab-sw-hex">${hex.toUpperCase()}</code>
    </div>`;
  }).join('');

  const stage = AB_STAGES.Design;
  const segs = Object.keys(AB_STAGES).map((s, i) =>
    `<button type="button" class="ab-seg-btn" aria-pressed="${i === 0}" data-stage="${s}">${s}</button>`).join('');

  const states = (labels.states || []).map((s, i) =>
    `<div class="ab-state"><span class="ab-disc" data-s="${i}"></span><span class="ab-state-name">${e(s)}</span></div>`).join('');

  const rows = AB_ROWS.map((r, i) => `<li class="ab-row">
      <span class="ab-row-n">${String(i + 1).padStart(2, '0')}</span>
      <span class="ab-av" aria-hidden="true">${e(r[0][0])}</span>
      <span class="ab-row-name">${e(r[0])}</span>
      <span class="ab-row-status">${e(r[1])}</span>
      <span class="ab-row-bar" aria-hidden="true"><i style="width:${r[2]}%"></i></span>
      <span class="ab-row-pct">${r[2]}%</span>
    </li>`).join('');

  return `<section class="ab" data-ae="${def.key}" data-mode="${t.isDark ? 'dark' : 'light'}" data-accent-text="${t.accentLow ? 'low' : 'ok'}" style="${style}">
  <div class="ab-in">
    <header class="ab-head">
      <div class="ab-brand">${brand}</div>
      <span class="ab-tag">Design language / <b>${e(def.name)}</b></span>
    </header>
    <div class="ab-rule"></div>
    <section class="ab-hero">
      <div class="ab-hero-copy">
        <p class="ab-kicker">${e(def.kicker || def.descriptor)}</p>
        <h2 class="ab-headline">${abHeadline(copy.tagline)}</h2>
      </div>
      <div class="ab-art" aria-hidden="true">${def.art ? def.art(ctx) : ''}</div>
    </section>
    <div class="ab-rule"></div>
    <section class="ab-palette" aria-label="Palette">
      <div class="ab-labelrow"><span class="ab-label">The palette</span><span class="ab-label">${e(def.descriptor)}</span></div>
      <div class="ab-swatches">${swatches}</div>
    </section>
    <div class="ab-rule"></div>
    <div class="ab-sections">
      <section class="ab-sec ab-sec-ui" aria-label="Interface">
        <div class="ab-labelrow"><span class="ab-label"><i class="ab-n">01</i><span>Interface</span></span></div>
        <div class="ab-card">
          <div class="ab-seg" role="group" aria-label="Project stage">${segs}</div>
          <h3 class="ab-card-title" data-ab-title>${e(stage[0])}</h3>
          <p class="ab-card-body" data-ab-body>${e(stage[1])}</p>
          <button type="button" class="ab-cta"><span class="ab-cta-label">Save direction</span><span class="ab-cta-arrow" aria-hidden="true"></span></button>
        </div>
      </section>
      <section class="ab-sec ab-sec-touch" aria-label="${e(labels.material)}">
        <div class="ab-labelrow"><span class="ab-label"><i class="ab-n">02</i><span>${e(labels.material)}</span></span></div>
        <div class="ab-panel">
          <label class="ab-fieldlabel" for="${uid}-f">Project name</label>
          <input class="ab-input" id="${uid}-f" type="text" value="Something good" maxlength="48" autocomplete="off" />
          <label class="ab-toggle" for="${uid}-t"><span>Focus mode</span><input class="ab-switch" id="${uid}-t" type="checkbox" checked /></label>
          <div class="ab-status" aria-live="polite">Focus mode on</div>
          <div class="ab-states">${states}</div>
        </div>
      </section>
      <section class="ab-sec ab-sec-use" aria-label="In use">
        <div class="ab-labelrow"><span class="ab-label"><i class="ab-n">03</i><span>In use</span></span></div>
        <ul class="ab-list">${rows}</ul>
      </section>
    </div>
    <footer class="ab-foot"><span class="ab-motto"><i class="ab-dot" aria-hidden="true"></i>${e(def.motto)}</span><span class="ab-infl">${e(def.influences)}</span></footer>
  </div>
</section>`;
}

/* ---------------- main board + compare grid ---------------- */

let boardView = 'board';          // 'board' | 'compare' (UI only, never saved)
const CMP_WIDE = 900;             // design width of a tile board on a wide grid
const CMP_NARROW = 500;           // ...and on a one-column grid

function setBoardFonts(el) {
  el.style.setProperty('--font-heading', state.headingFont.css);
  el.style.setProperty('--font-body', state.bodyFont.css);
}

function renderMainBoard() {
  const host = document.getElementById('previewCard');
  if (!host) return;
  setBoardFonts(host);
  host.innerHTML = boardHtml(state, aestheticByKey(state.aesthetic));
}

// Each tile previews its aesthetic in its own recommended mode (def.mode), the
// mode selecting it would switch to, via a per-tile state clone; the global
// state and the main board keep the brand's actual bgMode.
function renderCompareGrid() {
  const grid = document.getElementById('compareGrid');
  if (!grid) return;
  setBoardFonts(grid);
  grid.innerHTML = AESTHETICS.map(def => `
    <div class="cmp-tile${def.key === state.aesthetic ? ' is-current' : ''}" role="button" tabindex="0"
         data-key="${def.key}" aria-label="Use ${escapeHtml(def.name)}" aria-pressed="${def.key === state.aesthetic}">
      <div class="cmp-label"><span class="cmp-num">${String(def.order).padStart(2, '0')}</span><span class="cmp-name">${escapeHtml(def.name)}</span><span class="cmp-desc">${escapeHtml(def.descriptor)}</span></div>
      <div class="cmp-frame"><div class="cmp-board" inert>${boardHtml(Object.assign({}, state, { bgMode: def.mode }), def)}</div></div>
    </div>`).join('');
  fitCompareGrid();
}

// Tiles show the real board at a fixed design width, shrunk with CSS zoom so
// the container queries inside still see the layout width they were drawn for.
function fitCompareGrid() {
  const grid = document.getElementById('compareGrid');
  const first = grid && grid.querySelector('.cmp-frame');
  if (!first) return;
  const w = first.clientWidth;
  if (!w) return;
  const design = w >= 380 ? CMP_WIDE : CMP_NARROW;
  grid.style.setProperty('--cmp-w', design + 'px');
  grid.style.setProperty('--cmp-zoom', (w / design).toFixed(4));
}

function renderAestheticBoard() {
  const def = aestheticByKey(state.aesthetic);
  const compare = boardView === 'compare';
  const host = document.getElementById('previewCard');
  const grid = document.getElementById('compareGrid');
  if (host) host.hidden = compare;
  if (grid) grid.hidden = !compare;
  if (compare) renderCompareGrid(); else renderMainBoard();
  syncAestheticChrome(def);
}

/* ---------------- header + sidebar panel ---------------- */

function syncAestheticChrome(def) {
  const name = document.getElementById('aeName');
  if (name) name.textContent = def.name;
  const desc = document.getElementById('aeDesc');
  if (desc) desc.textContent = def.descriptor;
  const sum = document.getElementById('aeSummary');
  if (sum) sum.textContent = def.summary || '';
  document.querySelectorAll('#aeList .ae-tile').forEach(b => {
    b.setAttribute('aria-pressed', String(b.dataset.key === def.key));
  });
  document.querySelectorAll('input[name="boardView"]').forEach(r => { r.checked = r.value === boardView; });
}

function buildAestheticList() {
  const list = document.getElementById('aeList');
  if (!list) return;
  list.innerHTML = AESTHETICS.map(def => `
    <button type="button" class="ae-tile" data-key="${def.key}" aria-pressed="false" title="${escapeHtml(def.summary || def.name)}">
      <span class="ae-motif" data-motif="${def.key}" aria-hidden="true"></span>
      <span class="ae-num">${String(def.order).padStart(2, '0')}</span>
      <span class="ae-name">${escapeHtml(def.name)}</span>
      <span class="ae-desc">${escapeHtml(def.descriptor)}</span>
    </button>`).join('');
}

function stepAesthetic(dir) {
  const i = AESTHETICS.findIndex(a => a.key === state.aesthetic);
  const next = AESTHETICS[(i + dir + AESTHETICS.length) % AESTHETICS.length];
  chooseAesthetic(next.key);
}

function setBoardView(view) {
  boardView = view === 'compare' ? 'compare' : 'board';
  renderAestheticBoard();
}

/* ---------------- local interactions ---------------- */

function wireBoardInteractions(host) {
  host.addEventListener('click', e => {
    const board = e.target.closest('.ab');
    if (!board) return;
    const seg = e.target.closest('.ab-seg-btn');
    if (seg) {
      board.querySelectorAll('.ab-seg-btn').forEach(b => b.setAttribute('aria-pressed', String(b === seg)));
      const copy = AB_STAGES[seg.dataset.stage];
      board.querySelector('[data-ab-title]').textContent = copy[0];
      board.querySelector('[data-ab-body]').textContent = copy[1];
      const label = board.querySelector('.ab-cta-label');
      if (label) label.textContent = 'Save direction';
      return;
    }
    const cta = e.target.closest('.ab-cta');
    if (cta) {
      cta.querySelector('.ab-cta-label').textContent = 'Direction saved';
    }
  });
  host.addEventListener('change', e => {
    if (!e.target.classList.contains('ab-switch')) return;
    const status = e.target.closest('.ab-panel').querySelector('.ab-status');
    if (status) status.textContent = e.target.checked ? 'Focus mode on' : 'Focus mode off';
  });
}

function initAestheticUi() {
  buildAestheticList();
  wireBoardInteractions(document.getElementById('previewCard'));

  document.getElementById('aeList').addEventListener('click', e => {
    const tile = e.target.closest('.ae-tile');
    if (tile) chooseAesthetic(tile.dataset.key);
  });
  document.getElementById('aePrev').addEventListener('click', () => stepAesthetic(-1));
  document.getElementById('aeNext').addEventListener('click', () => stepAesthetic(1));
  document.querySelectorAll('input[name="boardView"]').forEach(r => {
    r.addEventListener('change', e => { if (e.target.checked) setBoardView(e.target.value); });
  });

  const grid = document.getElementById('compareGrid');
  const pick = tile => {
    if (!tile) return;
    boardView = 'board';
    if (tile.dataset.key === state.aesthetic) renderAestheticBoard();
    else chooseAesthetic(tile.dataset.key);
  };
  grid.addEventListener('click', e => pick(e.target.closest('.cmp-tile')));
  grid.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const tile = e.target.closest('.cmp-tile');
    if (!tile) return;
    e.preventDefault();
    e.stopPropagation();   // Space is also the global shuffle shortcut
    pick(tile);
  });
  if (window.ResizeObserver) new ResizeObserver(fitCompareGrid).observe(grid);
}
