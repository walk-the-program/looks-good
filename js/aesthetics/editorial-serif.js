/* 11 Editorial Serif — literate, confident, spacious. Reference: The Gentlewoman,
   Fantastic Man, Apartamento, Kinfolk, The Paris Review, NYT Magazine.
   The board is a magazine COVER, then a page: a full-width 4:5 cover plate carries a
   duotone still-life "photograph" (black + one spot tint derived from the primary; the
   brand logo hangs in it as a framed print when there is one), the masthead wordmark is
   set edge to edge across its top, and the headline sits over the plate's lower third in
   paper colour at poster scale (~130px against 9-10px captions). The accent word is ink
   italic, never a brand colour. Below: a thick-over-thin masthead rule, a contents list
   with dotted leaders, a colour index, and a real text page (two-column body with the
   only drop cap, a pull quote between hairlines, a byline) in section 02. */
let edsSeq = 0;
// The duotone's four tones: black (the dark neutral nudged 14% toward the primary), a mid,
// the spot (primary 42% into the light neutral) and a highlight. t.mix(a, b, x) keeps x of a.
function edsTones(t) {
  const lightN = t.isDark ? t.ink : t.canvas;
  const darkN = t.isDark ? t.canvas : t.ink;
  return {
    lightN, darkN,
    deep: t.mix(darkN, t.primary, 0.86),
    mid: t.mix(t.mix(t.primary, darkN, 0.6), lightN, 0.82),
    spot: t.mix(t.primary, lightN, 0.42),
    lite: t.mix(t.primary, lightN, 0.14),
  };
}

registerAesthetic({
  key: 'editorial-serif', order: 11,
  name: 'Editorial Serif',
  descriptor: 'Literate · Confident · Spacious',
  influences: 'The Gentlewoman / Fantastic Man / The Paris Review',
  summary: 'A magazine cover and page: one duotone image, a didone at poster scale over 9px captions, hairline rules.',
  motto: 'Set it like a page.',
  kicker: 'Issue 01 — Spring',
  mode: 'light',
  slideShape: 'minimal',
  labels: { material: 'Page', states: ['Rest', 'Hover', 'Pressed'], statesKind: 'button' },
  layout: { hero: 'poster', palette: 'chips', sections: 'asym' },
  type: { ui: 'sans', label: 'sans', display: 1.22 },
  highlight: 'custom',
  highlightNote: 'The last word is set in italic (same face, weight 400) in the same ink as the rest of the headline: contrast, not colour. No fill, no underline, never a brand colour.',

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
      use: 'The spot colour of the duotone cover plate, the one main action at rest, the selected tab underline and one 1px rule under the folio',
      never: 'Body text, headline words, decorative fills outside the plate',
      coverage: '≈6–10%',
    },
    secondary: {
      use: 'Reserved: a chart\'s second series in an infographic page; never on the cover',
      never: 'The main action, body text, the page background, headline words',
      coverage: '≤3%',
    },
    accent: {
      use: 'Reserved: a single "New" flag at most. The italic headline word is ink, not accent',
      never: 'Headline words, buttons, borders, rules or fills',
      coverage: '≤1%',
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
    const { deep, spot, lite, lightN } = edsTones(t);
    return {
      '--ab-tr': tr,
      '--ab-font-ui': ui,
      '--ab-font-label': ui,
      '--ab-hair': t.alpha(t.ink, d ? 0.26 : 0.3),
      '--ab-hair-soft': t.alpha(t.ink, d ? 0.14 : 0.16),
      '--ab-hair-strong': t.ink,
      // duotone plate: black (the dark neutral, nudged toward the primary) plus one spot
      // tint (the primary into the light neutral). Paper = the light neutral in both modes.
      '--ab-eds-deep': deep,
      '--ab-eds-spot': spot,
      '--ab-eds-lite': lite,
      '--ab-eds-paperlight': lightN,
    };
  },

  // The cover plate: masthead wordmark edge to edge across the top (justified; the size
  // comes from the name's length), a duotone still life (Morandi bottles on a table, lit
  // from the left) drawn in SVG from four tones, the brand logo as a framed print on the
  // wall when there is one, 5% grain, and the Fig. 1 caption and folio under the plate.
  // The hero headline is laid over the plate's dark lower third by the CSS.
  art(ctx) {
    const e = escapeHtml;
    const name = String(ctx.brandName || 'Studio').trim() || 'Studio';
    const n = Math.max(4, Math.min(28, name.length));
    const id = 'eds' + (++edsSeq);
    const T = edsTones(ctx.t);
    const print = ctx.logoDataUrl
      ? `<rect x="226" y="52" width="108" height="108" fill="${T.lite}" stroke="${T.deep}" stroke-width="3"/><image href="${e(ctx.logoDataUrl)}" x="240" y="66" width="80" height="80" preserveAspectRatio="xMidYMid meet"/>` : '';
    return `<figure class="eds">
      <div class="eds-plate">
        <svg class="eds-still" viewBox="0 0 400 500" preserveAspectRatio="xMidYMin slice" focusable="false">
          <defs>
            <radialGradient id="${id}w" cx=".22" cy=".18" r=".95"><stop offset="0" stop-color="${T.lite}"/><stop offset=".55" stop-color="${T.spot}"/><stop offset="1" stop-color="${T.mid}"/></radialGradient>
            <linearGradient id="${id}b" x1="0" x2="1"><stop offset="0" stop-color="${T.lite}"/><stop offset=".35" stop-color="${T.spot}"/><stop offset=".8" stop-color="${T.mid}"/><stop offset="1" stop-color="${T.deep}"/></linearGradient>
            <linearGradient id="${id}t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${T.spot}"/><stop offset="1" stop-color="${T.mid}"/></linearGradient>
            <linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${T.mid}"/><stop offset=".18" stop-color="${T.deep}"/><stop offset="1" stop-color="${T.deep}"/></linearGradient>
            <radialGradient id="${id}s" cx=".36" cy=".34" r=".7"><stop offset="0" stop-color="${T.lite}"/><stop offset=".5" stop-color="${T.spot}"/><stop offset="1" stop-color="${T.deep}"/></radialGradient>
          </defs>
          <rect width="400" height="500" fill="url(#${id}w)"/>
          <path d="M0 0H400V500H0Z" fill="${T.deep}" opacity=".06"/>
          <g transform="translate(0 -46)">
          ${print}
          <path d="M0 262H400V300H0Z" fill="url(#${id}t)"/>
          <path d="M0 300H400V500H0Z" fill="url(#${id}f)"/>
          <path d="M150 288 C 210 286 290 290 330 300 L 170 300Z" fill="${T.deep}" opacity=".38"/>
          <path d="M226 294 C 270 292 330 294 380 300 L 236 300Z" fill="${T.deep}" opacity=".32"/>
          <path d="M120 290V150C120 138 128 132 134 122V96H152V122C158 132 166 138 166 150V290Z" fill="url(#${id}b)"/>
          <path d="M131 96H155V90H131Z" fill="${T.mid}"/>
          <path d="M176 292V206C176 196 186 192 206 192C226 192 236 196 236 206V292Z" fill="url(#${id}b)"/>
          <ellipse cx="206" cy="206" rx="30" ry="5" fill="${T.deep}" opacity=".35"/>
          <path d="M98 292V232C98 224 104 220 113 220C122 220 128 224 128 232V292Z" fill="url(#${id}b)" opacity=".92"/>
          <circle cx="270" cy="276" r="18" fill="url(#${id}s)"/>
          <path d="M0 300H400" stroke="${T.lite}" stroke-opacity=".35" stroke-width="1"/>
          </g>
          <rect y="440" width="400" height="60" fill="${T.deep}"/>
        </svg>
        <i class="eds-grain"></i>
        <p class="eds-mast" style="--eds-mn:${n}">${e(name)}</p>
        <span class="eds-no">No. 01 · Spring</span>
      </div>
      <figcaption class="eds-fig"><span><em>Fig. 1</em> — Still life, the studio table</span><span class="eds-folio">p. 01</span></figcaption>
    </figure>`;
  },

  // 02 on the board is a text page, in real markup: two justified columns of body serif
  // (the board's only drop cap), a pull quote between hairlines, the states, and a byline
  // with a folio. The deck's Interface slide still takes the field and toggle from the
  // default panel (the framework falls back to it when this markup lacks them).
  panels: {
    panel(ctx) {
      return `<div class="ab-panel eds-page">
          <div class="eds-cols">
            <p class="eds-p">Every page begins with a single decision about scale. The cover gives the image the room and lets one line of type stand against it; inside, the rhythm changes to columns, folios and hairlines, and the reader slows down.</p>
            <p class="eds-p">A design language works the same way. It holds a few things steady (the paper, the ink, the faces and the measure) so that the stories can change from issue to issue without the page losing its voice. Nothing here is decoration: a rule separates, a caption explains, an italic word marks the turn in a sentence.</p>
          </div>
          <blockquote class="eds-pull"><p>\u201CA brand does not need to raise its voice to be heard.\u201D</p></blockquote>
          ${ctx.parts.states()}
          <p class="eds-by"><span>Words by the editors \u00B7 Photographs by the studio</span><span>p. 14</span></p>
        </div>`;
    },
  },

  materials: [
    { name: 'Paper', css: 'background: {canvas}; color: {ink}; border-radius: 0; box-shadow: none; /* canvas warmed ~25% toward cream; no cards, panels are the same paper */' },
    { name: 'Masthead rule', css: 'border-top: 3px solid {hairStrong}; border-bottom: 1px solid {hairStrong}; height: 7px; /* thick over thin, under the masthead only */' },
    { name: 'Hairline', css: 'border-top: 1px solid {hair}; /* every divider, every panel edge; never a shadow */' },
    { name: 'Duotone cover', css: 'a full-width 4:5 image: black {edsDeep} + spot {edsSpot} (primary 42% into paper), highlights {edsLite}; 5% grain; masthead wordmark edge to edge across the top; headline over the lower third in {edsPaperlight}; caption "Fig. 1" and folio below' },
    { name: 'Primary action', css: 'background: {primary}; color: {onPrimary}; border-radius: 0; text-transform: uppercase; letter-spacing: .14em; font-size: 12px; /* hover: background {ink}, color {canvas}; pressed: {ink} with a 1px paper inset; ink on paper only */' },
    { name: 'Text page', css: 'body serif 15/22 in two columns, a 3-line drop cap on the first paragraph only, a pull quote in heading italic 28px between hairlines, byline and folio in 9px small caps' },
    { name: 'Contents row', css: 'border-top: 1px solid {hairSoft}; /* name, dotted leader (1px dotted {hair}), status in small caps, page number right */' },
  ],

  rules: {
    do: [
      'Let one image carry the cover and set the headline over it at poster scale (120px+) against 9px captions.',
      'Set the headline in a didone at weight 400; the highlight word goes italic in the same ink. Contrast, not colour.',
      'Separate everything with hairline rules; use a thick-over-thin double rule once, under the masthead.',
      'Keep corners square (0–2px) and flat: no shadows, no gradients outside the duotone plate.',
      'Set captions, tabs and labels in small-caps sans with .14em tracking; keep reading copy in the text serif, with a drop cap only on a long first paragraph.',
    ],
    dont: [
      'Bold the headline, round the controls or add a shadow to a card; this is print, not an app.',
      'Colour a headline word with a brand colour, or use a stand-in letter where the image should be.',
      'Fill the page with tinted cards; the page is one sheet of paper with hairlines.',
      'Run body copy in sans or letter-space the serif.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    materialStage: 'pattern',
    coverDisplay: 1.1,
    principles: [
      ['One image carries the cover', 'A full-bleed duotone, the masthead edge to edge.'],
      ['Scale, not weight', 'A didone at 120px over 9px captions.'],
      ['One italic word, in ink', 'Contrast, not colour. Hairlines do the rest.'],
    ],
    do: [
      'Let one image carry the cover.',
      'Separate everything with hairline rules.',
      'Set labels in small-caps sans.',
    ],
    dont: [
      'Bold the headline or round the controls.',
      'Colour a headline word with the brand.',
      'Run body copy in sans.',
    ],
  },
});
