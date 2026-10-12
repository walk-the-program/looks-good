/* 47 Gummy — translucent, squishy, sweet. Light passes through, colour spills.
   References: Pinterest Predicts 2026 "Gimme Gummy" (jelly blush, gummy textures), Adobe's 2026
   "puffy, soft and squishy" trend, Framer's jelly buttons (wobble on hover), OLLY (gummy-vitamin
   brand: scalloped seal, pill CTAs, candy on pastel), the translucent iMac G3 / Game Boy Color
   (seeing the inside as delight), glazed "jelly" beauty packaging. No bears, no candy marks.

   Mechanism (the difference from Clay, which is opaque matte with grey shadows):
   - Jelly body: a saturated, translucent fill whose TRANSMITTED light pools lighter and more
     saturated at the bottom-right (light exits opposite the top-left source); a denser Fresnel
     rim 2-4px inside the edge; two or three tiny sharp specular DOTS top-left (never a big gloss
     cap: that is Aero).
   - Coloured shadow + caustic: every shadow is its jelly's own colour, offset down, soft, with a
     small bright focused spot inside it. Never grey.
   - Squash and stretch: pressed = scaleY(.86) scaleX(1.08) from the bottom edge; hover = a 1.03
     wobble with the dots shifted 1px.
   - Flavours: primary, secondary and accent pushed to candy (chroma up, lightness 52-70); two more
     flavours are computed by rotating the primary hue +-40 degrees. Overlaps multiply.
   - The headline's last word is a jelly word (def.headline): candy colour, a coloured shadow, a
     white top-left edge light, two specular dots, squashed onto its baseline.
   - def.art is a candy spill: gumdrops, a ridged ring, a two-tone worm, beans and a sugared drop,
     each with a coloured shadow and caustic, overlapping with multiply. */
(function () {
let seq = 0;

const GM_PLUM = '#2A1B3D';
const GM_SUGAR = '#FFF8FB';

function gmHex(h, s, l) { return hslToHex(h, Math.max(0, Math.min(100, s)), Math.max(0, Math.min(100, l))); }

// a client colour pushed to candy
function gmCandy(hex, rot) {
  const c = hexToHsl(hex);
  const grey = c.s < 10;
  return { h: c.h + (rot || 0), s: grey ? c.s : Math.max(c.s, 64), l: Math.min(70, Math.max(52, c.l)) };
}
function gmTones(f) {
  return {
    base: gmHex(f.h, f.s, f.l),
    light: gmHex(f.h, f.s + 10, Math.min(90, f.l + 18)),
    deep: gmHex(f.h, f.s + 6, Math.max(14, f.l - 16)),
    rim: gmHex(f.h, f.s + 4, Math.max(10, f.l - 26)),
    pale: gmHex(f.h, Math.min(f.s, 80), 93),
  };
}
// the flavour as a button: candy, then shaded only as far as a white label needs; else plum label
function gmButton(hex) {
  const f = gmCandy(hex);
  const W = l => contrastRatio('#ffffff', gmHex(f.h, f.s, l));
  const P = l => contrastRatio(GM_PLUM, gmHex(f.h, f.s, l));
  const yellow = f.h >= 38 && f.h <= 80;
  if (!yellow) {
    let l = f.l;
    while (l > 38 && W(l) < 4.5) l--;
    if (W(l) >= 4.5) return { f: { h: f.h, s: f.s, l }, label: '#ffffff' };
  }
  let l = f.l;
  while (l < 86 && P(l) < 4.5) l++;
  return { f: { h: f.h, s: f.s, l }, label: GM_PLUM };
}
// the jelly word: candy, shaded until it reads at 3:1 on the ground
function gmWordColour(hex, ground, dark) {
  const f = gmCandy(hex);
  let l = f.l;
  let c = gmHex(f.h, f.s, l);
  while (contrastRatio(c, ground) < 3.1 && l > 12 && l < 92) { l += dark ? 2 : -2; c = gmHex(f.h, f.s, l); }
  return c;
}

function gmEsc(s) { return escapeHtml(String(s == null ? '' : s)); }

// The nearest weight a face really has (font-synthesis is off): `want`, else the next one up
// within 100, else the next one down. Fonts come from the global app state.
function gmWeight(font, want) {
  const ws = String((font && font.weights) || '400').split(';').map(Number).filter(Boolean);
  if (ws.includes(want)) return want;
  const up = ws.filter(w => w > want).sort((x, y) => x - y)[0];
  const down = ws.filter(w => w < want).sort((x, y) => y - x)[0];
  return up && up - want <= 100 ? up : (down || up || 400);
}
function gmFonts() {
  const st = typeof state !== 'undefined' ? state : null;
  return { h: st && st.headingFont, b: st && st.bodyFont };
}

// Material slide: one big gumdrop dissected like a confectioner's spec sheet.
function gmAnatomy(ctx) {
  const t = ctx.t;
  const night = !!t.isDark;
  const id = `gm${++seq}`;
  const tn = gmTones(gmCandy(t.primary));
  const sq = gmTones(gmCandy(t.secondary));
  const ink = night ? GM_SUGAR : GM_PLUM;
  const bw = gmWeight(gmFonts().b, 700);
  const call = (x1, y1, x2, y2, tx, ty, anchor, a, b) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${ink}" stroke-opacity=".5" stroke-width="1.4" fill="none"/><circle cx="${x1}" cy="${y1}" r="4" fill="${ink}"/>
    <text x="${tx}" y="${ty}" text-anchor="${anchor}" font-family="var(--ab-font-b, sans-serif)" fill="${ink}"><tspan font-size="17" font-weight="${bw}">${a}</tspan><tspan x="${tx}" dy="21" font-size="15" fill-opacity=".78">${b}</tspan></text>`;
  const dome = 'M208 372C190 236 254 120 340 120S490 236 472 372C432 392 248 392 208 372Z';
  return `<svg class="gm-anatomy" viewBox="0 0 600 520" aria-hidden="true" focusable="false">
    <defs>${gmDefs(`${id}p`, tn)}${gmDefs(`${id}s`, sq)}
      <filter id="${id}b" x="-40%" y="-200%" width="180%" height="500%"><feGaussianBlur stdDeviation="13"/></filter>
      <filter id="${id}c" x="-40%" y="-300%" width="180%" height="700%"><feGaussianBlur stdDeviation="5"/></filter>
    </defs>
    <g filter="url(#${id}b)"><ellipse cx="362" cy="388" rx="168" ry="30" fill="${tn.deep}" fill-opacity="${night ? 0.6 : 0.45}"/></g>
    <g filter="url(#${id}c)"><ellipse cx="386" cy="392" rx="58" ry="10" fill="${tn.light}"/></g>
    <g opacity=".9"><path d="${dome}" fill="url(#${id}p)"/><path d="${dome}" fill="url(#${id}pg)"/></g>
    <path d="M216 366C200 240 260 130 340 130S480 240 464 366" fill="none" stroke="${tn.rim}" stroke-opacity=".45" stroke-width="7"/>
    ${gmDots(272, 176, 2)}
    <g opacity=".88"><rect x="452" y="430" width="104" height="44" rx="22" fill="url(#${id}s)" transform="translate(504 474) scale(1.08 .86) translate(-504 -474)"/></g>
    <g opacity=".88"><rect x="330" y="426" width="96" height="48" rx="24" fill="url(#${id}s)"/></g>
    ${gmDots(346, 438, 0.5)}${gmDots(470, 440, 0.5)}
    <text x="378" y="500" text-anchor="middle" font-family="var(--ab-font-b, sans-serif)" font-size="14" fill="${ink}" fill-opacity=".8">set</text>
    <text x="504" y="500" text-anchor="middle" font-family="var(--ab-font-b, sans-serif)" font-size="14" fill="${ink}" fill-opacity=".8">squish</text>
    ${call(254, 168, 150, 96, 26, 62, 'start', 'Specular dots', 'two or three, never a cap')}
    ${call(214, 320, 150, 290, 20, 262, 'start', 'Fresnel rim', 'denser at the edge')}
    ${call(400, 330, 520, 150, 590, 112, 'end', 'Transmitted light', 'pools bottom-right')}
    ${call(280, 398, 170, 446, 20, 470, 'start', 'Coloured shadow', 'its own colour, plus a caustic')}
  </svg>`;
}

/* ---------------- art: the candy spill ---------------- */

// gradient defs for one flavour: body (transmitted light bottom-right), rim, shadow
function gmDefs(id, tn) {
  return `<radialGradient id="${id}" cx=".68" cy=".74" r=".85"><stop offset="0" stop-color="${tn.light}"/><stop offset=".45" stop-color="${tn.base}"/><stop offset=".92" stop-color="${tn.deep}"/><stop offset="1" stop-color="${tn.rim}"/></radialGradient>
    <radialGradient id="${id}g" cx=".3" cy=".25" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`;
}
// coloured shadow + caustic under an object (cx, cy = ground contact)
function gmShadow(cx, cy, rx, tn, f, night) {
  return `<g filter="url(#${f}b)"><ellipse cx="${cx + rx * 0.16}" cy="${cy + 8}" rx="${rx * 1.02}" ry="${rx * 0.2}" fill="${tn.deep}" fill-opacity="${night ? 0.55 : 0.42}"/></g>
    <g filter="url(#${f}c)"><ellipse cx="${cx + rx * 0.28}" cy="${cy + 9}" rx="${rx * 0.34}" ry="${rx * 0.07}" fill="${tn.light}" fill-opacity=".95"/></g>`;
}
function gmDots(x, y, k) {
  return `<g fill="#fff"><ellipse cx="${x}" cy="${y}" rx="${7 * k}" ry="${4.2 * k}" transform="rotate(-28 ${x} ${y})"/><circle cx="${x + 13 * k}" cy="${y - 6 * k}" r="${2.6 * k}"/><circle cx="${x - 2 * k}" cy="${y + 11 * k}" r="${1.6 * k}" fill-opacity=".8"/></g>`;
}

function gmArt(ctx) {
  const t = ctx.t;
  const night = !!t.isDark;
  const id = `gm${++seq}`;
  // flavours: primary, secondary, accent, then two computed by rotating the primary hue; the
  // first rotation turns the other way when it would land on the accent's hue
  const ph = hexToHsl(t.primary).h, ah = hexToHsl(t.accent).h;
  const rot = hueDiff(ph + 40, ah) < 30 ? -72 : 40;
  const F = [gmTones(gmCandy(t.primary)), gmTones(gmCandy(t.secondary)), gmTones(gmCandy(t.accent)), gmTones(gmCandy(t.primary, rot)), gmTones(gmCandy(t.primary, -36))];
  const defs = F.map((tn, i) => gmDefs(`${id}f${i}`, tn)).join('');
  const op = night ? 0.9 : 0.88;
  // sugar speckles for the sugared gumdrop
  let sugar = '';
  let a = 11;
  const r = () => { a = (a * 9301 + 49297) % 233280; return a / 233280; };
  for (let i = 0; i < 70; i++) {
    const ang = r() * Math.PI, rad = 30 + r() * 62;
    sugar += `<circle cx="${(300 + Math.cos(ang) * rad * 1.05).toFixed(1)}" cy="${(318 - Math.sin(ang) * rad * 1.2).toFixed(1)}" r="${(1 + r() * 1.6).toFixed(1)}" fill="#fff" fill-opacity="${(0.45 + r() * 0.45).toFixed(2)}"/>`;
  }
  const ridges = (cx, cy, rr, n) => {
    let s = '';
    for (let i = 0; i < n; i++) {
      const an = (Math.PI * 2 * i) / n;
      s += `<path d="M${(cx + Math.cos(an) * (rr - 22)).toFixed(1)} ${(cy + Math.sin(an) * (rr - 22) * 0.86).toFixed(1)}L${(cx + Math.cos(an) * (rr + 22)).toFixed(1)} ${(cy + Math.sin(an) * (rr + 22) * 0.86).toFixed(1)}"/>`;
    }
    return s;
  };
  return `<svg class="gm-spill" viewBox="0 110 1200 350" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <defs>${defs}
      <filter id="${id}b" x="-40%" y="-200%" width="180%" height="500%"><feGaussianBlur stdDeviation="11"/></filter>
      <filter id="${id}c" x="-40%" y="-300%" width="180%" height="700%"><feGaussianBlur stdDeviation="4"/></filter>
      <linearGradient id="${id}w" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${F[2].base}"/><stop offset=".5" stop-color="${F[2].base}"/><stop offset=".5" stop-color="${F[1].base}"/><stop offset="1" stop-color="${F[1].base}"/></linearGradient>
    </defs>
    <!-- worm: two-tone, ridged, curled across the back -->
    ${gmShadow(600, 372, 230, F[2], id, night)}
    <g opacity="${op}">
      <path d="M380 360C440 300 520 380 590 352S700 270 770 300S860 372 830 392" fill="none" stroke="url(#${id}w)" stroke-width="50" stroke-linecap="round"/>
      <path d="M380 360C440 300 520 380 590 352S700 270 770 300S860 372 830 392" fill="none" stroke="${F[1].rim}" stroke-opacity=".3" stroke-width="50" stroke-linecap="butt" stroke-dasharray="2.5 13"/>
      <path d="M384 346C444 288 520 366 590 338S700 256 770 286" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="8" stroke-linecap="round"/>
    </g>
    ${gmDots(398, 340, 0.85)}
    <!-- ridged ring (secondary) -->
    ${gmShadow(640, 330, 118, F[1], id, night)}
    <g opacity="${op}">
      <ellipse cx="640" cy="236" rx="96" ry="83" fill="none" stroke="url(#${id}f1)" stroke-width="58"/>
      <g stroke="${F[1].rim}" stroke-opacity=".35" stroke-width="3">${ridges(640, 236, 96, 26)}</g>
      <ellipse cx="640" cy="236" rx="125" ry="112" fill="none" stroke="${F[1].rim}" stroke-opacity=".45" stroke-width="3"/>
      <ellipse cx="640" cy="236" rx="67" ry="54" fill="none" stroke="${F[1].rim}" stroke-opacity=".35" stroke-width="3"/>
    </g>
    ${gmDots(574, 160, 1.1)}
    <!-- the sugared gumdrop (primary), front left -->
    ${gmShadow(300, 404, 118, F[0], id, night)}
    <g opacity="${op}">
      <path d="M190 404C176 300 220 214 300 214S424 300 410 404C380 418 220 418 190 404Z" fill="url(#${id}f0)"/>
      <path d="M190 404C176 300 220 214 300 214S424 300 410 404C380 418 220 418 190 404Z" fill="url(#${id}f0g)"/>
      <path d="M196 398C186 304 226 222 300 222S414 304 404 398" fill="none" stroke="${F[0].rim}" stroke-opacity=".45" stroke-width="5"/>
    </g>
    ${sugar}
    ${gmDots(238, 262, 1.4)}
    <!-- jelly cube (rotated flavour) overlapping the gumdrop: overlaps multiply like candy glass -->
    ${gmShadow(452, 404, 70, F[4], id, night)}
    <g opacity="${op}" style="mix-blend-mode:multiply" transform="rotate(-10 452 350)">
      <rect x="392" y="292" width="122" height="112" rx="34" fill="url(#${id}f4)"/>
      <rect x="397" y="297" width="112" height="102" rx="30" fill="none" stroke="${F[4].rim}" stroke-opacity=".4" stroke-width="4"/>
    </g>
    ${gmDots(420, 316, 0.95)}
    <!-- jelly bean (accent), tumbling -->
    ${gmShadow(890, 402, 84, F[2], id, night)}
    <g opacity="${op}" transform="rotate(-24 890 352)">
      <path d="M816 352C816 316 846 300 880 312C900 319 918 312 940 306C976 297 980 352 960 380C940 408 900 402 870 398C836 394 816 382 816 352Z" fill="url(#${id}f2)"/>
      <path d="M822 352C822 320 850 306 880 318" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="5" stroke-linecap="round"/>
    </g>
    ${gmDots(842, 330, 0.9)}
    <!-- gumdrop (other flavour), back right, a little squashed -->
    ${gmShadow(1040, 372, 92, F[3], id, night)}
    <g opacity="${op}">
      <path d="M952 372C944 290 984 220 1040 220S1136 290 1128 372C1104 384 976 384 952 372Z" fill="url(#${id}f3)"/>
      <path d="M958 366C952 294 988 228 1040 228" fill="none" stroke="${F[3].rim}" stroke-opacity=".45" stroke-width="5"/>
    </g>
    ${gmDots(1000, 258, 1.1)}
    <!-- small drops -->
    ${gmShadow(150, 420, 30, F[1], id, night)}
    <g opacity="${op}"><circle cx="150" cy="394" r="28" fill="url(#${id}f1)"/></g>${gmDots(140, 382, 0.6)}
    ${gmShadow(1140, 420, 24, F[0], id, night)}
    <g opacity="${op}"><circle cx="1140" cy="400" r="22" fill="url(#${id}f0)"/></g>${gmDots(1132, 391, 0.5)}
    ${gmShadow(760, 420, 26, F[3], id, night)}
    <g opacity="${op}"><ellipse cx="760" cy="402" rx="30" ry="20" fill="url(#${id}f3)"/></g>${gmDots(748, 394, 0.55)}
  </svg>`;
}

// scalloped seal (OLLY-style) as an SVG data URI in a flavour, for backgrounds
function gmSealUri(tn, n) {
  let d = '';
  const N = n || 16, R = 46, r = 6.2;
  for (let i = 0; i < N; i++) {
    const an = (Math.PI * 2 * i) / N;
    d += `<circle cx='${(50 + Math.cos(an) * (R - r + 1)).toFixed(2)}' cy='${(50 + Math.sin(an) * (R - r + 1)).toFixed(2)}' r='${r}'/>`;
  }
  const enc = s => s.replace(/#/g, '%23');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><radialGradient id='j' cx='.66' cy='.72' r='.8'><stop offset='0' stop-color='${tn.light}'/><stop offset='.5' stop-color='${tn.base}'/><stop offset='1' stop-color='${tn.deep}'/></radialGradient></defs><g fill='url(%23j)'>${d}<circle cx='50' cy='50' r='${R - r}'/></g><circle cx='50' cy='50' r='${R - r - 4}' fill='none' stroke='${tn.rim}' stroke-opacity='.35' stroke-width='1.5' stroke-dasharray='2 3'/><ellipse cx='28' cy='26' rx='6' ry='3.4' transform='rotate(-35 28 26)' fill='white'/><circle cx='37' cy='21' r='2' fill='white'/></svg>`;
  return `url("data:image/svg+xml;utf8,${enc(svg).replace(/'/g, '%27')}")`;
}

registerAesthetic({
  key: 'gummy', order: 47,
  name: 'Gummy',
  descriptor: 'Translucent · Squishy · Sweet',
  influences: 'Gummy candy / Jelly UI / Squash and stretch',
  summary: 'Translucent candy controls with coloured shadows, tiny specular dots and a squash when pressed.',
  motto: 'Light passes through, colour spills.',
  kicker: 'Fresh batch',
  mode: 'light',
  slideShape: 'soft',
  labels: { material: 'Jelly', states: ['Set', 'Wobble', 'Squish'], statesKind: 'button' },
  layout: { hero: 'centered', palette: 'swatches', sections: 'two-col', subcopy: true },
  type: { ui: 'body', label: 'body', display: 1.06 },
  highlight: 'custom',
  highlightNote: 'The last word of the headline is a jelly word: the primary flavour (shaded to 3:1), a soft shadow in its own colour, a white top-left edge light and two specular dots, squashed onto its baseline. In running UI text the highlight word is the primary flavour as text, never a filled pill.',
  cardFill: '--ab-gm-card',

  roles: {
    canvas: {
      use: 'A pale candy ground: white tinted 6% toward the primary (dark mode: deep plum tinted 8%); pale cards sit on it with coloured soft shadows',
      never: 'Text, grey, a saturated flavour as the page',
      coverage: '60–70%',
    },
    ink: {
      use: 'Text is the fixed warm plum #2A1B3D (dark mode: sugar white #FFF8FB); jelly labels are white only where they reach 4.5:1, otherwise plum',
      never: 'Pure black, grey shadows, borders around jellies (depth comes from coloured shadows)',
      coverage: '15–20%',
    },
    primary: {
      use: 'The main flavour: the jelly CTA, the selected jelly bean, the toggle gumdrop when on, the jelly word in the headline, the hero gumdrop',
      never: 'Long text on translucent jelly, flat opaque fills, a grey shadow under it',
      coverage: '≈10–12%',
    },
    secondary: {
      use: 'The second flavour: the ridged ring and worm in the art, the gumdrop perched on the card, gumdrop bullets, the second progress worm',
      never: 'The main action, body text, page background',
      coverage: '≈10%',
    },
    accent: {
      use: 'The third flavour: the scalloped seal, one bean and half the worm, the third gumdrop bullet',
      never: 'Buttons, body text, borders, large fills',
      coverage: '≤5%',
    },
  },

  canvas(b) {
    return b.isDark ? b.mix(b.primary, '#1B1226', 0.08) : b.mix(b.primary, '#FFFFFF', 0.06);
  },

  headline(ctx, text) {
    const s = String(text || '').trim();
    const m = s.match(/^([\s\S]*?)([^\s]+?)([.,;:!?…]*)$/);
    if (!m) return gmEsc(s);
    return `${gmEsc(m[1])}<span class="ab-hl gm-jw"><span class="gm-jw-t">${gmEsc(m[2])}</span><i class="gm-dot1"></i><i class="gm-dot2"></i></span>${gmEsc(m[3])}`;
  },

  tokens(t) {
    const night = t.isDark;
    const f1 = gmTones(gmCandy(t.primary));
    const f2 = gmTones(gmCandy(t.secondary));
    const f3 = gmTones(gmCandy(t.accent));
    const f4 = gmTones(gmCandy(t.primary, 40));
    const btn = gmButton(t.primary);
    const bt = gmTones(btn.f);
    const sb = gmButton(t.secondary);
    const st = gmTones(sb.f);
    const ink = night ? GM_SUGAR : GM_PLUM;
    let muted = night ? '#D5C6DE' : '#5E4B70';
    if (contrastRatio(muted, t.canvas) < 4.5) muted = night ? '#E8DDEF' : '#4A385B';
    const word = gmWordColour(t.primary, t.canvas, night);
    const a = (hex, k) => t.alpha(hex, k);
    const fonts = gmFonts();
    return {
      '--ab-type-pick-w': 400,
      '--gm-hw': gmWeight(fonts.h, 400),
      '--gm-bw': gmWeight(fonts.b, 700),
      '--ab-ink': ink,
      '--ab-muted': muted,
      '--ab-line': night ? 'rgba(255, 240, 250, 0.16)' : a(GM_PLUM, 0.12),
      '--ab-gm-card': night ? t.mix('#ffffff', t.canvas, 0.06) : t.mix('#ffffff', t.canvas, 0.7),
      '--ab-gm-tray': night ? t.mix('#000000', t.canvas, 0.25) : t.mix(f1.base, t.canvas, 0.07),
      '--ab-gm-word': word,
      '--ab-gm-on': btn.label,
      '--ab-gm-b': bt.base, '--ab-gm-b-light': bt.light, '--ab-gm-b-deep': bt.deep, '--ab-gm-b-rim': bt.rim,
      '--ab-gm-b-sh': a(bt.deep, night ? 0.6 : 0.42),
      '--ab-gm-s-on': sb.label, '--ab-gm-s': st.base, '--ab-gm-s-light': st.light, '--ab-gm-s-deep': st.deep, '--ab-gm-s-rim': st.rim,
      '--ab-gm-f1': f1.base, '--ab-gm-f1-light': f1.light, '--ab-gm-f1-deep': f1.deep, '--ab-gm-f1-pale': f1.pale,
      '--ab-gm-f2': f2.base, '--ab-gm-f2-light': f2.light, '--ab-gm-f2-deep': f2.deep, '--ab-gm-f2-pale': f2.pale,
      '--ab-gm-f3': f3.base, '--ab-gm-f3-light': f3.light, '--ab-gm-f3-deep': f3.deep, '--ab-gm-f3-pale': f3.pale,
      '--ab-gm-f4': f4.base, '--ab-gm-f4-light': f4.light, '--ab-gm-f4-deep': f4.deep,
      '--ab-gm-shadow': a(f1.deep, night ? 0.5 : 0.2),
      '--ab-gm-seal': gmSealUri(f3),
      '--ab-gm-seal2': gmSealUri(f2, 14),
      '--ab-gm-seal-on': contrastRatio(GM_PLUM, f3.base) >= 4.5 ? GM_PLUM : '#ffffff',
    };
  },

  art(ctx) {
    return gmArt(ctx);
  },

  materials: [
    { name: 'Jelly', css: 'background: radial-gradient(60% 75% at 70% 80%, {gmBLight}, transparent 70%), linear-gradient(160deg, {gmBLight} -20%, {gmB} 45%, {gmBDeep}); color: {gmOn}; border-radius: 999px; box-shadow: inset 0 0 0 2px {gmBRim} /* Fresnel rim at ~35% */, inset 3px 4px 8px rgba(255,255,255,.35), 0 9px 16px -4px {gmBSh} /* coloured shadow, never grey */; /* + 2-3 tiny white specular dots top-left and a small bright caustic inside the shadow */' },
    { name: 'Coloured shadow + caustic', css: 'box-shadow: 0 9px 16px -4px {gmBSh}; /* the shadow is the jelly\'s own colour; a small light ellipse {gmBLight} sits inside it, under the body: light passing through */' },
    { name: 'Squish', css: 'transform: scaleY(.86) scaleX(1.08); transform-origin: 50% 100%; transition: transform 140ms cubic-bezier(.3,1.6,.5,1); /* pressed: down and outward from the base; wobble on hover = scale(1.03) */' },
    { name: 'Candy mould', css: 'background: {gmTray}; border-radius: 16px; box-shadow: inset 0 3px 6px rgba(42,27,61,.14), inset 0 -2px 0 rgba(255,255,255,.7); /* fields and tracks are moulds the jelly sits in */' },
    { name: 'Scalloped seal', css: 'background: {gmSeal} center / contain no-repeat; color: {gmSealOn}; /* OLLY-style scalloped badge in the accent flavour */' },
    { name: 'Gummy worm', css: 'background: repeating-linear-gradient(90deg, rgba(0,0,0,.12) 0 2px, transparent 2px 11px), linear-gradient(180deg, {gmF2Light}, {gmF2} 55%, {gmF2Deep}); border-radius: 999px; /* ridged, translucent progress */' },
  ],

  rules: {
    do: [
      'Tint every shadow with its jelly\'s own colour and put a small bright caustic inside it.',
      'Use two or three tiny sharp specular dots at the top-left of each jelly, never a big gloss cap.',
      'Let light pass through: the jelly is lighter and more saturated toward the bottom-right, with a denser rim inside the edge.',
      'Squash pressed controls down and outward from the base (scaleY .86, scaleX 1.08); wobble 1.03 on hover, 150ms or less.',
      'Push client colours to candy (chroma up, lightness 52–70); compute extra flavours by rotating the primary hue 40 degrees.',
    ],
    dont: [
      'Draw gummy bears or any candy brand\'s trade dress.',
      'Use grey shadows, opaque matte fills (that is Clay) or clear colourless glass (that is Liquid Glass).',
      'Put long text on translucent jelly: labels only, white where it reaches 4.5:1, otherwise plum.',
      'Animate a constant wobble; reduced motion gets a colour change only.',
    ],
  },

  deck: {
    coverDisplay: 0.66,
    coverBand: false,   // the candy spill runs across the cover's foot instead of a pattern band
    marks(ctx, kind) {
      return `<span class="gm-mark" data-k="${kind}">${kind === 'do' ? '✓' : '✕'}</span>`;
    },
    // Material slide: one gumdrop dissected (the spill is already on the cover)
    materialArt(ctx) {
      return gmAnatomy(ctx);
    },
    principles: [
      ['Light passes through, colour spills', 'Bodies are translucent and shadows carry their colour.'],
      ['Squash on press, never sag', 'Pressed controls flatten outward from the base.'],
      ['Candy colour, coloured shadows', 'Saturated bodies, tinted shadows, no grey.'],
    ],
    do: [
      'Tint every shadow with its jelly\'s colour, plus a caustic.',
      'Use tiny specular dots, not a big gloss cap.',
      'Squash pressed controls down and outward from the base.',
    ],
    dont: [
      'Add gummy bears or candy brand shapes.',
      'Use grey shadows or opaque matte fills.',
      'Put long text on translucent jelly.',
    ],
  },
});
})();
