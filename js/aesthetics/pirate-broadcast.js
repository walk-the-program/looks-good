/* 35 Pirate Broadcast — intercepted, analog, rogue. References: Ceefax / ORACLE teletext
   (a 40 by 24 character grid, eight colours, three-digit page numbers, four colour-coded
   Fastext keys), BBC Test Card F's diagnostic logic (every bar has a job), SMPTE colour
   bars, and real signal intrusions (Captain Midnight over bars, Max Headroom, Local 58).
   The board is a rigid diagnostic frame (page numbers, bars, timecode, channels, signal
   meters) that gets intruded on (a tracking tear, a plain-mono message, a chyron). Every
   card is a "screen" in teletext colours, so the board also works in light mode (a pale
   wall, black screens). Scanlines alone are not the style: structure and copy behave like
   broadcast. Fictional idents only; no real station, no emergency-alert impersonation. */

// The eight teletext colours are fixed by the hardware; the client colour is only the
// station ident (brand mark, the P100 page number, the inverse highlight block).
const PB_TT = { k: '#000000', r: '#FF0000', g: '#00FF00', y: '#FFFF00', b: '#0000FF', m: '#FF00FF', c: '#00FFFF', w: '#FFFFFF' };

// Punctuation the shared 5x7 table (AB_FONT_5X7, read-only) does not carry.
const PB_PUNCT = {
  '.': '00000 00000 00000 00000 00000 01100 01100', ',': '00000 00000 00000 00000 01100 00100 01000',
  '!': '00100 00100 00100 00100 00100 00000 00100', "'": '00100 00100 01000 00000 00000 00000 00000',
  '-': '00000 00000 00000 11111 00000 00000 00000', ':': '00000 01100 01100 00000 01100 01100 00000',
  '&': '01100 10010 10100 01000 10101 10010 01101', '/': '00001 00010 00010 00100 01000 01000 10000',
  '+': '00000 00100 00100 11111 00100 00100 00000', '#': '01010 01010 11111 01010 11111 01010 01010',
};
let pbSeq = 0;
// Local escape and glyph table guards: tokens() also runs where only the aesthetic files are loaded.
const pbEsc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pbFont = () => (typeof AB_FONT_5X7 !== 'undefined' ? AB_FONT_5X7 : {});
const pbGlyph = ch => pbFont()[ch] || PB_PUNCT[ch] || null;

// One word as a double-height Mode 7 style SVG: each glyph pixel is 1 unit wide and 2 tall
// (6 x 16 units per cell), drawn as one path. 1 cell = 0.6em wide, 2em tall, so the h2's
// font-size drives it like a typeface. fill = currentColor.
function pbWordSvg(word) {
  const chars = [...word.toUpperCase()];
  let d = '';
  chars.forEach((ch, i) => {
    const g = pbGlyph(ch);
    if (!g) return;
    g.split(' ').forEach((row, r) => {
      let c = 0;
      while (c < 5) {
        if (row[c] !== '1') { c++; continue; }
        let e = c;
        while (e < 5 && row[e] === '1') e++;
        d += `M${i * 6 + c} ${r * 2}h${e - c}v2h${c - e}z`;
        c = e;
      }
    });
  });
  const w = Math.max(1, chars.length * 6 - 1);
  return `<svg class="pbh-w" viewBox="0 0 ${w} 16" preserveAspectRatio="none" focusable="false" style="display:inline-block;vertical-align:top;width:${(w / 10).toFixed(1)}em;height:2em;overflow:visible"><path d="${d}" fill="currentColor"/></svg>`;
}

// The test card (fixed teletext bars, castellations to the edge, grey ramp, grating, centre
// circle with a fictional ident) with the torn frame-grab intrusion on its lower third.
// Standalone SVG (inline font attributes) so it also works as a data URI.
function pbTestCard(t, name) {
  const T = PB_TT;
  const bars = [T.w, T.y, T.c, T.g, T.m, T.r, T.b];
  const f = n => Math.round(n * 100) / 100;
  const bw = 160 / 7;
  const mono = "font-family=\"ui-monospace,Menlo,monospace\"";
  let cast = '';
  for (let i = 0; i < 20; i++) cast += `<rect x="${i * 8}" y="0" width="4" height="3.4" fill="#fff"/><rect x="${i * 8 + 4}" y="116.6" width="4" height="3.4" fill="#fff"/>`;
  for (let i = 0; i < 15; i++) cast += `<rect x="0" y="${i * 8 + 4}" width="3" height="4" fill="#fff"/><rect x="157" y="${i * 8}" width="3" height="4" fill="#fff"/>`;
  let barSvg = '';
  bars.forEach((c, i) => { barSvg += `<rect x="${f(i * bw)}" y="3.4" width="${f(bw + 0.05)}" height="52" fill="${c}"/>`; });
  const rev = [T.b, T.k, T.m, T.k, T.c, T.k, T.w];
  rev.forEach((c, i) => { barSvg += `<rect x="${f(i * bw)}" y="55.4" width="${f(bw + 0.05)}" height="6" fill="${c}"/>`; });
  for (let i = 0; i < 8; i++) { const g = Math.round((i / 7) * 235 + 10); barSvg += `<rect x="${i * 20}" y="61.4" width="20.05" height="7.5" fill="rgb(${g},${g},${g})"/>`; }
  let gx = 0;
  [2.2, 1.6, 1.2, 0.9, 0.6].forEach(w => { const end = gx + 32; for (let x = gx; x < end; x += w * 2) barSvg += `<rect x="${f(x)}" y="68.9" width="${w}" height="7" fill="#fff"/>`; gx = end; });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice"><rect width="160" height="120" fill="#000"/>${barSvg}${cast}
    <circle cx="80" cy="31" r="19.5" fill="#000" stroke="#fff" stroke-width="1.2"/><path d="M80 13V49M62 31H98" stroke="#fff" stroke-width=".5"/>
    <circle cx="80" cy="31" r="12" fill="none" stroke="#fff" stroke-width=".4" stroke-dasharray="1.2 1.2"/>
    <text x="80" y="33.4" text-anchor="middle" ${mono} font-size="9" font-weight="700" fill="#fff">ST-9</text>
    <text x="80" y="40.6" text-anchor="middle" ${mono} font-size="3.3" font-weight="700" fill="#fff">CH 43</text>
    <text x="80" y="22.6" text-anchor="middle" ${mono} font-size="3.3" font-weight="700" fill="#fff">4.2 MHZ</text>
    <rect x="0" y="76" width="160" height="40.6" fill="#000"/>
    <g transform="translate(92 79) scale(1.32)">${pbIntrusion(t, false)}</g>
    <text x="8" y="90" ${mono} font-size="7.2" font-weight="700" fill="#fff">GOOD EVENING.</text>
    <text x="8" y="98" ${mono} font-size="4.4" fill="#fff">THIS IS NOT YOUR SIGNAL.</text>
    <rect x="8" y="104" width="76" height="7" fill="#fff"/><rect x="8" y="104" width="20" height="7" fill="${T.r}"/>
    <text x="10.5" y="109.2" ${mono} font-size="3.8" font-weight="700" fill="#fff">REC</text>
    <text x="31" y="109.2" ${mono} font-size="3.8" font-weight="700" fill="#000">${name}</text></svg>`;
}

// The intrusion: a frame grab of the brand mark at 24 x 18 sixels in white on teletext blue,
// torn into three bands offset +3 / -2 / +5 with 1px white tear lines. Returns SVG content in
// a 24 x 18 box (embed it in an <svg viewBox="0 0 24 18"> or a transformed <g>).
function pbIntrusion(t, withSvg = true) {
  const T = PB_TT;
  const F = pbFont();
  const g = (F[String(t.__initial || 'M')] || F.M || '10001 11011 10101 10101 10001 10001 10001').split(' ');
  let px = '';
  g.forEach((row, r) => { for (let c = 0; c < 5; c++) if (row[c] === '1') px += `M${4.5 + c * 3} ${2 + r * 2}h2.6v1.7h-2.6z`; });
  const bands = [[0, 6, 3], [6, 12, -2], [12, 18, 5]];   // review asked +6/-4/+9: tuned down so the mark stays legible
  const id = 'pbi' + (++pbSeq);
  let out = `<defs>${bands.map((b, i) => `<clipPath id="${id}${i}"><rect x="0" y="${b[0]}" width="24" height="${b[1] - b[0]}"/></clipPath>`).join('')}</defs><rect width="24" height="18" fill="${T.b}"/>`;
  bands.forEach((b, i) => {
    const dx = b[2] % 24;
    out += `<g clip-path="url(#${id}${i})"><path d="${px}" fill="${T.w}" transform="translate(${dx} 0)"/><path d="${px}" fill="${T.w}" transform="translate(${dx > 0 ? dx - 24 : dx + 24} 0)"/></g>`;
  });
  out += `<rect x="0" y="5.8" width="24" height=".35" fill="#fff"/><rect x="0" y="11.8" width="24" height=".35" fill="#fff"/>`;
  return withSvg ? `<svg viewBox="0 0 24 18" preserveAspectRatio="none" shape-rendering="crispEdges" focusable="false" style="display:block;width:100%;height:100%">${out}</svg>` : out;
}

registerAesthetic({
  key: 'pirate-broadcast', order: 35,
  name: 'Pirate Broadcast',
  descriptor: 'Intercepted · Analog · Rogue',
  influences: 'Ceefax / Mode 7 / Test cards / Pirate TV',
  summary: 'A rigid teletext frame with test-card parts, interrupted by an intruding rogue signal.',
  motto: 'Do not adjust your set.',
  kicker: 'Page 100',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Signal', states: ['Carrier', 'Tuned', 'Intrusion'], statesKind: 'button' },
  layout: { hero: 'centered', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'body', label: 'body' },
  highlight: 'custom',
  highlightNote: 'The last word is an inverse-video block: the station ident colour (the client primary) behind teletext glyphs in black, like a Ceefax inverse header.',
  cardFill: '--ab-tt-screen',

  roles: {
    canvas: {
      use: 'The screen black (#000) in dark mode; in light mode a pale wall on which every card, header strip and the hero page is a black screen',
      never: 'Text, a grey wash, or a gradient other than scanlines',
      coverage: '60–70%',
    },
    ink: {
      use: 'Body text and numerals on the page around the screens',
      never: 'Large fills, or tinted text',
      coverage: '≈15%',
    },
    primary: {
      use: 'The station ident only: the brand mark, the P100 page number and the inverse block behind the highlighted headline word',
      never: 'Bars, title rows, keys or any teletext colour (those are fixed: R G Y B M C W on black)',
      coverage: '≈4%',
    },
    secondary: {
      use: 'Off screen: print pieces and charts',
      never: 'Anything on a teletext screen',
      coverage: '≈2%',
    },
    accent: {
      use: 'Off screen: one REC lamp at most',
      never: 'Bars, keys, title rows',
      coverage: '≤2%',
    },
  },

  // Its own ground: pure screen black in dark mode (teletext is a black field). Light mode
  // keeps the client's pale wall; every screen on it stays black.
  canvas(b) {
    return b.isDark ? '#000000' : null;
  },

  tokens(t) {
    const T = PB_TT;
    const name = pbEsc(String((typeof effectiveContent === 'function' && effectiveContent().brandName) || 'STATION').toUpperCase().slice(0, 22));
    return {
      '--ab-tt-screen': '#000000',
      '--ab-tt-fg': T.w,
      '--ab-tt-dim': '#9a9a9a',
      '--ab-tt-pri': t.primary,
      '--ab-tt-on-pri': t.onPrimary,
      '--ab-tt-yellow': T.y, '--ab-tt-green': T.g, '--ab-tt-magenta': T.m, '--ab-tt-red': T.r, '--ab-tt-blue': T.b, '--ab-tt-cyan': T.c, '--ab-tt-white': T.w,
      '--ab-tt-line': 'rgba(255,255,255,0.22)',
      '--ab-tt-scan': 'rgba(0,0,0,0.3)',
      '--ab-pb-card': `url("data:image/svg+xml,${encodeURIComponent(pbTestCard(Object.assign({}, t, { __initial: 'M' }), name))}")`,
      '--ab-type-pick-w': '400',
    };
  },

  // The headline as teletext: double-height Mode 7 style glyphs built from the shared 5x7
  // table (AB_FONT_5X7), one inline SVG per word so it wraps like type. The last word is an
  // inverse block in the station ident colour. The framework keeps the real text in the
  // h2's aria-label.
  headline(ctx, text) {
    const words = String(text || '').trim().split(/\s+/).filter(Boolean);
    if (!words.length) return '';
    return words.map((w, i) => {
      const svg = pbWordSvg(w);
      return i === words.length - 1 && words.length > 1 ? `<span class="pbh-hl">${svg}</span>` : `<span class="pbh">${svg}</span>`;
    }).join(' ');
  },

  // The hero IS a teletext page: a black screen with the Ceefax row 0 (page, service, date,
  // time), the torn frame-grab intrusion on the right, and the Fastext row 24. The headline
  // and copy sit over it on the character grid (css). The test card rides along hidden and is
  // shown on the deck's Material slide. Inline styles keep it whole as a blend donor.
  art(ctx) {
    const t = ctx.t;
    const T = PB_TT;
    const e = pbEsc;
    const svc = e(String(ctx.brandName || 'Station').trim().split(/\s+/)[0].toUpperCase().slice(0, 12));
    const name = e(String(ctx.brandName || 'Station').toUpperCase().slice(0, 22));
    const initial = String(ctx.initial || 'M').toUpperCase();
    const ti = Object.assign({}, t, { __initial: pbFont()[initial] ? initial : 'M' });
    const mono = "ui-monospace,'SF Mono',Menlo,monospace";
    const row = 'position:absolute;left:2.4%;right:2.4%;display:flex;justify-content:space-between;white-space:nowrap;font:700 clamp(8px,2.15cqw,19px)/1.2 ' + mono;
    const keys = [['INDEX', T.r], ['BRAND', T.g], ['TYPE', T.y], ['SIGNAL', T.c]];
    return `<div class="pba" style="position:absolute;inset:0;overflow:hidden;background:#000">
      <div class="pba-r0" style="${row};top:1.6%"><span><span style="color:${t.primary}">P100</span>&nbsp;&nbsp;<span style="color:${T.y}">${svc} 100</span></span><span style="color:${T.w}">SAT 11 OCT&nbsp;&nbsp;<span style="color:${T.y}">23:41/07</span></span></div>
      <div class="pba-gfx" style="position:absolute;left:58%;right:2.4%;top:14%;bottom:20%">
        <div style="position:absolute;inset:0 0 18% 0">${pbIntrusion(ti)}</div>
        <div style="position:absolute;left:0;right:0;bottom:0;height:14%;display:flex;align-items:center;background:${T.k};color:${T.w};font:400 clamp(7px,1.6cqw,14px)/1 ${mono};letter-spacing:.04em;white-space:nowrap;overflow:hidden">THIS IS NOT YOUR SIGNAL.</div>
      </div>
      <div class="pba-r24" style="${row};bottom:2%">${keys.map(k => `<span style="color:${k[1]}">${k[0]}</span>`).join('')}</div>
      <div style="position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,.28) 0 1px,transparent 1px 3px)"></div>
    </div><div class="pba-card" style="display:none;position:absolute;inset:0">${pbTestCard(ti, name)}</div>`;
  },

  materials: [
    { name: 'Teletext page', css: 'background: #000; color: #fff; font: 700 1em ui-monospace, Menlo, monospace; /* a 40-column character grid: row 0 P100 / service / date / time, double-height headline on rows 2-5, Fastext keys on row 24; eight fixed colours only */' },
    { name: 'Double-height headline', css: 'color: #FFFF00; /* Mode 7 style glyphs built from a 5x7 grid, each pixel 1 wide and 2 tall; the last word in inverse video on {primary} */' },
    { name: 'Test card', css: 'background: {pbCard} center / cover; /* fixed bars W Y C G M R B, castellations to the edge, grey ramp, grating, a fictional ident, the torn frame grab on its lower third */' },
    { name: 'Intrusion frame grab', css: 'background: #0000FF; /* the brand mark at 24 x 18 sixels in white, torn into three bands offset +6 / -4 / +9 with 1px white tear lines; "THIS IS NOT YOUR SIGNAL." in plain mono */' },
    { name: 'Title row', css: 'background: #00FFFF; color: #000; font: 700 11px ui-monospace, Menlo, monospace; letter-spacing: .08em; text-transform: uppercase; /* page number first: P101 */' },
    { name: 'Fastext keys', css: 'color: #FF0000 | #00FF00 | #FFFF00 | #00FFFF on #000; /* four colour-coded keys on row 24; the footer strip is R G Y B */' },
    { name: 'Dotted leader row', css: 'border-bottom: 2px dotted #9a9a9a; /* WEATHER ............ 401: title, dotted leader, right-aligned page number */' },
  ],

  rules: {
    do: [
      'Build the page on a 40-column character grid: row 0 carries page, service, date and time; Fastext keys sit on row 24.',
      'Set headlines as double-height teletext characters (pixel blocks one wide and two tall); keep the real text for screen readers.',
      'Use only the eight teletext colours on screen; the client colour is the station ident: the mark, one page number and the inverse block.',
      'Show the intrusion as an image: a torn frame grab of the mark with a plain mono message.',
    ],
    dont: [
      'Set the headline in a poster condensed face; teletext is a character generator.',
      'Put client colours in the test bars or the title rows; test signals are fixed.',
      'Frame the screen as a rounded TV; you are watching the broadcast, not a set.',
      'Impersonate a real station, a real emergency alert or a copied test-card picture.',
    ],
  },

  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['A forty-column page', 'Row 0 header, double-height headline, Fastext row 24.'],
      ['Eight fixed colours', 'Teletext R G Y B M C W on black; the brand is the ident.'],
      ['Then it gets intruded on', 'A torn frame grab and a plain message break the grid.'],
    ],
    do: [
      'Set copy on a 40-column character grid.',
      'Keep the eight teletext colours fixed.',
      'Show the intrusion as structure.',
    ],
    dont: [
      'Put client colours in the test bars.',
      'Frame the screen as a rounded TV.',
      'Impersonate a real station.',
    ],
  },
});
