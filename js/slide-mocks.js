/* ---------------------------------------------------------------------
   slide-mocks.js — a six-slide sample pitch deck (cover, what we do,
   results, growth chart, testimonial, closing) rendered as plain DOM/CSS elements themed
   through CSS custom properties, the same approach the live
   "preview-scope" card uses.

   Design language (see css/slides.css for the type scale): flat surfaces
   only — no gradients, no blurs, no decorative blobs. Most slides sit on
   the neutral surface with the primary used once, as a real architectural
   element (the cover's full-height panel, the divider's flat field); the
   accent appears as a hairline rule, a motif tick or a numeral, never as
   a wash. Every slide carries the same footer: brandmark bottom-left,
   "01 / 05" bottom-right in the body font.

   DOM/CSS (not Canvas 2D) so it always uses whatever font is actually on
   screen elsewhere in the app — no manual document.fonts.load() bookkeeping
   that can silently fall back to a default font. Sizing is done with CSS
   container query units (cqw) scoped to .slide-card (see css/slides.css for
   why the container can't be the slide itself), so each slide scales
   proportionally regardless of its card width.

   Colors are always resolved against the *actual* surface with
   pickReadableText/contrastRatio, and tints are precomputed to flat hex
   here rather than left to color-mix() — html2canvas doesn't understand
   color-mix(), and "Download PNG" rasterizes the live element.
------------------------------------------------------------------------ */

/* Deck order — index numbers, download filenames and the "Download all"
   sequence all read from this one list. */
const SLIDE_MOCKS = [
  { id: 'slideTitle', index: '01', name: 'cover-slide.png' },
  { id: 'slideDivider', index: '02', name: 'what-we-do-slide.png' },
  { id: 'slideContent', index: '03', name: 'results-slide.png' },
  { id: 'slideChart', index: '04', name: 'growth-slide.png' },
  { id: 'slideQuote', index: '05', name: 'testimonial-slide.png' },
  { id: 'slideClosing', index: '06', name: 'closing-slide.png' },
];

const SL_TOTAL = String(SLIDE_MOCKS.length).padStart(2, '0');

// Every `decorative` value a shape preset can carry gets a real motif.
const SL_MARK_CLASSES = {
  square: 'sl-mark-square',
  circle: 'sl-mark-circle',
  triangle: 'sl-mark-triangle',
  bar: 'sl-mark-bar',
  ring: 'sl-mark-ring',
};

/* ---------------- small helpers ---------------- */

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

// Hairline rule color that works on either a light or a dark surface.
function slHair(ink) {
  return ink === '#ffffff' ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.14)';
}

// Type that can't overflow: pick a cqw size from the copy's own length.
// Two constraints — the longest word has to fit its line, and the whole
// string has to fit the line budget. A *single* long word may break
// mid-word (the CSS sets overflow-wrap: anywhere), so it gets the full
// line budget; a long word inside a phrase must fit one line or the break
// reads as an accident. `widthPct` is the text column's width in cqw.
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

// "Aster & Co." -> "asterandco", for the closing slide's contact line.
function slSlug(name) {
  const s = String(name == null ? '' : name)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '');
  return (s || 'brand').slice(0, 22);
}

// Shape presets can carry exotic radius values (organic blob corners);
// only a plain length makes sense on a slide panel.
function slRadius(value, fallback) {
  const v = String(value == null ? '' : value).trim();
  return /^\d+(\.\d+)?(px|rem|em)$/.test(v) ? v : fallback;
}

function slMarkHtml(decorative) {
  const cls = SL_MARK_CLASSES[decorative] || SL_MARK_CLASSES.square;
  return `<span class="sl-mark ${cls}"></span>`;
}

function slKickerHtml(decorative, label) {
  return `<div class="sl-kicker-row">${slMarkHtml(decorative)}<span class="sl-kicker">${escapeHtml(label)}</span></div>`;
}

function slBrandmarkHtml(logoDataUrl, brandName) {
  return logoDataUrl
    ? `<span class="sl-foot-brand"><img src="${logoDataUrl}" alt="" /></span>`
    : `<span class="sl-foot-brand">${escapeHtml(brandName)}</span>`;
}

function slFootHtml(leftHtml, index) {
  return `
    <div class="sl-foot">
      ${leftHtml}
      <span class="sl-index">${index}<i>/</i>${SL_TOTAL}</span>
    </div>
  `;
}

// Reset any custom properties left by a previous render, then apply the
// new ones — slides don't all set the same vars.
function slApply(el, classNames, vars) {
  el.style.cssText = '';
  el.className = classNames;
  Object.entries(vars).forEach(([k, v]) => {
    if (v != null) el.style.setProperty(k, String(v));
  });
}

/* ---------------- render ---------------- */

// Example roles for the well-known default quote author; anyone else the
// user types in gets a neutral, believable role line.
const SL_KNOWN_ROLES = { 'paul rand': 'Art director and designer' };

function slInitials(name) {
  const parts = String(name || '').replace(/[^\p{L}\p{N}\s]/gu, ' ').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'B';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

function renderSlideMocks(state) {
  const { colors, headingFont, bodyFont, shapePreset, bgMode, content, logoDataUrl } = state;
  const c = content || {};

  const brandName = c.brandName || 'Brand Name';
  const tagline = c.tagline || 'A short tagline that captures the brand.';
  const sectionTitle = c.sectionTitle || 'Our Approach';
  const quoteText = c.quoteText || 'Design is the silent ambassador of your brand.';
  const quoteAuthor = c.quoteAuthor || 'Author Name';
  const slug = slSlug(brandName);
  const initial = slInitials(brandName)[0];

  const surface = bgMode === 'dark' ? colors.neutralDark : colors.neutralLight;
  const ink = pickReadableText(surface);
  const onPrimary = pickReadableText(colors.primary);
  const onSecondary = pickReadableText(colors.secondary);
  const onAccent = pickReadableText(colors.accent);
  const decorative = shapePreset.decorative;

  const base = {
    '--sl-font-head': headingFont.css,
    '--sl-font-body': bodyFont.css,
    '--sl-radius': slRadius(shapePreset.radius, '6px'),
    '--sl-radius-lg': slRadius(shapePreset.radiusLg, '8px'),
    '--sl-primary': colors.primary,
    '--sl-on-primary': onPrimary,
    '--sl-secondary': colors.secondary,
    '--sl-on-secondary': onSecondary,
    '--sl-accent': colors.accent,
    '--sl-on-accent': onAccent,
  };
  const onSurface = {
    ...base,
    '--sl-surface': surface,
    '--sl-ink': ink,
    '--sl-hair': slHair(ink),
    '--sl-motif': slVisible(surface, [colors.accent, colors.primary], 2.2, ink),
    '--sl-figure': slVisible(surface, [colors.primary, colors.accent], 3, ink),
  };

  /* --- 01 Cover: typographic lockup + a three-band palette panel --- */
  const cover = document.getElementById('slideTitle');
  if (cover) {
    const panelInner = logoDataUrl
      ? `<img src="${logoDataUrl}" alt="" />`
      : `<span class="sl-monogram">${escapeHtml(initial)}</span>`;
    slApply(cover, 'slide-mock sl-slide sl-cover', onSurface);
    cover.innerHTML = `
      <div class="sl-panel">
        <div class="sl-panel-main">${panelInner}</div>
        <div class="sl-panel-band"><span>Brand deck</span></div>
        <div class="sl-panel-tip"></div>
      </div>
      <div class="sl-main sl-split">
        ${slKickerHtml(decorative, 'Company overview')}
        <div class="sl-block">
          <h3 class="sl-title" style="font-size:${slFit(brandName, { max: 10, min: 2.8, widthPct: 52, lines: 2 })}cqw">${escapeHtml(brandName)}</h3>
          <p class="sl-lede">${escapeHtml(tagline)}</p>
        </div>
      </div>
      ${slFootHtml('<span class="sl-foot-meta">Brand guidelines</span>', '01')}
    `;
  }

  /* --- 02 What we do: numbered list beside a secondary-colour title panel --- */
  const agenda = document.getElementById('slideDivider');
  if (agenda) {
    const steps = [
      { title: 'Listen first', copy: 'Every project opens with a week of customer interviews, not a template.' },
      { title: 'Design the system', copy: 'Type, colour and shape are chosen together, then tested on real layouts.' },
      { title: 'Ship and support', copy: 'You get files your team can use on Monday morning, plus a year of help.' },
    ];
    slApply(agenda, 'slide-mock sl-slide sl-agenda', {
      ...onSurface,
      '--sl-panel-ink': onSecondary,
      '--sl-panel-motif': slVisible(colors.secondary, [colors.accent, onSecondary], 2.2, onSecondary),
    });
    agenda.innerHTML = `
      <div class="sl-agenda-panel">
        <div class="sl-agenda-top">${slKickerHtml(decorative, 'What we do')}</div>
        <div>
          <h3 class="sl-agenda-title" style="font-size:${slFit(sectionTitle, { max: 5.4, min: 2.2, widthPct: 22, lines: 3, glyph: 0.72 })}cqw">${escapeHtml(sectionTitle)}</h3>
          <p class="sl-agenda-lede">${escapeHtml(brandName)} keeps the process short, visible and shared.</p>
        </div>
      </div>
      <div class="sl-main sl-agenda-main">
        <ol class="sl-steps">
          ${steps.map((s, i) => `
            <li class="sl-step">
              <span class="sl-step-num">${String(i + 1).padStart(2, '0')}</span>
              <div class="sl-step-body">
                <h4 class="sl-step-title">${escapeHtml(s.title)}</h4>
                <p class="sl-step-copy">${escapeHtml(s.copy)}</p>
              </div>
            </li>`).join('')}
        </ol>
      </div>
      ${slFootHtml(slBrandmarkHtml(logoDataUrl, brandName), '02')}
    `;
  }

  /* --- 03 Numbers: flat primary field, one huge figure and two supporting --- */
  const stats = document.getElementById('slideContent');
  if (stats) {
    const figure = slVisible(colors.primary, [colors.accent], 2.6, onPrimary);
    const chipInk = onSecondary;
    slApply(stats, 'slide-mock sl-slide sl-stats', {
      ...base,
      '--sl-surface': colors.primary,
      '--sl-ink': onPrimary,
      '--sl-hair': slHair(onPrimary),
      '--sl-motif': figure,
      '--sl-figure': figure,
      '--sl-chip-ink': chipInk,
    });
    stats.innerHTML = `
      <div class="sl-main sl-split">
        <div class="sl-stats-head">
          ${slKickerHtml(decorative, 'Results')}
          <span class="sl-chip">Last 12 months</span>
        </div>
        <div class="sl-stats-grid">
          <div class="sl-stat sl-stat-hero">
            <div class="sl-stat-num">3.2×</div>
            <p class="sl-stat-label">return on the first campaign we ran with ${escapeHtml(brandName)}</p>
          </div>
          <div class="sl-stat-col">
            <div class="sl-stat">
              <div class="sl-stat-num">48k</div>
              <p class="sl-stat-label">people reached in launch month</p>
            </div>
            <div class="sl-stat">
              <div class="sl-stat-num">92%</div>
              <p class="sl-stat-label">of customers stay past year one</p>
            </div>
          </div>
        </div>
      </div>
      ${slFootHtml(slBrandmarkHtml(logoDataUrl, brandName), '03')}
    `;
  }

  /* --- 04 Growth chart: paired DOM bars (no SVG text, so fonts export) --- */
  const chart = document.getElementById('slideChart');
  if (chart) {
    const plotBg = slMix(colors.secondary, surface, 0.14);
    const plotLine = slMix(colors.secondary, surface, 0.34);
    const groups = [
      { label: 'Q1', last: 38, now: 46 },
      { label: 'Q2', last: 42, now: 58 },
      { label: 'Q3', last: 49, now: 71 },
      { label: 'Q4', last: 57, now: 92 },
    ];
    const chipBg = colors.accent;
    slApply(chart, 'slide-mock sl-slide sl-chart', {
      ...onSurface,
      '--sl-plot-bg': plotBg,
      '--sl-plot-line': plotLine,
    });
    chart.innerHTML = `
      <div class="sl-main sl-chart-grid">
        <div class="sl-chart-copy">
          ${slKickerHtml(decorative, 'Growth')}
          <div>
            <h3 class="sl-content-title">Growing every quarter</h3>
            <p class="sl-chart-lede">${escapeHtml(brandName)} revenue, this year against last, indexed to 100 in the first quarter of last year.</p>
            <div class="sl-legend">
              <span><i class="sl-key" style="background:${colors.secondary}"></i>Last year</span>
              <span><i class="sl-key" style="background:${colors.primary}"></i>This year</span>
              <span><i class="sl-key" style="background:${colors.accent}"></i>Peak</span>
            </div>
          </div>
        </div>
        <div class="sl-plot">
          <div class="sl-plot-lines"><i></i><i></i><i></i></div>
          <div class="sl-plot-groups">
            ${groups.map((g, i) => {
              const peak = i === groups.length - 1;
              return `
              <div class="sl-group">
                <div class="sl-bars">
                  <div class="sl-bar sl-bar-last" style="height:${g.last}%"></div>
                  <div class="sl-bar sl-bar-now${peak ? ' is-peak' : ''}" style="height:${g.now}%">
                    ${peak ? `<span class="sl-bar-tag" style="background:${chipBg};color:${onAccent}">+61%</span>` : ''}
                  </div>
                </div>
                <span class="sl-group-label">${g.label}</span>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>
      ${slFootHtml(slBrandmarkHtml(logoDataUrl, brandName), '04')}
    `;
  }

  /* --- 05 Testimonial: big quote glyph, person card in the palette --- */
  const quote = document.getElementById('slideQuote');
  if (quote) {
    const tint = slMix(colors.secondary, surface, 0.16);
    const glyph = slVisible(tint, [colors.accent, colors.primary], 2.2, ink);
    const role = SL_KNOWN_ROLES[quoteAuthor.trim().toLowerCase()] || `Long-time client of ${brandName}`;
    slApply(quote, 'slide-mock sl-slide sl-quote-slide', {
      ...onSurface,
      '--sl-surface': tint,
      '--sl-ink': pickReadableText(tint),
      '--sl-hair': slHair(pickReadableText(tint)),
      '--sl-glyph': glyph,
      '--sl-card': surface,
      '--sl-card-ink': ink,
    });
    quote.innerHTML = `
      <div class="sl-main sl-quote-main">
        <div class="sl-quote-col">
          <div class="sl-quote-glyph">“</div>
          <p class="sl-quote-text" style="font-size:${slFit(quoteText, { max: 4.2, min: 1.8, widthPct: 52, lines: 4 })}cqw">${escapeHtml(quoteText)}</p>
        </div>
        <div class="sl-person">
          <span class="sl-avatar">${escapeHtml(slInitials(quoteAuthor))}</span>
          <div class="sl-person-name">${escapeHtml(quoteAuthor)}</div>
          <div class="sl-person-role">${escapeHtml(role)}</div>
          <div class="sl-person-bar"></div>
        </div>
      </div>
      ${slFootHtml(slBrandmarkHtml(logoDataUrl, brandName), '05')}
    `;
  }

  /* --- 06 Closing: CTA, contact lines, and the shape preset drawn large --- */
  const closing = document.getElementById('slideClosing');
  if (closing) {
    const closeSurface = bgMode === 'dark' ? colors.primary : colors.neutralDark;
    const closeInk = pickReadableText(closeSurface);
    const closeMotif = slVisible(closeSurface, [colors.accent, colors.secondary, colors.primary], 2.2, closeInk);
    const bigShape = slVisible(closeSurface, [colors.secondary, colors.accent], 1.6, closeInk);
    slApply(closing, 'slide-mock sl-slide sl-closing', {
      ...base,
      '--sl-surface': closeSurface,
      '--sl-ink': closeInk,
      '--sl-hair': slHair(closeInk),
      '--sl-motif': closeMotif,
      '--sl-figure': closeMotif,
      '--sl-big': bigShape,
    });
    closing.innerHTML = `
      <span class="sl-bigshape sl-bigshape-${escapeHtml(decorative)}"></span>
      <div class="sl-main sl-split">
        ${slKickerHtml(decorative, 'Next step')}
        <div class="sl-block">
          <h3 class="sl-closing-title" style="font-size:${slFit('Ready when you are.', { max: 8, min: 4, widthPct: 56, lines: 2 })}cqw">Ready when you are.</h3>
          <p class="sl-closing-meta">Book a 30 minute intro call and we will bring a first look at what ${escapeHtml(brandName)} could become.</p>
          <div class="sl-cta-row">
            <span class="sl-cta" style="background:${colors.accent};color:${onAccent}">Book an intro call</span>
            <span class="sl-contact-lines">
              <span>hello@${escapeHtml(slug)}.com</span>
              <span>+1 (312) 847-1928</span>
            </span>
          </div>
        </div>
      </div>
      ${slFootHtml(slBrandmarkHtml(logoDataUrl, brandName), '06')}
    `;
  }
}

/* ---------------- PNG export ---------------- */

// Rasterize a live slide element to PNG and trigger a download.
// "Aster & Co." -> "aster-co", for export filenames.
function brandFileSlug() {
  const n = (typeof state !== 'undefined' && state.content && state.content.brandName) || '';
  return n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'brand';
}

async function downloadSlideMockPng(el, rawFilename) {
  const filename = `${brandFileSlug()}-${rawFilename}`;
  const canvas = await html2canvas(el, { scale: 2, backgroundColor: null });
  return new Promise(resolve => {
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      resolve();
    });
  });
}

// "Download all" — one file at a time with a short gap between them, since
// browsers throttle (or silently drop) a burst of programmatic downloads.
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('downloadAllSlides');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    const label = btn.textContent;
    btn.textContent = 'Downloading…';
    try {
      for (const slide of SLIDE_MOCKS) {
        const el = document.getElementById(slide.id);
        if (!el) continue;
        await downloadSlideMockPng(el, slide.name);
        await new Promise(r => setTimeout(r, 300));
      }
      if (typeof showToast === 'function') showToast('All slide PNGs downloaded');
    } catch (err) {
      if (typeof showToast === 'function') showToast('PNG export failed');
    } finally {
      btn.textContent = label;
      btn.disabled = false;
    }
  });
});
