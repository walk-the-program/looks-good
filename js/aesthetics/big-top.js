/* 46 Big Top — striped, showy, scalloped. A grown-up circus showbill, chic rather than a kids'
   party. References: Pinterest Predicts 2026 "FunHaus" (circus stripes, vintage carnival
   lettering), Strobridge chromolithograph posters (ornate wood type, ribbon banners, keylines),
   Hamilton Wood Type (Tuscan and French Clarendon showbill faces), the big-top tent (radial canvas
   panels, scalloped valance, king pole), Luna Park (bulb-outlined signs, pennants), Dreamland
   Margate's marquee ticker.

   Mechanism.
   - Tent stripes: wide equal vertical stripes, client primary and cream only (the primary is
     shaded until the stripes hold 3:1 on cream); never more than two stripe colours plus cream.
   - The scalloped valance (a band whose bottom edge is a row of half circles) edges the board top,
     the poster card, the tabs and the palette.
   - Showbill headline (def.headline): the first line set on an ARC (each letter placed and rotated
     along a circle, widths measured from the brand's heading face), in the stripe colour with a
     navy drop shade; the middle line straight and smaller between accent stars; the last word in a
     swallowtail RIBBON banner in the secondary.
   - Ticket buttons: side notches, a perforation, ADMIT ONE and a serial number; pressed = the stub
     drops 2px. Marquee bulbs spotlight one element only (the Spotlit state, the tent door, the
     progress bulbs). A programme of acts with dotted leaders for lists.
   - def.art: the big top itself (radial striped roof, scalloped valance, striped walls, a bulb-lit
     door, king-pole flag), two small side tents, bunting on sagging lines, accent stars, a faint
     sunburst — chromolithograph flats with a navy keyline. No clowns, no animals, no balloons. */
(function () {
let seq = 0;

const BT_CREAM = '#F6ECD6';
const BT_NAVY = '#1F2A44';
const BT_BULB = '#FFF4D6';
const BT_NIGHT = '#151C30';

function btHex(h, s, l) { return hslToHex(h, Math.max(0, Math.min(100, s)), Math.max(0, Math.min(100, l))); }
// shade a colour (keep hue and saturation) until `fg` reads at `ratio` on it, or it reads at
// `ratio` on `bg` when `onBg` is set
function btShade(hex, against, ratio) {
  const c = hexToHsl(hex);
  let l = c.l, out = hex;
  const s = c.s > 10 ? Math.max(c.s, 55) : c.s;
  out = btHex(c.h, s, l);
  while (contrastRatio(out, against) < ratio && l > 4) { l -= 1; out = btHex(c.h, s, l); }
  return out;
}

function btEsc(s) { return escapeHtml(String(s == null ? '' : s)); }

// The nearest weight a face really has (font-synthesis is off): `want`, else the next one up
// within 100, else the next one down. Fonts come from the global app state.
function btWeight(font, want) {
  const ws = String((font && font.weights) || '400').split(';').map(Number).filter(Boolean);
  if (ws.includes(want)) return want;
  const up = ws.filter(w => w > want).sort((x, y) => x - y)[0];
  const down = ws.filter(w => w < want).sort((x, y) => y - x)[0];
  return up && up - want <= 100 ? up : (down || up || 400);
}
function btFonts() {
  const st = typeof state !== 'undefined' ? state : null;
  return { h: st && st.headingFont, b: st && st.bodyFont };
}
function btUri(svg) { return `url("data:image/svg+xml;utf8,${svg.replace(/#/g, '%23').replace(/'/g, '%27').replace(/"/g, '%27')}")`; }

// measured advance widths (em) of a string in a CSS font (falls back to a wood-type estimate)
let btCanvas = null;
function btWidths(chars, fontCss) {
  try {
    if (typeof document === 'undefined') throw new Error('no dom');
    btCanvas = btCanvas || document.createElement('canvas');
    const g = btCanvas.getContext('2d');
    g.font = `400 100px ${fontCss}`;
    return chars.map(ch => (ch === ' ' ? Math.max(0.3, g.measureText(' ').width / 100) : g.measureText(ch).width / 100));
  } catch (err) {
    return chars.map(ch => (ch === ' ' ? 0.32 : /[MW]/.test(ch) ? 0.92 : /[IJ]/.test(ch) ? 0.42 : 0.74));
  }
}

// one line of letters on an arch: absolute spans placed on a circle, rotated to the tangent
function btArc(text, fontCss) {
  const chars = Array.from(text.toUpperCase());
  const track = 0.035;
  const w = btWidths(chars, fontCss).map(x => x + track);
  const L = w.reduce((a, b) => a + b, 0);
  const R = Math.max(3.2, L / 0.92);
  const half = L / 2 / R;
  let acc = 0;
  const spans = chars.map((ch, i) => {
    const mid = acc + w[i] / 2;
    acc += w[i];
    const phi = (mid - L / 2) / R;
    const x = R * Math.sin(phi);
    const y = R * (1 - Math.cos(phi));
    if (ch === ' ') return '';
    return `<i style="left:calc(50% + ${x.toFixed(3)}em);top:${y.toFixed(3)}em;transform:translateX(-50%) rotate(${(phi * 180 / Math.PI).toFixed(2)}deg)">${btEsc(ch)}</i>`;
  }).join('');
  const width = 2 * R * Math.sin(half) + 0.9;
  const height = R * (1 - Math.cos(half)) + 1.02;
  return `<span class="bt-arc" style="width:${width.toFixed(3)}em;height:${height.toFixed(3)}em;--bt-aw:${width.toFixed(3)}">${spans}</span>`;
}

// The showbill: the first line arched, the middle line straight between stars, the last word in a
// swallowtail ribbon. Used by def.headline and by the deck's box-office poster.
function btBill(ctx, text) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '';
  const fontCss = (ctx.state && ctx.state.headingFont && ctx.state.headingFont.css) || '"Rye", Georgia, serif';
  if (words.length === 1) return `<span class="bt-bill">${btArc(words[0], fontCss)}</span>`;
  const lastRaw = words[words.length - 1];
  const rest = words.slice(0, -1);
  const nArc = rest.length >= 3 ? Math.ceil(rest.length / 2) : rest.length === 2 ? 2 : 1;
  const arcText = rest.slice(0, nArc).join(' ');
  const mid = rest.slice(nArc).join(' ');
  // a long first line is split again so the arch stays a showbill arch
  const arc = arcText.length > 14 && nArc > 1
    ? btArc(rest.slice(0, nArc - 1).join(' '), fontCss) + `<span class="bt-mid"><b>★</b>${btEsc(rest[nArc - 1] + (mid ? ' ' + mid : ''))}<b>★</b></span>`
    : btArc(arcText, fontCss) + (mid ? `<span class="bt-mid"><b>★</b>${btEsc(mid)}<b>★</b></span>` : '');
  return `<span class="bt-bill">${arc}<span class="ab-hl bt-ribbon"><span class="bt-rib-t">${btEsc(lastRaw)}</span></span></span>`;
}

// Deck In product (slide 08): the box office. A showbill poster for the brand on the left; on the
// right the bulb-lit box-office sign, tonight's programme (the board's own list) and two tickets.
function btProduct(ctx) {
  const e = ctx.e || btEsc;
  const tix = label => `<span class="ab-cta bt-tix"><span class="ab-cta-label">${e(label)}</span><span class="ab-cta-arrow" aria-hidden="true"></span></span>`;
  const list = ctx.parts && typeof ctx.parts.list === 'function' ? ctx.parts.list() : '';
  return `<div class="bt-prod">
    <div class="bt-poster">
      <p class="bt-p-kick"><b>★</b>${e(ctx.brandName)} presents<b>★</b></p>
      <div class="bt-p-bill" role="img" aria-label="${e(ctx.tagline)}"><span aria-hidden="true">${btBill(ctx, ctx.tagline)}</span></div>
      <p class="bt-p-sub">Under the big top · Doors at seven · Admit one</p>
      <div class="bt-p-foot"><span>Matinée &amp; evening</span><span>No. 0472</span></div>
    </div>
    <div class="bt-booth">
      <div class="bt-sign"><span>Box office</span></div>
      <section class="ab-sec ab-sec-use bt-prog" aria-label="Programme">
        <div class="ab-labelrow"><span class="ab-label"><i class="ab-n">01</i><span>Tonight's programme</span></span><span class="ab-label">3 acts</span></div>
        ${list}
      </section>
      <div class="bt-tickets">${tix('Save direction')}${tix('Book a seat')}</div>
    </div>
  </div>`;
}

// Deck Material slide: the marquee sign (a bulb-bordered board with the brand name in wood type and a
// drop shade, a valance on top, a ticket tucked in front). The tent is already on the cover.
function btMarquee(ctx) {
  const t = ctx.t;
  const night = !!t.isDark;
  const id = `bt${++seq}`;
  const cream = BT_CREAM, navy = BT_NAVY;
  const stripe = btShade(t.primary, cream, 3);
  const tixC = btShade(t.primary, cream, 4.5);
  const ribbon = btShade(t.secondary, cream, 3.2);
  const name = String(ctx.brandName || '').toUpperCase();
  const fs = Math.max(26, Math.min(64, 380 / Math.max(4, name.length * 0.68)));
  const fontH = (ctx.state && ctx.state.headingFont && ctx.state.headingFont.css) || '"Rye", Georgia, serif';
  const bw = btWeight(btFonts().b, 600);
  let bulbs = '';
  const ring = (x0, y0, x1, y1, n) => { for (let i = 0; i <= n; i++) { const x = x0 + ((x1 - x0) * i) / n, y = y0 + ((y1 - y0) * i) / n; bulbs += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="url(#${id}gl)"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.4" fill="${BT_BULB}" stroke="${navy}" stroke-width="1"/>`; } };
  ring(64, 118, 536, 118, 16); ring(64, 342, 536, 342, 16); ring(64, 132, 64, 328, 6); ring(536, 132, 536, 328, 6);
  let val = '';
  for (let i = 0; i < 16; i++) {
    const x = 72 + i * 28.5;
    val += `<rect x="${x.toFixed(1)}" y="72" width="28.6" height="26" fill="${i % 2 ? cream : stripe}"/><circle cx="${(x + 14.25).toFixed(1)}" cy="98" r="14.2" fill="${i % 2 ? cream : stripe}" stroke="${navy}" stroke-width="1.6"/>`;
  }
  return `<svg class="bt-marquee" viewBox="0 0 600 520" aria-hidden="true" focusable="false">
    <defs><radialGradient id="${id}gl"><stop offset="0" stop-color="${t.accent}" stop-opacity=".9"/><stop offset=".55" stop-color="${t.accent}" stop-opacity=".3"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></radialGradient></defs>
    <path d="M300 10V72" stroke="${night ? '#C9BFA6' : navy}" stroke-width="3"/><path d="M301.5 14l46 10-46 11z" fill="${ribbon}" stroke="${navy}" stroke-width="1.6" stroke-linejoin="round"/>
    <rect x="44" y="104" width="512" height="258" rx="10" fill="${navy}"/>
    ${val}
    <path d="M72 98H528" stroke="${navy}" stroke-width="2.4"/>
    <rect x="88" y="142" width="424" height="182" rx="4" fill="${cream}" stroke="${navy}" stroke-width="2"/>
    <rect x="96" y="150" width="408" height="166" rx="2" fill="none" stroke="${navy}" stroke-width="1"/>
    ${bulbs}
    <text x="300" y="184" text-anchor="middle" font-family="var(--ab-font-b, sans-serif)" font-size="15" font-weight="${bw}" letter-spacing="5" fill="${navy}">★ PRESENTING ★</text>
    <text x="303" y="${250 + fs * 0.05}" text-anchor="middle" font-family='${fontH.replace(/'/g, '"')}' font-size="${fs.toFixed(0)}" fill="${navy}">${btEsc(name)}</text>
    <text x="300" y="250" text-anchor="middle" font-family='${fontH.replace(/'/g, '"')}' font-size="${fs.toFixed(0)}" fill="${stripe}">${btEsc(name)}</text>
    <g transform="translate(300 290)"><path d="M-120 -16H120V16H-120Z" fill="${ribbon}"/><path d="M-120 -10l-28 0 12 13-12 13h28z M120 -10l28 0-12 13 12 13h-28z" fill="${t.mix('#000000', ribbon, 0.28)}"/>
      <text x="0" y="6" text-anchor="middle" font-family='${fontH.replace(/'/g, '"')}' font-size="20" letter-spacing="2" fill="${cream}">ONE NIGHT ONLY</text></g>
    <g transform="translate(330 412) rotate(-6)">
      <path d="M-150 -40H150V-12A12 12 0 0 0 150 12V40H-150V12A12 12 0 0 0 -150 -12Z" fill="${tixC}"/>
      <path d="M70 -34V34" stroke="${cream}" stroke-opacity=".65" stroke-width="2" stroke-dasharray="5 5"/>
      <text x="-124" y="-8" font-family="var(--ab-font-b, sans-serif)" font-size="11" letter-spacing="4" fill="${cream}" fill-opacity=".85">ADMIT ONE</text>
      <text x="-124" y="16" font-family="var(--ab-font-b, sans-serif)" font-size="17" font-weight="${bw}" letter-spacing="3" fill="${cream}">BIG TOP · ROW C</text>
      <text x="110" y="5" text-anchor="middle" font-family='${fontH.replace(/'/g, '"')}' font-size="12.5" fill="${cream}">No. 0472</text>
    </g>
  </svg>`;
}

function btStar(cx, cy, r, fill, stroke) {
  let p = '';
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.42 : r, a = (Math.PI * i) / 5 - Math.PI / 2;
    p += `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)} `;
  }
  return `<polygon points="${p.trim()}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="1.6" stroke-linejoin="round"` : ''}/>`;
}

/* ---------------- art: the big top ---------------- */

function btTent(o) {
  // o: { cx, apexY, eaveY, half, wallY, groundY, n, stripe, cream, navy, id, door, bulb, glow, flag }
  const { cx, apexY, eaveY, half, groundY, n, stripe, cream, navy, id } = o;
  const left = cx - half, right = cx + half;
  const roofD = `M${cx} ${apexY}C${cx - half * 0.32} ${apexY + (eaveY - apexY) * 0.42} ${left + half * 0.14} ${eaveY - 6} ${left} ${eaveY}L${right} ${eaveY}C${right - half * 0.14} ${eaveY - 6} ${cx + half * 0.32} ${apexY + (eaveY - apexY) * 0.42} ${cx} ${apexY}Z`;
  let panels = '';
  for (let i = 0; i < n; i++) {
    const x0 = left + (2 * half * i) / n, x1 = left + (2 * half * (i + 1)) / n;
    panels += `<polygon points="${cx},${apexY - 4} ${x0.toFixed(1)},${eaveY + 2} ${x1.toFixed(1)},${eaveY + 2}" fill="${i % 2 ? cream : stripe}"/>`;
  }
  const valH = Math.max(10, half * 0.085);
  const sc = (2 * half) / n / 2;
  let scallops = '';
  for (let i = 0; i < n * 2; i++) {
    const x = left + sc * (i + 0.5);
    scallops += `<circle cx="${x.toFixed(1)}" cy="${eaveY + valH}" r="${(sc / 2).toFixed(1)}" fill="${Math.floor(i / 2) % 2 ? cream : stripe}"/>`;
  }
  const wallL = left + half * 0.08, wallR = right - half * 0.08;
  const wallTop = eaveY + valH;
  let wall = '';
  const wn = Math.round(n * 0.9);
  for (let i = 0; i < wn; i++) {
    const x0 = wallL + ((wallR - wallL) * i) / wn;
    wall += `<rect x="${x0.toFixed(1)}" y="${wallTop}" width="${((wallR - wallL) / wn + 0.4).toFixed(1)}" height="${groundY - wallTop}" fill="${i % 2 ? cream : stripe}"/>`;
  }
  let door = '';
  if (o.door) {
    const dw = half * 0.3, dTop = wallTop + (groundY - wallTop) * 0.22;
    const dPath = `M${cx - dw / 2} ${groundY}V${dTop + dw / 2}A${dw / 2} ${dw / 2} 0 0 1 ${cx + dw / 2} ${dTop + dw / 2}V${groundY}Z`;
    let bulbs = '';
    const nb = 15;
    for (let i = 0; i < nb; i++) {
      // bulbs around the arch: up the left jamb, over the arch, down the right
      const t = i / (nb - 1);
      const per = (groundY - (dTop + dw / 2)) * 2 + Math.PI * (dw / 2 + 9);
      let d = t * per, x, y;
      const jamb = groundY - (dTop + dw / 2) - 6;
      if (d < jamb) { x = cx - dw / 2 - 9; y = groundY - 6 - d; }
      else if (d < jamb + Math.PI * (dw / 2 + 9)) { const a = Math.PI - (d - jamb) / (dw / 2 + 9); x = cx + Math.cos(a) * (dw / 2 + 9); y = dTop + dw / 2 - Math.sin(a) * (dw / 2 + 9); }
      else { x = cx + dw / 2 + 9; y = dTop + dw / 2 + (d - jamb - Math.PI * (dw / 2 + 9)); }
      if (y > groundY - 4) continue;
      bulbs += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="url(#${id}gl)"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.2" fill="${o.bulb}" stroke="${navy}" stroke-width=".8"/>`;
    }
    door = `<path d="${dPath}" fill="${navy}"/><path d="${dPath}" fill="url(#${id}in)"/>
      <path d="M${cx - dw / 2} ${groundY}V${dTop + dw / 2}A${dw / 2} ${dw / 2} 0 0 1 ${cx} ${dTop}L${cx - dw * 0.18} ${groundY}Z" fill="${stripe}" opacity=".95"/>
      <path d="M${cx + dw / 2} ${groundY}V${dTop + dw / 2}A${dw / 2} ${dw / 2} 0 0 0 ${cx} ${dTop}L${cx + dw * 0.18} ${groundY}Z" fill="${stripe}" opacity=".95"/>
      ${bulbs}`;
  }
  const flag = o.flag ? `<path d="M${cx} ${apexY - 4}V${apexY - half * 0.3}" stroke="${navy}" stroke-width="3"/><path d="M${cx + 1.5} ${apexY - half * 0.3}l${half * 0.2} ${half * 0.05}l-${half * 0.2} ${half * 0.06}z" fill="${o.flag}" stroke="${navy}" stroke-width="1.5" stroke-linejoin="round"/>` : '';
  return `<g>
    <clipPath id="${id}rc${o.k}"><path d="${roofD}"/></clipPath>
    ${flag}
    ${wall}
    <rect x="${wallL}" y="${wallTop}" width="${wallR - wallL}" height="${groundY - wallTop}" fill="none" stroke="${navy}" stroke-width="2"/>
    ${door}
    <g clip-path="url(#${id}rc${o.k})">${panels}</g>
    <path d="${roofD}" fill="none" stroke="${navy}" stroke-width="2.4" stroke-linejoin="round"/>
    <rect x="${left}" y="${eaveY}" width="${2 * half}" height="${valH}" fill="${stripe}"/>
    ${scallops}
    <path d="M${left} ${eaveY}H${right}" stroke="${navy}" stroke-width="2.4"/>
    <circle cx="${cx}" cy="${apexY - 2}" r="${Math.max(3, half * 0.02)}" fill="${o.bulb}" stroke="${navy}" stroke-width="1.6"/>
  </g>`;
}

function btArt(ctx) {
  const t = ctx.t;
  const night = !!t.isDark;
  const id = `bt${++seq}`;
  const cream = BT_CREAM;
  const navy = BT_NAVY;
  const stripe = btShade(t.primary, cream, 3);
  const ribbon = btShade(t.secondary, cream, 2.2);
  const acc = t.accent;
  const ground = night ? BT_NIGHT : cream;
  // bunting along a sagging line from (x0,y0) to (x1,y1)
  const bunting = (x0, y0, x1, y1, sag, count, phase) => {
    let s = `<path d="M${x0} ${y0}Q${(x0 + x1) / 2} ${(y0 + y1) / 2 + sag * 2} ${x1} ${y1}" fill="none" stroke="${night ? '#C9BFA6' : navy}" stroke-width="1.8"/>`;
    for (let i = 1; i < count; i++) {
      const u = i / count;
      const x = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * ((x0 + x1) / 2) + u * u * x1;
      const y = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * ((y0 + y1) / 2 + sag * 2) + u * u * y1;
      const c = [ribbon, cream, stripe][(i + phase) % 3];
      s += `<path d="M${(x - 11).toFixed(1)} ${y.toFixed(1)}L${(x + 11).toFixed(1)} ${y.toFixed(1)}L${x.toFixed(1)} ${(y + 26).toFixed(1)}Z" fill="${c}" stroke="${navy}" stroke-width="1.4" stroke-linejoin="round"/>`;
    }
    return s;
  };
  // faint sunburst behind the tent
  let rays = '';
  for (let i = 0; i < 36; i++) {
    if (i % 2) continue;
    const a0 = (Math.PI * 2 * i) / 36, a1 = (Math.PI * 2 * (i + 1)) / 36;
    rays += `<polygon points="600,330 ${(600 + Math.cos(a0) * 900).toFixed(0)},${(330 + Math.sin(a0) * 900).toFixed(0)} ${(600 + Math.cos(a1) * 900).toFixed(0)},${(330 + Math.sin(a1) * 900).toFixed(0)}"/>`;
  }
  const stars = [[150, 70, 13], [1060, 64, 15], [330, 132, 8], [880, 120, 9], [70, 220, 7], [1140, 210, 8], [760, 40, 6], [440, 48, 6]].map(([x, y, r]) => btStar(x, y, r, acc, navy)).join('');
  return `<svg class="bt-tent" viewBox="0 0 1200 520" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="${id}gl"><stop offset="0" stop-color="${acc}" stop-opacity=".95"/><stop offset=".55" stop-color="${acc}" stop-opacity=".35"/><stop offset="1" stop-color="${acc}" stop-opacity="0"/></radialGradient>
      <radialGradient id="${id}in" cx=".5" cy=".75" r=".75"><stop offset="0" stop-color="${acc}" stop-opacity=".9"/><stop offset=".5" stop-color="${acc}" stop-opacity=".25"/><stop offset="1" stop-color="${acc}" stop-opacity="0"/></radialGradient>
      <radialGradient id="${id}fade" cx=".5" cy=".64" r=".62"><stop offset="0" stop-color="${ground}" stop-opacity="0"/><stop offset=".7" stop-color="${ground}" stop-opacity=".2"/><stop offset="1" stop-color="${ground}"/></radialGradient>
    </defs>
    <g fill="${stripe}" opacity="${night ? 0.16 : 0.1}">${rays}</g>
    <rect width="1200" height="520" fill="url(#${id}fade)"/>
    ${stars}
    ${bunting(600, 30, 70, 300, 50, 11, 0)}
    ${bunting(600, 30, 1130, 300, 50, 11, 1)}
    ${btTent({ k: 1, cx: 170, apexY: 300, eaveY: 400, half: 110, groundY: 492, n: 8, stripe, cream, navy, id, bulb: BT_BULB, flag: ribbon })}
    ${btTent({ k: 2, cx: 1030, apexY: 300, eaveY: 400, half: 110, groundY: 492, n: 8, stripe, cream, navy, id, bulb: BT_BULB, flag: ribbon })}
    ${btTent({ k: 0, cx: 600, apexY: 70, eaveY: 290, half: 330, groundY: 492, n: 16, stripe, cream, navy, id, door: true, bulb: BT_BULB, flag: ribbon })}
    <path d="M40 494H1160" stroke="${night ? '#C9BFA6' : navy}" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M90 504H1110" stroke="${night ? '#C9BFA6' : navy}" stroke-width="1.2" stroke-dasharray="2 7" stroke-linecap="round"/>
  </svg>`;
}

registerAesthetic({
  key: 'big-top', order: 46,
  name: 'Big Top',
  descriptor: 'Striped · Showy · Scalloped',
  influences: 'Circus showbills / Wood type / Tent striping',
  summary: 'A grown-up circus showbill: tent stripes, scalloped edges, wood-type headlines and ticket buttons.',
  motto: 'Stripes, scallops, showbill symmetry.',
  kicker: 'One night only',
  mode: 'light',
  slideShape: 'classic',
  labels: { material: 'Canvas', states: ['Plain', 'Striped', 'Spotlit'], statesKind: 'swatch' },
  layout: { hero: 'centered', palette: 'strips', sections: 'two-col', subcopy: true },
  type: { ui: 'body', label: 'body', display: 1 },
  highlight: 'custom',
  highlightNote: 'The headline is a showbill: the first line arched in wood type in the stripe colour with a navy drop shade, the middle line straight between accent stars, and the last word in a swallowtail ribbon banner in the secondary with cream type. In running UI text the highlight word is the stripe colour, never a pill.',
  cardFill: '--ab-bt-paper',

  roles: {
    canvas: {
      use: 'Fixed cream #F6ECD6, the showbill paper (dark mode: the night show, navy #151C30); plenty of it between the stripes',
      never: 'Text, a white page, a saturated colour as the page',
      coverage: '55–65%',
    },
    ink: {
      use: 'Fixed navy #1F2A44 for text, keylines (2px), drop shades and leaders (dark mode: cream)',
      never: 'Pure black, wood type for body copy',
      coverage: '15–20%',
    },
    primary: {
      use: 'The stripe colour: tent stripes, the valance, the arched headline line, the ticket CTA (shaded so cream type reads at 4.5:1), the selected tab flap',
      never: 'A third stripe colour beside it, body text, a full-bleed flat field without stripes',
      coverage: '≈15%',
    },
    secondary: {
      use: 'Ribbon banners (the headline\'s last word), the flags and a third of the bunting',
      never: 'The main action, stripes beside the primary (two stripe colours plus cream at most), body text',
      coverage: '≈8%',
    },
    accent: {
      use: 'Stars, bulb glow (the Spotlit state, the tent door, the lit progress bulbs), the toggle star',
      never: 'Buttons, body text, borders, stripes',
      coverage: '≤5%',
    },
  },

  canvas(b) {
    return b.isDark ? BT_NIGHT : BT_CREAM;
  },

  headline(ctx, text) {
    return btBill(ctx, text);
  },

  tokens(t) {
    const night = t.isDark;
    const cream = BT_CREAM;
    const stripe = btShade(t.primary, cream, 3);
    const tix = btShade(t.primary, cream, 4.5);
    const ribbon = btShade(t.secondary, cream, 3.2);
    const ink = night ? cream : BT_NAVY;
    let muted = night ? '#C9BFA6' : '#4F5670';
    if (contrastRatio(muted, t.canvas) < 4.5) muted = night ? '#E1D7BE' : '#3B4260';
    const acc = t.accent;
    const sh = (hex, k) => t.alpha(hex, k);
    // the Spotlit swatch: a ring of 16 bulbs with glow
    let bulbs = '';
    for (let i = 0; i < 16; i++) {
      const a = (Math.PI * 2 * i) / 16;
      const x = (50 + Math.cos(a) * 43).toFixed(1), y = (50 + Math.sin(a) * 43).toFixed(1);
      bulbs += `<circle cx='${x}' cy='${y}' r='6.5' fill='${acc}' fill-opacity='.35'/><circle cx='${x}' cy='${y}' r='3.3' fill='${BT_BULB}' stroke='${BT_NAVY}' stroke-width='.8'/>`;
    }
    const spot = btUri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>${bulbs}</svg>`);
    // the toggle knob: a five-point star with a navy keyline
    let star = '';
    for (let i = 0; i < 10; i++) {
      const rr = i % 2 ? 19 : 46, a = (Math.PI * i) / 5 - Math.PI / 2;
      star += `${(50 + rr * Math.cos(a)).toFixed(1)},${(53 + rr * Math.sin(a)).toFixed(1)} `;
    }
    const knob = btUri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><polygon points='${star.trim()}' fill='${acc}' stroke='${BT_NAVY}' stroke-width='6' stroke-linejoin='round'/></svg>`);
    const knobOff = btUri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><polygon points='${star.trim()}' fill='${cream}' stroke='${BT_NAVY}' stroke-width='6' stroke-linejoin='round'/></svg>`);
    // bunting divider for the footer and the deck
    let pen = '';
    for (let i = 0; i < 12; i++) {
      const x = 4 + i * 20;
      const y = 3 + Math.sin((i / 11) * Math.PI) * 5;
      pen += `<path d='M${x} ${y.toFixed(1)}L${x + 16} ${y.toFixed(1)}L${x + 8} ${(y + 16).toFixed(1)}Z' fill='${[ribbon, cream, stripe][i % 3]}' stroke='${BT_NAVY}' stroke-width='1.2' stroke-linejoin='round'/>`;
    }
    const bunting = btUri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 26' preserveAspectRatio='none'><path d='M0 3Q120 15 240 3' fill='none' stroke='${night ? '#C9BFA6' : BT_NAVY}' stroke-width='1.4'/>${pen}</svg>`);
    const fonts = btFonts();
    return {
      '--ab-type-pick-w': 400,
      '--bt-bw': btWeight(fonts.b, 600),
      '--bt-hw': btWeight(fonts.h, 400),
      '--ab-ink': ink,
      '--ab-muted': muted,
      '--ab-line': night ? 'rgba(246, 236, 214, 0.28)' : 'rgba(31, 42, 68, 0.3)',
      '--ab-bt-cream': cream,
      '--ab-bt-paper': night ? '#1D2640' : '#FBF4E4',
      '--ab-bt-sand': night ? '#28324F' : '#EBDDBC',
      '--ab-bt-navy': BT_NAVY,
      '--ab-bt-stripe': stripe,
      '--ab-bt-tix': tix,
      '--ab-bt-ribbon': ribbon,
      '--ab-bt-ribbon-deep': t.mix('#000000', ribbon, 0.28),
      '--ab-bt-hl': night ? t.mix('#ffffff', stripe, 0.25) : stripe,
      // the stripe colour as small text (act numbers, section numbers): 4.5:1 on the canvas
      '--ab-bt-txt': (() => { let c = night ? t.mix('#ffffff', stripe, 0.25) : tix; for (let k = 0.3; k <= 1 && contrastRatio(c, t.canvas) < 4.5; k += 0.1) c = t.mix(night ? '#ffffff' : '#000000', stripe, k); return c; })(),
      '--ab-bt-bulb': BT_BULB,
      '--ab-bt-glow': sh(acc, 0.55),
      '--ab-bt-star': acc,
      '--ab-bt-shade': night ? '#000000' : BT_NAVY,
      '--ab-bt-spot': spot,
      '--ab-bt-knob': knob,
      '--ab-bt-knob-off': knobOff,
      '--ab-bt-bunting': bunting,
    };
  },

  art(ctx) {
    return btArt(ctx);
  },

  materials: [
    { name: 'Tent stripes', css: 'background: repeating-linear-gradient(90deg, {btStripe} 0 28px, {btCream} 28px 56px); /* wide equal vertical stripes: the primary (shaded to 3:1 on cream) and cream only */' },
    { name: 'Scalloped valance', css: 'background: radial-gradient(circle at 50% 0, {btStripe} 10px, transparent 10.5px) 0 100% / 20px 11px repeat-x; /* a band whose bottom edge is a row of half circles, in the stripe colour, under a striped band */' },
    { name: 'Ticket', css: 'background: radial-gradient(circle at 0 50%, transparent 9px, {btTix} 9.5px) left / 51% 100% no-repeat, radial-gradient(circle at 100% 50%, transparent 9px, {btTix} 9.5px) right / 51% 100% no-repeat; color: #F6ECD6; /* side notches, a dashed perforation before the stub, ADMIT ONE, a serial number; pressed = the stub drops 2px */' },
    { name: 'Ribbon banner', css: 'background: {btRibbon}; color: #F6ECD6; /* + swallowtail ends in {btRibbonDeep} drawn with border triangles (export-safe) */' },
    { name: 'Marquee bulb', css: 'background: radial-gradient(circle, #FFF4D6 0 3px, {btGlow} 5px, transparent 8px); /* warm-white bulbs with a glow ring, spaced evenly round ONE element only */' },
    { name: 'Keyline', css: 'border: 2px solid #1F2A44; /* the chromolithograph keyline on posters, tickets and tents; text shade = offset navy copy .045em down-right */' },
  ],

  rules: {
    do: [
      'Edge headers, cards and tabs with a scalloped valance in the stripe colour.',
      'Set the headline as a showbill: wood type arched on the first line, a navy drop shade, the last word in a swallowtail ribbon.',
      'Make every main action a ticket: side notches, a perforation, ADMIT ONE and a serial number.',
      'Use marquee bulbs to spotlight one element only, and list items as a programme of acts with dotted leaders.',
      'Keep it symmetric and centred like a poster, with plenty of cream between the stripes.',
    ],
    dont: [
      'Draw clowns, performing animals, rainbow balloons or anything from a kids\' party.',
      'Use more than two stripe colours plus cream, or candy-stripe every surface.',
      'Set body text or UI labels in wood type: it is for display lines only.',
      'Reproduce Ringling or Barnum marks or real posters; draw the tent, bunting and stars from primitives.',
    ],
  },

  deck: {
    coverDisplay: 0.9,
    marks: { do: '★', dont: '✕' },
    // In product: the box office (a showbill poster, the bulb-lit sign, the programme, tickets)
    product(ctx) {
      return btProduct(ctx);
    },
    // Material slide: the marquee sign (the tent is already on the cover)
    materialArt(ctx) {
      return btMarquee(ctx);
    },
    principles: [
      ['Stripes, scallops, showbill symmetry', 'Everything centres and mirrors like a poster.'],
      ['Every button is a ticket', 'Controls borrow the shape of a ticket stub.'],
      ['Grown-up circus, not party', 'Warm vintage colour with plenty of cream.'],
    ],
    do: [
      'Edge headers with a scalloped valance in brand stripes.',
      'Set headlines in wood type on an arc or ribbon.',
      'Use bulbs to spotlight one element only.',
    ],
    dont: [
      'Add clowns, animals or rainbow balloons.',
      'Use more than two stripe colours plus cream.',
      'Set body text in wood type.',
    ],
  },
});
})();
