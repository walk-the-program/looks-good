/* ---------------------------------------------------------------------
   rules.js — heuristic "design language" recommendation engine.
   Pure function: (state) -> array of findings.
   Each finding: { category, level: 'good'|'warn'|'bad', title, detail }
------------------------------------------------------------------------ */

function contrastFinding(label, ratio, isLarge) {
  const min = isLarge ? 3 : 4.5;
  const good = ratio >= 7;
  const ok = ratio >= min;
  return {
    category: 'Contrast',
    level: good ? 'good' : ok ? 'warn' : 'bad',
    title: `${label} — ${ratio.toFixed(2)}:1`,
    detail: good
      ? 'Exceeds WCAG AAA. Very safe for body copy at any size.'
      : ok
      ? 'Meets WCAG AA. Fine for most use, but push it further before using it for long paragraphs.'
      : 'Fails WCAG AA (needs ≥4.5:1, or ≥3:1 for large text). Darken/lighten one side before shipping this pairing.',
  };
}

function typographyFindings(heading, body) {
  const out = [];
  if (heading.name === body.name) {
    out.push({
      category: 'Typography', level: 'warn',
      title: `${heading.name} for both heading & body`,
      detail: 'Safe but flat — hierarchy relies entirely on size/weight. Consider a second family, or at least a bold vs. regular contrast.',
    });
  } else if (heading.category === 'display' && body.category === 'display') {
    out.push({
      category: 'Typography', level: 'warn',
      title: `${heading.name} + ${body.name}: two expressive faces`,
      detail: 'Two display/decorative fonts compete for attention. Keep one loud voice (heading) and make the other quiet (a plain sans or serif body).',
    });
  } else if (heading.category === 'serif' && body.category === 'serif') {
    out.push({
      category: 'Typography', level: 'warn',
      title: `${heading.name} + ${body.name}: two serifs`,
      detail: 'Can work, but only if they contrast strongly in weight and x-height — otherwise they read as a mismatch rather than a pairing.',
    });
  } else if (heading.category === 'slab' && body.category === 'slab') {
    out.push({
      category: 'Typography', level: 'warn',
      title: `${heading.name} + ${body.name}: two slabs`,
      detail: 'Slab serifs have heavy, similar-looking brackets, so two of them blur together. Keep the slab for headings and set the body in a plain sans.',
    });
  } else if (
    (heading.category === 'slab' && body.category === 'sans') ||
    (heading.category === 'sans' && body.category === 'slab')
  ) {
    out.push({
      category: 'Typography', level: 'good',
      title: `${heading.name} + ${body.name}: slab/sans pairing`,
      detail: 'The slab carries weight and character in headings while the sans stays neutral in paragraphs — sturdy and highly readable.',
    });
  } else if (
    (heading.category === 'slab' && body.category === 'serif') ||
    (heading.category === 'serif' && body.category === 'slab')
  ) {
    out.push({
      category: 'Typography', level: 'warn',
      title: `${heading.name} + ${body.name}: slab over serif`,
      detail: 'Both faces have serifs, so the contrast comes only from stroke weight. Check them side by side at real sizes before committing.',
    });
  } else if (heading.category === 'display' && body.category === 'slab') {
    out.push({
      category: 'Typography', level: 'good',
      title: `${heading.name} + ${body.name}: display heading, slab body`,
      detail: 'A solid editorial combination — the display face sets the tone and the slab keeps paragraphs grounded and easy to read.',
    });
  } else if (body.category === 'display' && heading.category !== 'mono') {
    out.push({
      category: 'Typography', level: 'warn',
      title: `${heading.name} + ${body.name}: display used for body copy`,
      detail: 'Display faces are drawn for large sizes and get tiring in paragraphs. Swap the body to a sans or a text serif.',
    });
  } else if (
    (heading.category === 'serif' && body.category === 'sans') ||
    (heading.category === 'sans' && body.category === 'serif')
  ) {
    out.push({
      category: 'Typography', level: 'good',
      title: `${heading.name} + ${body.name}: serif/sans pairing`,
      detail: 'A classic, reliable combination — clear structural contrast and strong readability at body sizes.',
    });
  } else if (heading.category === 'display' && (body.category === 'sans' || body.category === 'serif')) {
    out.push({
      category: 'Typography', level: 'good',
      title: `${heading.name} + ${body.name}: expressive heading, quiet body`,
      detail: 'Strong hierarchy — the display face grabs attention while the body stays readable and gets out of the way.',
    });
  } else if (heading.category === 'mono' || body.category === 'mono') {
    out.push({
      category: 'Typography', level: 'warn',
      title: `Monospace in the mix (${heading.category === 'mono' ? heading.name : body.name})`,
      detail: 'Reads as technical/code-adjacent. Great for developer tools or data products, unusual for a general consumer brand.',
    });
  } else {
    out.push({
      category: 'Typography', level: 'good',
      title: `${heading.name} + ${body.name}`,
      detail: 'Balanced pairing with reasonable contrast between the two families.',
    });
  }
  return out;
}

function paletteFindings(colors) {
  const out = [];
  const p = hexToHsl(colors.primary);
  const s = hexToHsl(colors.secondary);
  const a = hexToHsl(colors.accent);

  const diffPS = hueDiff(p.h, s.h);
  if (diffPS < 12) {
    out.push({
      category: 'Color', level: 'warn',
      title: 'Primary & secondary are nearly monochromatic',
      detail: `Hue difference is only ${diffPS.toFixed(0)}°. Cohesive, but low differentiation — lean on lightness/saturation contrast so UI elements stay distinguishable.`,
    });
  } else if (diffPS <= 45) {
    out.push({
      category: 'Color', level: 'good',
      title: 'Analogous primary/secondary relationship',
      detail: `Hue difference of ${diffPS.toFixed(0)}° reads as calm and harmonious while still giving each color its own identity.`,
    });
  } else if (diffPS <= 90) {
    out.push({
      category: 'Color', level: 'warn',
      title: 'Primary & secondary sit in an awkward middle distance',
      detail: `${diffPS.toFixed(0)}° apart is neither harmonious nor a clean contrast. Consider nudging the hues closer together or further apart.`,
    });
  } else {
    out.push({
      category: 'Color', level: 'good',
      title: 'Primary & secondary are strongly separated',
      detail: `${diffPS.toFixed(0)}° apart gives energetic, unambiguous contrast between the two brand colors.`,
    });
  }

  if (a.s <= p.s + 5) {
    out.push({
      category: 'Color', level: 'warn',
      title: 'Accent color isn’t popping',
      detail: 'The accent should read as the most saturated, attention-grabbing color in the palette. Right now it’s about as saturated as the primary — bump its vividness so CTAs and highlights stand out.',
    });
  } else {
    out.push({
      category: 'Color', level: 'good',
      title: 'Accent color pops against primary/secondary',
      detail: 'Highest saturation in the palette — good for buttons, links, and highlights that need to draw the eye.',
    });
  }

  if (Math.abs(p.l - s.l) < 8) {
    out.push({
      category: 'Color', level: 'warn',
      title: 'Primary & secondary are close in lightness',
      detail: `Only ${Math.abs(p.l - s.l).toFixed(0)} points apart in lightness — they may blend together at a glance. Widening the gap improves visual hierarchy.`,
    });
  }

  return out;
}

function evaluateBrand(state) {
  const { headingFont, bodyFont, colors, bgMode } = state;
  const bg = bgMode === 'dark' ? colors.neutralDark : colors.neutralLight;
  const findings = [];

  const bodyTextColor = pickReadableText(bg);
  findings.push(contrastFinding('Body text on background', contrastRatio(bodyTextColor, bg), false));

  const onPrimary = pickReadableText(colors.primary);
  findings.push(contrastFinding('Text on primary button', contrastRatio(onPrimary, colors.primary), true));

  const onAccent = pickReadableText(colors.accent);
  findings.push(contrastFinding('Text on accent', contrastRatio(onAccent, colors.accent), true));

  findings.push(...typographyFindings(headingFont, bodyFont));
  findings.push(...paletteFindings(colors));

  return findings;
}
