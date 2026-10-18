/* ---------------------------------------------------------------------
   suggest.js — the suggestion engine. Pure functions: current state in,
   ranked suggestions out. Nothing here touches the DOM or mutates state.

   A suggestion is
     { id, section: 'fonts'|'colors'|'type', score,
       text  (one short, specific sentence naming the real font or color),
       why   (one short clause),
       apply (a state patch) }

   A patch is plain data, applied by suggest-ui.js through the normal
   state path (so Undo works and the brand is marked unsaved):
     { headingFont?: name, bodyFont?: name, scheme?, colors?: {...},
       typography?: {...partial} }

   Locked sections are never suggested for, dismissed ids are skipped, and
   anything that wouldn't change the current state is dropped.
------------------------------------------------------------------------ */

const Suggest = (function () {
  /* ---------- font knowledge ---------- */

  const GEOMETRIC = new Set(['Poppins', 'Montserrat', 'Outfit', 'Urbanist', 'Jost', 'Lexend', 'Sora',
    'Josefin Sans', 'Raleway', 'Red Hat Display', 'Plus Jakarta Sans', 'Manrope', 'Space Grotesk',
    'Righteous', 'Unbounded', 'Archivo Black', 'Dela Gothic One']);
  const NEUTRAL = new Set(['Inter', 'Geist', 'Archivo', 'IBM Plex Sans', 'DM Sans', 'Onest', 'Instrument Sans', 'Public Sans']);
  const HUMANIST = new Set(['Nunito Sans', 'Karla', 'Lato', 'Work Sans', 'Rubik', 'Figtree', 'Onest', 'Instrument Sans', 'Public Sans']);
  // Faces whose hairlines get thin at modest sizes.
  const THIN_DISPLAY = new Set(['Italiana', 'Cormorant Garamond', 'Bodoni Moda', 'Marcellus', 'Cinzel']);

  const CLEAN_SANS = ['Inter', 'DM Sans', 'Work Sans', 'Public Sans', 'Karla', 'Figtree'];
  const SOLID_SERIF = ['Lora', 'Source Serif 4', 'Merriweather', 'Literata'];
  const HUMANIST_SANS = ['Nunito Sans', 'Karla', 'Lato', 'Work Sans'];

  const fontByName = name => FONTS.find(f => f.name === name);
  const sansClass = f => (GEOMETRIC.has(f.name) ? 'geometric' : NEUTRAL.has(f.name) ? 'neutral grotesque'
    : HUMANIST.has(f.name) ? 'humanist' : 'sans');

  /* ---------- color knowledge ---------- */

  function hueName(h) {
    if (h < 15 || h >= 345) return 'red';
    if (h < 45) return 'orange';
    if (h < 70) return 'yellow';
    if (h < 150) return 'green';
    if (h < 190) return 'teal';
    if (h < 250) return 'blue';
    if (h < 290) return 'violet';
    return 'pink';
  }
  const isWarm = h => h < 70 || h >= 330;
  const isCool = h => h >= 150 && h < 270;

  const SCHEME_LABEL = {
    monochromatic: 'monochromatic', analogous: 'analogous', complementary: 'complementary',
    splitComplementary: 'split-complementary', triadic: 'triadic', custom: 'custom',
  };

  function schemePatch(primary, scheme) {
    return { scheme, colors: derivePalette(primary, scheme) };
  }

  // Smallest lightness nudge (either direction) that lets the label text on
  // `hex` reach `target` contrast, keeping hue and saturation.
  function nudgeForContrast(hex, target) {
    const { h, s, l } = hexToHsl(hex);
    for (let d = 1; d <= 40; d++) {
      for (const dir of [-1, 1]) {
        const cand = hslToHex(h, s, clamp(l + dir * d, 4, 96));
        if (contrastRatio(cand, pickReadableText(cand)) >= target) return cand;
      }
    }
    return null;
  }

  /* ---------- the engine ---------- */

  function fontSuggestions(st, ctx) {
    const out = [];
    const H = st.headingFont, B = st.bodyFont;
    const push = (id, score, text, why, patch, section = 'fonts') =>
      out.push({ id, section, score, text, why, apply: patch });

    const curated = PAIRINGS.some(p => p[0] === H.name && p[1] === B.name);
    const bodyOk = (B.category === 'sans' || B.category === 'serif');

    // Body that is hard to read at paragraph length.
    if (!bodyOk) {
      const alt = (H.category === 'serif' ? CLEAN_SANS : SOLID_SERIF.concat(CLEAN_SANS)).find(n => n !== H.name);
      push(`fonts:body=${alt}`, 93,
        `${alt} suits body text better than ${B.name}`,
        `${B.category === 'mono' ? 'Monospace' : 'Display'} faces work better for short lines.`,
        { bodyFont: alt });
    }

    // Two sans faces of the same classification blur together.
    if (H.category === 'sans' && B.category === 'sans' && sansClass(H) === sansClass(B) && H.name !== B.name) {
      const alt = SOLID_SERIF[0];
      push(`fonts:body=${alt}`, 95,
        `${H.name} and ${B.name} look samey: try ${alt} for body`,
        'A serif body gives the heading something to push against.',
        { bodyFont: alt });
    } else if (H.name === B.name) {
      const alt = H.category === 'sans' ? SOLID_SERIF[0] : CLEAN_SANS[0];
      push(`fonts:body=${alt}`, 88,
        `Try ${alt} for body to contrast with ${H.name}`,
        'Two distinct voices make the hierarchy clearer.',
        { bodyFont: alt });
    }

    // Curated pairings for this heading, first.
    PAIRINGS.filter(p => p[0] === H.name && p[1] !== B.name).forEach((p, i) => {
      push(`fonts:body=${p[1]}`, (curated ? 55 : 82) - i,
        `${H.name} pairs well with ${p[1]} for body`,
        H.category === 'serif' ? 'A clean sans keeps long text easy to read.'
          : H.category === 'display' ? 'Display faces need a calm companion.'
          : H.category === 'slab' ? 'Slab serifs like a neutral partner.'
          : H.category === 'mono' ? 'A humanist sans softens a technical heading.'
          : 'It is a tested pairing.',
        { bodyFont: p[1] });
    });

    // Category rules (skipped when the current body already fits the rule).
    const rule = (names, reason, score) => {
      const alt = names.find(n => n !== B.name && n !== H.name);
      if (alt) push(`fonts:body=${alt}`, score,
        `${alt} is a steady body font for ${H.name}`, reason, { bodyFont: alt });
    };
    if (H.category === 'serif' && B.category !== 'sans') rule(CLEAN_SANS, 'A clean sans keeps long text easy to read.', 70);
    if ((H.category === 'display' || H.category === 'slab') && !NEUTRAL.has(B.name) && B.category !== 'serif') {
      rule(CLEAN_SANS.slice(0, 3), 'A neutral body lets the heading do the talking.', 68);
    }
    if (H.category === 'mono' && !HUMANIST.has(B.name)) rule(HUMANIST_SANS, 'A humanist sans softens a technical heading.', 72);

    // The body just changed: offer a heading that suits it.
    if (ctx && ctx.changed === 'body') {
      PAIRINGS.filter(p => p[1] === B.name && p[0] !== H.name).slice(0, 2).forEach((p, i) => {
        push(`fonts:heading=${p[0]}`, 97 - i,
          `${p[0]} is a strong heading for ${B.name}`,
          'The two are a known working pair.',
          { headingFont: p[0] });
      });
    }
    return out;
  }

  function typeSuggestions(st) {
    const out = [];
    const T = st.typography || {};
    const H = st.headingFont;
    const push = (id, score, text, why, patch) => out.push({ id, section: 'type', score, text, why, apply: { typography: patch } });

    if (T.headingCase === 'uppercase' && (T.headingTracking || 0) < 1) {
      push('type:heading-tracking=2', 76,
        `Add 2px letter spacing to uppercase ${H.name}`,
        'Capitals sit too tight at default spacing.', { headingTracking: 2 });
    }
    if (T.bodyCase === 'uppercase') {
      push('type:body-case=none', 80,
        `Uppercase body is slow to read: use normal case`,
        'Mixed case gives words their shape.', { bodyCase: 'none' });
    }
    if (THIN_DISPLAY.has(H.name) && (T.headingSize || 44) < 40) {
      const w = String(H.weights).split(';').map(Number).filter(n => n >= 600).pop();
      if (w && (T.headingWeight || 700) < w) {
        push(`type:heading-weight=${w}`, 78,
          `${H.name} is thin at ${T.headingSize}px: use weight ${w}`,
          'Hairline strokes vanish at smaller sizes.', { headingWeight: w });
      } else {
        push('type:heading-size=48', 74,
          `${H.name} is thin at ${T.headingSize}px: try 48px`,
          'Hairline strokes need room to show.', { headingSize: 48 });
      }
    }
    return out;
  }

  function colorSuggestions(st) {
    const out = [];
    const c = st.colors;
    if (!c) return out;
    const { h, s, l } = hexToHsl(c.primary);
    const name = hueName(h);
    const push = (id, score, text, why, patch) => out.push({ id, section: 'colors', score, text, why, apply: patch });
    const canDerive = scheme => COLOR_SCHEMES[scheme] && COLOR_SCHEMES[scheme].offsets;

    // Accent whose label text can't reach AA: offer a nudged value.
    const accentRatio = contrastRatio(c.accent, pickReadableText(c.accent));
    if (accentRatio < 4.5) {
      const fixed = nudgeForContrast(c.accent, 4.5);
      if (fixed && fixed.toLowerCase() !== c.accent.toLowerCase()) {
        push(`colors:accent=${fixed}`, 92,
          `Accent ${c.accent} misses AA: use ${fixed}`,
          `It is ${accentRatio.toFixed(2)}:1 now and ${contrastRatio(fixed, pickReadableText(fixed)).toFixed(2)}:1 after.`,
          { scheme: 'custom', colors: Object.assign({}, c, { accent: fixed }) });
      }
    }

    // Very dark / very light primary.
    if (l < 20) {
      push('colors:dark-anchor', 74,
        `${c.primary} is near-black: use it as the dark anchor`,
        'Let the accent carry the brand and keep this one for text.',
        { scheme: 'custom', colors: Object.assign({}, c, { primary: c.accent, accent: c.secondary, neutralDark: c.primary }) });
    } else if (l > 82) {
      const darker = hslToHex(h, s, 52);
      push(`colors:primary=${darker}`, 74,
        `${c.primary} is very light: try ${darker}`,
        'A mid-tone primary works as a button and a background.',
        canDerive(st.scheme) ? { scheme: st.scheme, colors: derivePalette(darker, st.scheme) }
          : { scheme: 'custom', colors: Object.assign({}, c, { primary: darker }) });
    }

    // Scheme fit, read from the primary's saturation.
    if (l >= 20 && l <= 82) {
      if (s >= 70 && ['complementary', 'splitComplementary', 'triadic'].includes(st.scheme)) {
        const target = 'monochromatic';
        push(`colors:scheme=${target}`, 86,
          `${c.primary} is a vivid ${name}: go monochromatic`,
          `${SCHEME_LABEL[st.scheme][0].toUpperCase() + SCHEME_LABEL[st.scheme].slice(1)} puts two loud colors side by side.`,
          schemePatch(c.primary, target));
        push('colors:scheme=analogous', 70,
          `Analogous keeps ${c.primary} calm with nearby hues`,
          'Nearby hues feel related, not competing.', schemePatch(c.primary, 'analogous'));
      } else if (s >= 70 && st.scheme === 'analogous') {
        push('colors:scheme=monochromatic', 60,
          `${c.primary} can carry a monochromatic palette`,
          'One hue in several tones reads as confident.', schemePatch(c.primary, 'monochromatic'));
      } else if (s < 35 && ['monochromatic', 'analogous'].includes(st.scheme)) {
        push('colors:scheme=complementary', 84,
          `${c.primary} is muted: a complementary accent livens it`,
          'An opposite hue makes a quiet primary pop.', schemePatch(c.primary, 'complementary'));
        push('colors:scheme=splitComplementary', 72,
          `Split-complementary adds energy to ${c.primary}`,
          'It softens the opposition of a straight complement.', schemePatch(c.primary, 'splitComplementary'));
      } else if (isWarm(h) && st.scheme === 'analogous') {
        push('colors:scheme=splitComplementary', 50,
          `All warm: split-complementary adds a cool accent`,
          'A little contrast in temperature adds depth.', schemePatch(c.primary, 'splitComplementary'));
      } else if (isCool(h) && st.scheme === 'analogous') {
        push('colors:scheme=complementary', 50,
          `All cool: a complementary accent adds warmth`,
          'A warm accent stands out against cool tones.', schemePatch(c.primary, 'complementary'));
      }
    }
    return out;
  }

  // The state a patch would produce, used to drop no-op suggestions.
  function alreadyApplied(st, patch) {
    if (patch.headingFont && patch.headingFont !== st.headingFont.name) return false;
    if (patch.bodyFont && patch.bodyFont !== st.bodyFont.name) return false;
    if (patch.scheme && patch.scheme !== st.scheme) return false;
    if (patch.colors && JSON.stringify(patch.colors).toLowerCase() !== JSON.stringify(st.colors).toLowerCase()) return false;
    if (patch.typography && Object.keys(patch.typography).some(k => (st.typography || {})[k] !== patch.typography[k])) return false;
    return true;
  }

  // ctx: { changed: 'heading' | 'body' | null }
  function compute(st, ctx) {
    const locks = st.locks || {};
    const dismissed = new Set(st.dismissed || []);
    let all = [];
    if (!locks.typography) all = all.concat(fontSuggestions(st, ctx), typeSuggestions(st));
    if (!locks.color) all = all.concat(colorSuggestions(st));
    const seen = new Set();
    return all
      .filter(s => !dismissed.has(s.id) && !alreadyApplied(st, s.apply))
      .sort((a, b) => b.score - a.score)
      .filter(s => (seen.has(s.id) ? false : seen.add(s.id)));
  }

  return { compute, hueName };
})();
