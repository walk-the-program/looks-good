/* ---------------------------------------------------------------------
   logo-start.js — "Start from your logo": read a logo image, pull its colours out
   locally (no network, no model), and turn them into a complete brand with a few
   taste rules so ANY logo gives a palette worth showing.

   Two layers:
     - pure functions (extract, tastePalette, suggestAesthetic, suggestFonts,
       presetFromAnalysis). They work on plain RGBA arrays and hex strings, touch no
       DOM, and are covered by tests/run.js.
     - analyzeFile(file): the browser glue (FileReader, canvas) that feeds them.

   The result is a "preset" object that Onboarding.createFromPreset() turns into a
   saved library brand (js/onboarding.js).

   Depends on color.js (hexToHsl, hslToHex, contrastRatio, pickReadableText, clamp,
   hueDiff) and data.js (FONTS). aesthetic-meta.js is optional: without it the font
   suggestion uses the character lists below. Plain <script>, no modules.
------------------------------------------------------------------------ */

const LogoStart = (function () {
  'use strict';

  const ANALYSIS_PX = 192;          // long side of the copy the colours are read from
  const MIN_BODY_CONTRAST = 4.5;    // WCAG AA for text

  /* ======================= 1. reading colours from pixels ======================= */

  // Tunnels RGB into 4096 buckets, then k-means over the buckets (weighted by pixel
  // count). Cheap, deterministic, and good enough to separate a logo's few real colours.
  function bucketise(px) {
    const map = new Map();
    for (let i = 0; i < px.length; i += 3) {
      const key = ((px[i] >> 4) << 8) | ((px[i + 1] >> 4) << 4) | (px[i + 2] >> 4);
      let b = map.get(key);
      if (!b) { b = { r: 0, g: 0, b: 0, w: 0 }; map.set(key, b); }
      b.r += px[i]; b.g += px[i + 1]; b.b += px[i + 2]; b.w++;
    }
    return Array.from(map.values()).map(b => ({ r: b.r / b.w, g: b.g / b.w, b: b.b / b.w, w: b.w }));
  }
  const dist2 = (a, b) => (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2;

  function kmeans(buckets, k) {
    if (!buckets.length) return [];
    k = Math.min(k, buckets.length);
    // Seeds: heaviest bucket first, then farthest-first so rare-but-different colours get one.
    const seeds = [buckets.reduce((m, b) => (b.w > m.w ? b : m), buckets[0])];
    while (seeds.length < k) {
      let best = null, bestScore = -1;
      for (const b of buckets) {
        const d = Math.min(...seeds.map(s => dist2(b, s)));
        const score = d * Math.sqrt(b.w);
        if (score > bestScore) { bestScore = score; best = b; }
      }
      if (!best || bestScore <= 0) break;
      seeds.push(best);
    }
    let centers = seeds.map(s => ({ r: s.r, g: s.g, b: s.b, w: 0 }));
    for (let it = 0; it < 14; it++) {
      const acc = centers.map(() => ({ r: 0, g: 0, b: 0, w: 0 }));
      for (const b of buckets) {
        let bi = 0, bd = Infinity;
        for (let c = 0; c < centers.length; c++) {
          const d = dist2(b, centers[c]);
          if (d < bd) { bd = d; bi = c; }
        }
        const a = acc[bi];
        a.r += b.r * b.w; a.g += b.g * b.w; a.b += b.b * b.w; a.w += b.w;
      }
      centers = acc.map((a, i) => (a.w ? { r: a.r / a.w, g: a.g / a.w, b: a.b / a.w, w: a.w } : { r: centers[i].r, g: centers[i].g, b: centers[i].b, w: 0 }));
    }
    return centers.filter(c => c.w > 0);
  }

  function mergeClose(cs, minDist) {
    let list = cs.slice();
    for (;;) {
      let hit = null;
      for (let i = 0; i < list.length && !hit; i++) {
        for (let j = i + 1; j < list.length; j++) {
          if (dist2(list[i], list[j]) < minDist * minDist) { hit = [i, j]; break; }
        }
      }
      if (!hit) return list;
      const [i, j] = hit, a = list[i], b = list[j], w = a.w + b.w;
      const merged = { r: (a.r * a.w + b.r * b.w) / w, g: (a.g * a.w + b.g * b.w) / w, b: (a.b * a.w + b.b * b.w) / w, w };
      list = list.filter((_, n) => n !== i && n !== j);
      list.push(merged);
    }
  }

  const toHex = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const lumaOf = (r, g, b) => {
    const ch = c => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
  };

  // How "characterful" a colour is as the brand's lead: it should cover a fair share of
  // the logo, be clearly coloured (not grey), and not sit at the extremes of lightness.
  function characterScore(c) {
    return Math.pow(c.share, 0.55) * (0.2 + c.s / 100) * (1 - Math.abs(c.l - 48) / 85);
  }

  // data: RGBA bytes (Uint8ClampedArray or array), w*h pixels.
  function extract(data, w, h) {
    const A = (x, y) => data[(y * w + x) * 4 + 3];
    let minX = w, minY = h, maxX = -1, maxY = -1, solid = 0, edge = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const a = A(x, y);
        if (a >= 40) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
        if (a >= 128) {
          solid++;
          const nb = (x > 0 ? A(x - 1, y) : 255) < 128 || (x < w - 1 ? A(x + 1, y) : 255) < 128
            || (y > 0 ? A(x, y - 1) : 255) < 128 || (y < h - 1 ? A(x, y + 1) : 255) < 128;
          if (nb) edge++;
        }
      }
    }
    const empty = solid === 0;
    const bw = empty ? 1 : maxX - minX + 1, bh = empty ? 1 : maxY - minY + 1;
    const stride = Math.max(1, Math.floor(Math.sqrt(Math.max(1, solid) / 12000)));

    // One pass collects candidate colours; `strict` also drops anti-alias fringe pixels
    // (a strong colour jump to the right or below), which would otherwise invent purples
    // between a red and a blue. Thin-stroke logos have almost no interior, so if strict
    // leaves too little, it is retried without the fringe test.
    function collect(strict) {
      const cand = [];
      let light = 0, dark = 0, vanishLight = 0, vanishDark = 0, seen = 0;
      for (let y = 0; y < h; y += stride) {
        for (let x = 0; x < w; x += stride) {
          const i = (y * w + x) * 4;
          if (data[i + 3] < 230) continue;
          const r = data[i], g = data[i + 1], b = data[i + 2];
          seen++;
          const L = lumaOf(r, g, b);
          if (L > 0.55) vanishLight++;
          if (L < 0.035) vanishDark++;
          if (strict) {
            let jump = 0;
            if (x + 1 < w && data[i + 7] >= 230) jump = Math.max(jump, Math.abs(r - data[i + 4]), Math.abs(g - data[i + 5]), Math.abs(b - data[i + 6]));
            if (y + 1 < h && data[i + w * 4 + 3] >= 230) jump = Math.max(jump, Math.abs(r - data[i + w * 4]), Math.abs(g - data[i + w * 4 + 1]), Math.abs(b - data[i + w * 4 + 2]));
            if (jump > 56) continue;
          }
          const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
          if (mn >= 236) { light++; continue; }
          if (mx <= 30) { dark++; continue; }
          cand.push(r, g, b);
        }
      }
      return { cand, light, dark, vanishLight, vanishDark, seen };
    }
    let pass = collect(true);
    if (pass.cand.length / 3 < 40) pass = collect(false);
    const { cand, light, dark, seen } = pass;
    const candN = cand.length / 3;

    let clusters = [];
    if (candN) {
      clusters = mergeClose(kmeans(bucketise(cand), 6), 38);
      const total = clusters.reduce((s, c) => s + c.w, 0);
      clusters = clusters.map(c => Object.assign({ share: c.w / total }, c)).filter(c => c.share >= 0.015 || clusters.length === 1);
      clusters.forEach(c => {
        const hsl = rgbToHsl(c.r, c.g, c.b);
        c.hex = toHex(c.r, c.g, c.b); c.h = hsl.h; c.s = hsl.s; c.l = hsl.l;
      });
    }
    // Chromatic = visibly coloured; greys are kept out of the lead-colour race.
    const chromatic = clusters.filter(c => c.s >= 14).map(c => Object.assign({}, c, { score: 0 }));
    // Weight each colour by how much of the whole mark it covers (the near-white and
    // near-black pixels dilute a colour that is only a small accent on a black logo).
    const covers = candN / Math.max(1, seen);
    chromatic.forEach(c => { c.cover = c.share * covers; c.score = characterScore(Object.assign({}, c, { share: Math.max(c.share * (0.5 + covers / 2), 0.01) })); });
    chromatic.sort((a, b) => b.score - a.score);

    const inkShare = seen ? dark / seen : 0, paperShare = seen ? light / seen : 0;
    // A small stable number from the pixels, so a logo with no colour of its own always
    // gets the same signal colour.
    let seed = 7;
    for (let i = 0; i < Math.min(cand.length, 600); i++) seed = (seed * 31 + cand[i]) >>> 0;
    seed = (seed + Math.round(bw * 7 + bh * 13 + solid)) >>> 0;

    // The colours that make up the mark, for checking it stays visible on a background:
    // every cluster that covers a fair share, plus black or white when the mark has them.
    const tones = clusters.filter(c => c.share * covers >= 0.15).map(c => c.hex);
    if (inkShare >= 0.2) tones.push('#0a0a0a');
    if (paperShare >= 0.2) tones.push('#f5f5f5');
    if (!tones.length && clusters.length) tones.push(clusters[0].hex);

    return {
      tones,
      w, h, empty, solid, aspect: bw / bh,
      fill: empty ? 0 : solid / (bw * bh),
      edgeRatio: solid ? edge / solid : 0,
      clusters, chromatic,
      inkShare, paperShare, colorShare: seen ? candN / seen : 0,
      vanishLight: seen ? pass.vanishLight / seen : 0,
      vanishDark: seen ? pass.vanishDark / seen : 0,
      seed,
    };
  }

  /* ======================= 2. knocking out a white box ======================= */

  // A JPG (or flat PNG) logo arrives on a white rectangle. When all four corners are
  // near-white, the white that is connected to the edge becomes transparent, so the logo
  // sits on the board's own canvas. Returns true when it changed the data.
  function knockOutWhite(data, w, h) {
    const px = (x, y) => (y * w + x) * 4;
    const isPaper = i => data[i + 3] < 20 || Math.min(data[i], data[i + 1], data[i + 2]) >= 226;
    for (const [x, y] of [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]]) {
      const i = px(x, y);
      if (data[i + 3] < 250 || Math.min(data[i], data[i + 1], data[i + 2]) < 232) return false;
    }
    const bg = new Uint8Array(w * h);
    const stack = [];
    const push = (x, y) => { const k = y * w + x; if (!bg[k] && isPaper(px(x, y))) { bg[k] = 1; stack.push(k); } };
    for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
    for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
    while (stack.length) {
      const k = stack.pop(), x = k % w, y = (k - x) / w;
      if (x > 0) push(x - 1, y); if (x < w - 1) push(x + 1, y);
      if (y > 0) push(x, y - 1); if (y < h - 1) push(x, y + 1);
    }
    let n = 0;
    for (let k = 0; k < bg.length; k++) n += bg[k];
    if (n < w * h * 0.02 || n > w * h * 0.985) return false;
    // Erode the light halo that JPEG leaves around the shapes (one ring of pale pixels).
    const ring = [];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const k = y * w + x;
        if (bg[k]) continue;
        const nb = (x > 0 && bg[k - 1]) || (x < w - 1 && bg[k + 1]) || (y > 0 && bg[k - w]) || (y < h - 1 && bg[k + w]);
        if (nb) { const i = k * 4; if (Math.min(data[i], data[i + 1], data[i + 2]) >= 196) ring.push(k); }
      }
    }
    ring.forEach(k => { bg[k] = 1; });
    for (let k = 0; k < bg.length; k++) if (bg[k]) data[k * 4 + 3] = 0;
    return true;
  }

  /* ======================= 3. taste rules ======================= */

  const hsl = (h, s, l) => hslToHex(h, s, l);

  // Colours used as fills carry text, so each must hold 4.5:1 with its readable ink
  // (white or near-black). Moves lightness the shortest way that gets there, keeping hue.
  function textOn(hex) { return pickReadableText(hex); }
  function holdsText(hex) { return contrastRatio(hex, textOn(hex)) >= MIN_BODY_CONTRAST; }
  function readableFill(h, s, l) {
    let hex = hsl(h, s, l);
    if (holdsText(hex)) return hex;
    const up = l >= 50;
    for (let d = 1; d <= 40; d++) {
      const tries = up ? [l + d, l - d] : [l - d, l + d];
      for (const t of tries) {
        if (t < 8 || t > 94) continue;
        hex = hsl(h, s, t);
        if (holdsText(hex)) return hex;
      }
    }
    return hsl(h, s, l);
  }

  // Signal hues for logos with no colour of their own (black or white marks): warm to
  // cool, all of which sit well beside a near-black or near-white ink.
  const SIGNAL_HUES = [14, 28, 152, 212, 262, 340];

  const SICKLY = [62, 100];   // yellow-green band that goes muddy as a derived colour
  const inSickly = h => { const x = ((h % 360) + 360) % 360; return x >= SICKLY[0] && x <= SICKLY[1]; };

  function distinctFrom(c, others) {
    return others.every(o => hueDiff(c.h, o.h) >= 28 || Math.abs(c.l - o.l) >= 24);
  }

  function tastePalette(ex) {
    const chroma = ex.chromatic || [];
    const notes = [];
    let lead, achromatic = false, tone = 'color';
    if (chroma.length) {
      lead = chroma[0];
    } else {
      achromatic = true;
      const baseH = SIGNAL_HUES[(ex.seed || 0) % SIGNAL_HUES.length];
      tone = (ex.paperShare || 0) > (ex.inkShare || 0) ? 'light' : 'dark';
      lead = { h: baseH, s: 70, l: 52, share: 1 };
      notes.push('The logo has no colour of its own, so a signal colour was added.');
    }

    // Primary: the lead colour, brought into a range where a brand colour works.
    const ink = achromatic && tone === 'dark';
    let primary;
    if (ink) {
      // An ink mark: the primary is a near-black charcoal tinted toward the signal hue; the
      // signal colour itself becomes the accent below.
      primary = readableFill(lead.h, 16, 17);
    } else {
      let ps = lead.s;
      if (ps < 40) ps = Math.min(ps + 14, 44);               // muddy: lift it into a deliberate earth tone
      primary = readableFill(lead.h, clamp(ps, 38, 92), clamp(lead.l, 26, 72));
    }
    const earthy = !achromatic && lead.h >= 15 && lead.h <= 110 && lead.s < 58;
    const P = hexToHsl(primary);

    // Secondary: the next distinct colour in the logo, or an analogous +-30 degree shift at
    // a shifted lightness.
    const used = [P];
    let secondary = null;
    const secPick = chroma.slice(1).find(c => c.share >= 0.04 && distinctFrom(c, used));
    if (secPick) {
      secondary = readableFill(secPick.h, clamp(secPick.s, 34, 90), clamp(secPick.l, 30, 78));
    } else if (ink) {
      // A pale tint of the signal hue beside the charcoal.
      secondary = readableFill(lead.h + (inSickly(lead.h + 28) ? -28 : 28), 42, 80);
      notes.push('Secondary is a pale tint of the signal colour.');
    } else {
      let dir = 1;
      if (inSickly(P.h + 30) && !inSickly(P.h - 30)) dir = -1;
      secondary = readableFill(P.h + 30 * dir, Math.max(30, P.s * 0.85), P.l < 52 ? P.l + 18 : P.l - 16);
      notes.push('Secondary derived from the primary (analogous, lighter or darker).');
    }
    const S = hexToHsl(secondary);
    used.push(S);

    // Accent: a third colour from the logo, or the complement at high chroma (of the
    // complement candidates, the one farthest from both existing hues wins). Earth tones get
    // a clear amber or rust instead, which sits with them rather than against them.
    let accent = null;
    const accPick = chroma.slice(1).find(c => c.share >= 0.03 && distinctFrom(c, used) && hueDiff(c.h, P.h) >= 35 && hueDiff(c.h, S.h) >= 28 && c.s >= 30);
    if (accPick) {
      accent = readableFill(accPick.h, clamp(accPick.s, 50, 95), clamp(accPick.l, 38, 66));
    } else if (ink) {
      accent = readableFill(lead.h, 82, 54);
      notes.push('Accent is the signal colour.');
    } else if (earthy) {
      accent = readableFill(hueDiff(P.h, 38) >= 24 ? 38 : 12, 88, 52);
      notes.push('Accent added: a clear amber or rust beside the earth tone.');
    } else {
      const cands = [180, 150, 210].map(o => P.h + o);
      let best = cands[0], bestScore = -1;
      cands.forEach(c => {
        const score = Math.min(hueDiff(c, P.h), hueDiff(c, S.h)) - (inSickly(c) ? 25 : 0);
        if (score > bestScore) { bestScore = score; best = c; }
      });
      accent = readableFill(best, 82, 54);
      notes.push('Accent added at high chroma opposite the primary.');
    }

    // Neutrals: a light and a dark, both tinted toward the primary so they belong to it.
    const nh = ink ? lead.h : P.h;
    const ns = clamp((ink ? 40 : P.s) * 0.32, 10, 26);
    const neutralLight = hsl(nh, ns, 96.5);
    const neutralDark = hsl(nh, clamp(ns * 0.85, 10, 24), 11);

    const colors = { primary, secondary, accent, neutralDark, neutralLight };
    return {
      colors, achromatic, tone, earthy, notes,
      checks: {
        body: contrastRatio(neutralDark, neutralLight),
        onPrimary: contrastRatio(primary, textOn(primary)),
        onSecondary: contrastRatio(secondary, textOn(secondary)),
        onAccent: contrastRatio(accent, textOn(accent)),
      },
    };
  }

  // Light or dark canvas: whichever the logo stays visible on. `modeHint` is the
  // aesthetic's own preferred mode, kept unless the logo would fade into it.
  function chooseMode(ex, tone, modeHint) {
    const hint = modeHint === 'dark' ? 'dark' : 'light';
    if (ex.empty) return hint;
    const fadeLight = ex.vanishLight || 0;
    const fadeDark = ex.vanishDark || 0;
    if (hint === 'light' && fadeLight > 0.3 && fadeDark < fadeLight / 2) return 'dark';
    if (hint === 'dark' && fadeDark > 0.3 && fadeLight < fadeDark / 2) return 'light';
    return hint;
  }

  /* ======================= 4. character, aesthetic, fonts ======================= */

  // 'bold' | 'serif' | 'geometric', from simple shape ratios of the mark.
  function characterOf(ex) {
    if (ex.empty) return 'geometric';
    const roundish = ex.fill > 0.7 && ex.fill < 0.84 && ex.aspect > 0.8 && ex.aspect < 1.25;
    if (ex.edgeRatio >= 0.42) return 'serif';
    if (roundish) return 'geometric';
    if (ex.fill >= 0.5 || (ex.edgeRatio <= 0.12 && ex.fill > 0.34)) return 'bold';
    return 'geometric';
  }

  // Aesthetics a stranger's logo is safe to land in (the owner's favourites, plus the quiet
  // ones). Picked by colour mood first, then the logo's character.
  function suggestAesthetic(pal, ex) {
    const c = pal.colors;
    const P = hexToHsl(c.primary);
    const lead = (ex.chromatic && ex.chromatic[0]) || null;
    const character = characterOf(ex);
    const hueOf = lead ? lead.h : P.h;
    const sat = lead ? lead.s : P.s;
    const lit = lead ? lead.l : P.l;
    const second = (ex.chromatic || []).find(x => x !== lead && x.share >= 0.1);
    let key, why;
    if (pal.achromatic) {
      if (pal.tone === 'light') { key = 'aurora-noir'; why = 'A light mark on a night canvas.'; }
      else if (character === 'serif') { key = 'dystopian-luxury'; why = 'Fine strokes in one ink read as quiet luxury.'; }
      else if (character === 'bold') { key = 'xerox'; why = 'A heavy one-colour mark looks like toner on paper.'; }
      else { key = 'bento-grid'; why = 'A clean one-colour mark suits clear, modular layouts.'; }
    } else if (sat >= 85 && lit >= 50 && ((hueOf >= 70 && hueOf <= 200) || (hueOf >= 290 && hueOf <= 340))) {
      key = 'acid-graphics'; why = 'Neon colour wants a dark, loud stage.';
    } else if (lit >= 68) {
      key = (ex.chromatic || []).length >= 3 ? 'mesh-gradient' : 'soft-form'; why = 'Pastel colour feels soft and airy.';
    } else if (sat < 52 && lit < 48 && hueOf >= 15 && hueOf <= 110) {
      key = 'gorpcore'; why = 'Earth tones sit naturally in outdoor, utilitarian design.';
    } else if (second && hueDiff(lead.h, second.h) > 100 && lead.s > 50 && second.s > 50) {
      key = 'radical-memphis'; why = 'Two strong, clashing colours get a playful, bold treatment.';
    } else if (hueOf >= 28 && hueOf < 70) {
      key = character === 'serif' ? 'dystopian-luxury' : 'naive-doodle'; why = 'Warm yellows and oranges feel sunny and handmade.';
    } else if (hueOf >= 340 || hueOf < 28) {
      key = character === 'bold' ? 'pirate-broadcast' : 'radical-memphis'; why = 'Red and pink carry a loud, rebellious feel.';
    } else if (hueOf >= 70 && hueOf < 180) {
      key = 'gorpcore'; why = 'Greens suit outdoor, technical design.';
    } else if (hueOf >= 180 && hueOf < 260) {
      key = character === 'serif' ? 'dystopian-luxury' : 'bento-grid'; why = 'Blues read as clear and product-minded.';
    } else {
      key = 'mesh-gradient'; why = 'Violets and magentas flow into soft gradients.';
    }
    const known = k => typeof AESTHETICS === 'undefined' || !AESTHETICS.length || AESTHETICS.some(a => a.key === k);
    if (!known(key)) key = 'soft-form';
    // Fallbacks for when the first choice would hide the logo (a dark header band, say):
    // styles whose logo sits straight on the canvas.
    const alts = ['bento-grid', 'soft-form', 'naive-doodle', 'mesh-gradient', 'corporate-vandalism', 'xerox'].filter(k => k !== key && known(k));
    return { key, why, character, alts };
  }

  // Character -> font classes (FONTS[].cls) that suit it, and fallback pairs for each.
  const CHARACTER_CLASSES = {
    bold: ['heavy', 'grotesk', 'condensed', 'wide'],
    serif: ['didone', 'old-style', 'text-serif', 'soft-serif'],
    geometric: ['geometric', 'neo-grotesk', 'rounded', 'humanist'],
  };
  const CHARACTER_PAIRS = {
    bold: [['Archivo Black', 'Archivo'], ['Bricolage Grotesque', 'DM Sans'], ['Syne', 'Inter']],
    serif: [['Playfair Display', 'Inter'], ['Fraunces', 'Work Sans'], ['Instrument Serif', 'Instrument Sans'], ['Cormorant Garamond', 'Montserrat']],
    geometric: [['Manrope', 'Inter'], ['Sora', 'Inter'], ['Outfit', 'Inter'], ['Plus Jakarta Sans', 'Inter']],
  };
  const fontOf = name => (typeof FONTS !== 'undefined' ? FONTS.find(f => f.name === name) : null) || null;

  function suggestFonts(character, aestheticKey, seed) {
    const classes = CHARACTER_CLASSES[character] || CHARACTER_CLASSES.geometric;
    const meta = typeof aestheticMeta === 'function' ? aestheticMeta(aestheticKey) : null;
    const own = (meta && meta.fonts && meta.fonts.pairings) || [];
    const fits = p => { const f = fontOf(p[0]), g = fontOf(p[1]); return f && g && classes.includes(f.cls); };
    let pair = own.find(fits);
    if (!pair) {
      // No pairing of the aesthetic's own fits the logo's character. The character's pairing
      // wins unless the aesthetic names that kind of face as one to avoid.
      const avoid = (meta && meta.fonts && meta.fonts.avoid) || [];
      const clash = classes.some(c => avoid.includes(c)) || (character === 'serif' && avoid.includes('serif'));
      const list = (CHARACTER_PAIRS[character] || CHARACTER_PAIRS.geometric).filter(p => fontOf(p[0]) && fontOf(p[1]) && !avoid.includes(fontOf(p[0]).cls));
      if (!clash && list.length) pair = list[(seed || 0) % list.length];
      else if (own.length) pair = own.find(p => fontOf(p[0]) && fontOf(p[1]));
      else if (list.length) pair = list[(seed || 0) % list.length];
    }
    return pair ? { heading: pair[0], body: pair[1] } : { heading: 'Inter', body: 'Inter' };
  }

  /* ======================= 5. copy seeds ======================= */

  // Plain, believable taglines grouped by mood; the brand name is never baked in.
  const TAGLINES = {
    calm: ['Made slowly, made well.', 'Simple things, done properly.', 'Quiet by design.', 'Everything in its place.'],
    loud: ['Turn it up.', 'Made to be noticed.', 'Not for everyone. Good.', 'Louder than the rest.'],
    craft: ['Made by hand, shared widely.', 'Small batch. Big care.', 'Good things take a minute.', 'Honest work, nicely done.'],
    tech: ['Clear tools for clear thinking.', 'Built to stay out of your way.', 'Precise by default.', 'Less friction, more done.'],
    luxe: ['Rare by intention.', 'Restraint, perfected.', 'For those who notice.', 'Exactly enough.'],
  };
  const MOOD_OF = {
    'acid-graphics': 'loud', 'radical-memphis': 'loud', 'pirate-broadcast': 'loud', 'xerox-punk': 'loud', 'corporate-vandalism': 'loud', 'neo-brutal-pop': 'loud',
    'naive-doodle': 'craft', 'gorpcore': 'craft', 'xerox': 'craft', 'old-web': 'craft', 'riso-print': 'craft', 'clay': 'craft',
    'bento-grid': 'tech', 'blueprint': 'tech', 'industrial-device': 'tech', 'micrographics': 'tech', 'ascii-art': 'tech', 'blob-tracking': 'tech',
    'dystopian-luxury': 'luxe', 'aurora-noir': 'luxe', 'holo-iridescent': 'luxe', 'editorial-serif': 'luxe',
  };
  function taglineFor(aestheticKey, seed) {
    const list = TAGLINES[MOOD_OF[aestheticKey] || 'calm'];
    return list[(seed || 0) % list.length];
  }

  // "acme-logo_FINAL (2).png" -> "Acme"
  function nameFromFile(fileName) {
    let s = String(fileName || '').replace(/\.[a-z0-9]{2,5}$/i, '');
    s = s.replace(/[_\-.+]+/g, ' ').replace(/\([^)]*\)/g, ' ');
    s = s.replace(/\b(logo|logos|final|copy|new|v\d+|image|img|png|jpe?g|svg|brand|mark|icon|vector|transparent|\d{3,})\b/gi, ' ');
    s = s.replace(/\s+/g, ' ').trim();
    if (!s || /^[\d\s]+$/.test(s)) return '';
    return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').slice(0, 40);
  }

  /* ======================= 6. the whole recipe ======================= */

  // ex = extract() output (plus dataUrl). Returns the analysis the dialog shows and
  // presetFromAnalysis() turns into a brand.
  function analyse(ex, opts) {
    opts = opts || {};
    const pal = tastePalette(ex);
    const sug = suggestAesthetic(pal, ex);
    const fonts = suggestFonts(sug.character, sug.key, ex.seed);
    const def = typeof aestheticByKey === 'function' ? aestheticByKey(sug.key) : null;
    const mode = chooseMode(ex, pal.tone, def && def.mode);
    return {
      palette: pal, aesthetic: sug.key, why: sug.why, character: sug.character, alts: sug.alts,
      fonts, bgMode: mode, seed: ex.seed || 0, tones: ex.tones || [], logoDataUrl: opts.logoDataUrl || null,
    };
  }

  function presetFromAnalysis(an, fields) {
    fields = fields || {};
    return {
      name: fields.name || 'Your brand',
      tagline: fields.tagline || taglineFor(an.aesthetic, an.seed),
      colors: Object.assign({}, an.palette.colors),
      headingFont: an.fonts.heading, bodyFont: an.fonts.body,
      aesthetic: an.aesthetic, bgMode: an.bgMode,
      logoDataUrl: an.logoDataUrl || null,
      source: 'logo',
    };
  }

  /* ======================= 7. browser glue ======================= */

  const ACCEPT = /^image\/(png|jpe?g|svg\+xml|webp|gif)$/i;
  const accepts = file => !!file && (ACCEPT.test(file.type) || /\.(png|jpe?g|svg|webp|gif)$/i.test(file.name || ''));

  function readAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(r.error || new Error('Could not read the file'));
      r.readAsDataURL(file);
    });
  }
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('That file could not be read as an image'));
      img.src = src;
    });
  }

  // File -> { dataUrl (stored copy, downscaled like the editor's own logo upload),
  //           analysis, name } or throws with a plain message.
  async function analyzeFile(file) {
    if (!accepts(file)) throw new Error('Please choose a PNG, JPG or SVG image.');
    let src = await readAsDataUrl(file);
    // An SVG with no size of its own has no pixels to draw; give it room.
    if (/^data:image\/svg\+xml/i.test(src) && typeof atob === 'function') {
      try {
        const b64 = /;base64,/.test(src);
        const text = b64 ? atob(src.split(',')[1]) : decodeURIComponent(src.split(',')[1]);
        if (!/<svg[^>]*\swidth=/i.test(text) && /viewBox="[^"]*"/i.test(text)) {
          const vb = /viewBox="([^"]*)"/i.exec(text)[1].trim().split(/[\s,]+/).map(Number);
          if (vb.length === 4 && vb[2] > 0 && vb[3] > 0) {
            const k = 512 / Math.max(vb[2], vb[3]);
            const sized = text.replace(/<svg/i, `<svg width="${Math.round(vb[2] * k)}" height="${Math.round(vb[3] * k)}"`);
            src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(sized)));
          }
        }
      } catch (e) { /* keep the original */ }
    }
    const img = await loadImage(src);
    const nw = img.naturalWidth || 512, nh = img.naturalHeight || 512;
    const maxPx = typeof LOGO_MAX_PX === 'number' ? LOGO_MAX_PX : 1024;
    const maxBytes = typeof LOGO_MAX_BYTES === 'number' ? LOGO_MAX_BYTES : 400 * 1024;
    const scale = Math.min(1, maxPx / Math.max(nw, nh));
    const cw = Math.max(1, Math.round(nw * scale)), ch = Math.max(1, Math.round(nh * scale));
    const canvas = document.createElement('canvas');
    canvas.width = cw; canvas.height = ch;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, cw, ch);
    let stored = src;
    let cleaned = false;
    try {
      const full = ctx.getImageData(0, 0, cw, ch);
      if (knockOutWhite(full.data, cw, ch)) { ctx.putImageData(full, 0, 0); cleaned = true; }
    } catch (e) { /* a tainted canvas cannot be read; the logo is kept as it is */ }
    if (cleaned) stored = canvas.toDataURL('image/png');
    else if (scale < 1 || src.length > maxBytes) stored = /^data:image\/jpe?g/i.test(src) ? canvas.toDataURL('image/jpeg', 0.88) : canvas.toDataURL('image/png');

    const k = ANALYSIS_PX / Math.max(cw, ch);
    const aw = Math.max(1, Math.round(cw * k)), ah = Math.max(1, Math.round(ch * k));
    const small = document.createElement('canvas');
    small.width = aw; small.height = ah;
    const sctx = small.getContext('2d', { willReadFrequently: true });
    sctx.imageSmoothingQuality = 'high';
    sctx.drawImage(canvas, 0, 0, aw, ah);
    const px = sctx.getImageData(0, 0, aw, ah);
    const ex = extract(px.data, aw, ah);
    if (ex.empty) throw new Error('That image looks empty. Try a logo with a visible mark.');
    return { dataUrl: stored, analysis: analyse(ex, { logoDataUrl: stored }), name: nameFromFile(file.name), extract: ex };
  }

  return {
    extract, knockOutWhite, tastePalette, chooseMode, characterOf, suggestAesthetic, suggestFonts,
    taglineFor, nameFromFile, analyse, presetFromAnalysis, analyzeFile, accepts,
    readableFill, holdsText, MIN_BODY_CONTRAST,
  };
})();

if (typeof window !== 'undefined') window.LogoStart = LogoStart;
