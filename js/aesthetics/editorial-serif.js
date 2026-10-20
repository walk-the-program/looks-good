/* 11 Editorial Serif — literate, confident, spacious. Reference: NYT Magazine,
   Kinfolk, Apartamento. The board is set as a magazine page: a masthead with a
   double rule, a cover headline in a high-contrast serif at weight 400 with the
   highlight word in italic, a duotone "cover plate" with a caption, hairline
   rules instead of shadows, square corners, a standfirst set in two columns,
   and a contents list (dotted leaders, page numbers) for the list and the type
   picks. Weight comes from contrast, never from boldness. */
const EDS_KEY = 'editorial-serif';   // abCopy key for the plain functions below (js/aesthetics/registry.js)

registerAesthetic({
  key: 'editorial-serif', order: 11,
  name: 'Editorial Serif',
  descriptor: 'Literate · Confident · Spacious',
  influences: 'Magazine editorial / Swiss columns / Book typography',
  summary: 'Magazine pages set in a high-contrast serif, with hairline rules and room to breathe.',
  motto: 'Set it like a page.',   // = copy.motto.text
  kicker: 'Issue 01 — Spring',    // = copy.kicker.text
  mode: 'light',
  slideShape: 'minimal',
  labels: { material: 'Page', states: ['Rest', 'Hover', 'Pressed'], statesKind: 'button' },
  // Editable specimen copy (Brand > Advanced > Specimen copy). {brand} in coverSub is filled in by the template.
  copy: {
    motto: { label: 'Motto', text: 'Set it like a page.' },
    kicker: { label: 'Kicker above the headline', text: 'Issue 01 — Spring' },
    state0: { label: 'State 1 name', text: 'Rest' },
    state1: { label: 'State 2 name', text: 'Hover' },
    state2: { label: 'State 3 name', text: 'Pressed' },
    plateNo: { label: 'Cover plate number', text: 'No. 01' },
    coverLine: { label: 'Coverline', text: 'The design issue' },
    coverSub: { label: 'Cover sub-line ({brand})', text: '{brand} · Spring' },
    figLabel: { label: 'Figure label', text: 'Fig. 1' },
    figCaption: { label: 'Figure caption', text: 'the brand at rest' },
    pageNo: { label: 'Page number', text: 'p. 01' },
  },
  layout: { hero: 'poster', palette: 'chips', sections: 'asym' },
  type: { ui: 'sans', label: 'sans', display: 1.22 },
  highlight: 'custom',
  highlightNote: 'The last word is set in italic (same face, weight 400) in --accent-ink, no fill, no underline; the rest of the headline stays upright ink.',

  roles: {
    canvas: {
      use: 'The paper: page and card background, warmed slightly toward cream; panels are the same paper separated by hairlines',
      never: 'Text, or a second tinted background',
      coverage: '70–75%',
    },
    ink: {
      use: 'Headlines, body copy, rules (full ink for the masthead, a tint for hairlines) and the pressed/hover fill of the main action',
      never: 'Large background fields',
      coverage: '18–22%',
    },
    primary: {
      use: 'The one main action per page, the duotone cover plate and the selected tab underline',
      never: 'Body text, rules, decorative fills outside the plate',
      coverage: '≈8–10%',
    },
    secondary: {
      use: 'Pull-quote tint, the list "status" tags and the second bar in a chart; always small and quiet',
      never: 'The main action, body text, the page background',
      coverage: '≈5–8%',
    },
    accent: {
      use: 'The one italic headline word and a single "New" flag; set as text, shaded to stay readable on paper',
      never: 'Buttons, borders, rules or fills',
      coverage: '≤3%',
    },
  },

  // The paper is warmed a quarter of the way toward cream (light mode only).
  canvas(b) {
    return b.isDark ? null : b.mix(b.canvas, '#f3ead9', 0.74);
  },

  tokens(t) {
    const st = typeof state !== 'undefined' ? state : null;
    const h = st && st.headingFont;
    const b = st && st.bodyFont;
    // tracking: wide / techno / heavy faces must not take the tight serif tracking
    const tr = (h && { condensed: 0, heavy: 0, wide: 0.4, techno: 0.4 }[h.cls]) ?? 1;
    // interface sans: the brand's own sans if it has one, else Inter (captions are always sans)
    const brandSans = [b, h].find(f => f && f.category === 'sans');
    const ui = brandSans ? (brandSans === b ? 'var(--ab-font-b)' : 'var(--ab-font-h)')
      : '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif';
    const d = t.isDark;
    return {
      '--ab-tr': tr,
      '--ab-font-ui': ui,
      '--ab-font-label': ui,
      '--ab-hair': t.alpha(t.ink, d ? 0.26 : 0.3),
      '--ab-hair-soft': t.alpha(t.ink, d ? 0.14 : 0.16),
      '--ab-hair-strong': t.ink,
      // duotone plate: primary multiplied over a greyscale image; the plate's
      // lights and darks are derived from the brand primary, never invented
      '--ab-eds-plate-dark': t.mix(t.primary, '#000000', 0.5),
      '--ab-eds-plate': t.mix(t.primary, t.ink, 0.35),
      '--ab-eds-plate-hi': d ? t.mix(t.mix(t.primary, t.ink, 0.35), t.ink, 0.4) : t.mix(t.mix(t.primary, t.ink, 0.35), t.canvas, 0.3),
      // light mode: the plate deepens toward the foot (canvas-coloured coverline on top); dark mode keeps it light
      // (the coverline is canvas-coloured, i.e. dark, there)
      '--ab-eds-plate-lo': d ? t.mix(t.mix(t.primary, t.ink, 0.35), t.ink, 0.25) : t.mix(t.mix(t.primary, t.ink, 0.35), '#000000', 0.45),
      '--ab-eds-paper': d ? t.ink : t.canvas,
      '--ab-eds-ink-hover': t.mix(t.ink, t.primary, 0.88),
      '--ab-eds-primary-press': t.mix(t.primary, '#000000', 0.78),
      '--ab-eds-on-press': t.readable(t.mix(t.primary, '#000000', 0.78)),
    };
  },

  // The cover plate: a dark duotone field (primary mixed toward ink) with 5% grain, a giant
  // brand initial in the heading face cropped by the bottom and left edges, a coverline and
  // a caption under the plate. Pure HTML/CSS (css/aesthetics/editorial-serif.css).
  art(ctx) {
    const e = escapeHtml;
    return `<figure class="eds">
      <div class="eds-plate">
        <i class="eds-half"></i>
        <i class="eds-grain"></i>
        <span class="eds-no">${abCopy(EDS_KEY, 'plateNo')}</span>
        <span class="eds-cap">${e(ctx.initial)}</span>
        <div class="eds-cover"><em class="eds-line">${abCopy(EDS_KEY, 'coverLine')}</em><span class="eds-sub">${abCopy(EDS_KEY, 'coverSub').replace('{brand}', () => e(ctx.brandName || ctx.name || ''))}</span></div>
      </div>
      <figcaption class="eds-fig"><span><em>${abCopy(EDS_KEY, 'figLabel')}</em> — ${abCopy(EDS_KEY, 'figCaption')}</span><span>${abCopy(EDS_KEY, 'pageNo')}</span></figcaption>
    </figure>`;
  },

  materials: [
    { name: 'Paper', css: 'background: {canvas}; color: {ink}; border-radius: 0; box-shadow: none; /* canvas warmed ~25% toward cream; no cards, panels are the same paper */' },
    { name: 'Masthead rule', css: 'border-top: 3px solid {hairStrong}; border-bottom: 1px solid {hairStrong}; height: 7px; /* thick over thin, under the masthead only */' },
    { name: 'Hairline', css: 'border-top: 1px solid {hair}; /* every divider, every panel edge; never a shadow */' },
    { name: 'Duotone plate', css: 'background: {edsPlate}; /* primary mixed 35% toward ink, 5% multiply grain */ border: 1px solid {hairStrong}; border-radius: 0; /* cropped brand initial, coverline "The design issue", caption "Fig. 1 — the brand at rest" below */' },
    { name: 'Primary action', css: 'background: {primary}; color: {onPrimary}; border-radius: 0; text-transform: uppercase; letter-spacing: .14em; font-size: 12px; /* hover: background {ink}, color {canvas}; pressed: {edsPrimaryPress}, text {edsOnPress} */' },
    { name: 'Contents row', css: 'border-top: 1px solid {hairSoft}; /* name, dotted leader (1px dotted {hair}), status in small caps, page number right */' },
  ],

  rules: {
    do: [
      'Set the headline in the serif at weight 400 and let the highlight word go italic in the accent ink; contrast carries the weight.',
      'Separate everything with hairline rules; use a thick-over-thin double rule once, under the masthead.',
      'Keep corners square (0–2px) and flat: no shadows, no gradients outside the duotone plate.',
      'Set captions, tabs and labels in small-caps sans with .12em tracking; keep reading copy in the text serif with a drop cap on the first paragraph.',
    ],
    dont: [
      'Bold the headline, round the controls or add a shadow to a card; this is print, not an app.',
      'Use accent as a fill, button or rule; it is one italic word.',
      'Fill the page with tinted cards; the page is one sheet of paper with hairlines.',
      'Run body copy in sans or letter-space the serif.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['Set it like a page', 'High-contrast serif at weight 400, with room to breathe.'],
      ['Hairline rules do the work', 'No shadows, no tinted cards, square corners.'],
      ['One italic accent word', 'Everything else is ink on paper.'],
    ],
    do: [
      'Set headlines in the serif at weight 400.',
      'Separate everything with hairline rules.',
      'Set labels in small-caps sans.',
    ],
    dont: [
      'Bold the headline or round the controls.',
      'Use the accent as a fill.',
      'Run body copy in sans.',
    ],
  },
});
