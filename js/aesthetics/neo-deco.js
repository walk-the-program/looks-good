/* 12 Neo Deco — brass, stepped, fat. Reference: the Chrysler crown, Radio City's
   proscenium bands, Daily Express lobby, Cassandre and Broadway-class display caps,
   The Great Gatsby (2013) titles.
   The metal is a material, not a brand role: a FIXED brass ramp (lo / hi / lo at 135°)
   draws every line, ray, frame and diamond, so a mint or lemon accent never turns into
   "gold". Client colours stay in the swatches, the single CTA, the status tags and the
   one highlighted headline word.
   Hero: fat display caps with a gilt inline (a stroked duplicate offset up-left, built by
   the headline hook) inside a stepped nine-slice frame, over a crisp SVG sunburst: 48
   two-length rays that end on a solid brass half-disc, with three Radio City bands.
   No arches anywhere (that is Religious Futurism): swatches are stepped ziggurat tiles,
   states are three frame grades. */

// url(data:...) for an SVG string; percent-encoded so it survives the inline style attribute.
function ndUri(svg) {
  return 'url(data:image/svg+xml,' + encodeURIComponent(svg).replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/'/g, '%27') + ')';
}

// The fixed brass ramp. Dark canvas: polished brass; light canvas: a darker, oxidised one.
// `text` is the gilt used for small type (>= 4.5:1 on the canvas in both modes).
function ndBrass(isDark) {
  return isDark
    ? { base: '#C8A24A', hi: '#F1D592', lo: '#7A5A1E', text: '#D4B061' }
    : { base: '#9A7425', hi: '#C8A24A', lo: '#5B4214', text: '#6E5118' };
}

let ndSeq = 0;
function ndEsc(s) {
  return typeof escapeHtml === 'function' ? escapeHtml(s) : String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

registerAesthetic({
  key: 'neo-deco', order: 12,
  name: 'Neo Deco',
  descriptor: 'Brass · Stepped · Radiant',
  influences: 'Chrysler crown / Radio City / Cassandre and Broadway display caps',
  summary: 'Fat display caps with a gilt inline, crisp brass sunbursts and stepped setbacks on a deep field.',
  motto: 'Symmetry, polished.',
  kicker: 'Brass & setback',
  mode: 'dark',
  slideShape: 'classic',
  labels: { material: 'Brass', states: ['Single rule', 'Double rule', 'Stepped'], statesKind: 'swatch' },
  layout: { hero: 'centered', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'sans', label: 'sans', display: 1 },
  highlight: 'ink',

  roles: {
    canvas: {
      use: 'The deep field (lightness capped at 11% in dark mode) under everything; panels are a half-step lighter, never a second colour',
      never: 'Text, or bright fills',
      coverage: '65–75%',
    },
    ink: {
      use: 'Headlines (fat display caps), body copy and the quiet hairlines at low alpha',
      never: 'Large background fields in dark mode',
      coverage: '15–20%',
    },
    primary: {
      use: 'The one solid action (a stepped, notched-corner block), the selected state and switch "on"; never a line or ornament',
      never: 'Ornaments, borders, body text, a second CTA',
      coverage: '≈6–8%',
    },
    secondary: {
      use: 'Quiet support: status tags and the second bar in a chart, kept under 5%',
      never: 'The main CTA, ornaments, body text, cover or pattern fills',
      coverage: '≈3–5%',
    },
    accent: {
      use: 'The headline highlight word only. The metal is a fixed brass ramp, never the accent',
      never: 'Lines, frames, rays, fills, buttons, body text',
      coverage: '≤2%',
    },
  },

  // The field is pushed deep (<= 11% lightness) so the brass lines glow against it.
  canvas(b) {
    if (!b.isDark) return null;
    const h = b.hexToHsl(b.canvas);
    return h.l > 11 ? b.hslToHex(h.h, Math.min(h.s, 42), 11) : b.canvas;
  },

  tokens(t) {
    const d = t.isDark;
    const B = ndBrass(d);
    // interface face: the brand's own sans if it has one, else Jost-class system sans (never a display face at 11px)
    const stU = typeof state !== 'undefined' ? state : null;
    const sansF = stU && [stU.bodyFont, stU.headingFont].find(f => f && f.category === 'sans');
    const uiFace = sansF ? (sansF === stU.bodyFont ? 'var(--ab-font-b)' : 'var(--ab-font-h)') : '"Jost", "Futura", "Century Gothic", "Helvetica Neue", Arial, sans-serif';
    // t.mix(a, b, x) keeps x of a and 1 - x of b
    const panel = d ? t.mix(t.canvas, '#ffffff', 0.94) : t.mix(t.canvas, '#000000', 0.97);
    const grad = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${B.lo}"/><stop offset=".5" stop-color="${B.hi}"/><stop offset="1" stop-color="${B.lo}"/></linearGradient></defs>`;
    // 84x84 nine-slice frame: three nested 1px stepped-corner outlines (outer full, then 60% and 32%), in brass
    const line = (e, o) => `<path d="M${e} 56V${20 + e}H${10 + e}V${10 + e}H${20 + e}V${e}H56" fill="none" stroke="${B.base}" stroke-opacity="${o}" stroke-width="1" shape-rendering="crispEdges"/>`;
    const quad = line(0, 1) + line(5, 0.6) + line(10, 0.32);
    const mirror = ['', ' matrix(-1 0 0 1 84 0)', ' matrix(1 0 0 -1 0 84)', ' matrix(-1 0 0 -1 84 84)'];
    const frameSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="84" height="84" viewBox="0 0 84 84">'
      + mirror.map(m => `<g${m ? ` transform="${m.trim()}"` : ''}><g transform="translate(.5 .5)">${quad}</g></g>`).join('') + '</svg>';
    // 42x42 nine-slice: a stepped double rule (the third frame grade)
    const st = (e, o) => `<path d="M${e} 21V${8 + e}H${4 + e}V${4 + e}H${8 + e}V${e}H21" fill="none" stroke="${B.base}" stroke-opacity="${o}" stroke-width="1" shape-rendering="crispEdges"/>`;
    const smallFrame = '<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 42 42">'
      + mirror.map(m => `<g${m ? ` transform="${m.trim().replace('84 0', '42 0').replace('0 84', '0 42').replace('84 84', '42 42')}"` : ''}><g transform="translate(.5 .5)">${st(0, 1)}${st(4, 0.7)}</g></g>`).join('') + '</svg>';
    const diaSvg = (fill, stroke) => `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11">${grad}<path d="M5.5.5 10.5 5.5 5.5 10.5.5 5.5Z" fill="${fill}" stroke="${stroke}"/></svg>`;
    // stepped ziggurat outline for the palette tiles (100x100 stretched; 1px non-scaling stroke 3px inside the edge)
    const zigPts = '0,100 0,30 15,30 15,15 30,15 30,0 70,0 70,15 85,15 85,30 100,30 100,100';
    const zigSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">${grad}`
      + `<polygon points="${zigPts}" fill="none" stroke="url(#g)" stroke-width="2.4" vector-effect="non-scaling-stroke"/>`
      + `<polygon points="5,95 5,35 20,35 20,20 35,20 35,5 65,5 65,20 80,20 80,35 95,35 95,95" fill="none" stroke="${B.hi}" stroke-opacity=".75" stroke-width="1" vector-effect="non-scaling-stroke"/></svg>`;
    // reeded (fluted) brass: vertical flutes, each a lo-hi-lo cylinder
    const reed = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="40"><defs><linearGradient id="r" x1="0" x2="1"><stop offset="0" stop-color="${B.lo}"/><stop offset=".45" stop-color="${B.hi}"/><stop offset="1" stop-color="${B.lo}"/></linearGradient></defs><rect width="11" height="40" fill="url(#r)"/><rect x="11" width="1" height="40" fill="${B.lo}"/></svg>`;
    return {
      '--ab-font-ui': uiFace, '--ab-font-label': uiFace,
      '--ab-gilt': B.base,
      '--ab-gilt-hi': B.hi,
      '--ab-gilt-lo': B.lo,
      '--ab-gilt-text': B.text,
      '--ab-gilt-a': t.alpha(B.base, 0.7),
      '--ab-gilt-b': t.alpha(B.base, 0.42),
      '--ab-gilt-c': t.alpha(B.base, 0.16),
      '--ab-brass': `linear-gradient(135deg, ${B.lo}, ${B.hi} 48%, ${B.base} 62%, ${B.lo})`,
      '--ab-panel': panel,
      '--ab-veil': t.alpha(t.canvas, 0.9),
      '--ab-pri-hover': t.mix(t.primary, '#ffffff', 0.86),
      '--ab-pri-press': t.mix(t.primary, '#000000', 0.8),
      '--ab-on-pri-press': t.readable(t.mix(t.primary, '#000000', 0.8)),
      '--ab-nd-frame': ndUri(frameSvg),
      '--ab-nd-frame-s': ndUri(smallFrame),
      '--ab-nd-dia': ndUri(diaSvg(panel, B.base)),
      '--ab-nd-dia-f': ndUri(diaSvg('url(#g)', B.base)),
      '--ab-nd-zig': ndUri(zigSvg),
      '--ab-nd-reed': ndUri(reed),
    };
  },

  // Fat display caps with a gilt inline: the solid caps, and an exact duplicate in a
  // transparent fill with a 1px brass-highlight stroke, offset up-left (Broadway / Gatsby
  // inline without a paid face). Both copies share one grid cell so they wrap identically.
  headline(ctx, text) {
    const s = String(text || '').trim();
    if (!s) return '';
    const m = s.match(/^([\s\S]*?)([^\s]+?)([.,;:!?…]*)$/);
    const inner = m ? `${ndEsc(m[1])}<span class="ab-hl">${ndEsc(m[2])}</span>${ndEsc(m[3])}` : ndEsc(s);
    return `<span class="ndh"><span class="ndh-b">${inner}</span><span class="ndh-i">${inner}</span></span>`;
  },

  // The sunburst: 48 crisp rays alternating long (r 96) and short (r 70), starting at r 18
  // so they end on a solid brass half-disc; three Radio City bands at r 24 / 36 / 48; a
  // stepped baseline. Every stroke is the brass gradient (userSpaceOnUse, so horizontal and
  // radial lines both take it). In the deck's Material slide a brass specimen (gradient
  // swatch, reeded flutes, stepped frame at 1:1) replaces the fan (CSS shows .nds-mat there).
  art(ctx) {
    const B = ndBrass(ctx.t.isDark);
    const id = 'ndg' + (++ndSeq);
    const rays = [];
    for (let i = 0; i < 48; i++) {
      const a = Math.PI + (i + 0.5) * Math.PI / 48;
      const long = i % 2 === 0;
      const r1 = 18, r2 = long ? 96 : 70;
      const c = Math.cos(a), s = Math.sin(a);
      rays.push(`<line x1="${(100 + c * r1).toFixed(2)}" y1="${(100 + s * r1).toFixed(2)}" x2="${(100 + c * r2).toFixed(2)}" y2="${(100 + s * r2).toFixed(2)}" stroke-width="${long ? 1.6 : 0.8}"/>`);
    }
    const band = (r, w) => `<path d="M${100 - r} 100A${r} ${r} 0 0 1 ${100 + r} 100" stroke-width="${w}"/>`;
    const steps = 'M0 99.4H40V96.4H52V93.4H64V90.4H136V93.4H148V96.4H160V99.4H200';
    return `<div class="nds">
      <svg class="nds-svg" viewBox="0 0 200 100" preserveAspectRatio="xMidYMax meet" focusable="false" fill="none">
        <defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="10" y1="0" x2="190" y2="100"><stop offset="0" stop-color="${B.lo}"/><stop offset=".5" stop-color="${B.hi}"/><stop offset="1" stop-color="${B.lo}"/></linearGradient></defs>
        <g stroke="url(#${id})" vector-effect="non-scaling-stroke" stroke-linecap="butt">${rays.join('').replace(/<line /g, '<line vector-effect="non-scaling-stroke" ')}</g>
        <g stroke="url(#${id})">${[band(24, 2.4), band(36, 1.2), band(48, 2.4), band(98, 1)].join('').replace(/<path /g, '<path vector-effect="non-scaling-stroke" ')}</g>
        <path d="M84 100A16 16 0 0 1 116 100Z" fill="url(#${id})"/>
        <path vector-effect="non-scaling-stroke" d="${steps}" stroke="url(#${id})" stroke-width="1.2"/>
      </svg>
      <div class="nds-mat"><i class="nds-swatch"></i><i class="nds-reed"></i><i class="nds-frame"></i></div>
    </div>`;
  },

  materials: [
    { name: 'Brass', css: 'background: linear-gradient(135deg, {giltLo}, {giltHi} 48%, {gilt} 62%, {giltLo}); /* a FIXED ramp, never the accent: dark #7A5A1E / #F1D592 / #C8A24A, light #5B4214 / #C8A24A / #9A7425 */' },
    { name: 'Brass line', css: 'stroke: brass gradient (lo, hi, lo at 135°); 1px frames, double rules and diamonds; rays 1.6px long / 0.8px short' },
    { name: 'Stepped frame', css: 'border-image: 36px nine-slice, three nested 1px {gilt} outlines (100% / 60% / 32%) with two-step setback corners (10px and 20px), on a {veil} fill' },
    { name: 'Gilt inline', css: 'display caps in {ink}; a duplicate with color: transparent; -webkit-text-stroke: 1px {giltHi}; translate(-1.5px, -1.5px)' },
    { name: 'Ziggurat tile', css: 'clip-path: polygon(0 100%, 0 30%, 15% 30%, 15% 15%, 30% 15%, 30% 0, 70% 0, 70% 15%, 85% 15%, 85% 30%, 100% 30%, 100% 100%); 1px brass inner stroke; palette swatches only' },
    { name: 'Primary action', css: 'background: {primary}; color: {onPrimary}; border-radius: 0; clip-path with 6px notched corners; uppercase .2em; no ring. Hover {priHover}; pressed {priPress}' },
    { name: 'Reeded brass', css: 'repeating vertical flutes 12px wide, each lo → hi → lo: the fluted-glass and lift-door texture' },
  ],

  rules: {
    do: [
      'Keep everything symmetric about the vertical axis: centred headline, centred ornaments, equal columns.',
      'Draw every line, ray, frame and diamond in the fixed brass ramp; the brand colours never become the metal.',
      'Set the headline in fat display caps (Limelight-class) at .08em tracking with a 1px gilt inline.',
      'Use stepped setbacks for corners and tiles; rays are crisp, two lengths, and end on a solid half-disc.',
    ],
    dont: [
      'Turn the accent or any brand colour into gold lines, rays or ornament fills.',
      'Use arches, soft glows, blurred rays or glassy gradients; deco geometry is hard-edged.',
      'Round controls or use pill shapes.',
      'Set the headline in thin, widely tracked caps; that is a candle label, not 1930.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    coverDisplay: 1.45,
    principles: [
      ['Symmetry, polished', 'A centred headline, centred ornaments, equal columns.'],
      ['Brass is a material', 'A fixed brass ramp draws every line and ray.'],
      ['Fat caps, gilt inline', 'Display caps at .08em with a 1px highlight inline.'],
    ],
    do: [
      'Keep everything symmetric on the vertical axis.',
      'Draw lines and rays in the fixed brass ramp.',
      'Use the primary fill for one stepped action.',
    ],
    dont: [
      'Turn a brand colour into the metal.',
      'Use arches, glows or blurred rays.',
      'Round controls or use pill shapes.',
    ],
  },
});
