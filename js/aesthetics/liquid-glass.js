/* 05 Liquid Glass — fluid, luminous, layered. Two mechanisms on purpose:
   backdrop blur (frosting) and a simulated-refraction lens (a clipped,
   scaled duplicate of the scene). Blur alone is not refraction. */
registerAesthetic({
  key: 'liquid-glass', order: 5,
  name: 'Liquid Glass',
  descriptor: 'Fluid · Luminous · Layered',
  influences: 'Liquid glass / visionOS / Optical refraction',
  summary: 'Translucent layers that bend and glow over a soft field of your brand colors.',
  motto: 'Light, bent gently.',
  kicker: 'Light, layered',
  mode: 'light',
  slideShape: 'soft',
  labels: { material: 'Optics', states: ['Clear', 'Tinted', 'Frosted'] },

  roles: {
    primary: {
      use: 'The one tinted-glass action per view, the "on" state of toggles and the focus ring',
      never: 'Body text, large solid fills, a second CTA',
    },
    secondary: {
      use: 'Light wallpaper blobs behind glass, chips and the second data series',
      never: 'The main CTA, body text',
    },
    accent: {
      use: 'The highlighted headline word, one wallpaper blob and the lens focal shape',
      never: 'Buttons, body text, borders',
    },
  },

  tokens(t) {
    const d = t.isDark;
    // A wallpaper blob must never push ink text below ~5:1 where it sits.
    const blob = (hex, start) => {
      let a = start;
      while (a > 0.12 && t.contrast(t.ink, t.mix(hex, t.canvas, a)) < 5) a -= 0.04;
      return t.alpha(hex, a.toFixed(2));
    };
    return {
      '--ab-glass': t.alpha(t.canvas, d ? 0.35 : 0.45),
      '--ab-glass-solid': t.mix('#ffffff', t.canvas, d ? 0.1 : 0.6),
      '--ab-rim': d ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.5)',
      '--ab-spec': d ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.7)',
      '--ab-drop': d ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.12)',
      '--ab-lens-hi': d ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.88)',
      '--ab-lens-lo': d ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.5)',
      '--ab-well': d ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.32)',
      '--ab-blob-1': blob(t.primary, 0.55),
      '--ab-blob-2': blob(t.secondary, 0.5),
      '--ab-blob-3': blob(t.accent, 0.45),
      '--ab-pri-glow': t.alpha(t.primary, 0.35),
      '--ab-primary-a': t.alpha(t.primary, 0.88),
    };
  },

  art(ctx) {
    // Brand-colored shapes under a glass lens. Inside the lens a clipped
    // duplicate of the same shapes is scaled and offset: simulated
    // refraction, with a faint red/blue edge split for chromatic aberration.
    const scene = '<i class="lga-ring"></i><i class="lga-orb"></i><i class="lga-slab"></i><i class="lga-spark"></i>';
    return `<div class="lga"><div class="lga-scene">${scene}</div>`
      + abLens(scene, { x: 25, y: 30, w: 52, h: 46, scale: 1.18, dx: -3, dy: -2, cls: 'lga-lens' })
      + '</div>';
  },

  materials: [
    { name: 'Glass panel', css: 'background: {glass}; backdrop-filter: blur(24px) saturate(180%); border: 1px solid {rim}; border-radius: 28px; box-shadow: inset 0 1px 0 {spec}, inset 0 -1px 0 rgba(255,255,255,.15), 0 8px 32px {drop};' },
    { name: 'Opaque fallback', css: 'background: {glassSolid}; backdrop-filter: none; /* under prefers-reduced-transparency, keep the rim */' },
    { name: 'Primary action', css: 'background: linear-gradient(180deg, rgba(255,255,255,.5), rgba(255,255,255,.12) 50%, transparent 51%), {primaryA}; color: {onPrimary}; border: 1px solid rgba(255,255,255,.7); border-radius: 999px; box-shadow: inset 0 1px 0 rgba(255,255,255,.8), 0 8px 20px {priGlow};' },
    { name: 'Selected segment (lens)', css: 'background: linear-gradient(180deg, {lensHi}, {lensLo}); border-radius: 999px; box-shadow: 0 2px 8px rgba(0,0,0,.14), inset 0 1px 0 #fff; /* inside a glass capsule track */' },
    { name: 'Glass droplet knob', css: 'background: radial-gradient(circle at 35% 28%, #fff, rgba(255,255,255,.85) 22%, rgba(255,255,255,.35) 60%, rgba(255,255,255,.55)); border: 1px solid rgba(255,255,255,.8); border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,.2);' },
  ],

  rules: {
    do: [
      'Put glass over a field of brand-colored shapes so there is something to refract.',
      'Pair backdrop blur with a refracted, scaled duplicate inside lenses; use both mechanisms.',
      'Give every panel a visible rim and a specular top edge so it reads as glass at arm length.',
      'Provide an opaque fallback that keeps the rim for reduced transparency.',
    ],
    dont: [
      'Call a blur-only surface refraction.',
      'Nest glass panels inside glass panels, other than small sample objects.',
      'Put text on strong distortion; keep it on a stable, readable substrate.',
      'Let wallpaper blobs drop ink text below readable contrast.',
    ],
  },
});
