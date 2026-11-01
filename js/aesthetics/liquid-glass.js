/* 05 Liquid Glass — fluid, luminous, layered. Reference: Apple Liquid Glass
   (iOS / macOS 26). Real Liquid Glass is a control layer of clear glass with
   bright specular rims floating over sharp content, so: a full-width scene of
   hard-edged brand-color planes and one crisp glyph (the brand initial), a
   squircle lens whose rim bends them (an SVG displacement filter on a 1:1
   duplicate), a glass tab bar and a glass slider, glass controls in the
   interface (the segmented control floats on a scene strip) and clear glass
   everywhere else (a thin white fill, a light blur, a bright specular
   rim, a soft contact shadow; never frosted). The hero copy is set directly on
   the scene's dark base (never on a frosted slab). */
let lgSeq = 0;   // unique SVG filter ids per rendered board (compare grid, deck)

const LG_KEY = 'liquid-glass';   // abCopy key for the plain functions below (js/aesthetics/registry.js)

registerAesthetic({
  key: 'liquid-glass', order: 5,
  name: 'Liquid Glass',
  descriptor: 'Fluid · Luminous · Layered',
  influences: 'Liquid glass / visionOS / Optical refraction',
  summary: 'Clear glass controls with bright rims floating over a vivid scene of your brand colors.',
  motto: 'Light, bent gently.',   // = copy.motto.text
  kicker: 'Light, layered',       // = copy.kicker.text
  mode: 'light',
  slideShape: 'soft',
  labels: { material: 'Optics', states: ['Clear', 'Tinted', 'Frosted'], statesKind: 'chip' },
  // Editable specimen copy (Brand > Advanced > Specimen copy).
  copy: {
    motto: { label: 'Motto', text: 'Light, bent gently.' },
    kicker: { label: 'Kicker above the headline', text: 'Light, layered' },
    state0: { label: 'State 1 name', text: 'Clear' },
    state1: { label: 'State 2 name', text: 'Tinted' },
    state2: { label: 'State 3 name', text: 'Frosted' },
    tab1: { label: 'Scene tab 1', text: 'Home' },
    tab2: { label: 'Scene tab 2', text: 'Search' },
    tab3: { label: 'Scene tab 3', text: 'Library' },
  },
  // stacked inset-grouped sections (iOS Settings rhythm) and a compact chip palette
  layout: { hero: 'scene', palette: 'chips', sections: 'stacked' },
  type: { ui: 'sans' },
  highlight: 'custom',
  highlightNote: 'The word is set as text, no fill or band: the raw accent (lightened toward white if it would fall under 3:1) over the dark scene on wide boards, and plain --accent-ink when the copy sits on the canvas below the scene.',

  roles: {
    primary: {
      use: 'The one tinted-glass action per view, the "on" state of toggles, the focus ring and the main light in the scene',
      never: 'Body text, large solid fills, a second CTA',
    },
    secondary: {
      use: 'The last plane of the scene and the optics strip, and the second data series',
      never: 'The main CTA, body text',
    },
    accent: {
      use: 'The highlighted headline word (set as text over the scene) and the third light in the scene',
      never: 'Buttons, body text, borders',
    },
  },

  tokens(t) {
    const d = t.isDark;
    // The scene is the dark "content" the glass floats over: half of the ink on a
    // light board; half of the canvas on a dark one (a light ink would make it grey).
    // In light mode the base is the ink only 20% darker (t.mix(a, b, k) = k of a), so
    // the scene reads as content inside the board rather than a pasted black slab.
    const sceneBase = d ? t.mix(t.canvas, '#000000', 0.5) : t.mix(t.ink, '#000000', 0.8);
    // Clear glass: the fill is white at a very low alpha over whatever is behind it, never a
    // near-opaque slab. matteFx is the colour that fill makes on a flat canvas; contrast checks use it.
    const matAlpha = d ? 0.07 : 0.16;
    const matteFx = t.mix('#ffffff', t.canvas, matAlpha);
    // headline word on the scene: the raw accent if it holds 3:1 on the scene base, else lightened toward white
    const hlScene = t.contrast(t.accent, sceneBase) >= 3 ? t.accent : t.mix(t.accent, '#ffffff', 0.35);
    // muted labels sit on the glass over the canvas (a step lighter than a dark canvas), so they
    // have to hold 4.5:1 there, not only on the canvas: pull them toward the ink until they do
    let muted = t.muted;
    for (let k = 0.1; k <= 1 && t.contrast(muted, matteFx) < 4.5; k += 0.1) muted = t.mix(t.ink, t.muted, k);
    // primary action: tinted clear glass (primary at partial alpha, a specular on top). The partial alpha
    // lets the canvas show through, so raise it until the label still holds 4.5:1 on the lifted tint.
    let ctaA = 0.74;
    for (; ctaA < 1; ctaA += 0.04) {
      const base = t.mix(t.primary, t.canvas, ctaA);
      if (t.contrast(t.onPrimary, t.mix('#ffffff', base, 0.2)) >= 4.5) break;
    }
    ctaA = Math.min(1, +ctaA.toFixed(2));
    return {
      '--ab-muted': muted,
      '--ab-hl-scene': hlScene,
      '--ab-scene-base': sceneBase,
      // clear material: white at 16% (7% in dark) over the canvas, with the backdrop blurred 2-6px behind it
      '--ab-material': d ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.16)',
      '--ab-material-line': t.alpha(t.ink, d ? 0.18 : 0.11),
      '--ab-glass': t.alpha(t.canvas, d ? 0.2 : 0.24),
      '--ab-glass-solid': t.mix('#ffffff', t.canvas, d ? 0.1 : 0.6),
      '--ab-rim': d ? 'rgba(255,255,255,0.34)' : 'rgba(255,255,255,0.9)',
      '--ab-spec': d ? 'rgba(255,255,255,0.34)' : 'rgba(255,255,255,0.9)',
      '--ab-drop': d ? 'rgba(0,0,0,0.4)' : 'rgba(10,14,30,0.16)',
      '--ab-lens-hi': d ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.92)',
      '--ab-lens-lo': d ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.55)',
      '--ab-well': d ? 'rgba(255,255,255,0.08)' : 'rgba(20,24,40,0.07)',
      '--ab-pri-glow': t.alpha(t.primary, 0.35),
      '--ab-pri-glow-strong': t.alpha(t.primary, 0.55),
      '--ab-primary-a': t.alpha(t.primary, 0.88),
      '--ab-cta-fill': t.alpha(t.primary, ctaA),
      '--lg-glass-fill': d ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.12)',
      '--ab-type-pick-w': 700,
    };
  },

  art(ctx) {
    // The scene is hard-edged content (Apple puts glass over photos, text and
    // lists, never over blur): a dark base, a primary plane, a thin accent bar and
    // a secondary plane, plus one crisp element, the brand initial. A squircle
    // lens sits off-centre so its rim cuts through the letter and the accent bar.
    // The lens holds a duplicate of the scene that an SVG displacement filter
    // bends at the rim only (normal map: neutral grey across the middle 56%,
    // ramps in the outer 22%, blurred 4px so the bend is smooth; scale
    // 40). The fringe is a 20% echo of the same full-colour scene bent a little
    // further (48), so it only ever shows the brand's own colours (no channel split).
    // This is an ordinary CSS filter on a duplicate DOM scene, not a backdrop
    // filter; the PNG export hides the duplicate and keeps the clear lens and rim
    // (css/aesthetics/liquid-glass.css, .deck-export-host).
    const initial = ctx.initial && ctx.initial !== '·' ? ctx.initial : 'M';
    const id = 'lg-refract-' + (++lgSeq);
    const scene = `<i class="lgs-mesh"></i><i class="lgs-initial">${escapeHtml(initial)}</i>`;
    const adv = { M: 0.9, W: 0.95, I: 0.34, J: 0.5, L: 0.6, F: 0.62, E: 0.64, T: 0.66, Y: 0.7, Z: 0.68, B: 0.7, P: 0.68, S: 0.64, R: 0.7, K: 0.7, X: 0.7, V: 0.72 }[initial.toUpperCase()] || 0.78;
    // cx/cy: lens centre in % of the art box; fs: the initial's font-size (cqw);
    // ar: art width / height. The lens is 0.62 of the glyph advance wide, so its
    // rim crosses the strokes rather than framing the letter.
    const lens = (cx, cy, fs, ar, cls) => {
      const w = adv * fs * 0.62;
      const h = Math.max(fs * 0.62 * ar, w * ar * 1.05);
      const x = +(cx - w / 2).toFixed(2), y = +(cy - h / 2).toFixed(2);
      const ox = x + w / 2, oy = y + h / 2;
      const sceneStyle = `left:${(-x / w) * 100}%;top:${(-y / h) * 100}%;width:${(100 / w) * 100}%;height:${(100 / h) * 100}%;transform-origin:${ox}% ${oy}%`;
      return `<div class="ab-lens ${cls}" style="left:${x}%;top:${y}%;width:${w.toFixed(2)}%;height:${h.toFixed(2)}%">`
        + `<div class="lgs-bend" style="--lg-refract:url(#${id})"><div class="ab-lens-scene" style="${sceneStyle}">${scene}</div></div></div>`;
    };
    // normal map: R ramps across x, G across y, both neutral (128) between 22% and 78%
    const ramp = (dir, ch) => {
      const c = v => (ch === 'r' ? `rgb(${v},0,0)` : `rgb(0,${v},0)`);
      const g = dir === 'x' ? 'x1="0" y1="0" x2="1" y2="0"' : 'x1="0" y1="0" x2="0" y2="1"';
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><linearGradient id="g" ${g}>`
        + `<stop offset="0" stop-color="${c(255)}"/><stop offset=".09" stop-color="${c(196)}"/><stop offset=".22" stop-color="${c(128)}"/>`
        + `<stop offset=".78" stop-color="${c(128)}"/><stop offset=".91" stop-color="${c(60)}"/><stop offset="1" stop-color="${c(0)}"/>`
        + '</linearGradient></defs><rect width="100" height="100" fill="url(#g)"/></svg>';
      return 'data:image/svg+xml,' + encodeURIComponent(svg);
    };
    const filter = `<svg class="lgs-defs" width="0" height="0" aria-hidden="true" focusable="false"><filter id="${id}" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB">`
      + `<feImage href="${ramp('x', 'r')}" preserveAspectRatio="none" result="mx"/>`
      + `<feImage href="${ramp('y', 'g')}" preserveAspectRatio="none" result="my"/>`
      + '<feComposite in="mx" in2="my" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="map0"/>'
      + '<feGaussianBlur in="map0" stdDeviation="4" result="map"/>'
      + '<feDisplacementMap in="SourceGraphic" in2="map" scale="40" xChannelSelector="R" yChannelSelector="G" result="d1"/>'
      + '<feDisplacementMap in="SourceGraphic" in2="map" scale="48" xChannelSelector="R" yChannelSelector="G" result="d2"/>'
      + '<feComposite in="d1" in2="d2" operator="arithmetic" k1="0" k2="0.8" k3="0.2" k4="0" result="bent"/>'
      // Chrome samples the displaced source nearest-neighbour, so the magnified rim shows
      // pixel steps; a 0.6px blur on the result smooths them without softening the 1:1 centre
      + '<feGaussianBlur in="bent" stdDeviation="0.6"/>'
      + '</filter></svg>';
    const icon = d => `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
    const tabs = [
      ['tab1', '<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>'],
      ['tab2', '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>'],
      ['tab3', '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>'],
    ].map(([n, d], i) => `<span class="lgs-tab${i === 0 ? ' on' : ''}">${icon(d)}<em>${abCopy(LG_KEY, n)}</em></span>`).join('');
    return `<div class="lgs">${filter}<div class="lgs-scene">${scene}</div>`
      + lens(80, 40, 30, 21 / 10, 'lgs-lens lgs-lens-w')
      + lens(72, 50, 50, 4 / 4.2, 'lgs-lens lgs-lens-n')
      + `<div class="lgs-tabs">${tabs}</div>`
      // a glass slider over the dark base, where a thin fill actually reads as glass
      + '<div class="lgs-slider"><i class="lgs-track"><i class="lgs-fill"></i></i><i class="lgs-thumb"></i></div>'
      + '</div>';
  },

  // 03: an inset grouped list in Apple's voice: title, detail text and a chevron per
  // row (real markup, no numbers or progress bars).
  panels: {
    list(ctx) {
      const e = ctx.e;
      const chev = '<svg class="lg-chev" viewBox="0 0 8 14" width="8" height="14" aria-hidden="true" focusable="false"><path d="M1.5 1.5 7 7l-5.5 5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      return `<ul class="ab-list">${ctx.rows.map(r => `<li class="ab-row"><span class="ab-row-name">${e(r[0])}</span><span class="ab-row-status">${e(r[1])}</span>${chev}</li>`).join('')}</ul>`;
    },
  },

  materials: [
    { name: 'Glass lens', css: 'border-radius: 28%; /* a squircle whose rim cuts through hard content; inside, a duplicate of the content with filter: url(#refract), an feDisplacementMap (scale 40, plus a 20% full-colour echo at 48 as the fringe, never a split colour channel) driven by a blurred normal map that is neutral in the middle and ramps in the outer 22%, so only the rim bends */ box-shadow: inset 1px 1px 0 rgba(255,255,255,.6), inset -1px -1px 0 rgba(255,255,255,.25), 0 0 0 .5px rgba(0,0,0,.25);' },
    { name: 'Scene (content under glass)', css: 'background: linear-gradient(100deg, {sceneBase} 0 50%, {primary} 50% 72%, {accent} 72% 77%, {secondary} 77%); /* hard edges for the glass to bend, plus one crisp glyph; never a blur */' },
    { name: 'Clear glass (every surface)', css: 'background: rgba(255,255,255,.16); /* 7% in dark */ backdrop-filter: blur(4px) saturate(1.6) brightness(1.06); border: 1px solid {materialLine}; box-shadow: inset 1px 1px 0 rgba(255,255,255,.9), inset -1px -1px 0 rgba(10,14,30,.07), 0 1px 2px rgba(10,14,30,.08), 0 6px 16px -6px rgba(10,14,30,.22); /* see-through: whatever is behind shows, slightly refracted; the rim and the soft contact shadow do the work */' },
    { name: 'Floating glass control', css: 'background: rgba(255,255,255,.12); backdrop-filter: blur(4px) saturate(1.6) brightness(1.06); border-radius: 999px; box-shadow: inset 1px 1px 0 rgba(255,255,255,.6), inset -1px -1px 0 rgba(255,255,255,.25), 0 0 0 .5px rgba(0,0,0,.35), 0 8px 24px {drop}; /* glass fill never above 18% white */' },
    { name: 'Glass over text or a dim layer', css: 'background: color-mix(in srgb, {canvas} 62%, transparent); backdrop-filter: blur(6px) saturate(1.6) brightness(1.1); /* dialog, sheet, side sheet, drawer: a slight local tint behind the copy keeps 4.5:1; never a frosted slab */' },
    { name: 'Opaque fallback', css: 'background: {glassSolid}; backdrop-filter: none; /* under prefers-reduced-transparency, keep the rim */' },
    { name: 'Primary action', css: 'background: linear-gradient(180deg, rgba(255,255,255,.2), rgba(255,255,255,0) 55%), {ctaFill}; backdrop-filter: blur(4px) saturate(1.6); color: {onPrimary}; border: 1px solid rgba(255,255,255,.7); border-radius: 999px; box-shadow: inset 1px 1px 0 rgba(255,255,255,.55), inset -1px -1px 0 rgba(0,0,0,.08), 0 8px 20px -8px {priGlowStrong}; /* the primary as tinted clear glass: partial alpha, a rim and a soft specular, not opaque plastic */' },
    { name: 'Selected segment (lens)', css: 'background: linear-gradient(180deg, {lensHi}, {lensLo}); border-radius: 999px; box-shadow: 0 2px 8px rgba(0,0,0,.14), inset 0 1px 0 #fff; /* inside a capsule track */' },
    { name: 'Glass droplet knob', css: 'background: radial-gradient(circle at 35% 28%, #fff, rgba(255,255,255,.85) 22%, rgba(255,255,255,.35) 60%, rgba(255,255,255,.55)); border: 1px solid rgba(255,255,255,.8); border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,.2);' },
  ],

  rules: {
    do: [
      'Make glass clear: a fill of 18% white or less (about 16% on a light canvas, 7% in dark), a 2-6px backdrop blur with a saturation and brightness lift, so what is behind shows through.',
      'Give every glass surface a bright specular rim top-left, a faint darker edge bottom-right, a hairline and a soft, low contact shadow.',
      'Float glass over sharp content (hard colour edges, type, photos, lists) so there is something to see through and bend.',
      'Bend content at the rim only: the centre of a lens stays 1:1, the outer fifth refracts.',
      'Where glass sits over copy or a dim layer, add a slight local tint (about 60% canvas) behind the text so it holds 4.5:1; do not fog the whole surface.',
      'Make the primary action tinted clear glass: the primary at partial alpha with a rim and a soft specular.',
      'In the product, put a soft brand-colour field behind the app and make the sidebar, header, cards and current nav row glass over it, with capsule controls and 28px cards.',
      'Give controls a gel feel: scale 1.03 on hover, 0.97 on press, a spring curve of about 220 ms.',
      'Provide an opaque fallback that keeps the rim for reduced transparency.',
    ],
    dont: [
      'Frost it: no milky 50-90% fills or 14px+ blur that turn glass into plastic.',
      'Call a blur-only surface refraction.',
      'Put glass on a flat or pastel background with nothing behind it to show, or nest glass panels inside glass panels.',
      'Put text on strong distortion; keep it on a stable, readable substrate.',
      'Put a refracting lens over blurred blobs; refraction of a blur is invisible (soft colour fields are for the app backdrop behind the glass).',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    // No pattern band on the cover or strip on the closing slide: the scene and its lens are
    // the cover, and slide 06 shows that same lens material (the hero art), not a pattern.
    coverBand: false,
    closingStrip: false,
    principles: [
      ['Glass floats over sharp content', 'Hard edges and type are what the rim bends.'],
      ['Clear fill, bright rim', 'A thin white fill, a light blur, a specular rim and a hairline.'],
      ['See through it', 'No frost: what sits behind the glass shows.'],
    ],
    do: [
      'Float glass only over sharp content.',
      'Keep glass fill at 18% white or less.',
      'Light blur, bright rim, soft shadow.',
    ],
    dont: [
      'Frost the glass into plastic.',
      'Nest glass inside glass.',
      'Put text on strong distortion.',
    ],
  },
});
