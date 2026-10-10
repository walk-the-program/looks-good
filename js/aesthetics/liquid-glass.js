/* 05 Liquid Glass — fluid, luminous, layered. Reference: Apple Liquid Glass
   (iOS / macOS 26). Real Liquid Glass is clear glass with bright specular rims
   floating over vivid content, so: a full-width scene of saturated brand-color
   light over a dark base, a few glass controls floating on it (tab bar, round
   button, card), and near-opaque "regular material" panels everywhere else.
   Two mechanisms on purpose: backdrop blur (frosting) and a simulated
   refraction lens (a clipped, scaled duplicate of the scene). Blur alone is
   not refraction. */
registerAesthetic({
  key: 'liquid-glass', order: 5,
  name: 'Liquid Glass',
  descriptor: 'Fluid · Luminous · Layered',
  influences: 'Liquid glass / visionOS / Optical refraction',
  summary: 'Clear glass controls with bright rims floating over a vivid scene of your brand colors.',
  motto: 'Light, bent gently.',
  kicker: 'Light, layered',
  mode: 'light',
  slideShape: 'soft',
  labels: { material: 'Optics', states: ['Clear', 'Tinted', 'Frosted'], statesKind: 'chip' },
  layout: { hero: 'scene' },
  type: { ui: 'sans' },
  highlight: 'custom',
  highlightNote: 'The word is set as text, no fill or band: in --ab-hl-ink (the accent-ink shaded toward ink to hold 3:1 on the translucent hero card) over the card, and in plain --accent-ink when it sits directly on the canvas.',

  roles: {
    primary: {
      use: 'The one tinted-glass action per view, the "on" state of toggles, the focus ring and the main light in the scene',
      never: 'Body text, large solid fills, a second CTA',
    },
    secondary: {
      use: 'The second light in the scene, status chips and the second data series',
      never: 'The main CTA, body text',
    },
    accent: {
      use: 'The highlighted headline word (shaded to read as text), one light and one shape in the scene',
      never: 'Buttons, body text, borders',
    },
  },

  tokens(t) {
    const d = t.isDark;
    // The hero card is a translucent regular material (78% of --ab-material over
    // the scene). Worst-case backdrop: the darkest scene color on a light board,
    // white on a dark one. The highlight word is shaded toward ink until it holds
    // 3:1 against that worst case (sub-copy uses --ab-ink, which clears 4.5:1).
    const sceneBase = t.mix(t.primary, '#06070d', 0.14);
    const material = t.mix('#ffffff', t.canvas, d ? 0.07 : 0.72);
    const cardFloor = t.mix(material, d ? '#ffffff' : sceneBase, 0.78);
    let hl = t.accentInk;
    for (let k = 0; k <= 1.001 && t.contrast(hl, cardFloor) < 3.2; k += 0.05) hl = t.mix(t.ink, t.accentInk, k);
    return {
      '--ab-hl-ink': hl,
      // vivid scene: a dark base the brand colors glow on (the "content" the glass floats over)
      '--ab-scene-base': sceneBase,
      // regular material: a near-opaque panel, one step lighter than the canvas
      '--ab-material': material,
      '--ab-material-line': t.alpha(t.ink, d ? 0.14 : 0.09),
      '--ab-glass': t.alpha(t.canvas, d ? 0.35 : 0.45),
      '--ab-glass-solid': t.mix('#ffffff', t.canvas, d ? 0.1 : 0.6),
      '--ab-rim': d ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.6)',
      '--ab-spec': d ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.8)',
      '--ab-drop': d ? 'rgba(0,0,0,0.4)' : 'rgba(10,14,30,0.16)',
      '--ab-lens-hi': d ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.92)',
      '--ab-lens-lo': d ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.55)',
      '--ab-well': d ? 'rgba(255,255,255,0.08)' : 'rgba(20,24,40,0.07)',
      '--ab-pri-glow': t.alpha(t.primary, 0.35),
      '--ab-primary-a': t.alpha(t.primary, 0.88),
    };
  },

  art(ctx) {
    // The scene: saturated mesh light plus a few bold shapes, all <i> elements
    // sized in cqw (the art box is a size container) so the lens duplicate
    // lines up. Over it float glass controls. The round button carries the
    // refraction: a clipped duplicate of the scene, scaled and offset, masked
    // to a ring so only content near the glass edge is magnified (simulated
    // refraction, not real optics); its center is plain backdrop blur.
    const word = String(ctx.tagline || '').trim().split(/\s+/).pop().replace(/[.,;:!?…]+$/, '') || 'alive';
    const scene = '<i class="lgs-mesh"></i><i class="lgs-sun"></i><i class="lgs-ring"></i><i class="lgs-pill"></i><i class="lgs-dot"></i>';
    const icon = d => `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
    const tabs = [
      ['Home', '<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>'],
      ['Search', '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>'],
      ['Library', '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>'],
    ].map(([n, d], i) => `<span class="lgs-tab${i === 0 ? ' on' : ''}">${icon(d)}<em>${n}</em></span>`).join('');
    return `<div class="lgs"><div class="lgs-scene">${scene}</div>`
      + '<i class="lgs-btn"></i>'
      + abLens(scene, { x: 72.5, y: 41, w: 10, h: 21, scale: 1.16, cls: 'lgs-lens' })
      + '<svg class="lgs-play" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>'
      + `<div class="lgs-tabs">${tabs}</div>`
      + `<div class="lgs-card"><span class="lgs-cap">Now playing</span><b>${escapeHtml(word)}</b><span class="lgs-prog"><i></i></span></div>`
      + '</div>';
  },

  materials: [
    { name: 'Scene', css: 'background: radial-gradient(ellipse 42% 60% at 16% 30%, {primary}, transparent 72%), radial-gradient(ellipse 40% 55% at 80% 24%, {secondary}, transparent 72%), radial-gradient(ellipse 34% 50% at 64% 88%, {accent}, transparent 72%), {sceneBase}; /* the content glass floats over; colors at full saturation */' },
    { name: 'Floating glass control', css: 'background: rgba(255,255,255,.12); backdrop-filter: blur(14px) saturate(160%); border-radius: 999px; box-shadow: inset 1px 1px 0 rgba(255,255,255,.6), inset -1px -1px 0 rgba(255,255,255,.25), 0 0 0 .5px rgba(0,0,0,.35), 0 8px 24px {drop}; /* glass fill never above 12% white */' },
    { name: 'Regular material (panels)', css: 'background: {material}; border: 1px solid {materialLine}; border-radius: 28px; box-shadow: 0 1px 2px rgba(0,0,0,.05), 0 12px 32px -16px {drop}; /* near-opaque; no backdrop blur */' },
    { name: 'Opaque fallback', css: 'background: {glassSolid}; backdrop-filter: none; /* under prefers-reduced-transparency, keep the rim */' },
    { name: 'Primary action', css: 'background: linear-gradient(180deg, rgba(255,255,255,.5), rgba(255,255,255,.12) 50%, transparent 51%), {primaryA}; color: {onPrimary}; border: 1px solid rgba(255,255,255,.7); border-radius: 999px; box-shadow: inset 0 1px 0 rgba(255,255,255,.8), 0 8px 20px {priGlow};' },
    { name: 'Selected segment (lens)', css: 'background: linear-gradient(180deg, {lensHi}, {lensLo}); border-radius: 999px; box-shadow: 0 2px 8px rgba(0,0,0,.14), inset 0 1px 0 #fff; /* inside a capsule track */' },
    { name: 'Glass droplet knob', css: 'background: radial-gradient(circle at 35% 28%, #fff, rgba(255,255,255,.85) 22%, rgba(255,255,255,.35) 60%, rgba(255,255,255,.55)); border: 1px solid rgba(255,255,255,.8); border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,.2);' },
  ],

  rules: {
    do: [
      'Float glass only over vivid content (the saturated scene of brand colors) so there is something to refract.',
      'Keep glass fill at 12% white or less, with a bright specular rim top-left, a softer rim bottom-right and a 0.5px dark hairline outside.',
      'Pair backdrop blur with a magnified, clipped duplicate near the edges of lenses; use both mechanisms.',
      'Make every panel a near-opaque regular material on a neutral canvas; reserve glass for floating controls.',
      'Provide an opaque fallback that keeps the rim for reduced transparency.',
    ],
    dont: [
      'Call a blur-only surface refraction.',
      'Put glass on a flat or pastel background, or nest glass panels inside glass panels.',
      'Put text on strong distortion; keep it on a stable, readable substrate.',
      'Wash the page in pastel blobs; the only saturated color is the scene.',
    ],
  },
});
