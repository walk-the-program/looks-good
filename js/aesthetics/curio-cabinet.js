/* 48 Curio Cabinet — collected, labelled, precious. References (docs/research/round6.md §12): Kittl
   2026 #4 "Trinket design" (5-10 objects, museum-style display, "the trick is in the spacing and
   the lighting"), the cabinet of curiosities and Ole Worm's Museum Wormianum, Seba's and Haeckel's
   numbered plates, the printer's type case (unequal compartments), Joseph Cornell's shadow boxes,
   Deyrolle and natural-history specimen drawers with string-tied tags, knolling, Sophie Buhai.

   Mechanism.
   - A type-case tray under a warm lamp: 16 unequal recessed compartments (1x1, 2x1, 1x2, 2x2) in
     oak walls with a lit top edge, deep baize inside with the shadow falling from the top-left;
     two compartments left empty on purpose, one holding the collection's typed label.
   - Twelve procedural objects with contact shadows, each numbered: an ammonite (log spiral with
     ribs and sutures), a struck brass token with the brand initial, a sewn button and a swirl
     marble and glass beads in the client secondary (two-tone material, never a flat fill), a
     skeleton key with a string tag, a barred moulted feather on a pin, a quartz point in the
     client accent (the one treasured object, with a glow and an accent pin), a sea-urchin test,
     a veined pebble, a pressed ginkgo leaf on a taped herbarium slip, a cowrie. One diagonal
     vitrine sheen. A typed legend lists the figures (Haeckel's numbering).
   - Headline: the h2 is a museum label (cream card, typed accession line, Caslon roman with the
     last word in italic like a Latin name and a figure reference), pinned at the top and tied
     to the tray with a string.
   - Components: drawer fronts in the client primary with a brass card-frame pull holding a paper
     label (segmented control and the main action), a pin-head toggle in a specimen track, a paper
     label field with a brass focus, Found / Pinned / Treasured specimens, a legend list whose
     progress is compartments filling, string-tied tags for status, a brass plaque footer.
   - Colour: baize, oak, label paper, label ink and brass are fixed; primary = drawer fronts,
     secondary = object materials (glass, enamel, beads), accent = pin heads and the treasured glow.
   The deck's Material slide (def.deck.materialArt) shows a Haeckel-style plate of nine numbered
   procedural rosettes on cream, so the cover's tray is not repeated. */

const CC = {
  baize: '#1F2A26', oak: '#4A3626', oakTop: '#6B5038', oakLo: '#2E2118', paper: '#EDE4CF', ink: '#2A2520',
  brass: '#A8874A', brassHi: '#E2C98E', brassLo: '#6E5428', cream: '#CFC3A6',
};
let ccSeq = 0;

function ccHash(s) {
  let h = 2166136261 >>> 0;
  for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}
function ccRand(seed) {
  let a = (seed >>> 0) || 1;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const ccF = n => (Math.round(n * 100) / 100).toString();
function ccFace(name) { return (typeof FONTS !== 'undefined' && FONTS.find(f => f.name === name)) || null; }

// Client colours as materials: a lit, a body and a shadow tone.
function ccMat(hex, lift) {
  return { hi: slMix('#ffffff', hex, lift || 0.42), mid: hex, lo: slMix('#000000', hex, 0.42) };
}
function ccDrawer(hex) {
  const { h, s, l } = hexToHsl(hex);
  const d = hslToHex(h, Math.min(s * 0.85, 70), Math.max(30, Math.min(l, 46)));
  return { hi: slMix('#ffffff', d, 0.16), mid: d, lo: slMix('#000000', d, 0.32) };
}

// The legend (figure, common name, Latin or provenance in italic).
const CC_ITEMS = [
  ['Ammonite', 'Dactylioceras'], ['Struck token', 'brass, 1871'], ['Sewn button', 'four holes'], ['Skeleton key', 'brass'],
  ['Swirl marble', 'hand-gathered'], ['Moulted feather', 'barred'], ['Quartz point', 'the treasured one'], ['Urchin test', 'Echinus'],
  ['River pebble', 'quartz vein'], ['Pressed leaf', 'Ginkgo biloba'], ['Glass beads', 'a strand of 15'], ['Cowrie', 'Cypraea'],
];

function ccTray(ctx, id, rnd) {
  const t = ctx.t;
  const st = ctx.state || {};
  const hFace = String((st.headingFont && st.headingFont.css) || 'Georgia, serif').replace(/'/g, '"');
  const typed = '"Courier Prime", "Courier New", monospace';
  const ini = escapeHtml(ctx.initial || '·');
  const brand = escapeHtml(String(ctx.brandName || 'The').trim().toUpperCase());
  const sec = ccMat(t.secondary), acc = ccMat(t.accent, 0.5);
  const felt = t.isDark ? slMix('#000000', t.canvas, 0.28) : slMix('#000000', t.canvas, 0.1);
  const W = 320, H = 214, x0 = 9, y0 = 9, iw = 302, ih = 196, wall = 3.2;
  const U = (iw + wall) / 6, V = (ih + wall) / 4;
  const cell = (c, r, w, h) => ({ x: x0 + c * U, y: y0 + r * V, w: w * U - wall, h: h * V - wall });
  // type-case layout: [col,row,w,h,kind]
  const layout = [
    [0, 0, 2, 2, 'ammonite'], [2, 0, 1, 1, 'coin'], [3, 0, 1, 1, 'button'], [4, 0, 2, 1, 'key'],
    [2, 1, 1, 1, 'marble'], [3, 1, 1, 2, 'feather'], [4, 1, 1, 1, 'crystal'], [5, 1, 1, 1, 'empty'],
    [0, 2, 1, 1, 'urchin'], [1, 2, 1, 1, 'pebble'], [2, 2, 1, 2, 'leaf'], [4, 2, 2, 1, 'beads'],
    [0, 3, 2, 1, 'label'], [3, 3, 1, 1, 'cowrie'], [4, 3, 1, 1, 'empty'], [5, 3, 1, 1, 'token2'],
  ];
  const fig = { ammonite: 1, coin: 2, button: 3, key: 4, marble: 5, feather: 6, crystal: 7, urchin: 8, pebble: 9, leaf: 10, beads: 11, cowrie: 12 };
  const sh = `filter="url(#${id}cs)"`;
  let cells = '', objs = '', nums = '';
  const pin = (x, y, r) => `<g ${sh}><circle cx="${ccF(x)}" cy="${ccF(y)}" r="${r}" fill="url(#${id}pin)"/><circle cx="${ccF(x - r * 0.3)}" cy="${ccF(y - r * 0.35)}" r="${ccF(r * 0.32)}" fill="#fff" opacity=".7"/></g>`;
  layout.forEach(([c, r, w, h, kind]) => {
    const b = cell(c, r, w, h);
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2, m = Math.min(b.w, b.h);
    // the recess: baize, the shadow from the top-left walls, the lit faces of the bottom-right walls
    cells += `<rect x="${ccF(b.x)}" y="${ccF(b.y)}" width="${ccF(b.w)}" height="${ccF(b.h)}" fill="${felt}"/>`
      + `<rect x="${ccF(b.x)}" y="${ccF(b.y)}" width="${ccF(b.w)}" height="${ccF(b.h)}" fill="url(#${id}nap)"/>`
      + `<rect x="${ccF(b.x)}" y="${ccF(b.y)}" width="${ccF(b.w)}" height="7" fill="url(#${id}st)"/>`
      + `<rect x="${ccF(b.x)}" y="${ccF(b.y)}" width="6" height="${ccF(b.h)}" fill="url(#${id}sl)"/>`
      + `<path d="M${ccF(b.x + 0.6)} ${ccF(b.y + b.h - 0.6)}H${ccF(b.x + b.w - 0.6)}V${ccF(b.y + 0.6)}" fill="none" stroke="${CC.oakTop}" stroke-width="1.2" opacity=".5"/>`;
    if (fig[kind]) nums += `<text x="${ccF(b.x + 3.2)}" y="${ccF(b.y + b.h - 3)}" font-family='${typed}' font-size="5.2" fill="${CC.cream}" opacity=".78">${fig[kind]}</text>`;
    let o = '';
    if (kind === 'ammonite') {
      const R = m * 0.4, bgr = Math.log(1.8) / (2 * Math.PI), tmax = 6.75 * Math.PI, a = R / Math.exp(bgr * tmax);
      const P = th => [cx + Math.cos(th) * a * Math.exp(bgr * th), cy + Math.sin(th) * a * Math.exp(bgr * th)];
      let outer = '';
      for (let th = tmax - 2 * Math.PI; th <= tmax + 0.001; th += 0.12) { const p = P(th); outer += `${outer ? 'L' : 'M'}${ccF(p[0])} ${ccF(p[1])}`; }
      let spiral = '';
      for (let th = 0.6; th <= tmax - 2 * Math.PI + 0.001; th += 0.12) { const p = P(th); spiral += `${spiral ? 'L' : 'M'}${ccF(p[0])} ${ccF(p[1])}`; }
      let ribs = '';
      for (let th = 1.2 * Math.PI; th <= tmax; th += 0.2) {
        const p1 = P(th - 2 * Math.PI), p2 = P(th), pm = P(th - Math.PI * 0.95);
        const q = [(p1[0] + p2[0]) / 2 + (pm[0] - (p1[0] + p2[0]) / 2) * 0.12, (p1[1] + p2[1]) / 2 + (pm[1] - (p1[1] + p2[1]) / 2) * 0.12];
        ribs += `M${ccF(p1[0])} ${ccF(p1[1])}Q${ccF(q[0])} ${ccF(q[1])} ${ccF(p2[0])} ${ccF(p2[1])}`;
      }
      o += `<g ${sh}><path d="${outer}Z" fill="url(#${id}stone)"/><path d="${ribs}" fill="none" stroke="#3B2F22" stroke-width=".55" opacity=".5"/><path d="${ribs}" fill="none" stroke="#fff" stroke-width=".35" opacity=".18" transform="translate(-.5 -.4)"/><path d="${spiral}" fill="none" stroke="#2E241A" stroke-width=".9" opacity=".7"/><path d="${outer}" fill="none" stroke="#3B2F22" stroke-width=".7" opacity=".6"/></g>`;
      // a tiny accession card in the corner, tied with string
      const lx = b.x + b.w - 34, ly = b.y + b.h - 15;
      o += `<path d="M${ccF(cx + R * 0.7)} ${ccF(cy + R * 0.5)} C${ccF(cx + R * 0.9)} ${ccF(cy + R)} ${ccF(lx - 6)} ${ccF(ly - 4)} ${ccF(lx + 2)} ${ccF(ly + 5)}" fill="none" stroke="${CC.cream}" stroke-width=".45" opacity=".8"/>`
        + `<g ${sh} transform="rotate(-4 ${ccF(lx + 14)} ${ccF(ly + 5)})"><rect x="${ccF(lx)}" y="${ccF(ly)}" width="30" height="11" fill="${CC.paper}"/><circle cx="${ccF(lx + 3)}" cy="${ccF(ly + 5.5)}" r=".9" fill="${felt}"/><text x="${ccF(lx + 6)}" y="${ccF(ly + 4.6)}" font-family='${typed}' font-size="3.1" fill="${CC.ink}">No. 0417</text><text x="${ccF(lx + 6)}" y="${ccF(ly + 8.8)}" font-family='${hFace}' font-style="italic" font-size="3.3" fill="${CC.ink}">Dactylioceras</text></g>`;
    } else if (kind === 'coin' || kind === 'token2') {
      const R = kind === 'coin' ? m * 0.36 : m * 0.3;
      const cu = kind === 'token2';
      let ticks = '';
      for (let k = 0; k < 72; k++) { const an = k / 72 * Math.PI * 2; ticks += `M${ccF(cx + Math.cos(an) * (R - 1.4))} ${ccF(cy + Math.sin(an) * (R - 1.4))}L${ccF(cx + Math.cos(an) * R)} ${ccF(cy + Math.sin(an) * R)}`; }
      o += `<g ${sh}><circle cx="${ccF(cx)}" cy="${ccF(cy)}" r="${ccF(R)}" fill="url(#${id}${cu ? 'cu' : 'brass'})"/><path d="${ticks}" stroke="#000" stroke-width=".35" opacity=".35"/>`
        + `<circle cx="${ccF(cx)}" cy="${ccF(cy)}" r="${ccF(R * 0.76)}" fill="none" stroke="${cu ? '#5E3220' : CC.brassLo}" stroke-width=".6"/>`;
      if (!cu) {
        let dots = '';
        for (let k = 0; k < 24; k++) { const an = k / 24 * Math.PI * 2; dots += `<circle cx="${ccF(cx + Math.cos(an) * R * 0.87)}" cy="${ccF(cy + Math.sin(an) * R * 0.87)}" r=".42" fill="${CC.brassLo}"/>`; }
        o += dots + `<text x="${ccF(cx + 0.45)}" y="${ccF(cy + R * 0.32 + 0.45)}" text-anchor="middle" font-family='${hFace}' font-size="${ccF(R * 0.95)}" fill="#fff" opacity=".35">${ini}</text><text x="${ccF(cx)}" y="${ccF(cy + R * 0.32)}" text-anchor="middle" font-family='${hFace}' font-size="${ccF(R * 0.95)}" fill="${CC.brassLo}">${ini}</text></g>`;
      } else {
        let star = '';
        for (let k = 0; k < 10; k++) { const an = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? R * 0.18 : R * 0.42; star += `${k ? 'L' : 'M'}${ccF(cx + Math.cos(an) * rr)} ${ccF(cy + Math.sin(an) * rr)}`; }
        o += `<path d="${star}Z" fill="#5E3220" opacity=".55"/><path d="${star}Z" fill="none" stroke="#F0B890" stroke-width=".3" opacity=".5" transform="translate(-.3 -.3)"/></g>`;
      }
    } else if (kind === 'button') {
      const R = m * 0.31;
      o += `<g ${sh}><circle cx="${ccF(cx)}" cy="${ccF(cy)}" r="${ccF(R)}" fill="url(#${id}sec)"/><circle cx="${ccF(cx)}" cy="${ccF(cy)}" r="${ccF(R * 0.8)}" fill="none" stroke="${sec.hi}" stroke-width=".9" opacity=".7"/><circle cx="${ccF(cx)}" cy="${ccF(cy)}" r="${ccF(R * 0.66)}" fill="${sec.lo}" opacity=".35"/>`;
      const hs = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dy]) => [cx + dx * R * 0.24, cy + dy * R * 0.24]);
      o += `<path d="M${ccF(hs[0][0])} ${ccF(hs[0][1])}L${ccF(hs[3][0])} ${ccF(hs[3][1])}M${ccF(hs[1][0])} ${ccF(hs[1][1])}L${ccF(hs[2][0])} ${ccF(hs[2][1])}" stroke="${CC.paper}" stroke-width="1.1" stroke-linecap="round"/>`
        + hs.map(p => `<circle cx="${ccF(p[0])}" cy="${ccF(p[1])}" r="${ccF(R * 0.1)}" fill="${sec.lo}"/>`).join('') + `</g>`;
    } else if (kind === 'key') {
      const L = b.w * 0.74, kx = b.x + (b.w - L) / 2 + 9, ky = cy - 2;
      o += `<g ${sh} transform="rotate(-6 ${ccF(cx)} ${ccF(cy)})"><circle cx="${ccF(kx)}" cy="${ccF(ky)}" r="8.4" fill="none" stroke="url(#${id}brass)" stroke-width="3.4"/><circle cx="${ccF(kx)}" cy="${ccF(ky)}" r="3.2" fill="none" stroke="url(#${id}brass)" stroke-width="1.6"/>`
        + `<rect x="${ccF(kx + 8)}" y="${ccF(ky - 1.9)}" width="${ccF(L - 14)}" height="3.8" rx="1" fill="url(#${id}rod)"/><rect x="${ccF(kx + 11)}" y="${ccF(ky - 3)}" width="2.6" height="6" rx=".8" fill="url(#${id}rod)"/><rect x="${ccF(kx + 15)}" y="${ccF(ky - 2.6)}" width="1.6" height="5.2" rx=".6" fill="url(#${id}rod)"/>`
        + `<path d="M${ccF(kx + L - 13)} ${ccF(ky + 1.4)}h7v9h-2.4v-3.4h-2v3.4h-2.6z" fill="url(#${id}rod)"/></g>`;
      // string tag from the bow
      const tx = kx - 4, ty = b.y + b.h - 14;
      o += `<path d="M${ccF(kx - 6)} ${ccF(ky + 5)} C${ccF(kx - 10)} ${ccF(ky + 14)} ${ccF(tx + 4)} ${ccF(ty - 6)} ${ccF(tx + 6)} ${ccF(ty + 2)}" fill="none" stroke="${CC.cream}" stroke-width=".5" opacity=".85"/>`
        + `<g ${sh} transform="rotate(8 ${ccF(tx + 12)} ${ccF(ty + 5)})"><path d="M${ccF(tx + 3)} ${ccF(ty)}h22v10h-22l-3-5z" fill="${CC.paper}"/><circle cx="${ccF(tx + 3.6)}" cy="${ccF(ty + 5)}" r=".9" fill="${felt}"/><text x="${ccF(tx + 7)}" y="${ccF(ty + 6.4)}" font-family='${typed}' font-size="3.6" fill="${CC.ink}">No. 4</text></g>`;
    } else if (kind === 'marble') {
      const R = m * 0.27;
      o += `<ellipse cx="${ccF(cx + R * 0.5)}" cy="${ccF(cy + R * 0.85)}" rx="${ccF(R * 0.7)}" ry="${ccF(R * 0.32)}" fill="${t.secondary}" opacity=".22" filter="url(#${id}bl)"/>`
        + `<g ${sh}><circle cx="${ccF(cx)}" cy="${ccF(cy)}" r="${ccF(R)}" fill="url(#${id}glass)"/><clipPath id="${id}mc"><circle cx="${ccF(cx)}" cy="${ccF(cy)}" r="${ccF(R)}"/></clipPath>`
        + `<path clip-path="url(#${id}mc)" d="M${ccF(cx - R)} ${ccF(cy + R * 0.3)} C${ccF(cx - R * 0.3)} ${ccF(cy - R * 0.6)} ${ccF(cx + R * 0.2)} ${ccF(cy + R * 0.7)} ${ccF(cx + R)} ${ccF(cy - R * 0.25)}" fill="none" stroke="${CC.paper}" stroke-width="${ccF(R * 0.24)}" opacity=".75"/>`
        + `<path clip-path="url(#${id}mc)" d="M${ccF(cx - R)} ${ccF(cy + R * 0.55)} C${ccF(cx - R * 0.2)} ${ccF(cy - R * 0.25)} ${ccF(cx + R * 0.3)} ${ccF(cy + R * 0.95)} ${ccF(cx + R)} ${ccF(cy + R * 0.05)}" fill="none" stroke="${acc.mid}" stroke-width="${ccF(R * 0.12)}" opacity=".7"/>`
        + `<ellipse cx="${ccF(cx - R * 0.36)}" cy="${ccF(cy - R * 0.42)}" rx="${ccF(R * 0.3)}" ry="${ccF(R * 0.18)}" transform="rotate(-35 ${ccF(cx - R * 0.36)} ${ccF(cy - R * 0.42)})" fill="#fff" opacity=".8"/></g>`;
    } else if (kind === 'feather') {
      const top = b.y + 8, bot = b.y + b.h - 10, len = bot - top, sx = cx + 2;
      const rach = t2 => [sx + Math.sin(t2 * 2.4) * 3 - t2 * 2, bot - t2 * len];
      let barbs = '', vaneL = '', vaneR = '';
      const wid = t2 => (t2 < 0.12 ? t2 / 0.12 * 0.6 : 1) * Math.sin(Math.min(1, t2 * 1.08) * Math.PI) * 9 + 1.2;
      const ptsL = [], ptsR = [];
      for (let k = 0; k <= 40; k++) {
        const t2 = 0.06 + k / 40 * 0.92, p = rach(t2), w2 = wid(t2);
        ptsL.push([p[0] - w2, p[1] - w2 * 0.55]); ptsR.push([p[0] + w2 * 0.82, p[1] - w2 * 0.5]);
        if (k % 1 === 0) barbs += `M${ccF(p[0])} ${ccF(p[1])}L${ccF(p[0] - w2)} ${ccF(p[1] - w2 * 0.55)}M${ccF(p[0])} ${ccF(p[1])}L${ccF(p[0] + w2 * 0.82)} ${ccF(p[1] - w2 * 0.5)}`;
      }
      const r0 = rach(0.06), r1 = rach(0.98);
      vaneL = `M${ccF(r0[0])} ${ccF(r0[1])}` + ptsL.map(p => `L${ccF(p[0])} ${ccF(p[1])}`).join('') + `L${ccF(r1[0])} ${ccF(r1[1])}Z`;
      vaneR = `M${ccF(r0[0])} ${ccF(r0[1])}` + ptsR.map(p => `L${ccF(p[0])} ${ccF(p[1])}`).join('') + `L${ccF(r1[0])} ${ccF(r1[1])}Z`;
      let bars = '';
      for (let k = 1; k < 7; k++) { const p = rach(0.12 + k * 0.12); bars += `<path d="M${ccF(p[0] - 10)} ${ccF(p[1] - 3)}L${ccF(p[0] + 10)} ${ccF(p[1] - 1)}" stroke="#4A4038" stroke-width="2.4" opacity=".55"/>`; }
      let rachis = '';
      for (let k = 0; k <= 20; k++) { const p = rach(k / 20); rachis += `${k ? 'L' : 'M'}${ccF(p[0])} ${ccF(p[1])}`; }
      o += `<g ${sh}><clipPath id="${id}fv"><path d="${vaneL}"/><path d="${vaneR}"/></clipPath><path d="${vaneL}" fill="#A69886"/><path d="${vaneR}" fill="#968876"/><g clip-path="url(#${id}fv)">${bars}<path d="${barbs}" stroke="#E8DECB" stroke-width=".22" opacity=".45"/></g><path d="${rachis}" fill="none" stroke="#E9E0CC" stroke-width=".8"/></g>`
        + pin(rach(0.5)[0], rach(0.5)[1], 2.1);
    } else if (kind === 'crystal') {
      const s2 = m * 0.36;
      // the treasured one: a quartz point in the accent, with a glow and an accent pin
      o += `<circle cx="${ccF(cx)}" cy="${ccF(cy)}" r="${ccF(m * 0.46)}" fill="url(#${id}glow)"/>`
        + `<g ${sh} transform="rotate(-28 ${ccF(cx)} ${ccF(cy)})"><path d="M${ccF(cx - s2 * 0.42)} ${ccF(cy + s2)}V${ccF(cy - s2 * 0.25)}L${ccF(cx)} ${ccF(cy - s2 * 1.05)}L${ccF(cx - s2 * 0.08)} ${ccF(cy + s2 * 1.04)}Z" fill="${acc.hi}"/>`
        + `<path d="M${ccF(cx - s2 * 0.08)} ${ccF(cy + s2 * 1.04)}L${ccF(cx)} ${ccF(cy - s2 * 1.05)}L${ccF(cx + s2 * 0.24)} ${ccF(cy - s2 * 0.2)}V${ccF(cy + s2 * 0.98)}Z" fill="${acc.mid}"/>`
        + `<path d="M${ccF(cx + s2 * 0.24)} ${ccF(cy + s2 * 0.98)}V${ccF(cy - s2 * 0.2)}L${ccF(cx)} ${ccF(cy - s2 * 1.05)}L${ccF(cx + s2 * 0.42)} ${ccF(cy - s2 * 0.22)}V${ccF(cy + s2 * 0.94)}Z" fill="${acc.lo}"/>`
        + `<path d="M${ccF(cx - s2 * 0.42)} ${ccF(cy - s2 * 0.25)}L${ccF(cx)} ${ccF(cy - s2 * 1.05)}" stroke="#fff" stroke-width=".6" opacity=".75"/><path d="M${ccF(cx - s2 * 0.3)} ${ccF(cy + s2 * 0.5)}l${ccF(s2 * 0.1)} ${ccF(-s2 * 0.6)}" stroke="#fff" stroke-width=".9" opacity=".45"/></g>`
        + pin(b.x + b.w - 8, b.y + 8, 2.3);
    } else if (kind === 'urchin') {
      const R = m * 0.33;
      o += `<g ${sh}><circle cx="${ccF(cx)}" cy="${ccF(cy)}" r="${ccF(R)}" fill="url(#${id}urch)"/>`;
      for (let k = 0; k < 5; k++) {
        const an = -Math.PI / 2 + k * Math.PI * 2 / 5;
        for (let j = 1; j <= 6; j++) {
          const rr = R * (0.16 + j * 0.13);
          for (const off of [-0.11, 0.11]) o += `<circle cx="${ccF(cx + Math.cos(an + off * (1.3 - j * 0.1)) * rr)}" cy="${ccF(cy + Math.sin(an + off * (1.3 - j * 0.1)) * rr)}" r=".55" fill="#7A5E50" opacity=".75"/>`;
        }
        for (let j = 1; j <= 4; j++) { const rr = R * (0.25 + j * 0.17); o += `<circle cx="${ccF(cx + Math.cos(an + Math.PI / 5) * rr)}" cy="${ccF(cy + Math.sin(an + Math.PI / 5) * rr)}" r="${ccF(0.7 + j * 0.25)}" fill="#fff" opacity=".3"/>`; }
      }
      o += `<circle cx="${ccF(cx)}" cy="${ccF(cy)}" r="${ccF(R * 0.12)}" fill="#6A5244" opacity=".7"/></g>`;
    } else if (kind === 'pebble') {
      const pts = [];
      for (let k = 0; k < 9; k++) { const an = k / 9 * Math.PI * 2; const rr = m * 0.3 * (1 + (rnd() - 0.5) * 0.18); pts.push([cx + Math.cos(an) * rr * 1.18, cy + Math.sin(an) * rr * 0.86]); }
      let d = '';
      for (let k = 0; k < 9; k++) { const p0 = pts[(k + 8) % 9], p1 = pts[k], p2 = pts[(k + 1) % 9], p3 = pts[(k + 2) % 9]; if (!k) d = `M${ccF(p1[0])} ${ccF(p1[1])}`; d += `C${ccF(p1[0] + (p2[0] - p0[0]) / 6)} ${ccF(p1[1] + (p2[1] - p0[1]) / 6)} ${ccF(p2[0] - (p3[0] - p1[0]) / 6)} ${ccF(p2[1] - (p3[1] - p1[1]) / 6)} ${ccF(p2[0])} ${ccF(p2[1])}`; }
      o += `<g ${sh}><path d="${d}Z" fill="url(#${id}peb)"/><path d="M${ccF(cx - m * 0.3)} ${ccF(cy + m * 0.05)}C${ccF(cx - m * 0.1)} ${ccF(cy - m * 0.08)} ${ccF(cx + m * 0.08)} ${ccF(cy + m * 0.12)} ${ccF(cx + m * 0.34)} ${ccF(cy - m * 0.04)}" stroke="#F2EDE2" stroke-width="1.3" fill="none" opacity=".8"/></g>`;
    } else if (kind === 'leaf') {
      // a pressed ginkgo leaf on a taped herbarium slip
      const sw = b.w * 0.8, shh = b.h * 0.82, sx = cx - sw / 2, sy = cy - shh / 2;
      const lx = cx, ly = sy + shh * 0.44, Rf = sw * 0.42;
      let veins = '';
      for (let k = 0; k <= 12; k++) { const an = Math.PI * (1.12 + k / 12 * 0.76); veins += `M${ccF(lx)} ${ccF(ly + Rf * 0.12)}L${ccF(lx + Math.cos(an) * Rf * 0.95)} ${ccF(ly + Rf * 0.12 + Math.sin(an) * Rf * 0.95)}`; }
      const fan = `M${ccF(lx)} ${ccF(ly + Rf * 0.12)}L${ccF(lx + Math.cos(Math.PI * 1.12) * Rf)} ${ccF(ly + Rf * 0.12 + Math.sin(Math.PI * 1.12) * Rf)}A${ccF(Rf)} ${ccF(Rf)} 0 0 1 ${ccF(lx - 1)} ${ccF(ly - Rf * 0.86)}l1 3.2 1-3.2A${ccF(Rf)} ${ccF(Rf)} 0 0 1 ${ccF(lx + Math.cos(Math.PI * 1.88) * Rf)} ${ccF(ly + Rf * 0.12 + Math.sin(Math.PI * 1.88) * Rf)}Z`;
      o += `<g ${sh} transform="rotate(3 ${ccF(cx)} ${ccF(cy)})"><rect x="${ccF(sx)}" y="${ccF(sy)}" width="${ccF(sw)}" height="${ccF(shh)}" fill="${CC.paper}"/>`
        + `<path d="${fan}" fill="url(#${id}leaf)"/><path d="${veins}" stroke="#5A4520" stroke-width=".3" opacity=".55"/><path d="M${ccF(lx)} ${ccF(ly + Rf * 0.1)}C${ccF(lx + 1)} ${ccF(ly + Rf * 0.6)} ${ccF(lx - 1)} ${ccF(ly + Rf * 0.9)} ${ccF(lx + 2)} ${ccF(sy + shh * 0.8)}" stroke="#6E5A2E" stroke-width=".9" fill="none"/>`
        + `<rect x="${ccF(sx + sw * 0.18)}" y="${ccF(sy + shh * 0.62)}" width="${ccF(sw * 0.3)}" height="3.4" fill="#E9DFC0" opacity=".85" transform="rotate(-18 ${ccF(sx + sw * 0.33)} ${ccF(sy + shh * 0.64)})"/>`
        + `<text x="${ccF(sx + 3)}" y="${ccF(sy + shh - 7)}" font-family='${hFace}' font-style="italic" font-size="3.6" fill="${CC.ink}">Ginkgo biloba</text><text x="${ccF(sx + 3)}" y="${ccF(sy + shh - 2.8)}" font-family='${typed}' font-size="2.8" fill="${CC.ink}" opacity=".75">coll. Oct. 2026</text></g>`
        + pin(sx + sw - 4, sy + 4, 1.9);
    } else if (kind === 'beads') {
      let bd = '', thread = '';
      const n = 15;
      for (let k = 0; k < n; k++) {
        const u = k / (n - 1), bx = b.x + 12 + u * (b.w - 24), by = cy - 4 + Math.sin(u * Math.PI) * 9 - Math.sin(u * Math.PI * 2) * 2;
        thread += `${k ? 'L' : 'M'}${ccF(bx)} ${ccF(by)}`;
        const gold = k % 3 === 1;
        bd += `<circle cx="${ccF(bx)}" cy="${ccF(by)}" r="${gold ? 2.4 : 3.5}" fill="url(#${id}${gold ? 'brass' : 'bead'})"/><circle cx="${ccF(bx - 1)}" cy="${ccF(by - 1.1)}" r="${gold ? 0.6 : 0.9}" fill="#fff" opacity=".65"/>`;
      }
      o += `<g ${sh}><path d="${thread}" fill="none" stroke="${CC.cream}" stroke-width=".4"/>${bd}</g>`;
    } else if (kind === 'cowrie') {
      const rx = m * 0.3, ry = m * 0.21;
      let teeth = '';
      for (let k = -4; k <= 4; k++) teeth += `M${ccF(cx + k * rx * 0.17)} ${ccF(cy - 1.8)}v3.6`;
      o += `<g ${sh} transform="rotate(-18 ${ccF(cx)} ${ccF(cy)})"><ellipse cx="${ccF(cx)}" cy="${ccF(cy)}" rx="${ccF(rx)}" ry="${ccF(ry)}" fill="url(#${id}cow)"/><path d="M${ccF(cx - rx * 0.86)} ${ccF(cy)}C${ccF(cx - rx * 0.3)} ${ccF(cy - 1.6)} ${ccF(cx + rx * 0.3)} ${ccF(cy + 1.6)} ${ccF(cx + rx * 0.86)} ${ccF(cy)}" stroke="#4A3220" stroke-width="1.3" fill="none"/><path d="${teeth}" stroke="#F4EAD8" stroke-width=".55" opacity=".75"/></g>`;
    } else if (kind === 'label') {
      // the collection label in a brass card frame
      const lw = b.w * 0.82, lh = b.h * 0.56, lx = cx - lw / 2, ly = cy - lh / 2;
      const fs = Math.min(6.4, (lw - 12) / Math.max(8, brand.length * 0.62));
      o += `<g ${sh}><rect x="${ccF(lx - 2.6)}" y="${ccF(ly - 2.6)}" width="${ccF(lw + 5.2)}" height="${ccF(lh + 5.2)}" rx="1" fill="url(#${id}brass)"/><rect x="${ccF(lx)}" y="${ccF(ly)}" width="${ccF(lw)}" height="${ccF(lh)}" fill="${CC.paper}"/>`
        + `<circle cx="${ccF(lx - 1.3)}" cy="${ccF(cy)}" r=".8" fill="${CC.brassLo}"/><circle cx="${ccF(lx + lw + 1.3)}" cy="${ccF(cy)}" r=".8" fill="${CC.brassLo}"/>`
        + `<text x="${ccF(cx)}" y="${ccF(ly + lh * 0.46)}" text-anchor="middle" font-family='${hFace}' font-size="${ccF(fs)}" letter-spacing=".5" fill="${CC.ink}">${brand}</text>`
        + `<text x="${ccF(cx)}" y="${ccF(ly + lh * 0.8)}" text-anchor="middle" font-family='${typed}' font-size="3.7" fill="${CC.ink}" opacity=".8">THE COLLECTION · FIGS. 1–12</text></g>`;
    }
    objs += o;
  });
  // oak grain on the walls
  let grain = '';
  for (let k = 0; k < 22; k++) { const y = 2 + rnd() * (H - 4); grain += `M0 ${ccF(y)}C${ccF(W * 0.3)} ${ccF(y + (rnd() - 0.5) * 6)} ${ccF(W * 0.7)} ${ccF(y + (rnd() - 0.5) * 6)} ${W} ${ccF(y + (rnd() - 0.5) * 4)}`; }
  return `<svg class="cc-tray" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="presentation">
    <defs>
      <filter id="${id}cs" x="-30%" y="-30%" width="170%" height="170%"><feDropShadow dx="1.7" dy="2.4" stdDeviation="1.5" flood-color="#000" flood-opacity=".55"/></filter>
      <filter id="${id}bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"/></filter>
      <linearGradient id="${id}st" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
      <linearGradient id="${id}sl" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
      <pattern id="${id}nap" width="3" height="3" patternUnits="userSpaceOnUse"><circle cx=".8" cy=".7" r=".35" fill="#fff" opacity=".035"/><circle cx="2.2" cy="2.1" r=".3" fill="#000" opacity=".08"/></pattern>
      <radialGradient id="${id}brass" cx=".34" cy=".3" r=".8"><stop offset="0" stop-color="${CC.brassHi}"/><stop offset=".55" stop-color="${CC.brass}"/><stop offset="1" stop-color="${CC.brassLo}"/></radialGradient>
      <radialGradient id="${id}cu" cx=".34" cy=".3" r=".8"><stop offset="0" stop-color="#E7A47C"/><stop offset=".55" stop-color="#B0704A"/><stop offset="1" stop-color="#6A3A22"/></radialGradient>
      <linearGradient id="${id}rod" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${CC.brassHi}"/><stop offset=".6" stop-color="${CC.brass}"/><stop offset="1" stop-color="${CC.brassLo}"/></linearGradient>
      <radialGradient id="${id}stone" cx=".36" cy=".32" r=".78"><stop offset="0" stop-color="#D8C6A6"/><stop offset=".6" stop-color="#A48C68"/><stop offset="1" stop-color="#6A563C"/></radialGradient>
      <radialGradient id="${id}sec" cx=".34" cy=".3" r=".8"><stop offset="0" stop-color="${sec.hi}"/><stop offset=".6" stop-color="${sec.mid}"/><stop offset="1" stop-color="${sec.lo}"/></radialGradient>
      <radialGradient id="${id}glass" cx=".36" cy=".32" r=".75"><stop offset="0" stop-color="${sec.hi}" stop-opacity=".95"/><stop offset=".55" stop-color="${sec.mid}" stop-opacity=".92"/><stop offset="1" stop-color="${sec.lo}"/></radialGradient>
      <radialGradient id="${id}bead" cx=".36" cy=".32" r=".75"><stop offset="0" stop-color="${sec.hi}"/><stop offset=".6" stop-color="${sec.mid}"/><stop offset="1" stop-color="${sec.lo}"/></radialGradient>
      <radialGradient id="${id}pin" cx=".36" cy=".32" r=".75"><stop offset="0" stop-color="${acc.hi}"/><stop offset=".6" stop-color="${acc.mid}"/><stop offset="1" stop-color="${acc.lo}"/></radialGradient>
      <radialGradient id="${id}glow"><stop offset="0" stop-color="${t.accent}" stop-opacity=".42"/><stop offset=".55" stop-color="${t.accent}" stop-opacity=".12"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></radialGradient>
      <radialGradient id="${id}urch" cx=".38" cy=".34" r=".75"><stop offset="0" stop-color="#F0DCCB"/><stop offset=".65" stop-color="#C9A894"/><stop offset="1" stop-color="#8E6E5E"/></radialGradient>
      <radialGradient id="${id}peb" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="#9AA096"/><stop offset=".6" stop-color="#6C7268"/><stop offset="1" stop-color="#43483F"/></radialGradient>
      <radialGradient id="${id}cow" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#FBF1E0"/><stop offset=".5" stop-color="#D9B68A"/><stop offset="1" stop-color="#8A6038"/></radialGradient>
      <linearGradient id="${id}leaf" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#C9A24A"/><stop offset="1" stop-color="#8E6A2A"/></linearGradient>
      <linearGradient id="${id}sheen" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".07"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <radialGradient id="${id}lamp" cx=".1" cy="0" r="1.2"><stop offset="0" stop-color="#FFE1A8" stop-opacity=".14"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></radialGradient>
    </defs>
    <rect x="0" y="0" width="${W}" height="${H}" rx="3" fill="${CC.oak}"/>
    <path d="${grain}" fill="none" stroke="#000" stroke-width=".4" opacity=".22"/>
    <rect x=".6" y=".6" width="${W - 1.2}" height="${H - 1.2}" rx="2.6" fill="none" stroke="${CC.oakTop}" stroke-width="1.2" opacity=".8"/>
    ${cells}${objs}${nums}
    <path d="M${W * 0.52} 0L${W * 0.74} 0L${W * 0.36} ${H}L${W * 0.14} ${H}Z" fill="url(#${id}sheen)"/>
    <path d="M${W * 0.78} 0L${W * 0.42} ${H}" stroke="#fff" stroke-width=".5" opacity=".07"/>
    <rect x="0" y="0" width="${W}" height="${H}" rx="3" fill="url(#${id}lamp)"/>
  </svg>`;
}

// The Material slide variant: a Haeckel-style plate of nine numbered procedural rosettes.
function ccPlate(ctx, id) {
  const t = ctx.t;
  const st = ctx.state || {};
  const hFace = String((st.headingFont && st.headingFont.css) || 'Georgia, serif').replace(/'/g, '"');
  const line = '#3A2E22';
  const folds = [5, 6, 8, 7, 9, 6, 12, 5, 10];
  let figs = '';
  folds.forEach((n, k) => {
    const cx = 64 + (k % 3) * 56, cy = 50 + Math.floor(k / 3) * 54, R = 16.5;
    const tint = k % 3 === 1 ? t.secondary : k === 4 ? t.accent : '#C9B48E';
    const type = [0, 1, 2, 2, 0, 1, 1, 2, 0][k];
    const P = (an, r) => [cx + Math.cos(an) * r, cy + Math.sin(an) * r];
    let g = '';
    if (type === 0) {
      // spiked lattice sphere: a shell of pores in two rings, fine spines past the rim
      g += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${tint}" fill-opacity=".2" stroke="${line}" stroke-width=".5"/>`;
      for (let i = 0; i < n * 2; i++) {
        const an = i / (n * 2) * Math.PI * 2;
        const [x1, y1] = P(an, R), [x2, y2] = P(an, R * (i % 2 ? 1.22 : 1.48));
        g += `<path d="M${ccF(x1)} ${ccF(y1)}L${ccF(x2)} ${ccF(y2)}" stroke="${line}" stroke-width="${i % 2 ? 0.3 : 0.5}"/>`;
      }
      for (const [rr, cnt, pr] of [[R * 0.78, n * 2, R * 0.1], [R * 0.45, n, R * 0.12]]) {
        for (let i = 0; i < cnt; i++) { const [x, y] = P(i / cnt * Math.PI * 2 + (rr < R * 0.6 ? Math.PI / cnt : 0), rr); g += `<circle cx="${ccF(x)}" cy="${ccF(y)}" r="${ccF(pr)}" fill="none" stroke="${line}" stroke-width=".38"/>`; }
      }
      g += `<circle cx="${cx}" cy="${cy}" r="${ccF(R * 0.16)}" fill="${line}" opacity=".8"/>`;
    } else if (type === 1) {
      // star-latticed medusa: an n-pointed star polygon over concentric rings and pores at the tips
      let star = '';
      for (let i = 0; i < n * 2; i++) { const [x, y] = P(i / (n * 2) * Math.PI * 2 - Math.PI / 2, i % 2 ? R * 0.42 : R * 1.08); star += `${i ? 'L' : 'M'}${ccF(x)} ${ccF(y)}`; }
      g += `<circle cx="${cx}" cy="${cy}" r="${ccF(R * 0.86)}" fill="none" stroke="${line}" stroke-width=".4"/><circle cx="${cx}" cy="${cy}" r="${ccF(R * 0.62)}" fill="none" stroke="${line}" stroke-width=".3" stroke-dasharray="1 1"/>`;
      g += `<path d="${star}Z" fill="${tint}" fill-opacity=".28" stroke="${line}" stroke-width=".55" stroke-linejoin="round"/>`;
      for (let i = 0; i < n; i++) {
        const an = i / n * Math.PI * 2 - Math.PI / 2;
        const [x, y] = P(an, R * 1.18), [x2, y2] = P(an, R * 0.42);
        g += `<circle cx="${ccF(x)}" cy="${ccF(y)}" r="1.1" fill="none" stroke="${line}" stroke-width=".4"/><path d="M${cx} ${cy}L${ccF(x2)} ${ccF(y2)}" stroke="${line}" stroke-width=".3"/>`;
      }
      g += `<circle cx="${cx}" cy="${cy}" r="${ccF(R * 0.18)}" fill="${tint}" fill-opacity=".5" stroke="${line}" stroke-width=".5"/>`;
    } else {
      // petal rosette: n pointed petals, veined, around a pored disc
      for (let i = 0; i < n; i++) {
        const an = i / n * Math.PI * 2;
        const [tx, ty] = P(an, R * 1.12), [l1x, l1y] = P(an - 0.42, R * 0.62), [l2x, l2y] = P(an + 0.42, R * 0.62), [bx, by] = P(an, R * 0.3);
        g += `<path d="M${ccF(bx)} ${ccF(by)}Q${ccF(l1x)} ${ccF(l1y)} ${ccF(tx)} ${ccF(ty)}Q${ccF(l2x)} ${ccF(l2y)} ${ccF(bx)} ${ccF(by)}Z" fill="${tint}" fill-opacity=".26" stroke="${line}" stroke-width=".48"/><path d="M${ccF(bx)} ${ccF(by)}L${ccF(tx)} ${ccF(ty)}" stroke="${line}" stroke-width=".28"/>`;
      }
      g += `<circle cx="${cx}" cy="${cy}" r="${ccF(R * 0.32)}" fill="${CC.paper}" stroke="${line}" stroke-width=".5"/>`;
      for (let i = 0; i < 7; i++) { const [x, y] = i ? P(i / 6 * Math.PI * 2, R * 0.18) : [cx, cy]; g += `<circle cx="${ccF(x)}" cy="${ccF(y)}" r=".9" fill="none" stroke="${line}" stroke-width=".35"/>`; }
    }
    g += `<text x="${cx}" y="${cy + R + 12}" text-anchor="middle" font-family='${hFace}' font-style="italic" font-size="5.4" fill="${line}">Fig. ${k + 1}</text>`;
    figs += g;
  });
  return `<svg class="cc-plate" viewBox="0 0 240 196" xmlns="http://www.w3.org/2000/svg" role="presentation">
    <defs><filter id="${id}sh" x="-10%" y="-10%" width="120%" height="125%"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#000" flood-opacity=".55"/></filter></defs>
    <rect width="240" height="196" fill="${CC.oak}"/><rect x="4" y="4" width="232" height="188" fill="${CC.baize}"/>
    <g filter="url(#${id}sh)"><rect x="24" y="10" width="192" height="178" fill="${CC.paper}"/></g>
    <rect x="30" y="16" width="180" height="166" fill="none" stroke="${line}" stroke-width=".4"/>
    <text x="120" y="26" text-anchor="middle" font-family='${hFace}' font-size="6" letter-spacing="2" fill="${line}">TAB. XII · KUNSTFORMEN</text>
    ${figs}
  </svg>`;
}

function ccHeadlineHtml(text) {
  const e = escapeHtml;
  const s = String(text || '').trim();
  if (!s) return '';
  const m = s.match(/^([\s\S]*?)([^\s]+?)([.,;:!?…]*)$/);
  if (!m) return e(s);
  return `${e(m[1])}<i class="ab-hl cc-it">${e(m[2])}</i>${e(m[3])}<sup class="cc-fig">fig. 7</sup>`;
}

registerAesthetic({
  key: 'curio-cabinet', order: 48,
  name: 'Curio Cabinet',
  descriptor: 'Collected · Labelled · Precious',
  influences: 'Wunderkammer / Specimen drawers / Museum labels',
  summary: 'Small objects in unequal recessed compartments on dark baize, each numbered with a typed paper label.',
  motto: 'The brand shows what it keeps.',
  kicker: 'Case 12, drawer 3',
  mode: 'dark',
  slideShape: 'classic',
  labels: { material: 'Specimens', states: ['Found', 'Pinned', 'Treasured'], statesKind: 'swatch' },
  // the cabinet first, its drawers next, the specimen card for type last (the legend of the board)
  layout: { hero: 'split', palette: 'swatches', sections: 'two-col', order: ['hero', 'palette', 'sections', 'type'] },
  type: { ui: 'body', label: 'body', display: 0.74 },
  highlight: 'custom',
  highlightNote: 'The headline is a museum label (cream card, ink type); the highlighted last word is set in the heading face\'s italic like a Latin name, followed by a small typed figure reference (fig. 7). No colour on the word; the accent belongs to pin heads and the treasured object.',
  cardFill: '--ab-cc-felt',

  roles: {
    canvas: {
      use: 'Baize: the deep green-black lining of the cabinet (cream felt by day), with the lamp from the top-left',
      never: 'Clinical white, a gradient wash or a flat grey',
      coverage: '≈50%',
    },
    ink: {
      use: 'Typed labels and captions on the baize; label ink stays fixed on the cream paper labels',
      never: 'Large fills or decorative lines (lines are brass or oak)',
      coverage: '≈12%',
    },
    primary: {
      use: 'Drawer fronts: the main action and the selected drawer, always lacquered (lit edge, shadow edge) and carrying a brass card-frame pull with a paper label',
      never: 'Flat fills, text, object materials or the baize',
      coverage: '≈8%',
    },
    secondary: {
      use: 'Object materials: the swirl marble, the sewn button, the glass beads, the progress compartments, always shaded as glass or enamel',
      never: 'Buttons, text or flat panels',
      coverage: '≈6%',
    },
    accent: {
      use: 'Pin heads and the one treasured object (the quartz point and its soft glow)',
      never: 'Text, buttons, rules or more than one treasured object per view',
      coverage: '≤2%',
    },
  },

  // Baize by night, cream felt by day; never clinical white.
  canvas(b) {
    return b.isDark ? b.mix(CC.baize, b.canvas, 0.8) : b.mix('#E3D9C4', b.canvas, 0.78);
  },

  tokens(t) {
    const d = t.isDark;
    const dr = ccDrawer(t.primary);
    const sec = ccMat(t.secondary);
    const acc = ccMat(t.accent, 0.5);
    const text = d ? '#E9DFC6' : CC.ink;
    const dim = d ? '#BDB197' : '#5A5042';
    return {
      '--ab-cc-felt': d ? t.mix('#000000', t.canvas, 0.28) : t.mix('#000000', t.canvas, 0.08),
      '--ab-cc-oak': CC.oak, '--ab-cc-oak-top': CC.oakTop, '--ab-cc-oak-lo': CC.oakLo,
      '--ab-cc-paper': CC.paper, '--ab-cc-label-ink': CC.ink,
      '--ab-cc-brass': CC.brass, '--ab-cc-brass-hi': CC.brassHi, '--ab-cc-brass-lo': CC.brassLo,
      '--ab-cc-drawer': dr.mid, '--ab-cc-drawer-hi': dr.hi, '--ab-cc-drawer-lo': dr.lo,
      '--ab-cc-glass': sec.mid, '--ab-cc-glass-hi': sec.hi, '--ab-cc-glass-lo': sec.lo,
      '--ab-cc-pin': acc.mid, '--ab-cc-pin-hi': acc.hi, '--ab-cc-pin-lo': acc.lo,
      '--ab-cc-glow': t.alpha(t.accent, 0.55),
      '--ab-cc-text': text, '--ab-cc-dim': dim,
      '--ab-ink': text,
      '--ab-muted': dim,
      '--ab-line': d ? 'rgba(168, 135, 74, 0.38)' : 'rgba(110, 84, 40, 0.35)',
      '--ab-type-pick-w': '400',
    };
  },

  headline(ctx, text) { return ccHeadlineHtml(text); },

  art(ctx) {
    if (typeof window !== 'undefined' && window.loadFontFamily) { const f = ccFace('Courier Prime'); if (f) window.loadFontFamily(f); }
    const id = `cc${++ccSeq}`;
    const rnd = ccRand(ccHash(String(ctx.brandName || 'brand') + '|cc'));
    const legend = CC_ITEMS.map((it, i) => `<li><b>${i + 1}</b><span>${escapeHtml(it[0])}</span><i>${escapeHtml(it[1])}</i></li>`).join('');
    return `<div class="cc-art"><div class="cc-trayw">${ccTray(ctx, id, rnd)}</div><ol class="cc-legend">${legend}</ol></div>`;
  },

  materials: [
    { name: 'Recessed compartment', css: 'background: {ccFelt}; box-shadow: inset 5px 6px 10px rgba(0,0,0,.55), inset -1px -1px 0 rgba(107,80,56,.5), 0 0 0 5px #4A3626; /* unequal type-case cells; the shadow falls from the top-left wall; leave one or two empty */' },
    { name: 'Drawer front', css: 'background: linear-gradient({ccDrawerHi}, {ccDrawer} 60%, {ccDrawerLo}); border-radius: 4px; /* the primary as lacquered wood; a brass card-frame pull holds a paper label; pressed = pushed in (inset shadow) */' },
    { name: 'Paper label', css: 'background: #EDE4CF; color: #2A2520; font-family: "Courier Prime", monospace; /* typed: No. 0417 — name in italic, place, year; tied with string or pinned */' },
    { name: 'Brass', css: 'background: radial-gradient(circle at 34% 30%, #E2C98E, #A8874A 55%, #6E5428); /* card frames, screws, plaques, hairlines; never a large fill */' },
    { name: 'Object material', css: 'background: radial-gradient(circle at 36% 32%, {ccGlassHi}, {ccGlass} 60%, {ccGlassLo}); /* the secondary as glass or enamel with a contact shadow (2px 3px 4px, 35-55%) */' },
    { name: 'Pin head and treasure', css: 'background: radial-gradient(circle at 36% 32%, {ccPinHi}, {ccPin} 60%, {ccPinLo}); box-shadow: 0 0 18px {ccGlow}; /* accent: pin heads and the one treasured object only */' },
  ],

  rules: {
    do: [
      'Arrange 8 to 15 objects in unequal recessed compartments (1x1, 2x1, 1x2, 2x2) and leave one or two empty.',
      'Number every object and give it a typed paper label; keep a numbered legend beside the tray.',
      'Light everything from the top-left: shadow inside the top and left walls, a soft contact shadow under each object.',
      'Render client colours as materials (drawer lacquer, glass, enamel) with a lit and a shaded tone, never as flat fills.',
    ],
    dont: [
      'Show taxidermy, pinned insects, bones or any dead animal; only shells, stones, coins, keys, glass and moulted feathers.',
      'Clutter every compartment, or trace public-domain plates instead of generating them.',
      'Go clinical white (Dystopian Luxury) or turn it into a library of books (Dark Academia).',
      'Use rounded headline tiles (Bento Grid); compartments are recessed and hold objects, not slogans.',
    ],
  },

  deck: {
    principles: [
      ['Collected, numbered, labelled', 'Every object sits in its own recessed compartment.'],
      ['Every object earns a tag', 'Typed labels, figure numbers and a legend.'],
      ['Warm lamp over dark baize', 'Light from the top-left, soft contact shadows.'],
    ],
    do: [
      'Arrange 5 to 12 objects in unequal recessed compartments.',
      'Number every object and give it a typed label.',
      'Light from top-left with soft contact shadows.',
    ],
    dont: [
      'Add taxidermy, insects or dead animals.',
      'Fill every compartment; leave some empty.',
      'Use clinical white; that\'s Dystopian Luxury.',
    ],
    // the Material slide shows a Haeckel-style plate, not the cover's tray again
    materialArt: ctx => `<div class="cc-art">${ccPlate(ctx, `cc${++ccSeq}p`)}</div>`,
    marks: (ctx, kind) => (kind === 'do' ? '<i class="cc-mk"></i>' : '✕'),
    coverDisplay: 0.6,
    coverBand: false,
    closingStrip: false,
  },
});
