/* ---------------------------------------------------------------------
   brand-guide.js — the 6-page brand guide deck built from current state.

   Same design language as the slide mockups (css/slides.css): flat
   surfaces, no gradients, generous whitespace, small uppercase tracked
   kickers, hairline rules, and a repeating footer (brandmark bottom-left,
   page index bottom-right). Color is used with discipline — the cover is
   the one page that sits on flat primary; the rest are paper-white with
   the palette shown as artifacts rather than as backgrounds.

   Contracts other files depend on, deliberately unchanged:
   - BRAND_GUIDE_CSS / injectBrandGuideStyles() / renderBrandGuideHTML(state)
     (export-html.js, export-pdf.js, brand-guide-ui.js)
   - `.bg-page` marks one page; export-pdf.js rasterizes each one into its
     own PDF page, so pages stay a fixed 900px wide with fixed padding.
   - renderBrandGuideHTML returns only the pages; the caller supplies the
     `.brand-guide-doc` wrapper — which is why the brand's body font is set
     inline on each page rather than on the wrapper.
------------------------------------------------------------------------ */

const BRAND_GUIDE_CSS = `
  .brand-guide-doc {
    font-family: system-ui, -apple-system, sans-serif;
    color: #111111;
  }

  .brand-guide-doc .bg-page {
    position: relative;
    width: 100%;
    max-width: 900px;
    min-height: 620px;
    padding: 72px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    margin-bottom: 40px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    page-break-inside: avoid;
    background: #ffffff;
    color: #111111;
    line-height: 1.5;
  }

  .brand-guide-doc .bg-page:last-child { margin-bottom: 0; }

  .brand-guide-doc .bg-body { flex: 1; min-width: 0; }

  .brand-guide-doc .bg-kicker {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    opacity: 0.55;
    margin: 0 0 22px 0;
  }

  .brand-guide-doc h1 {
    font-size: 68px;
    font-weight: 700;
    line-height: 1.0;
    letter-spacing: -0.02em;
    margin: 0;
    overflow-wrap: anywhere;
  }

  .brand-guide-doc h2 {
    font-size: 40px;
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: -0.02em;
    margin: 0 0 36px 0;
  }

  .brand-guide-doc h3 {
    font-size: 17px;
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: -0.01em;
    margin: 0 0 8px 0;
  }

  .brand-guide-doc p {
    font-size: 15px;
    line-height: 1.65;
    margin: 0 0 14px 0;
  }

  .brand-guide-doc p:last-child { margin-bottom: 0; }

  .brand-guide-doc .bg-rule {
    width: 56px;
    height: 3px;
    border-radius: 2px;
    background: var(--bg-figure, currentColor);
    margin: 26px 0 0 0;
  }

  .brand-guide-doc .bg-foot {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    margin-top: 48px;
    padding-top: 16px;
    border-top: 1px solid var(--bg-hair, rgba(0, 0, 0, 0.14));
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    opacity: 0.6;
  }

  .brand-guide-doc .bg-foot-index {
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .brand-guide-doc .bg-foot-index i { font-style: normal; opacity: 0.5; margin: 0 4px; }

  .brand-guide-doc .bg-foot img {
    display: block;
    max-height: 20px;
    max-width: 180px;
    object-fit: contain;
  }

  /* ---------- cover ---------- */

  .brand-guide-doc .bg-cover-mark {
    display: flex;
    align-items: center;
    min-height: 64px;
    margin-bottom: 56px;
  }

  .brand-guide-doc .bg-cover-mark img {
    max-height: 64px;
    max-width: 320px;
    object-fit: contain;
  }

  .brand-guide-doc .bg-wordmark {
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.01em;
    overflow-wrap: anywhere;
  }

  .brand-guide-doc .bg-cover-body {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex: 1;
  }

  .brand-guide-doc .cover-tagline {
    font-size: 19px;
    line-height: 1.5;
    opacity: 0.8;
    max-width: 62%;
    margin: 22px 0 0 0;
  }

  /* ---------- palette ---------- */

  .brand-guide-doc .color-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
  }

  .brand-guide-doc .color-swatch { display: flex; flex-direction: column; }

  .brand-guide-doc .swatch-block {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 8px;
    margin-bottom: 14px;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.10);
  }

  .brand-guide-doc .swatch-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: 6px;
  }

  .brand-guide-doc .swatch-hex {
    font-family: 'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, monospace;
    font-size: 12px;
    letter-spacing: 0.02em;
    opacity: 0.75;
    margin-bottom: 6px;
  }

  .brand-guide-doc .swatch-contrast {
    font-size: 11px;
    line-height: 1.5;
    opacity: 0.55;
  }

  .brand-guide-doc .bg-notes {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid var(--bg-hair, rgba(0, 0, 0, 0.14));
  }

  .brand-guide-doc .bg-note-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    opacity: 0.5;
    margin-bottom: 8px;
  }

  .brand-guide-doc .bg-note-copy { font-size: 13px; line-height: 1.6; opacity: 0.8; margin: 0; }

  /* ---------- color roles ---------- */

  .brand-guide-doc .roles-sub {
    font-size: 13px;
    opacity: 0.6;
    margin: -22px 0 26px 0;
  }

  .brand-guide-doc .role-list { display: flex; flex-direction: column; }

  .brand-guide-doc .role-row {
    display: grid;
    grid-template-columns: 56px 168px 1fr 1fr;
    gap: 22px;
    align-items: start;
    padding: 14px 0;
    border-top: 1px solid var(--bg-hair, rgba(0, 0, 0, 0.14));
  }

  .brand-guide-doc .role-chip {
    width: 56px;
    height: 56px;
    border-radius: 8px;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.10);
  }

  .brand-guide-doc .role-name { font-size: 15px; font-weight: 700; margin-bottom: 3px; }

  .brand-guide-doc .role-meta {
    font-size: 11px;
    line-height: 1.55;
    opacity: 0.65;
  }

  .brand-guide-doc .role-meta code {
    font-family: 'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, monospace;
    font-size: 11px;
  }

  .brand-guide-doc .role-copy { font-size: 12.5px; line-height: 1.55; margin: 0; }

  .brand-guide-doc .role-copy b {
    display: block;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    opacity: 0.5;
    margin-bottom: 3px;
  }

  .brand-guide-doc .pair-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px 28px;
    margin-top: 12px;
    padding-top: 18px;
    border-top: 1px solid var(--bg-hair, rgba(0, 0, 0, 0.14));
  }

  .brand-guide-doc .pair {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
  }

  .brand-guide-doc .pair-sample {
    flex: none;
    width: 34px;
    height: 34px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    font-weight: 700;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.10);
  }

  .brand-guide-doc .pair-text { line-height: 1.4; }
  .brand-guide-doc .pair-text span { display: block; opacity: 0.6; font-size: 11px; }

  /* ---------- typography ---------- */

  .brand-guide-doc .typography-blocks {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
  }

  .brand-guide-doc .typography-block { display: flex; flex-direction: column; min-width: 0; }

  .brand-guide-doc .font-info {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    opacity: 0.5;
    margin-bottom: 16px;
  }

  .brand-guide-doc .font-name { font-size: 20px; font-weight: 700; margin-bottom: 18px; }

  .brand-guide-doc .specimen-heading {
    font-size: 52px;
    font-weight: 700;
    line-height: 1.02;
    letter-spacing: -0.02em;
    margin: 0;
    overflow-wrap: anywhere;
  }

  .brand-guide-doc .specimen-body { font-size: 15px; line-height: 1.7; opacity: 0.85; margin: 0; }

  .brand-guide-doc .type-scale {
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid var(--bg-hair, rgba(0, 0, 0, 0.14));
  }

  .brand-guide-doc .scale-row {
    display: flex;
    align-items: baseline;
    gap: 24px;
    padding: 9px 0;
  }

  .brand-guide-doc .scale-meta {
    flex: none;
    width: 132px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    opacity: 0.45;
  }

  .brand-guide-doc .scale-sample {
    min-width: 0;
    line-height: 1.1;
    letter-spacing: -0.01em;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  /* ---------- logo & style ---------- */

  .brand-guide-doc .logo-frame {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 190px;
    padding: 24px;
    box-sizing: border-box;
    background: var(--bg-tint, #f5f5f5);
    border: 1px solid var(--bg-hair, rgba(0, 0, 0, 0.12));
    border-radius: 10px;
    margin-bottom: 32px;
  }

  .brand-guide-doc .logo-frame img { max-height: 140px; max-width: 100%; object-fit: contain; }

  .brand-guide-doc .logo-placeholder {
    font-size: 13px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    opacity: 0.45;
  }

  .brand-guide-doc .style-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    align-items: start;
  }

  .brand-guide-doc .corner-tiles { display: flex; gap: 14px; margin-top: 4px; }
  .brand-guide-doc .corner-tilebox { display: flex; flex-direction: column; gap: 8px; }

  .brand-guide-doc .corner-tile {
    width: 78px;
    height: 78px;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
  }

  /* ---------- voice ---------- */

  .brand-guide-doc .voice-quote {
    font-size: 34px;
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: -0.02em;
    margin: 0;
    max-width: 92%;
    overflow-wrap: anywhere;
  }

  .brand-guide-doc .voice-author {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    opacity: 0.6;
    margin: 24px 0 0 0;
  }

  .brand-guide-doc .voice-lists {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-top: 44px;
    padding-top: 26px;
    border-top: 1px solid var(--bg-hair, rgba(0, 0, 0, 0.14));
  }

  .brand-guide-doc .voice-list { list-style: none; margin: 0; padding: 0; }

  .brand-guide-doc .voice-list li {
    font-size: 14px;
    line-height: 1.6;
    padding: 7px 0 7px 18px;
    position: relative;
    opacity: 0.85;
  }

  .brand-guide-doc .voice-list li::before {
    content: "";
    position: absolute;
    left: 0;
    top: 15px;
    width: 6px;
    height: 2px;
    background: var(--bg-figure, currentColor);
    opacity: 0.8;
  }

  @media print {
    .brand-guide-doc .bg-page {
      page-break-after: always;
      min-height: 0;
      margin: 0;
      border-radius: 0;
      box-shadow: none;
    }
    .brand-guide-doc .bg-page:last-child { page-break-after: auto; }
  }
`;

function injectBrandGuideStyles() {
  if (!document.getElementById('brandGuideStyles')) {
    const style = document.createElement('style');
    style.id = 'brandGuideStyles';
    style.textContent = BRAND_GUIDE_CSS;
    document.head.appendChild(style);
  }
}

// Hairline that reads on either a light or a dark page.
function bgGuideHair(ink) {
  return ink === '#ffffff' ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.14)';
}

// First candidate color legible on `surface`, else `fallback`.
function bgGuideVisible(surface, candidates, minRatio, fallback) {
  for (const c of candidates) {
    if (c && contrastRatio(c, surface) >= minRatio) return c;
  }
  return fallback;
}

function renderBrandGuideHTML(state) {
  // Untouched fields resolve to the brand's own believable copy (app.js), never a placeholder.
  const c = typeof effectiveContent === 'function' ? effectiveContent(state.content || {}) : (state.content || {});
  const brandName = escapeHtml(c.brandName || 'Aster & Co.');
  const tagline = escapeHtml(c.tagline || 'Made with care, built to last.');
  const quoteText = escapeHtml(c.quoteText || 'We would rather do one thing well than ten things nearly.');
  const quoteAuthor = escapeHtml(c.quoteAuthor || 'The founding team');

  // Font stacks carry real double quotes, which would close the
  // double-quoted style="..." attributes below — single quotes are equally
  // valid CSS and safe to interpolate.
  const headingFontCss = state.headingFont.css.replace(/"/g, '\'');
  const bodyFontCss = state.bodyFont.css.replace(/"/g, '\'');

  const colors = state.colors;
  const paperInk = '#111111';
  const paperHair = 'rgba(0,0,0,0.14)';
  const paperFigure = bgGuideVisible('#ffffff', [colors.primary, colors.accent], 3, paperInk);

  // Footer: brandmark bottom-left, page index bottom-right — the same meta
  // system the slide mockups use, so deck and guide read as one family.
  // Footer mark sits on the white paper page; the page is small, so the wordmark cut.
  const footLogo = brandLogo(state, { variant: 'wordmark', ground: '#ffffff' });
  const brandmark = footLogo
    ? `<img src="${footLogo.url}" alt="">`
    : `<span>${brandName}</span>`;

  function foot(index) {
    return `
      <div class="bg-foot">
        ${brandmark}
        <span class="bg-foot-index">${index}<i>/</i>06</span>
      </div>
    `;
  }

  /* ---------- 01 Cover — the one page on flat primary ---------- */

  const coverInk = pickReadableText(colors.primary);
  const coverHair = bgGuideHair(coverInk);
  const coverFigure = bgGuideVisible(colors.primary, [colors.accent], 2, coverInk);
  // With no logo uploaded the cover's own h1 *is* the wordmark, so the mark
  // slot is dropped rather than setting the brand name three times on one
  // page (mark, title, footer).
  const coverLogo = brandLogo(state, { variant: 'full', ground: colors.primary });
  const coverMark = coverLogo
    ? `<div class="bg-cover-mark"><img src="${coverLogo.url}" alt="Logo"></div>`
    : '';

  const coverPage = `
    <section class="bg-page" style="font-family: ${bodyFontCss}; background: ${colors.primary}; color: ${coverInk}; --bg-hair: ${coverHair}; --bg-figure: ${coverFigure};">
      <div class="bg-body bg-cover-body">
        <div>
          <div class="bg-kicker">Brand Guidelines</div>
          ${coverMark}
        </div>
        <div>
          <h1 style="font-family: ${headingFontCss};">${brandName}</h1>
          <p class="cover-tagline">${tagline}</p>
          <div class="bg-rule"></div>
        </div>
      </div>
      ${foot('01')}
    </section>
  `;

  /* ---------- 02 Color palette ---------- */

  const SWATCH_LABELS = {
    primary: 'Primary', secondary: 'Secondary', accent: 'Accent',
    neutralDark: 'Neutral Dark', neutralLight: 'Neutral Light',
  };

  const colorSwatches = ['primary', 'secondary', 'accent', 'neutralDark', 'neutralLight']
    .map(key => {
      const hex = colors[key];
      const contrastWhite = contrastRatio(hex, '#ffffff');
      const contrastBlack = contrastRatio(hex, '#141414');
      const isWhiteBetter = contrastWhite >= contrastBlack;
      const ratio = isWhiteBetter ? contrastWhite : contrastBlack;
      const pairing = isWhiteBetter ? 'white' : 'black';
      const aaPass = ratio >= 4.5 ? 'AA body text' : ratio >= 3 ? 'AA large text only' : 'decorative only';

      return `
        <div class="color-swatch">
          <div class="swatch-block" style="background-color: ${hex};"></div>
          <div class="swatch-label">${SWATCH_LABELS[key]}</div>
          <div class="swatch-hex">${hex.toUpperCase()}</div>
          <div class="swatch-contrast">${ratio.toFixed(2)}:1 on ${pairing}<br>${aaPass}</div>
        </div>
      `;
    })
    .join('');

  const colorPage = `
    <section class="bg-page" style="font-family: ${bodyFontCss}; --bg-hair: ${paperHair}; --bg-figure: ${paperFigure};">
      <div class="bg-body">
        <div class="bg-kicker">Palette</div>
        <h2 style="font-family: ${headingFontCss};">Color</h2>
        <div class="color-grid">${colorSwatches}</div>
        <div class="bg-notes">
          <div>
            <div class="bg-note-label">Proportion</div>
            <p class="bg-note-copy">Neutrals carry the layout. Primary appears once per view as a single confident block; accent is a detail, never a background.</p>
          </div>
          <div>
            <div class="bg-note-label">Contrast</div>
            <p class="bg-note-copy">Ratios above are measured against the better of white or near-black. Anything under 4.5:1 is reserved for large type and graphic shapes.</p>
          </div>
          <div>
            <div class="bg-note-label">Backgrounds</div>
            <p class="bg-note-copy">Flat fills only — no gradients, no tinted photography washes. Tints are the primary mixed into the neutral at 8% or less.</p>
          </div>
        </div>
      </div>
      ${foot('02')}
    </section>
  `;

  /* ---------- 03 Color roles ---------- */

  const aeDef = resolveAestheticDef(state);
  const rt = boardTokens(state, aeDef);
  const roleDefs = colorRolesFor(state);
  const roleRows = ['canvas', 'ink', 'primary', 'secondary', 'accent'].map(k => {
    const r = roleDefs[k];
    return `
        <div class="role-row">
          <div class="role-chip" style="background-color: ${rt[k]};"></div>
          <div>
            <div class="role-name">${escapeHtml(r.label)}</div>
            <div class="role-meta">${escapeHtml(r.job)}<br><code>${rt[k].toUpperCase()}</code> · ${escapeHtml(r.coverage)}</div>
          </div>
          <p class="role-copy"><b>Use for</b>${escapeHtml(r.use)}</p>
          <p class="role-copy"><b>Never for</b>${escapeHtml(r.never)}</p>
        </div>
      `;
  }).join('');

  const rolePairs = [
    ['Ink on canvas', rt.ink, rt.canvas],
    ['Muted on canvas', rt.muted, rt.canvas],
    ['On-primary on primary', rt.onPrimary, rt.primary],
    ['On-secondary on secondary', rt.onSecondary, rt.secondary],
    ['On-accent on accent', rt.onAccent, rt.accent],
    ['Accent on canvas', rt.accent, rt.canvas],
  ].map(([label, fg, bg]) => {
    const ratio = contrastRatio(fg, bg);
    const grade = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA large text only' : 'Graphics only';
    return `
        <div class="pair">
          <div class="pair-sample" style="background-color: ${bg}; color: ${fg};">Aa</div>
          <div class="pair-text">${label}<span>${ratio.toFixed(2)}:1 · ${grade}</span></div>
        </div>
      `;
  }).join('');

  const rolesPage = `
    <section class="bg-page" style="font-family: ${bodyFontCss}; --bg-hair: ${paperHair}; --bg-figure: ${paperFigure};">
      <div class="bg-body">
        <div class="bg-kicker">Roles</div>
        <h2 style="font-family: ${headingFontCss};">Color roles</h2>
        <p class="roles-sub">${escapeHtml(aeDef.name)} · ${rt.isDark ? 'dark' : 'light'} mode. Every color has one job; nothing else gets used.</p>
        <div class="role-list">${roleRows}</div>
        <div class="pair-grid">${rolePairs}</div>
      </div>
      ${foot('03')}
    </section>
  `;

  /* ---------- 04 Typography ---------- */

  const SCALE = [
    { label: 'Display · 52 / 1.0', size: 52, font: headingFontCss, weight: 700, sample: brandName },
    { label: 'Heading · 32 / 1.1', size: 32, font: headingFontCss, weight: 700, sample: 'Section heading' },
    { label: 'Subhead · 20 / 1.3', size: 20, font: headingFontCss, weight: 700, sample: 'Supporting subhead' },
    { label: 'Body · 15 / 1.65', size: 15, font: bodyFontCss, weight: 400, sample: 'Body copy, set for long-form reading.' },
    { label: 'Caption · 11 / 1.4', size: 11, font: bodyFontCss, weight: 400, sample: 'Captions, labels and metadata.' },
  ].map(row => `
      <div class="scale-row">
        <div class="scale-meta">${row.label}</div>
        <div class="scale-sample" style="font-family: ${row.font}; font-size: ${row.size}px; font-weight: ${row.weight};">${row.sample}</div>
      </div>
    `).join('');

  const typographyPage = `
    <section class="bg-page" style="font-family: ${bodyFontCss}; --bg-hair: ${paperHair}; --bg-figure: ${paperFigure};">
      <div class="bg-body">
        <div class="bg-kicker">Type System</div>
        <h2 style="font-family: ${headingFontCss};">Typography</h2>
        <div class="typography-blocks">
          <div class="typography-block">
            <div class="font-info">Headings · ${escapeHtml(state.headingFont.category)}</div>
            <div class="font-name" style="font-family: ${headingFontCss};">${escapeHtml(state.headingFont.name)}</div>
            <div class="specimen-heading" style="font-family: ${headingFontCss};">${brandName}</div>
          </div>
          <div class="typography-block">
            <div class="font-info">Body · ${escapeHtml(state.bodyFont.category)}</div>
            <div class="font-name" style="font-family: ${bodyFontCss};">${escapeHtml(state.bodyFont.name)}</div>
            <p class="specimen-body">The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. Set body copy at a comfortable measure — roughly 60 to 75 characters a line — and let the headings carry the personality.</p>
          </div>
        </div>
        <div class="type-scale">
          <div class="bg-note-label">Scale</div>
          ${SCALE}
        </div>
      </div>
      ${foot('04')}
    </section>
  `;

  /* ---------- 05 Logo & style ---------- */

  const pageLogo = brandLogo(state, { variant: 'full', ground: '#ffffff' });
  const logoContent = pageLogo
    ? `<img src="${pageLogo.url}" alt="Logo">`
    : `<span class="logo-placeholder">No logo uploaded</span>`;

  // The style's own corners, read off the board it really draws (js/ai-brief.js probe).
  // Without a DOM the page keeps the style name and drops the tiles.
  let look = null, corners = null;
  try {
    look = typeof abView === 'function' ? abView(state) : null;
    const probe = look && typeof aibProbeBoard === 'function' ? aibProbeBoard(look.state, look.def) : null;
    corners = probe && probe.radius && probe.radius.card && probe.radius.button && probe.radius.field ? probe.radius : null;
  } catch (err) { corners = null; }
  const lookName = look && look.def ? look.def.name : '';
  const lookNote = look && look.def && look.def.descriptor ? look.def.descriptor : '';
  const tiles = corners ? [[colors.primary, 'Cards', corners.card], [colors.accent, 'Buttons', corners.button], [colors.secondary, 'Fields', corners.field]]
    .map(([hex, label, r]) => `<div class="corner-tilebox"><div class="corner-tile" style="background: ${hex}; border-radius: ${escapeHtml(r)};"></div><div class="bg-note-label">${label}</div></div>`)
    .join('') : '';

  const logoPage = `
    <section class="bg-page" style="font-family: ${bodyFontCss}; --bg-hair: ${paperHair}; --bg-figure: ${paperFigure}; --bg-tint: ${colors.neutralLight};">
      <div class="bg-body">
        <div class="bg-kicker">Marks &amp; Surfaces</div>
        <h2 style="font-family: ${headingFontCss};">Logo &amp; Style</h2>
        <div class="logo-frame">${logoContent}</div>
        <div class="style-row">
          <div>
            <h3 style="font-family: ${headingFontCss};">${escapeHtml(lookName)}</h3>
            <p>${escapeHtml(lookNote)}</p>
          </div>
          ${tiles ? `<div>
            <div class="bg-note-label">Corner language</div>
            <div class="corner-tiles">${tiles}</div>
            <p class="bg-note-copy" style="margin-top: 14px;">Radius ${escapeHtml(corners.button)} on buttons, ${escapeHtml(corners.field)} on fields and ${escapeHtml(corners.card)} on cards: the style draws its own corners, borders and shadows.</p>
          </div>` : ''}
        </div>
      </div>
      ${foot('05')}
    </section>
  `;

  /* ---------- 06 Voice ---------- */

  const voiceBg = state.bgMode === 'dark' ? colors.neutralDark : colors.neutralLight;
  const voiceInk = pickReadableText(voiceBg);
  const voiceHair = bgGuideHair(voiceInk);
  const voiceFigure = bgGuideVisible(voiceBg, [colors.accent, colors.primary], 2.5, voiceInk);

  const voicePage = `
    <section class="bg-page" style="font-family: ${bodyFontCss}; background-color: ${voiceBg}; color: ${voiceInk}; --bg-hair: ${voiceHair}; --bg-figure: ${voiceFigure};">
      <div class="bg-body">
        <div class="bg-kicker">How We Sound</div>
        <h2 style="font-family: ${headingFontCss};">Voice</h2>
        <blockquote class="voice-quote" style="font-family: ${headingFontCss};">${quoteText}</blockquote>
        <div class="voice-author">${quoteAuthor}</div>
        <div class="voice-lists">
          <div>
            <div class="bg-note-label">We sound like</div>
            <ul class="voice-list">
              <li>Direct — the point comes first, the detail second.</li>
              <li>Specific — real numbers and real examples over adjectives.</li>
              <li>Warm — plain language, written to a person, not a segment.</li>
            </ul>
          </div>
          <div>
            <div class="bg-note-label">We never sound like</div>
            <ul class="voice-list">
              <li>Hype — no superlatives we cannot demonstrate.</li>
              <li>Jargon — if a shorter word works, it wins.</li>
              <li>Filler — nothing on the page that does no work.</li>
            </ul>
          </div>
        </div>
      </div>
      ${foot('06')}
    </section>
  `;

  return coverPage + colorPage + rolesPage + typographyPage + logoPage + voicePage;
}
