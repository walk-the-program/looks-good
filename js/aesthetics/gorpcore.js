/* 44 Gorpcore — Technical, Outdoor, Rugged. Technical outdoor gear as a brand language
   (spec-table product pages, USGS / swisstopo contour maps, NPS Unigrid title bands,
   trail blazing, hang tags).

   Mechanism. A stone ground (#EDEBE6) woven with a ripstop grid (5px, heavier every 5th
   line, about 3% contrast) under a black Unigrid title band. The client colours are FABRIC
   colourways, dyed 10% flatter: primary = the shell fabric (main panels, the main action),
   secondary = the second colour-blocked panel and the contour tint, accent = trail-blaze
   markers. Fixed: carbon #1B1D1C, blaze orange #FF5F1F used tiny (zip pull, "you are
   here"), reflective silver #C9CCCF. Every number has a unit (g, m, °C, km).
   Hero art: a topographic map generated from a seeded height field by marching squares,
   every fifth contour an index contour at double weight with its elevation label knocking
   out the line, a dashed switchback trail in the shell colour to a summit triangle, one
   blaze-orange position dot, coordinates, scale bar and north tick; a paper hang tag with a
   grommet hangs off a carabiner on a cord over the map and carries the brand's spec table.
   Headline: condensed caps; the last word is a woven brand label in the shell fabric with a
   dashed stitch inset (the "Taped" seam). Components are hardware: a webbing strap with a
   buckle for tabs, a side-release buckle for the toggle, a pull-tab loop and an orange zip
   pull on the button, fabric swatches for the states. */
(function () {
const GC_STONE = '#EDEBE6';
const GC_CARBON = '#1B1D1C';
const GC_BLAZE = '#FF5F1F';
const GC_SILVER = '#C9CCCF';
const GC_PAPER = '#F7F4EC';

function gcHash(s) { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function gcRand(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function gcMix(a, b, k) { return typeof slMix === 'function' ? slMix(a, b, k) : a; }

// Fabric dye: the client colour 10% less saturated (a dyed-textile read).
function gcDye(hex) {
  if (typeof hexToHsl !== 'function' || typeof hslToHex !== 'function') return hex;
  const c = hexToHsl(hex);
  return hslToHex(c.h, Math.max(0, c.s * 0.9), c.l);
}
function gcWeight(cap) {
  const hf = typeof state !== 'undefined' && state && state.headingFont;
  const ws = String((hf && hf.weights) || '700').split(';').map(Number).filter(Boolean);
  const le = ws.filter(x => x <= cap);
  return le.length ? Math.max(...le) : Math.min(...ws);
}
function gcFace(name) { return typeof FONTS !== 'undefined' ? FONTS.find(f => f.name === name) : null; }

/* ---- the height field and marching squares ---- */
function gcField(seed) {
  const rnd = gcRand(seed);
  const j = () => (rnd() - 0.5) * 0.06;
  const bumps = [
    [0.33 + j(), 0.44 + j(), 1, 0.2],
    [0.56 + j(), 0.63 + j(), 0.5, 0.13],
    [0.16 + j(), 0.84 + j(), 0.36, 0.1],
    [0.8 + j(), 0.2 + j(), 0.28, 0.12],
    [0.22 + j(), 0.18 + j(), 0.22, 0.09],
  ];
  const n = 7, g = [];
  for (let i = 0; i < n * n; i++) g.push(rnd());
  const noise = (x, y) => {
    const fx = x * (n - 1), fy = y * (n - 1);
    const i = Math.min(n - 2, Math.floor(fx)), k = Math.min(n - 2, Math.floor(fy));
    const u = fx - i, v = fy - k;
    const s = t => t * t * (3 - 2 * t);
    const a = g[k * n + i], b = g[k * n + i + 1], c = g[(k + 1) * n + i], d = g[(k + 1) * n + i + 1];
    return a + (b - a) * s(u) + (c - a) * s(v) + (a - b - c + d) * s(u) * s(v);
  };
  return (x, y) => {
    let v = 0;
    for (const [bx, by, a, sg] of bumps) v += a * Math.exp(-((x - bx) ** 2 + ((y - by) * 1.15) ** 2) / (2 * sg * sg));
    // a ridge running from the summit to the south-east shoulder
    const t = Math.max(0, Math.min(1, ((x - 0.33) * 0.23 + (y - 0.44) * 0.19) / (0.23 ** 2 + 0.19 ** 2)));
    const rx = 0.33 + 0.23 * t, ry = 0.44 + 0.19 * t;
    v += 0.32 * Math.exp(-((x - rx) ** 2 + (y - ry) ** 2) / (2 * 0.05 * 0.05)) * (1 - t * 0.6);
    return v + (noise(x, y) - 0.5) * 0.14;
  };
}

// Contour polylines of `f` at `level` over a W x H box sampled on an nx x ny grid.
function gcContours(F, nx, ny, W, H, level) {
  const sx = W / (nx - 1), sy = H / (ny - 1);
  const segs = [];
  const lerp = (p, q, a, b) => { const t = (level - a) / ((b - a) || 1e-9); return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]; };
  for (let j = 0; j < ny - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const a = F[j][i], b = F[j][i + 1], c = F[j + 1][i + 1], d = F[j + 1][i];
      const idx = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
      if (idx === 0 || idx === 15) continue;
      const P = [i * sx, j * sy], Q = [(i + 1) * sx, j * sy], R = [(i + 1) * sx, (j + 1) * sy], S = [i * sx, (j + 1) * sy];
      const top = () => lerp(P, Q, a, b), right = () => lerp(Q, R, b, c), bot = () => lerp(S, R, d, c), left = () => lerp(P, S, a, d);
      const add = (p, q) => segs.push([p, q]);
      switch (idx) {
        case 1: case 14: add(left(), bot()); break;
        case 2: case 13: add(bot(), right()); break;
        case 3: case 12: add(left(), right()); break;
        case 4: case 11: add(top(), right()); break;
        case 5: add(left(), top()); add(bot(), right()); break;
        case 6: case 9: add(top(), bot()); break;
        case 7: case 8: add(left(), top()); break;
        case 10: add(top(), right()); add(left(), bot()); break;
      }
    }
  }
  // chain segments into polylines through shared endpoints
  const key = p => p[0].toFixed(3) + ',' + p[1].toFixed(3);
  const ends = new Map();
  segs.forEach((s, i) => { [0, 1].forEach(e => { const k = key(s[e]); if (!ends.has(k)) ends.set(k, []); ends.get(k).push(i); }); });
  const used = new Uint8Array(segs.length);
  const lines = [];
  for (let i = 0; i < segs.length; i++) {
    if (used[i]) continue;
    used[i] = 1;
    const line = [segs[i][0], segs[i][1]];
    for (const dir of [1, 0]) {
      let guard = 0;
      while (guard++ < 5000) {
        const tip = dir ? line[line.length - 1] : line[0];
        const next = (ends.get(key(tip)) || []).find(k => !used[k]);
        if (next === undefined) break;
        used[next] = 1;
        const s = segs[next];
        const other = key(s[0]) === key(tip) ? s[1] : s[0];
        if (dir) line.push(other); else line.unshift(other);
      }
    }
    lines.push(line);
  }
  return lines;
}

function gcPathOf(line) {
  return 'M' + line.map(p => p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join('L');
}
function gcLen(line) { let L = 0; for (let i = 1; i < line.length; i++) L += Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]); return L; }

let gcSeq = 0;

registerAesthetic({
  key: 'gorpcore', order: 44,
  name: 'Gorpcore',
  descriptor: 'Technical · Outdoor · Rugged',
  influences: 'Technical shells / USGS & swisstopo maps / NPS Unigrid / Trail blazes',
  summary: 'Stone ground, contour maps, hang tags with spec tables and one blaze-orange zip pull.',
  motto: 'The gear spec is the story.',
  kicker: 'Field tested',
  mode: 'light',
  slideShape: 'minimal',
  labels: { material: 'Fabric', states: ['Ripstop', 'Taped', 'Reflective'], statesKind: 'swatch' },
  layout: { hero: 'split', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'body', label: 'mono', display: 1.18 },
  highlight: 'custom',
  highlightNote: 'The last word of the headline is a woven brand label: set on the shell fabric (primary, dyed 10% flatter) in its readable text colour, with a dashed stitch line inset 0.08em all round, like a taped seam; never a plain colour change.',
  cardFill: '--gc-panel',

  roles: {
    canvas: {
      job: 'Stone ground',
      use: 'The stone ground (#EDEBE6 light, carbon #1A1C1B dark) woven with a ripstop grid at about 3% contrast; contour maps sit on it. Fixed, never a client tint. Hang tags are paper #F7F4EC in both modes',
      never: 'Text, glossy or gradient fills',
      coverage: '55–65%',
    },
    ink: {
      job: 'Carbon',
      use: 'Carbon text, the Unigrid title band, 1px spec-table rules, webbing straps, index contours',
      never: 'Fabric panels',
      coverage: '15–20%',
    },
    primary: {
      job: 'Shell fabric',
      use: 'The shell fabric, dyed 10% flatter: the main action, the woven headline label, the trail on the map, the selected toggle clip, the lead colourway chip',
      never: 'Body text, page background, more than one big panel per view',
      coverage: '≈10%',
    },
    secondary: {
      job: 'Second panel · contours',
      use: 'The colour-blocked second fabric panel and the contour-line tint; the Taped swatch',
      never: 'The main action, body text',
      coverage: '≈8–12%',
    },
    accent: {
      job: 'Trail blazes',
      use: 'Trail-blaze markers only: circle, square and diamond difficulty marks on trail rows and the kicker',
      never: 'Buttons, text, large fills. The orange zip pull and position dot are the fixed blaze orange #FF5F1F, not the accent',
      coverage: '≤3%',
    },
  },

  canvas(b) { return b.isDark ? '#1A1C1B' : GC_STONE; },

  tokens(t) {
    const d = t.isDark;
    const shell = gcDye(t.printPrimary || t.primary);
    const shell2 = gcDye(t.secondary);
    const hw = gcWeight(800);
    return {
      '--ab-type-pick-w': 400,   // secondary picks; each column's lead pick gets its own real weight in the css
      '--gc-hw': hw,
      '--gc-bw': gcWeight(700),
      '--ab-carbon': GC_CARBON,
      '--ab-blaze': GC_BLAZE,
      '--ab-silver': GC_SILVER,
      '--ab-paper': GC_PAPER,
      '--ab-shell': shell,
      '--ab-on-shell': t.readable(shell),
      '--ab-shell2': shell2,
      '--ab-on-shell2': t.readable(shell2),
      '--ab-blazemark': t.accentInk,
      '--gc-panel': d ? '#232624' : '#F4F2EC',
      '--gc-band': d ? '#000000' : GC_CARBON,
      '--gc-hair': d ? 'rgba(237,235,230,0.22)' : 'rgba(27,29,28,0.22)',
      '--ab-rip': d ? 'rgba(237,235,230,0.035)' : 'rgba(27,29,28,0.045)',
      '--ab-rip5': d ? 'rgba(237,235,230,0.06)' : 'rgba(27,29,28,0.075)',
      '--gc-mono': '"JetBrains Mono", "IBM Plex Mono", ui-monospace, Menlo, monospace',
      '--gc-stencil': '"Saira Stencil", var(--ab-font-h)',
      '--ab-art-ratio': '1 / 1.04',
      '--ab-tr': 0,
    };
  },

  art(ctx) {
    const t = ctx.t;
    const e = escapeHtml;
    const d = t.isDark;
    if (typeof window !== 'undefined' && window.loadFontFamily) {
      ['Saira Stencil', 'JetBrains Mono'].forEach(n => { const f = gcFace(n); if (f) window.loadFontFamily(f); });
    }
    const name = String(ctx.brandName || '').trim();
    const seed = gcHash(name || 'brand');
    const rnd = gcRand(seed ^ 0x51ed27);
    const W = 100, H = 106, NX = 70, NY = 74;
    const f = gcField(seed);
    const F = [];
    for (let j = 0; j < NY; j++) { const row = []; for (let i = 0; i < NX; i++) row.push(f(i / (NX - 1), j / (NY - 1))); F.push(row); }
    const shell = gcDye(t.printPrimary || t.primary);
    const ground = d ? '#232624' : '#E4E1D9';
    const carbon = d ? GC_STONE : GC_CARBON;
    const tint = d ? gcMix(t.secondary, GC_STONE, 0.45) : gcMix(t.secondary, GC_CARBON, 0.45);
    const cline = d ? gcMix(tint, ground, 0.62) : gcMix(tint, ground, 0.55);
    const iline = d ? gcMix(tint, ground, 0.9) : gcMix(tint, ground, 0.85);
    // levels: 15 contours from 0.1, every fifth an index contour with a label
    let paths = '', idx = '', labels = '';
    const N = 24;
    for (let k = 0; k < N; k++) {
      const level = 0.04 + k * 0.048;
      const lines = gcContours(F, NX, NY, W, H, level).filter(l => l.length > 3);
      const isIdx = k % 5 === 2;
      const dd = lines.map(gcPathOf).join('');
      if (!dd) continue;
      if (isIdx) {
        idx += `<path d="${dd}"/>`;
        const long = lines.slice().sort((a, b) => gcLen(b) - gcLen(a))[0];
        if (long && long.length > 12) {
          const at = Math.floor(long.length * (0.32 + rnd() * 0.3));
          const p = long[at], q = long[Math.min(long.length - 1, at + 2)];
          let ang = Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI;
          if (ang > 90) ang -= 180; if (ang < -90) ang += 180;
          if (p[0] > 6 && p[0] < 94 && p[1] > 6 && p[1] < 100) {
            const elev = (1200 + Math.round(level * 1250 / 10) * 10).toLocaleString('en-US');
            labels += `<text x="${p[0].toFixed(2)}" y="${p[1].toFixed(2)}" transform="rotate(${ang.toFixed(1)} ${p[0].toFixed(2)} ${p[1].toFixed(2)})" dy="0.9">${elev}</text>`;
          }
        }
      } else paths += `<path d="${dd}"/>`;
    }
    // the summit: the highest grid point
    let best = [0, 0, -1];
    F.forEach((row, j) => row.forEach((v, i) => { if (v > best[2]) best = [i, j, v]; }));
    const sx = best[0] * W / (NX - 1), sy = best[1] * H / (NY - 1);
    const peak = (2000 + Math.round(best[2] * 70)).toLocaleString('en-US');
    // a switchback trail from the south-west foot to the summit
    const pts = [[4, 104], [10, 95], [21, 92], [14, 84], [26, 79], [19, 71], [sx - 4, sy + 14], [sx - 9, sy + 9], [sx - 1, sy + 4], [sx, sy + 1.6]];
    let tp = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const [x, y] = pts[i], [nx, ny] = pts[i + 1];
      tp += ` Q${x.toFixed(1)} ${y.toFixed(1)} ${((x + nx) / 2).toFixed(1)} ${((y + ny) / 2).toFixed(1)}`;
    }
    tp += ` L${pts[pts.length - 1][0].toFixed(1)} ${pts[pts.length - 1][1].toFixed(1)}`;
    const here = [(pts[3][0] + pts[4][0]) / 2, (pts[3][1] + pts[4][1]) / 2];
    const lake = `M${72} ${30} q6 -5 12 -1 q5 4 1 9 q-4 5 -10 3 q-6 -3 -3 -11z`;
    const id = 'gc' + (++gcSeq);
    const map = `<svg class="gca-map" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs><pattern id="${id}-g" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M5 0H0V5" fill="none" stroke="${carbon}" stroke-opacity="0.06" stroke-width="0.2"/></pattern></defs>
      <rect x="-10" y="-10" width="${W + 20}" height="${H + 20}" fill="${ground}"/>
      <rect x="-10" y="-10" width="${W + 20}" height="${H + 20}" fill="url(#${id}-g)"/>
      <path d="${lake}" fill="${d ? gcMix(t.secondary, ground, 0.3) : gcMix(t.secondary, ground, 0.32)}"/>
      <g fill="none" stroke="${cline}" stroke-width="0.32" stroke-linejoin="round">${paths}</g>
      <g fill="none" stroke="${iline}" stroke-width="0.7" stroke-linejoin="round">${idx}</g>
      <g class="gca-el" fill="${iline}" stroke="${ground}" stroke-width="0.9" paint-order="stroke" text-anchor="middle">${labels}</g>
      <path d="${tp}" fill="none" stroke="${ground}" stroke-width="1.9" stroke-linecap="round"/>
      <path d="${tp}" fill="none" stroke="${shell}" stroke-width="0.9" stroke-dasharray="2.2 1.2" stroke-linecap="round"/>
      <path d="M${sx.toFixed(2)} ${(sy - 2.6).toFixed(2)}l2.4 4.1h-4.8z" fill="${carbon}"/>
      <text class="gca-pk" x="${sx.toFixed(2)}" y="${(sy + 5.4).toFixed(2)}" text-anchor="middle" fill="${carbon}" stroke="${ground}" stroke-width="0.8" paint-order="stroke">${peak} m</text>
      <circle cx="${here[0].toFixed(2)}" cy="${here[1].toFixed(2)}" r="2.6" fill="${GC_BLAZE}" fill-opacity="0.22"/>
      <circle cx="${here[0].toFixed(2)}" cy="${here[1].toFixed(2)}" r="1.25" fill="${GC_BLAZE}" stroke="#fff" stroke-width="0.45"/>
      <g class="gca-n" fill="${carbon}"><path d="M8 7.5l1.6 4.6-1.6-1-1.6 1z"/><text x="8" y="6">N</text></g>
    </svg>`;
    const specs = [['Weight', '312 g'], ['Fabric', '20D ripstop'], ['Shell', '3-layer'], ['Range', '−5 to 15 °C'], ['Seams', 'fully taped']];
    const rows = specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
    const shell2 = gcDye(t.secondary);
    return `<div class="gca" data-dark="${d ? 1 : 0}">
      <div class="gca-panel">${map}
        <span class="gca-coord">N 46°32′48″ · E 7°57′45″ · ${peak} m</span>
        <span class="gca-scale"><i></i>500 m</span>
        <span class="gca-loop"></span>
      </div>
      <svg class="gca-cord" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M80.5 4.2C77 12 66 15.5 58.6 21.2" fill="none" stroke="${GC_CARBON}" stroke-width="1.6" vector-effect="non-scaling-stroke" stroke-linecap="round"/></svg>
      <span class="gca-biner" aria-hidden="true"></span>
      <div class="gca-tag">
        <i class="gca-grom"></i>
        <div class="gca-th"><b>${e(name)}</b><span>GC—044</span></div>
        <p class="gca-model">Alpine shell <em>M</em></p>
        <dl class="gca-spec">${rows}</dl>
        <div class="gca-cw"><span style="background:${shell}"></span><span style="background:${shell2}"></span><span style="background:${GC_CARBON}"></span><small>Colourway 01</small></div>
      </div>
    </div>`;
  },

  // 03 as a real trail log: blaze marker, trail, status chip, elevation profile, percent + distance.
  panels: {
    list(ctx) {
      const e = ctx.e;
      const shapes = ['circle', 'square', 'diamond'];
      const dist = ['7.2 km · +640 m', '5.8 km · +410 m', '8.4 km · +810 m'];
      const rows = (ctx.rows || []).slice(0, 3).map((r, i) => `<li class="ab-row">
          <span class="ab-row-n gc-blaze" data-shape="${shapes[i]}" aria-hidden="true"></span>
          <span class="ab-row-name">${e(r[0])}</span>
          <span class="ab-row-status">${e(r[1])}</span>
          <span class="ab-row-bar" aria-hidden="true"><i style="width:${Number(r[2]) || 0}%"></i></span>
          <span class="ab-row-pct"><b>${Number(r[2]) || 0}%</b><small>${dist[i]}</small></span>
        </li>`).join('');
      return `<ul class="ab-list gc-log"><li class="gc-loghead">Trail log · 3 routes · 21.4 km · +1,860 m</li>${rows}</ul>`;
    },
  },

  materials: [
    { name: 'Ripstop ground', css: 'background: linear-gradient(90deg, {rip5} 1px, transparent 1px) 0 0 / 25px 25px, linear-gradient({rip5} 1px, transparent 1px) 0 0 / 25px 25px, linear-gradient(90deg, {rip} 1px, transparent 1px) 0 0 / 5px 5px, linear-gradient({rip} 1px, transparent 1px) 0 0 / 5px 5px, {canvas}; /* 5px grid, every 5th line heavier, about 3% contrast */' },
    { name: 'Shell fabric', css: 'background: {shell}; color: {onShell}; border-radius: 6px; /* the client primary dyed 10% flatter; main action and woven labels */' },
    { name: 'Taped seam', css: 'border: 1.5px dashed currentColor; border-radius: 4px; /* a stitch line inset 4-5px inside a fabric panel or the woven headline label */' },
    { name: 'Hang tag', css: 'background: {paper}; color: {carbon}; border-radius: 8px; box-shadow: 0 1px 0 rgba(0,0,0,.12), 0 8px 18px -10px rgba(0,0,0,.35); /* a grommet (silver ring) top-left, a carbon header band, a mono spec table with units, hung on a cord from a carabiner */' },
    { name: 'Reflective strip', css: 'background: linear-gradient(115deg, transparent 38%, {silver} 38% 62%, transparent 62%); /* a silver diagonal band on carbon fabric */' },
    { name: 'Zip pull', css: 'background: {blaze}; border-radius: 3px; width: 9px; height: 20px; /* the one blaze-orange spark: zip pulls and the "you are here" dot, under 3% of the area */' },
    { name: 'Webbing strap', css: 'background: repeating-linear-gradient(0deg, {carbon} 0 2px, #2C2F2D 2px 3px); border-radius: 4px; /* tabs ride on it; the selected tab is a silver buckle */' },
  ],

  rules: {
    do: [
      'Write every number with a unit (312 g, 20D, 2,061 m, −5 to 15 °C) and set specs as a hang-tag table in mono.',
      'Draw maps as real contours: every fifth line an index contour at double weight, its elevation label breaking the line.',
      'Treat client colours as fabric colourways dyed 10% flatter: shell (primary), second panel and contours (secondary), trail blazes (accent).',
      'Keep the blaze orange to one zip pull and one position dot per view.',
    ],
    dont: [
      'Use camo, military cosplay, tents, campfires or bears.',
      'Copy outdoor brand logos, skylines or trademarked membranes.',
      'Use hazard stripes, alarm ladders or HUD readouts; that is Industrial Hazard and Cyber HUD.',
      'Let it go khaki-only: the shell fabric needs a real colourway.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    coverDisplay: 0.9,
    // Do: the three trail-blaze difficulty marks; Don't: a crossed-out blaze.
    marks(ctx, kind, i) {
      return kind === 'do' ? `<i class="gc-mk" data-shape="${['circle', 'square', 'diamond'][i] || 'circle'}"></i>` : '<i class="gc-mk gc-mk--x"></i>';
    },
    principles: [
      ['Gear specs are the story', 'Spec tables carry the product, not slogans.'],
      ['Map lines, not decoration', 'Contours and grids do the ornamenting.'],
      ['One orange zip pull', 'Blaze orange is a pull tab, never a theme.'],
    ],
    do: [
      'Hang a spec tag off every hero product.',
      'Make every fifth contour line heavier.',
      'Write numbers with units: grams, metres, degrees.',
    ],
    dont: [
      'Use camo, tents or campfire clip-art.',
      'Copy outdoor brand logos or skylines.',
      'Use hazard stripes; that\'s Industrial Hazard.',
    ],
  },
});
})();
