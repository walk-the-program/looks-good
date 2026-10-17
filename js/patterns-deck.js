/* ---------------------------------------------------------------------
   patterns-deck.js — patterns in the Brand deck (js/brand-deck.js).

   1. A "Patterns" slide after "Material & graphics": a wall of the patterns in
      the brief (state.patterns; or the aesthetic's six-pattern suite when none).
   2. deckPatternHook: the closing slide gets a full-height pattern strip down
      its left edge (css/patterns.css pads the slide content away from it); the
      cover gets a full-width, 132px band along the bottom (css/brand-deck.css
      pads the cover content above it). Text never sits on a pattern.
   3. deckStageHook: the Material slide's stage shows a pattern instead of the
      signature art when def.deck.materialStage === 'pattern'.

   Quiet aesthetics: each Patterns.suiteFor() entry may carry a `tone` (0-1,
   default 1, applied by Patterns.render through params.tone). It is passed
   through to every render here (wall, band, strip, stage), so a quiet suite
   stays quiet on the deck.

   Every pattern is rendered to a <canvas> and handed to the slide as a
   data-URL <img>, which is what html2canvas (PNG / PDF export) can draw.
   Results are cached by family, parameters, inks and size, so retyping the
   brand name does not re-render anything.
------------------------------------------------------------------------ */
(function () {
  'use strict';
  if (!window.Patterns || typeof registerDeckSlide !== 'function') return;
  const P = window.Patterns;
  const cache = new Map();
  const STRIP_W = 288;                 // CSS px of the closing strip
  const BAND_W = 1280, BAND_H = 132;   // CSS px of the cover band
  const STAGE_W = 600, STAGE_H = 460;  // Material slide stage (object-fit: cover absorbs the difference)
  // Image area (CSS px at the 1280x720 design size) for a wall of n patterns.
  const WALL = { 1: [1168, 457], 2: [575, 457], 3: [377, 457], 4: [575, 208], 5: [377, 208], 6: [377, 208] };

  const famName = key => (P.get(key) || {}).name || key;
  const cwLabel = v => (P.E.COLORWAYS.find(c => c.value === v) || {}).label || v;

  // Quiet tone (0-1). A suite entry carries it as `tone` (or in params); entries in the brief keep it in params.
  const toneOf = (en, src) => {
    const v = [src && src.tone, en.params && en.params.tone].find(x => x != null && isFinite(x));
    return v == null ? 1 : Math.max(0, Math.min(1, Number(v)));
  };

  function suiteEntries(def) {
    // A blended def (js/blend.js) interleaves the base and donor suites.
    return (typeof blendSuite === 'function' ? blendSuite(def) : P.suiteFor(def.key)).map(s => {
      const en = PatternPins.normalize({
        key: s.key, params: Object.assign(P.defaults(s.key), s.params), colorway: s.colorway, seed: PatternPins.SUITE_SEED,
      });
      if (!en) return null;
      const tone = toneOf(en, s);
      const named = Object.assign({}, en, { label: s.name });   // the suite's own name for it
      return tone === 1 ? named : Object.assign(named, { params: Object.assign({}, en.params, { tone }) });
    }).filter(Boolean);
  }

  // The patterns shown on the wall: the ones in the brief, else the suite.
  function wallEntries(state, def) {
    const pinned = PatternPins.normalizeList(state.patterns).slice(0, 6);
    return pinned.length ? { pinned: true, list: pinned } : { pinned: false, list: suiteEntries(def) };
  }

  // Data-URL for one pattern at w x h CSS px, rendered at `dpr`.
  function urlFor(tokens, entry, w, h, dpr) {
    const inks = P.inksFor(tokens, entry.colorway, { tints: !!entry.params.tints });
    const params = Object.assign({}, entry.params, { tone: toneOf(entry) });
    const key = [entry.key, JSON.stringify(params), entry.colorway, entry.seed, inks.ground, inks.ink1, inks.ink2, inks.spark, inks.deep, inks.t1, inks.t2, w, h, dpr].join('|');
    let url = cache.get(key);
    if (!url) {
      const c = document.createElement('canvas');
      P.render(c, entry.key, params, inks, entry.seed, { width: w, height: h, dpr, setStyle: false });
      url = c.toDataURL('image/png');
      if (url.length > 450000) url = c.toDataURL('image/jpeg', 0.92);   // grainy fields: PNG gets huge
      cache.set(key, url);
      if (cache.size > 80) cache.delete(cache.keys().next().value);
    }
    return url;
  }

  registerDeckSlide({
    key: 'patterns', title: 'Patterns',
    build(Parts, state, def, t) {
      const e = escapeHtml;
      const nameOf = en => en.label || famName(en.key);   // suite entries carry their own name
      const { pinned, list } = wallEntries(state, def);
      // def.deck.patternsStage(ctx): an aesthetic may replace this slide's body (Bento's
      // tile system). ctx adds entries (the wall's patterns), pinned, and
      // patternImg(entry, w, h) -> a data-URL of that pattern at w x h CSS px.
      if (typeof bdCallHook === 'function' && typeof bdHookCtx === 'function') {
        const own = bdCallHook(def, 'patternsStage', bdHookCtx(Parts, 'patterns', {
          entries: list.slice(0, 6), pinned, patternImg: (en, w, h) => urlFor(t, en, w, h, 2), nameOf, colorwayLabel: cwLabel,
        }));
        if (own) return `<div class="ab-deck-patterns" data-stage="custom">${own}</div>`;
      }
      const n = Math.max(1, Math.min(6, list.length));
      const [w, h] = WALL[n];
      const tiles = list.slice(0, 6).map(en => `<figure class="ab-deck-pt">
          <img src="${urlFor(t, en, w, h, 2)}" alt="${e(nameOf(en))} pattern" />
          <figcaption><span class="ab-label">${e(nameOf(en))}</span><span class="ab-label ab-deck-ptcw">${e(cwLabel(en.colorway))}</span></figcaption>
        </figure>`).join('');
      return `<div class="ab-deck-patterns">
        <div class="ab-labelrow"><span class="ab-label">${pinned ? 'Patterns in the brief' : 'Pattern suite'}</span><span class="ab-label">${e(def.name)}</span></div>
        <div class="ab-deck-ptgrid" data-n="${n}">${tiles}</div>
      </div>`;
    },
  }, 'material');

  // The first pattern in the brief, else the first of the suite.
  const leadEntry = Parts => (PatternPins.normalizeList(Parts.state.patterns)[0]) || suiteEntries(Parts.def)[0];

  // Cover: a full-width bottom band. Closing: a strip down the left edge.
  deckPatternHook = function (Parts, slideKey) {
    const entry = leadEntry(Parts);
    if (!entry) return '';
    if (slideKey === 'closing') {
      return `<div class="pt-deck-strip" data-side="left"><img src="${urlFor(Parts.t, entry, STRIP_W, 720, 2)}" alt="" /></div>`;
    }
    return `<div class="pt-deck-band"><img src="${urlFor(Parts.t, entry, BAND_W, BAND_H, 2)}" alt="" /></div>`;
  };

  // Material slide stage for aesthetics whose own art is empty or repeats the cover.
  deckStageHook = function (Parts, state, def, t) {
    const entry = leadEntry({ state, def, t });
    if (!entry) return '';
    return `<img class="pt-deck-stage" src="${urlFor(t, entry, STAGE_W, STAGE_H, 2)}" alt="${escapeHtml(famName(entry.key))} pattern" />`;
  };

  // The closing slide's headline can outgrow its column once the pattern strip
  // narrows it, and brand-deck.js only shrinks it when the whole slide body
  // overflows. Shrink it further until the copy block fits above the contact row.
  if (typeof bdFitDeck === 'function') {
    const baseFit = bdFitDeck;
    bdFitDeck = function (grid) {
      baseFit(grid);
      grid.querySelectorAll('.ab-slide[data-slide="closing"]').forEach(root => {
        const main = root.querySelector('.ab-deck-closemain');
        if (!main || !root.querySelector('.pt-deck-strip')) return;
        let hs = parseFloat(root.style.getPropertyValue('--ab-hs')) || 1;
        const floor = (parseFloat(root.dataset.hs0) || 1) * 0.4;
        for (let i = 0; i < 30 && hs > floor && main.scrollHeight > main.clientHeight + 1; i++) {
          hs *= 0.94;
          root.style.setProperty('--ab-hs', hs.toFixed(3));
        }
        if (typeof bdBleedBands === 'function') bdBleedBands(root);   // the highlight moved with the headline
      });
    };
  }
})();
