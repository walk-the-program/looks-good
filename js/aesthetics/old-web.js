/* 45 Old Web — Handmade, Beveled, Hyperlinked. Web 1.0 (1995-2001): a black starfield
   homepage holding grey bevelled OS windows, Times body text, blue underlined links that turn
   purple, a visitor counter, a WordArt headline, an under-construction strip and a row of 88x31
   badges. References: 98.css (the exact four-tone bevel), Cameron's World, Space Jam 1996,
   Neocities, the 88x31 button archives.

   Mechanism. The page is a starfield tile (#000; a pale paper tile in light mode). Every
   control and panel is a silver (#C0C0C0) window or button drawn with the four-tone bevel:
   raised = white / #DFDFDF top-left, #808080 / #0A0A0A bottom-right (2px), sunken swaps the
   pairs; fields are sunken and white; the default button has an extra 1px black frame; focus
   is the dotted rectangle inside the button. Title bars run navy #000080 into the client
   primary (or #1084D0 when the primary cannot carry a white caption). Links are #0000EE and
   visited #551A8B inside windows; #9DB4FF / #C9A0FF on the black page.
   Headline: def.headline builds WordArt that survives html2canvas: every word is an
   inline-block holding a base copy (extrusion = a stack of 1px text-shadows in a dark
   primary) and two clipped overlay copies (overflow hidden at 36% / 66% of the word's
   height), so the face reads as a three-band gradient (light primary, primary, deep primary).
   The highlighted last word uses the accent bands. No background-clip:text, no masks.
   Client colours: primary = WordArt + title bar end; secondary = window accents and desktop
   icon fills; accent = NEW! badges and the counter LEDs. */
(function () {
const OW_NAVY = '#000080';
const OW_FALLBACK = '#1084D0';

function owMix(a, b, k) { return typeof slMix === 'function' ? slMix(a, b, k) : a; }
function owCR(a, b) { return typeof contrastRatio === 'function' ? contrastRatio(a, b) : 21; }
function owFace(name) { return typeof FONTS !== 'undefined' ? FONTS.find(f => f.name === name) : null; }
function owLoad(names) {
  if (typeof window === 'undefined' || !window.loadFontFamily) return;
  names.forEach(n => { const f = owFace(n); if (f) window.loadFontFamily(f); });
}
// a colour lifted (on black) or shaded (on white) until it holds `min` contrast on `bg`
function owHold(hex, bg, min) {
  const to = owCR(bg, '#000000') > owCR(bg, '#ffffff') ? '#000000' : '#ffffff';
  let c = hex;
  for (let k = 0.08; k <= 1 && owCR(c, bg) < min; k += 0.08) c = owMix(to, hex, k);
  return c;
}
// WordArt bands (light, mid, deep) and the extrusion colour for a page colour: every band
// holds 3:1 on the page (large display text), so a pale primary darkens on white and a deep
// one lifts on black. Yellows on white cannot stay yellow at 3:1; mixing them toward black
// turns them olive / brown, so they run a saturated sunset ramp instead (amber, orange,
// red-orange at full saturation, a deep red-brown extrusion), the classic WordArt preset.
function owSat(h, page, min) {
  for (let l = 70; l >= 0; l--) { const x = hslToHex(h, 100, l); if (owCR(x, page) >= min) return x; }
  return '#000000';
}
function owBands(hex, page) {
  const onWhite = page === '#FFFFFF';
  if (onWhite && typeof hexToHsl === 'function' && typeof hslToHex === 'function') {
    const hsl = hexToHsl(hex);
    if (hsl.s >= 35 && hsl.h >= 38 && hsl.h <= 80 && owCR(hex, page) < 3) {
      return [owSat(Math.min(42, hsl.h - 4), page, 3), owSat(30, page, 3.6), owSat(18, page, 4.5), hslToHex(16, 100, 17)];
    }
  }
  let mid = hex;
  if (onWhite && typeof abAccentInk === 'function') mid = abAccentInk(hex, page, '#000000');
  mid = owHold(mid, page, 3);
  return [owHold(owMix('#ffffff', mid, 0.5), page, 3), mid, owHold(owMix('#000000', mid, 0.3), page, 3), owMix('#000000', hex, 0.62)];
}

// One WordArt word: base copy (extruded) + two clipped band copies.
function owWord(word, cls) {
  const w = escapeHtml(word);
  return `<span class="ow-w${cls ? ' ' + cls : ''}"><span class="ow-x">${w}</span><span class="ow-b ow-b2">${w}</span><span class="ow-b ow-b1">${w}</span></span>`;
}

// tiny drawn icons (no OS logos): folder, globe, note, mail
const OW_ICONS = {
  folder: c => `<svg viewBox="0 0 16 16" class="owi" aria-hidden="true" focusable="false"><path d="M1 4h5l1 1h8v9H1z" fill="${c}" stroke="#000" stroke-width="1" shape-rendering="crispEdges"/><path d="M2 6h12" stroke="#fff" stroke-width="1" shape-rendering="crispEdges"/></svg>`,
  globe: c => `<svg viewBox="0 0 16 16" class="owi" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="6.5" fill="${c}" stroke="#000"/><path d="M1.5 8h13M8 1.5c-3 3-3 10 0 13M8 1.5c3 3 3 10 0 13M3 4.5h10M3 11.5h10" fill="none" stroke="#000" stroke-width=".8"/></svg>`,
  note: c => `<svg viewBox="0 0 16 16" class="owi" aria-hidden="true" focusable="false"><path d="M3 1h7l3 3v11H3z" fill="#fff" stroke="#000" shape-rendering="crispEdges"/><path d="M10 1v3h3" fill="${c}" stroke="#000" shape-rendering="crispEdges"/><path d="M5 7h6M5 9h6M5 11h4" stroke="${c}" shape-rendering="crispEdges"/></svg>`,
  mail: c => `<svg viewBox="0 0 16 16" class="owi" aria-hidden="true" focusable="false"><path d="M1 4h14v9H1z" fill="#fff" stroke="#000" shape-rendering="crispEdges"/><path d="M1 4l7 5 7-5" fill="none" stroke="${c}" stroke-width="1.2"/></svg>`,
};

registerAesthetic({
  key: 'old-web', order: 45,
  name: 'Old Web',
  descriptor: 'Handmade · Beveled · Hyperlinked',
  influences: '98.css / Cameron\'s World / GeoCities / 88×31 buttons',
  summary: 'A starfield homepage of grey bevelled windows, Times and blue links, with a WordArt title, a visitor counter and a row of badges.',
  motto: 'Default HTML, made with love.',
  kicker: 'Welcome to the homepage',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Bevels', states: ['Raised', 'Visited', 'Sunken'], statesKind: 'button' },
  layout: { hero: 'centered', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'body', label: 'body', display: 1 },
  highlight: 'custom',
  highlightNote: 'The whole headline is WordArt: a three-band gradient face (light primary, primary, deep primary) with a stacked 1px extrusion in a dark primary; the last word swaps to the accent bands. Built from clipped solid copies, never background-clip:text.',
  ctaFill: 'ink',
  cardInk: { ink: { light: '#000000', dark: '#000000' }, muted: { light: '#3A3A3A', dark: '#3A3A3A' } },   // window text is black on silver in both modes
  cardFill: '--ow-silver',

  roles: {
    canvas: {
      job: 'Starfield page',
      use: 'The page: a #000 starfield tile in dark mode, a pale paper tile in light mode. Windows on it are fixed silver #C0C0C0 with the four-tone bevel; fields are white and sunken',
      never: 'Text on a busy tile, gradients, rounded panels',
      coverage: '45–55% (silver windows 30–40%)',
    },
    ink: {
      job: 'Page text',
      use: 'Times text on the page. Inside windows text is always #000; links are #0000EE / visited #551A8B there, and #9DB4FF / #C9A0FF on the black page',
      never: 'Links (links keep the browser blues)',
      coverage: '10–15%',
    },
    primary: {
      job: 'WordArt · title bars',
      use: 'The WordArt headline gradient and extrusion, and the end colour of every title bar (navy #000080 to primary; #1084D0 when the primary cannot carry a white caption)',
      never: 'Button faces (buttons are silver), body text, links',
      coverage: '≈8%',
    },
    secondary: {
      job: 'Window accents',
      use: 'Window accents: folder, globe and row icon fills, the brand mark and one 88x31 badge back (progress blocks stay navy #000080)',
      never: 'Buttons, links, the page',
      coverage: '≈6%',
    },
    accent: {
      job: 'NEW! · counter LEDs',
      use: 'NEW! badges, the hit-counter LED digits and the highlighted WordArt word',
      never: 'Buttons, links, body text',
      coverage: '≤3%',
    },
  },

  canvas(b) { return b.isDark ? '#000000' : '#FFFFFF'; },

  tokens(t) {
    const d = t.isDark;
    owLoad(['Arimo']);
    const pri = t.printPrimary || t.primary;
    const titleEnd = owCR('#ffffff', pri) >= 3 ? pri : OW_FALLBACK;
    const page = d ? '#000000' : '#FFFFFF';
    const wa = owBands(pri, page);
    const ha = owBands(t.accent, page);
    const led = owHold(t.accent, '#000000', 4.5);
    return {
      '--ow-silver': '#C0C0C0',
      '--ow-face': '#DFDFDF',
      '--ow-shade': '#808080',
      '--ow-dark': '#0A0A0A',
      '--ab-navy': OW_NAVY,
      '--ab-title-end': titleEnd,
      '--ow-raised': 'inset -1px -1px #0A0A0A, inset 1px 1px #FFFFFF, inset -2px -2px #808080, inset 2px 2px #DFDFDF',
      '--ow-sunken': 'inset -1px -1px #FFFFFF, inset 1px 1px #808080, inset -2px -2px #DFDFDF, inset 2px 2px #0A0A0A',
      '--ow-window': 'inset -1px -1px #0A0A0A, inset 1px 1px #DFDFDF, inset -2px -2px #808080, inset 2px 2px #FFFFFF',
      '--ab-raised': 'inset -1px -1px #0A0A0A, inset 1px 1px #FFFFFF, inset -2px -2px #808080, inset 2px 2px #DFDFDF',
      '--ab-sunken': 'inset -1px -1px #FFFFFF, inset 1px 1px #808080, inset -2px -2px #DFDFDF, inset 2px 2px #0A0A0A',
      '--ow-link': d ? '#9DB4FF' : '#0000EE',
      '--ow-visited': d ? '#C9A0FF' : '#551A8B',
      '--ow-wa1': wa[0], '--ow-wa2': wa[1], '--ow-wa3': wa[2],
      '--ow-wx': wa[3],
      '--ow-ha1': ha[0], '--ow-ha2': ha[1], '--ow-ha3': ha[2],
      '--ow-hx': ha[3],
      '--ow-led': led,
      '--ow-new': t.accent,
      '--ow-on-new': t.readable(t.accent),
      '--ow-sec': t.secondary,
      '--ow-on-sec': t.readable(t.secondary),
      '--ow-star': d ? '#FFFFFF' : '#B8BED6',
      '--ow-star2': d ? '#9DB4FF' : '#D5D9EA',
      '--ow-sys': 'Arimo, Arial, "MS Sans Serif", Tahoma, sans-serif',
      '--ow-pix': '"Silkscreen", "Pixelify Sans", Tahoma, Verdana, monospace',
      '--ow-led-font': '"VT323", "Courier Prime", "Courier New", monospace',
      '--ow-comic': '"Comic Neue", "Comic Sans MS", cursive',
      '--ab-art-ratio': '16 / 8.4',
      '--ab-art-ratio-narrow': '10 / 15',
      '--ab-tr': 1,
    };
  },

  headline(ctx, text) {
    owLoad(['Silkscreen', 'VT323', 'Comic Neue']);
    const words = String(text || '').trim().split(/\s+/).filter(Boolean);
    if (!words.length) return '';
    return words.map((w, i) => owWord(w, i === words.length - 1 ? 'ab-hl ow-hlw' : '')).join(' ');
  },

  art(ctx) {
    const t = ctx.t;
    const e = escapeHtml;
    owLoad(['Silkscreen', 'VT323', 'Comic Neue']);
    const name = String(ctx.brandName || '').trim() || 'My';
    const pri = t.printPrimary || t.primary;
    const titleEnd = owCR('#ffffff', pri) >= 3 ? pri : OW_FALLBACK;
    const sec = t.secondary;
    const led = owHold(t.accent, '#000000', 4.5);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 14) || 'home';
    const count = '000417';
    const digits = count.split('').map(ch => `<b>${ch}</b>`).join('');
    const links = [['folder', 'My projects'], ['note', 'About me'], ['mail', 'Guestbook'], ['globe', 'Cool links']]
      .map(([ic, l], i) => `<li>${OW_ICONS[ic](sec)}<a class="${i === 2 ? 'ow-vis' : ''}">${l}</a></li>`).join('');
    const badges = [
      ['ow-bd1', 'BEST VIEWED', '800 × 600'],
      ['ow-bd2', 'MADE WITH', 'NOTEPAD'],
      ['ow-bd3', e(name.split(/\s+/)[0].toUpperCase().slice(0, 10)), 'WEBRING'],
    ].map(([c, a, b]) => `<span class="ow-88 ${c}"><i>${a}</i><i>${b}</i></span>`).join('');
    return `<div class="owa">
      <div class="owa-win">
        <div class="ow-title" style="background-color:${OW_NAVY};background-image:linear-gradient(90deg, ${OW_NAVY}, ${titleEnd})">${OW_ICONS.globe(sec)}<b>Welcome to ${e(name)}'s Homepage!</b><span class="ow-caps"><i class="ow-cap ow-min"></i><i class="ow-cap ow-max"></i><i class="ow-cap ow-cls"></i></span></div>
        <div class="owa-menu"><span><u>F</u>ile</span><span><u>E</u>dit</span><span><u>V</u>iew</span><span><u>G</u>o</span><span><u>H</u>elp</span></div>
        <div class="owa-body">
          <ul class="owa-nav">${links}</ul>
          <div class="owa-main">
            <div class="owa-uc"><span class="owa-sign" aria-hidden="true"><i>!</i></span><b>UNDER CONSTRUCTION</b><small>pardon our dust · last updated 10/11/1999</small></div>
            <div class="owa-marq"><span>*** Thanks for visiting ${e(name)}! Sign my guestbook before you go! *** New stuff added every week!! ***</span></div>
            <div class="owa-row">
              <div class="owa-count"><span>You are visitor #</span><span class="owa-odo" style="--ow-led:${led}">${digits}</span></div>
              <p class="owa-gb">♥ please sign my guestbook ♥</p>
            </div>
            <div class="owa-ring"><span class="ow-legend">${e(name)} webring</span><a>&lt;&lt; prev</a> | <a>random</a> | <a class="ow-vis">list</a> | <a>next &gt;&gt;</a></div>
            <div class="owa-new"><b>What's New?</b><ul><li><i>NEW!</i> 10/11 · added my <a>design language</a> page</li><li>09/30 · fixed the <a class="ow-vis">guestbook</a> (sorry!!)</li><li>09/02 · <a>${e(name)}</a> joined the webring</li></ul></div>
            <div class="owa-badges">${badges}</div>
          </div>
        </div>
        <div class="owa-status"><span>Done</span><span>http://www.${slug}.com/~home/index.html</span></div>
      </div>
    </div>`;
  },

  // 03 as a real grid-lined table: raised column headers (list-view style), folder icons,
  // link names (the second one visited), a NEW! badge, segmented navy progress.
  panels: {
    list(ctx) {
      const e = ctx.e;
      const sec = ctx.t.secondary;
      const rows = (ctx.rows || []).slice(0, 3).map((r, i) => `<li class="ab-row">
          <span class="ab-row-n" aria-hidden="true">${OW_ICONS.folder(sec)}</span>
          <span class="ab-row-name"><a class="${i === 1 ? 'ow-vis' : ''}">${e(r[0])}</a></span>
          <span class="ab-row-status">${e(r[1])}${i === 0 ? ' <i class="ow-new">NEW!</i>' : ''}</span>
          <span class="ab-row-bar" aria-hidden="true"><i style="width:${Number(r[2]) || 0}%"></i></span>
          <span class="ab-row-pct">${Number(r[2]) || 0}%</span>
        </li>`).join('');
      return `<ul class="ab-list ow-table"><li class="ab-row ow-th" aria-hidden="true"><span></span><span>Name</span><span>Status</span><span>Progress</span><span>Done</span></li>${rows}</ul>`;
    },
  },

  materials: [
    { name: 'Raised bevel', css: 'background: #C0C0C0; box-shadow: {raised}; border-radius: 0; color: #000000; font: 11px Arial, "MS Sans Serif", sans-serif; /* the exact four-tone bevel: white and #DFDFDF top-left, #808080 and #0A0A0A bottom-right; the default button gets an extra 1px black frame */' },
    { name: 'Sunken field', css: 'background: #FFFFFF; box-shadow: {sunken}; border-radius: 0; color: #000000; /* the raised pairs swapped; text fields, the counter, progress tracks */' },
    { name: 'Title bar', css: 'background: linear-gradient(90deg, {navy}, {titleEnd}); color: #FFFFFF; font: 700 12px Arial, "MS Sans Serif", sans-serif; /* navy into the client primary; three bevelled 16x14 caption buttons at the right */' },
    { name: 'Hyperlink', css: 'color: #0000EE; text-decoration: underline; /* visited #551A8B; on the black page #9DB4FF / #C9A0FF */' },
    { name: 'Focus rectangle', css: 'outline: 1px dotted #000000; outline-offset: -4px; /* drawn inside the button; the original focus ring */' },
    { name: 'Grooved rule', css: 'border: 0; border-top: 1px solid #808080; border-bottom: 1px solid #FFFFFF; /* the default <hr> */' },
  ],

  rules: {
    do: [
      'Use the exact four-tone bevel on every control: raised for buttons and windows, sunken for fields, the counter and progress tracks.',
      'Keep links blue and underlined, visited purple, and body text in Times; set the window chrome in an 11-12px system sans.',
      'Make the headline WordArt: a banded gradient face with a stacked extrusion, built from solid copies so it exports.',
      'Add a visitor counter, a webring bar and a row of 88x31 badges; use Comic for exactly one element.',
    ],
    dont: [
      'Use OS logos, the Windows flag, real GIF assets or real sites\' 88x31 badges.',
      'Add gloss, gradients or rounded corners to buttons; that is Frutiger Aero and Web 2.0.',
      'Set body text on a busy tile or link blue on black; switch links to the light blues on the page.',
      'Borrow game sprites, stepped pixel borders or vaporwave statues; those are other aesthetics.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    coverDisplay: 0.86,
    // Do / Don't marks are classic sunken checkboxes: ticked for do, crossed for don't.
    marks: (ctx, kind) => `<i class="ow-chk ${kind === 'do' ? 'is-on' : 'is-x'}"></i>`,
    principles: [
      ['Default HTML, made with love', 'Plain markup, earnestly decorated.'],
      ['Bevel, link, badge, repeat', 'The same few parts, used everywhere.'],
      ['Fully usable', 'Chaotic on the surface and still easy to navigate.'],
    ],
    do: [
      'Use the exact four-tone bevel on every control.',
      'Keep links blue and underlined; visited purple.',
      'Add a visitor counter and a row of badges.',
    ],
    dont: [
      'Use OS logos or real GIF assets.',
      'Add gloss or rounded buttons; that\'s Aero.',
      'Set body text on busy tiles.',
    ],
  },
});
})();
