/* ---------------------------------------------------------------------
   share.js — the "Share" menu in the board toolbar: output that travels.

   Show.share.site()           One self-contained HTML file for the brand: hero,
                               the board, the ten-slide deck with its own present
                               mode, the product screens ("Built"), the pattern
                               wall and the typeset brief with a Copy button.
                               Fonts and images are embedded; it opens from
                               Finder with no server and no app.
   Show.share.reel(shape)      A 15-second video, 'vertical' (1080x1920) or
                               'horizontal' (1920x1080): title card, the board
                               building in, six aesthetics, end card. Recorded
                               with MediaRecorder from a canvas (mp4 where the
                               engine supports it, else webm); a numbered PNG frame
                               sequence plus a how-to note where it does not.
   Show.share.picture(kind)    PNG pictures drawn with canvas from the brand's
                               tokens and pattern engine: 'card' (business card),
                               'home' (phone home screen), 'phone' (phone
                               wallpaper, 1290x2796), 'desktop' (2560x1440),
                               'poster' (the brand in twelve aesthetics). 'all'
                               saves every one.

   Files are saved the way every export in the app is (a download link, which
   the Mac app turns into a save panel). Share.saveHook(blob, name) replaces
   that, for tests. Boards are rasterised with the Mac app's native capture
   when it is there (window.webkit.messageHandlers.capture), else with
   html2canvas and the deck export's clean-up helpers (js/brand-deck.js).

   Needs app.js, aesthetic-board.js, brand-deck.js, patterns. Plain script.
------------------------------------------------------------------------ */

window.Show = window.Show || {};

(function () {
  'use strict';

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clean = s => String(s || '').replace(/\s+/g, ' ').trim();
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const frame = () => new Promise(r => requestAnimationFrame(() => r()));
  const reduceMotion = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const toast = msg => { if (typeof showToast === 'function') showToast(msg); };
  const slug = () => (typeof brandFileSlug === 'function' ? brandFileSlug() : 'brand');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);              // ease-out cubic
  const easeIO = t => { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const CANCEL = new Error('cancelled');

  const Share = { saveHook: null, busy: false, last: null };

  /* ---------------- saving ---------------- */

  function saveBlob(blob, name) {
    if (typeof Share.saveHook === 'function') return Share.saveHook(blob, name);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 20000);
    return null;
  }

  // Several files at once: the Mac app asks for one folder instead of a save panel per file.
  function batch(msg) {
    if (typeof Share.saveHook === 'function') return;
    const mh = window.webkit && window.webkit.messageHandlers;
    if (mh && mh.batch && typeof mh.batch.postMessage === 'function') {
      try { mh.batch.postMessage(msg); } catch (err) { /* plain downloads still work */ }
    }
  }

  const canvasBlob = (cv, type, q) => new Promise((res, rej) => cv.toBlob(b => (b ? res(b) : rej(new Error('toBlob failed'))), type || 'image/png', q));
  const blobDataUrl = blob => new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(blob); });
  const loadImage = src => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error('image failed')); im.src = src; });

  /* ---------------- the brand ---------------- */

  function brandInfo() {
    const v = abView();
    const st = v.state, def = v.def;
    const content = typeof effectiveContent === 'function' ? effectiveContent() : (st.content || {});
    const t = boardTokens(st, def);
    const name = clean(content.brandName) || 'Brand';
    return {
      v, st, def, t, content, name,
      tagline: clean(content.tagline),
      initial: typeof abInitial === 'function' ? abInitial(name) : name.charAt(0).toUpperCase(),
      logo: st.logoDataUrl || null,
      head: st.headingFont, body: st.bodyFont,
    };
  }

  /* ---------------- progress: a veil with a card, and Cancel ---------------- */

  let veil = null;
  function job(title, opts) {
    opts = opts || {};
    endVeil(true);
    veil = document.createElement('div');
    veil.className = 'sh-veil';
    veil.innerHTML = `<div class="sh-prog" role="status" aria-live="polite">
        <div class="sh-prog-head"><b class="sh-prog-title">${esc(title)}</b><span class="sh-prog-pct">0%</span></div>
        <div class="sh-prog-bar"><i></i></div>
        <p class="sh-prog-detail">Getting ready</p>
        <div class="sh-prog-preview" hidden></div>
        <div class="sh-prog-foot">${opts.cancel === false ? '' : '<button type="button" class="btn btn-ghost btn-small sh-prog-cancel">Cancel</button>'}</div>
      </div>`;
    document.body.appendChild(veil);
    const J = {
      cancelled: false,
      el: veil,
      set(frac, detail) {
        const pct = Math.round(clamp(frac, 0, 1) * 100);
        veil.querySelector('.sh-prog-bar i').style.width = pct + '%';
        veil.querySelector('.sh-prog-pct').textContent = pct + '%';
        if (detail) veil.querySelector('.sh-prog-detail').textContent = detail;
      },
      check() { if (J.cancelled) throw CANCEL; },
      preview(node) {
        const box = veil.querySelector('.sh-prog-preview');
        box.hidden = !node;
        box.textContent = '';
        if (node) box.appendChild(node);
      },
      hideCard(on) { veil.classList.toggle('is-capturing', !!on); },
      done() { endVeil(); },
    };
    const btn = veil.querySelector('.sh-prog-cancel');
    if (btn) btn.addEventListener('click', () => { J.cancelled = true; btn.disabled = true; btn.textContent = 'Stopping'; });
    J.onKey = e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); if (btn) btn.click(); } };
    document.addEventListener('keydown', J.onKey, true);
    veil._job = J;
    requestAnimationFrame(() => veil && veil.classList.add('is-in'));
    return J;
  }
  function endVeil(now) {
    if (!veil) return;
    const v = veil;
    veil = null;
    if (v._job) document.removeEventListener('keydown', v._job.onKey, true);
    if (now) { v.remove(); return; }
    v.classList.remove('is-in');
    setTimeout(() => v.remove(), 220);
  }

  async function fontsReady(ms) {
    if (!document.fonts || !document.fonts.ready) return;
    try { await Promise.race([document.fonts.ready, sleep(ms || 2000)]); } catch (err) { /* proceed */ }
  }

  /* ---------------- patterns ---------------- */

  function patternEntries(st, def) {
    if (typeof Patterns === 'undefined' || typeof PatternPins === 'undefined') return [];
    const pinned = PatternPins.normalizeList(st.patterns || []);
    if (pinned.length) return pinned.map(e => Object.assign({ label: (Patterns.get(e.key) || {}).name || e.key }, e));
    const suite = typeof blendSuite === 'function' ? blendSuite(def) : Patterns.suiteFor(def.key);
    return suite.map(s => {
      const en = PatternPins.normalize({ key: s.key, params: Object.assign(Patterns.defaults(s.key), s.params), colorway: s.colorway, seed: PatternPins.SUITE_SEED });
      if (!en) return null;
      const tone = [s.tone, en.params && en.params.tone].find(x => x != null && isFinite(x));
      if (tone != null && tone !== 1) en.params = Object.assign({}, en.params, { tone: clamp(Number(tone), 0, 1) });
      return Object.assign(en, { label: s.name || (Patterns.get(s.key) || {}).name || s.key });
    }).filter(Boolean);
  }

  function patternCanvas(entry, t, w, h, dpr) {
    const cv = document.createElement('canvas');
    cv.width = Math.round(w * (dpr || 1));
    cv.height = Math.round(h * (dpr || 1));
    try {
      const inks = Patterns.inksFor(t, entry.colorway, { tints: !!(entry.params && entry.params.tints) });
      Patterns.render(cv, entry.key, entry.params, inks, entry.seed, { width: w, height: h, dpr: dpr || 1, setStyle: false });
    } catch (err) {
      const ctx = cv.getContext('2d');
      ctx.fillStyle = t.primary; ctx.fillRect(0, 0, cv.width, cv.height);
    }
    return cv;
  }

  /* ---------------- boards and slides as pictures ---------------- */

  function nativeCapture() {
    const mh = window.webkit && window.webkit.messageHandlers;
    return mh && mh.capture && typeof mh.capture.postMessage === 'function' ? mh.capture : null;
  }

  // Board markup for an aesthetic key (null = the brand as it is now, blend included),
  // in that aesthetic's own light/dark mode, with the brand's colours, fonts and copy.
  function boardFor(key) {
    if (!key) {
      const v = abView();
      return { html: boardHtml(Object.assign({}, v.state, { content: effectiveContent() }), v.def), def: v.def, blend: !!v.def.blend };
    }
    const def = aestheticByKey(key);
    const st = Object.assign({}, state, { aesthetic: def.key, aestheticVersion: 'current', bgMode: def.mode || state.bgMode, blend: null, content: effectiveContent() });
    return { html: boardHtml(st, def), def, blend: false };
  }

  // Draws html (one root element) at width w, cropped to height h, as an image `scale`
  // times larger. Returns a canvas.
  async function rasterHtml(html, w, h, scale, J, after) {
    const cap = nativeCapture();
    const host = document.createElement('div');
    host.className = 'sh-raster';
    if (typeof setBoardFonts === 'function') setBoardFonts(host);
    host.innerHTML = html;
    const root = host.firstElementChild;
    if (cap) {
      const vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
      const fit = Math.min(1, (vw - 32) / w, (vh - 32) / h);
      host.style.cssText += `;position:fixed;left:${Math.round((vw - w * fit) / 2)}px;top:${Math.round((vh - h * fit) / 2)}px;width:${w}px;height:${h}px;overflow:hidden;transform:scale(${fit});transform-origin:0 0;z-index:2147483647;`;
      document.body.appendChild(host);
      if (after) after(root);
      try {
        await fontsReady(1500);
        await Promise.all([...host.querySelectorAll('img')].map(img => (img.decode ? img.decode().catch(() => {}) : null)));
        if (J) J.hideCard(true);
        await frame(); await frame(); await sleep(60);
        const r = host.getBoundingClientRect();
        const url = await cap.postMessage({ op: 'snapshot', rect: [r.left, r.top, r.width, r.height], pixelWidth: Math.round(w * scale), format: 'png' });
        const im = await loadImage(url);
        const cv = document.createElement('canvas');
        cv.width = Math.round(w * scale); cv.height = Math.round(h * scale);
        cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
        return cv;
      } catch (err) {
        host.remove();
        return rasterHtmlCanvas(html, w, h, scale, after);
      } finally {
        if (J) J.hideCard(false);
        host.remove();
      }
    }
    return rasterHtmlCanvas(html, w, h, scale, after);
  }

  async function rasterHtmlCanvas(html, w, h, scale, after) {
    if (typeof html2canvas !== 'function') throw new Error('No renderer');
    const host = document.createElement('div');
    host.className = 'sh-raster sh-raster-off';
    host.style.width = w + 'px';
    host.style.height = h + 'px';
    if (typeof setBoardFonts === 'function') setBoardFonts(host);
    host.innerHTML = html;
    document.body.appendChild(host);
    const root = host.firstElementChild;
    if (after) after(root);
    try {
      await fontsReady(1500);
      await sleep(40);
      if (typeof bdPrepareExportClone === 'function') { try { await bdPrepareExportClone(host); } catch (err) { /* draw it as it is */ } }
      const bg = getComputedStyle(root).backgroundColor;
      return await html2canvas(host, {
        scale, useCORS: true, logging: false,
        backgroundColor: bg && bg !== 'rgba(0, 0, 0, 0)' ? bg : '#ffffff',
        width: w, height: h, windowWidth: Math.max(w, 1280), windowHeight: Math.max(h, 800), scrollX: 0, scrollY: 0,
        onclone: (doc, el) => {
          const off = doc.querySelector('.sh-raster-off');
          if (off) off.classList.remove('sh-raster-off');
          if (typeof bdSanitizeClone === 'function') { try { bdSanitizeClone(doc, el); } catch (err) { /* as it is */ } }
        },
      });
    } finally {
      host.remove();
    }
  }

  async function rasterBoard(key, w, h, scale, J) {
    const b = boardFor(key);
    const cv = await rasterHtml(b.html, w, h, scale, J, root => {
      if (b.blend && root) {
        try { if (typeof blendClearArtText === 'function') blendClearArtText(root); if (typeof blendLegibility === 'function') blendLegibility(root); } catch (err) { /* cosmetic */ }
      }
    });
    return { cv, def: b.def };
  }

  // A canvas the page may no longer read (an SVG layer html2canvas drew taints it) cannot
  // be saved or recorded.
  function tainted(cv) {
    try { cv.getContext('2d').getImageData(0, 0, 1, 1); return false; } catch (err) { return true; }
  }
  // Stand-in for a board that could not be drawn readably: its ground, ink and the name.
  function plainBoard(B, w, h, scale) {
    const cv = document.createElement('canvas');
    cv.width = Math.round(w * scale); cv.height = Math.round(h * scale);
    const ctx = cv.getContext('2d');
    ctx.scale(scale, scale);
    ctx.fillStyle = B.t.canvas; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = B.t.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    const f = fitText(ctx, B.tagline || B.name, B.head, 700, w * 0.09, w * 0.8, 24);
    ctx.font = fontSpec(B.head, 700, f.size);
    f.lines.forEach((l, i) => ctx.fillText(l, w * 0.08, h * 0.42 + i * f.size * 1.05));
    ctx.fillStyle = B.t.primary; ctx.fillRect(w * 0.08, h * 0.42 + f.lines.length * f.size * 1.05, w * 0.2, Math.max(6, w * 0.012));
    return cv;
  }
  // Boards for `keys` (n of them; a board that comes back unreadable is skipped for the next key).
  async function rasterMany(keys, n, w, h, scale, J, onStep) {
    const out = [];
    for (let i = 0; i < keys.length && out.length < n; i++) {
      J.check();
      if (onStep) onStep(out.length, aestheticByKey(keys[i]).name);
      const r = await rasterBoard(keys[i], w, h, scale, J);
      if (!tainted(r.cv)) out.push(r);
    }
    return out;
  }

  // The aesthetics for the sweep and the poster: the owner's favourites in showcase
  // mode, a hand-picked varied set otherwise; never the brand's own.
  const SWEEP = ['aurora-noir', 'radical-memphis', 'blueprint', 'dystopian-luxury', 'acid-graphics', 'old-web',
    'holo-iridescent', 'xerox-punk', 'gorpcore', 'industrial-device', 'naive-doodle', 'bento-grid',
    'corporate-vandalism', 'mesh-gradient', 'pirate-broadcast', 'micrographics', 'ascii-art', 'xerox', 'blob-tracking'];
  function pickAesthetics(n, exclude) {
    const pool = (typeof showcaseFilter === 'function' ? showcaseFilter(AESTHETICS) : AESTHETICS).map(a => a.key);
    const keys = SWEEP.filter(k => pool.includes(k)).concat(pool.filter(k => !SWEEP.includes(k)));
    const all = keys.concat(AESTHETICS.map(a => a.key).filter(k => !keys.includes(k)));
    return all.filter(k => k !== exclude).slice(0, n);
  }

  /* ================================================================
     1. Mini-site
     ================================================================ */

  // Rules of every same-origin stylesheet that touch something inside `root`
  // (state pseudo-classes and pseudo-elements are ignored for the test), plus :root
  // variables, keyframes and @property. Media / supports / container blocks are kept
  // around the rules inside them that survive.
  const STATE_PSEUDO = /::?(?:-webkit-[a-z-]+|-moz-[a-z-]+|before|after|first-line|first-letter|marker|placeholder|selection|backdrop|file-selector-button|hover|focus-visible|focus-within|focus|active|visited|link|any-link|target|checked|disabled|enabled|indeterminate|placeholder-shown|invalid|valid|required|optional|read-only|read-write|default|autofill|fullscreen|popover-open|modal|open|closed)(?![\w-])(?:\([^()]*\))?/g;
  function testSelector(sel) {
    let s = sel.replace(STATE_PSEUDO, '');
    s = s.replace(/\s*([>+~])\s*/g, ' $1 ').replace(/\s+/g, ' ').trim();
    // A compound left empty by the removal ("a > :hover") becomes "*".
    s = s.replace(/([>+~]) (?=[>+~,)]|$)/g, '$1 * ').replace(/(^|[,(]) ?(?=[>+~])/g, '$1* ').trim().replace(/([>+~])$/, '$1 *');
    return s || '*';
  }
  function ruleMatches(sel, root) {
    if (/^\s*(:root|html)\s*$/.test(sel)) return true;
    try {
      const test = testSelector(sel);
      if (root.matches(test)) return true;
      return !!root.querySelector(test);
    } catch (err) {
      return true;   // a selector this engine cannot test: keep it
    }
  }
  function pruneRules(rules, root, out) {
    for (const rule of rules) {
      const type = rule.constructor && rule.constructor.name;
      if (rule.type === 1 || type === 'CSSStyleRule') {
        if (rule.selectorText && ruleMatches(rule.selectorText, root)) out.push(rule.cssText);
      } else if (rule.type === 7 || type === 'CSSKeyframesRule') {
        out.push(rule.cssText);
      } else if (rule.type === 5 || type === 'CSSFontFaceRule') {
        // fonts are embedded separately (see fontFaces)
      } else if (rule.cssRules && rule.cssRules.length != null && rule.cssText.indexOf('{') > 0) {
        const inner = [];
        pruneRules(rule.cssRules, root, inner);
        if (inner.length) out.push(rule.cssText.slice(0, rule.cssText.indexOf('{')).trim() + ' {\n' + inner.join('\n') + '\n}');
      } else if (rule.cssText && !/^@import/.test(rule.cssText)) {
        out.push(rule.cssText);
      }
    }
  }
  function usedCss(root) {
    const out = [];
    for (const sheet of document.styleSheets) {
      if (sheet.ownerNode && sheet.ownerNode.id === 'localFonts') continue;
      if (sheet.href && /\/css\/share\.css/.test(sheet.href)) continue;
      let rules;
      try { rules = sheet.cssRules; } catch (err) { continue; }
      if (!rules) continue;
      pruneRules(rules, root, out);
    }
    // Keyframes nobody uses are dropped.
    const text = out.join('\n');
    return out.filter(r => {
      const m = /^@(?:-webkit-)?keyframes\s+([\w-]+)/.exec(r);
      if (!m) return true;
      const re = new RegExp('(animation(?:-name)?\\s*:[^;}]*\\b' + m[1] + '\\b)');
      return re.test(text);
    }).join('\n');
  }

  // The local copies of the Google Fonts (fonts/fonts.css) for every family the
  // exported page names, as data: URLs. Families with no local copy come back in `missing`.
  async function fontFaces(text, wanted) {
    const sheet = [...document.styleSheets].find(s => s.ownerNode && s.ownerNode.id === 'localFonts');
    const faces = [];
    const have = new Set();
    if (sheet) {
      let rules = [];
      try { rules = [...sheet.cssRules]; } catch (err) { rules = []; }
      const fams = new Map();
      rules.forEach(r => {
        if (!(r.type === 5 || (r.constructor && r.constructor.name === 'CSSFontFaceRule'))) return;
        const fam = (r.style.getPropertyValue('font-family') || '').replace(/["']/g, '').trim();
        if (!fam) return;
        if (!fams.has(fam)) fams.set(fam, []);
        fams.get(fam).push(r);
      });
      const used = [...fams.keys()].filter(f => new RegExp('["\'\\s,(:]' + f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '["\'\\s,;)]').test(text));
      const cache = new Map();
      for (const fam of used) {
        for (const r of fams.get(fam)) {
          let css = r.cssText;
          const urls = [...css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)].map(m => m[1]).filter(u => !/^data:/.test(u));
          let ok = true;
          for (const u of urls) {
            const abs = new URL(u, sheet.href || location.href).href;
            try {
              if (!cache.has(abs)) {
                const res = await fetch(abs);
                if (!res.ok) throw new Error('font ' + res.status);
                cache.set(abs, await blobDataUrl(new Blob([await res.arrayBuffer()], { type: 'font/woff2' })));
              }
              css = css.split(u).join(cache.get(abs));
            } catch (err) { ok = false; }
          }
          if (ok) { faces.push(css); have.add(fam); }
        }
      }
    }
    return { css: faces.join('\n'), missing: (wanted || []).filter(f => f && !have.has(f.name)) };
  }

  function canvasToImg(cv) {
    const img = document.createElement('img');
    let url = '';
    try {
      url = cv.toDataURL('image/png');
      if (url.length > 600000) url = cv.toDataURL('image/jpeg', 0.9);
    } catch (err) { url = ''; }
    img.src = url;
    img.className = cv.className;
    img.setAttribute('style', cv.getAttribute('style') || '');
    img.alt = cv.getAttribute('aria-label') || '';
    if (cv.style.width === '' && cv.getAttribute('width')) img.style.width = '100%';
    return img;
  }
  // cloneNode does not copy canvas pixels: swap each canvas in `clone` for an image of
  // its counterpart in `orig`.
  function freezeCanvases(orig, clone) {
    const a = [...orig.querySelectorAll('canvas')], b = [...clone.querySelectorAll('canvas')];
    b.forEach((cv, i) => { if (a[i]) cv.replaceWith(canvasToImg(a[i])); });
  }
  // Relative image sources become data: URLs so the file stands alone.
  async function inlineImages(root) {
    for (const img of root.querySelectorAll('img[src]')) {
      const src = img.getAttribute('src');
      if (!src || /^(data:|blob:)/.test(src)) continue;
      try { img.src = await blobDataUrl(await (await fetch(new URL(src, location.href).href)).blob()); } catch (err) { img.removeAttribute('src'); }
    }
  }

  async function grabBuilt(J) {
    const out = [];
    if (!(typeof Show.built === 'function' && typeof SeeBuilt !== 'undefined' && typeof setBoardView === 'function')) return out;
    const prevView = typeof boardView !== 'undefined' ? boardView : 'board';
    const bv = document.getElementById('builtView');
    const prevKindBtn = bv && bv.querySelector('.sb-kind[aria-pressed="true"]');
    const prevKind = prevKindBtn ? prevKindBtn.dataset.kind : null;
    const wasBefore = !!(bv && bv.querySelector('.sb-compare'));
    const names = { dashboard: 'Dashboard', mobile: 'Mobile app', landing: 'Landing page', settings: 'Settings' };
    try {
      if (wasBefore && typeof Show.beforeAfter === 'function') Show.beforeAfter(false);
      for (const kind of (SeeBuilt.kinds || Object.keys(names))) {
        J.check();
        Show.built(kind);
        await frame();
        const single = bv && bv.querySelector('.sb-single');
        if (!single) continue;
        const clone = single.cloneNode(true);
        freezeCanvases(single, clone);
        clone.querySelectorAll('[tabindex]').forEach(el => el.removeAttribute('tabindex'));
        out.push({ kind, label: names[kind] || kind, node: clone, fonts: bv.getAttribute('style') || '' });
      }
    } finally {
      if (prevView === 'built') {
        if (prevKind) Show.built(prevKind);
        if (wasBefore && typeof Show.beforeAfter === 'function') Show.beforeAfter(true);
      } else {
        setBoardView(prevView);
      }
    }
    return out;
  }

  async function grabBrief(J) {
    if (!(typeof Show.brief === 'function')) return null;
    const md = typeof Show.brief.text === 'function' ? Show.brief.text() : (typeof buildAiBrief === 'function' ? buildAiBrief(state) : '');
    const wasOpen = typeof Show.brief.isOpen === 'function' && Show.brief.isOpen();
    let root = null;
    try {
      root = Show.brief();
      if (!root) return { node: null, md };
      const doc = root.querySelector('.bv-doc');
      // Pattern tiles draw one by one; each one resizes its canvas when drawn.
      const t0 = performance.now();
      while (performance.now() - t0 < 5000) {
        const cvs = [...doc.querySelectorAll('canvas.bv-pat-cv')];
        if (cvs.every(cv => cv.width !== 480)) break;
        await sleep(80);
      }
      J.check();
      const clone = doc.cloneNode(true);
      freezeCanvases(doc, clone);
      return { node: clone, md };
    } finally {
      if (!wasOpen && typeof Show.brief.close === 'function') Show.brief.close();
    }
  }

  async function makeSite() {
    if (Share.busy) return;
    Share.busy = true;
    const J = job('Making the mini-site');
    const stage = document.createElement('div');
    stage.className = 'sh-stage';
    try {
      const B = brandInfo();
      const { st, def, t } = B;
      if (typeof setBoardFonts === 'function') setBoardFonts(stage);
      document.body.appendChild(stage);

      // The board.
      J.set(0.05, 'Drawing the board');
      const boardWrap = document.createElement('div');
      boardWrap.className = 'ms-board';
      boardWrap.innerHTML = boardFor(null).html;
      stage.appendChild(boardWrap);
      if (def.blend) {
        try { blendClearArtText(boardWrap.firstElementChild); blendLegibility(boardWrap.firstElementChild); } catch (err) { /* cosmetic */ }
      }

      // The deck, built and fitted the way present mode does it.
      J.set(0.12, 'Laying out the ten slides');
      const deckWrap = document.createElement('div');
      deckWrap.className = 'ms-deck-src';
      const slides = (typeof DECK_SLIDES !== 'undefined' ? DECK_SLIDES : []).slice();
      const sst = Object.assign({}, st, { content: effectiveContent() });
      deckWrap.innerHTML = slides.map((sl, i) => `<div class="ms-slide-src" data-i="${i}">${bdSlideHtml(sst, def, sl, i, slides.length)}</div>`).join('');
      stage.appendChild(deckWrap);
      await fontsReady(2500);
      await frame();
      try { if (typeof bdApplyRadius === 'function') bdApplyRadius(deckWrap, def); if (typeof bdFitDeck === 'function') bdFitDeck(deckWrap); } catch (err) { /* an unfitted slide still shows */ }
      J.check();

      // Product screens.
      J.set(0.25, 'Drawing the product screens');
      const built = await grabBuilt(J);
      const builtWrap = document.createElement('div');
      builtWrap.className = 'sb-view ms-built-src';
      built.forEach(b => builtWrap.appendChild(b.node));
      stage.appendChild(builtWrap);
      J.check();

      // Brief.
      J.set(0.4, 'Typesetting the brief');
      const brief = await grabBrief(J);
      const briefWrap = document.createElement('div');
      briefWrap.className = 'bv ms-bv';
      if (brief && brief.node) briefWrap.appendChild(brief.node);
      stage.appendChild(briefWrap);
      J.check();

      // Pattern wall.
      J.set(0.5, 'Drawing the patterns');
      const pats = patternEntries(st, def).slice(0, 6);
      const patImgs = [];
      for (let i = 0; i < pats.length; i++) {
        J.check();
        const cv = patternCanvas(pats[i], t, 800, 500, 1.5);
        let url = cv.toDataURL('image/png');
        if (url.length > 260000) url = cv.toDataURL('image/jpeg', 0.88);
        const fam = Patterns.get(pats[i].key) || {};
        patImgs.push({ url, name: pats[i].label || fam.name || pats[i].key, blurb: fam.blurb || '' });
        J.set(0.5 + 0.1 * (i + 1) / pats.length);
        await sleep(0);
      }
      const heroPat = pats[0] ? patternCanvas(pats[0], t, 1600, 360, 1).toDataURL('image/jpeg', 0.9) : '';

      // Freeze any canvases, inline images, then collect the CSS everything uses.
      J.set(0.62, 'Collecting styles');
      stage.querySelectorAll('canvas').forEach(cv => cv.replaceWith(canvasToImg(cv)));
      await inlineImages(stage);
      const css = usedCss(stage);
      J.check();
      J.set(0.72, 'Embedding fonts');
      const fontText = css + stage.innerHTML + (st.headingFont.css || '') + (st.bodyFont.css || '') + getComputedStyle(document.documentElement).getPropertyValue('--font-ui');
      const fonts = await fontFaces(fontText, [st.headingFont, st.bodyFont]);
      let gf = '';
      if (fonts.missing.length && typeof googleFamilyParam === 'function') {
        const fp = fonts.missing.filter((f, i, a) => a.findIndex(x => x.name === f.name) === i).sort((a, b) => a.name.localeCompare(b.name)).map(f => googleFamilyParam(f)).join('&');
        gf = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${fp}&display=swap">`;
      }
      J.check();

      J.set(0.85, 'Writing the file');
      const html = siteHtml({
        B, css, fontCss: fonts.css, gf, heroPat,
        board: boardWrap.innerHTML,
        slides: [...deckWrap.querySelectorAll('.ms-slide-src')].map(el => el.innerHTML),
        slideNames: slides.map(s => s.label || s.title || s.key),
        built: built.map(b => ({ kind: b.kind, label: b.label, html: b.node.outerHTML })),
        brief: briefWrap.firstChild ? briefWrap.outerHTML : '', md: brief ? brief.md : '',
        pats: patImgs,
      });
      const blob = new Blob([html], { type: 'text/html' });
      const name = `${slug()}-mini-site.html`;
      J.set(1, 'Saving');
      await saveBlob(blob, name);
      Share.last = { kind: 'site', name, bytes: blob.size, built: built.length, slides: slides.length, patterns: patImgs.length, brief: !!(brief && brief.node), embeddedFonts: (fonts.css.match(/@font-face/g) || []).length, googleFonts: !!gf };
      J.done();
      toast('Mini-site saved: one HTML file that opens in any browser');
      return Share.last;
    } catch (err) {
      J.done();
      if (err !== CANCEL) { console.error('mini-site failed', err); toast('The mini-site could not be made'); }
      else toast('Mini-site cancelled');
      return null;
    } finally {
      stage.remove();
      Share.busy = false;
    }
  }

  function siteHtml(o) {
    const { B } = o;
    const t = B.t;
    const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const mark = B.logo
      ? `<img class="ms-logo" src="${esc(B.logo)}" alt="">`
      : `<span class="ms-initial" aria-hidden="true">${esc(B.initial)}</span>`;
    const sw = ['canvas', 'ink', 'primary', 'secondary', 'accent'].map(k => `<span class="ms-sw" style="background:${t[k]}" title="${k} ${t[k]}"><i>${esc(t[k].toUpperCase())}</i></span>`).join('');
    const hasBuilt = o.built.length > 0;
    const hasBrief = !!o.brief.trim();
    let n = 0;
    const num = () => String(++n).padStart(2, '0');
    const sections = [];
    sections.push(`<section class="ms-sec" id="board" aria-labelledby="h-board">
      <header class="ms-head"><span class="ms-num">${num()}</span><h2 id="h-board">The board</h2><p>Colour, type, shape and material in one place, in the ${esc(B.def.name)} language.</p></header>
      <div class="ms-board">${o.board}</div>
    </section>`);
    sections.push(`<section class="ms-sec" id="deck" aria-labelledby="h-deck">
      <header class="ms-head"><span class="ms-num">${num()}</span><h2 id="h-deck">The deck</h2><p>${o.slides.length} slides. Click any slide to present it full screen, then use the arrow keys.</p>
        <button type="button" class="ms-btn ms-btn-solid" data-present="0">Present the deck</button></header>
      <div class="ms-deck">${o.slides.map((s, i) => `<div class="ms-slide" role="button" tabindex="0" data-present="${i}" aria-label="Present from slide ${i + 1}"><div class="ms-slide-in" inert>${s}</div><span class="ms-slide-n">${String(i + 1).padStart(2, '0')}</span></div>`).join('')}</div>
    </section>`);
    if (hasBuilt) {
      sections.push(`<section class="ms-sec" id="built" aria-labelledby="h-built">
        <header class="ms-head"><span class="ms-num">${num()}</span><h2 id="h-built">See it built</h2><p>The same colours, type and components as product screens.</p></header>
        <div class="ms-tabs" role="tablist" aria-label="Product screens">${o.built.map((b, i) => `<button type="button" role="tab" class="ms-tab" id="tab-${b.kind}" aria-controls="panel-${b.kind}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(b.label)}</button>`).join('')}</div>
        <div class="sb-view ms-built">${o.built.map((b, i) => `<div class="ms-panel" role="tabpanel" id="panel-${b.kind}" aria-labelledby="tab-${b.kind}"${i ? ' hidden' : ''}><div class="ms-panel-in" inert>${b.html}</div></div>`).join('')}</div>
      </section>`);
    }
    if (o.pats.length) {
      sections.push(`<section class="ms-sec" id="patterns" aria-labelledby="h-pat">
        <header class="ms-head"><span class="ms-num">${num()}</span><h2 id="h-pat">Patterns</h2><p>Generated from the brand's own colours.</p></header>
        <div class="ms-pats">${o.pats.map(p => `<figure class="ms-pat"><img src="${p.url}" alt="${esc(p.name)} pattern" loading="lazy"><figcaption><b>${esc(p.name)}</b>${p.blurb ? `<span>${esc(p.blurb)}</span>` : ''}</figcaption></figure>`).join('')}</div>
      </section>`);
    }
    if (hasBrief) {
      sections.push(`<section class="ms-sec ms-sec-brief" id="brief" aria-labelledby="h-brief">
        <header class="ms-head"><span class="ms-num">${num()}</span><h2 id="h-brief">The brief</h2><p>Everything above, written down for whoever builds it. Copy it into any coding tool.</p>
          <button type="button" class="ms-btn ms-btn-solid" id="msCopy">Copy brief</button></header>
        <div class="ms-brief">${o.brief}</div>
      </section>`);
    }
    const nav = [['board', 'Board'], ['deck', 'Deck']].concat(hasBuilt ? [['built', 'Built']] : [], o.pats.length ? [['patterns', 'Patterns']] : [], hasBrief ? [['brief', 'Brief']] : []);
    const vars = `--ms-canvas:${t.canvas};--ms-ink:${t.ink};--ms-pri:${t.primary};--ms-on-pri:${t.onPrimary};--ms-acc:${t.accent};--ms-muted:${t.muted};--font-heading:${B.head.css};--font-body:${B.body.css}`;
    const md = String(o.md || '').replace(/<\/(script)/gi, '<\\/$1');
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(B.name)}: brand</title>
<meta name="description" content="${esc(B.tagline || B.name + ' brand identity')}">
<meta name="generator" content="Branding Designer">
${o.gf}
<style>
${o.fontCss}
</style>
<style>
${o.css}
</style>
<style>
${SITE_CSS}
</style>
</head>
<body class="ms" style="${esc(vars)}">
<a class="ms-skip" href="#board">Skip to the board</a>
<header class="ms-nav">
  <a class="ms-mark" href="#top">${mark}<span>${esc(B.name)}</span></a>
  <nav aria-label="Sections">${nav.map(([id, label]) => `<a href="#${id}">${label}</a>`).join('')}</nav>
  <button type="button" class="ms-btn" data-present="0">Present</button>
</header>
<main>
<section class="ms-hero" id="top" style="background:${t.canvas};color:${t.ink}">
  <div class="ms-hero-in">
    <p class="ms-eyebrow">Brand identity &middot; ${esc(B.def.name)}</p>
    <h1 class="ms-title">${esc(B.name)}</h1>
    ${B.tagline ? `<p class="ms-tagline">${esc(B.tagline)}</p>` : ''}
    <div class="ms-sws" aria-label="Brand colours">${sw}</div>
  </div>
  ${o.heroPat ? `<div class="ms-hero-pat" style="background-image:url(${o.heroPat})" aria-hidden="true"></div>` : ''}
</section>
${sections.join('\n')}
</main>
<footer class="ms-foot"><span>${esc(B.name)}</span><span>Made with Branding Designer &middot; ${esc(date)}</span></footer>
<div class="ms-pr" hidden role="dialog" aria-modal="true" aria-label="Deck">
  <div class="ms-pr-stage"></div>
  <div class="ms-pr-bar"><button type="button" class="ms-pr-btn" data-go="-1" aria-label="Previous slide">&larr;</button><span class="ms-pr-n" aria-live="polite"></span><button type="button" class="ms-pr-btn" data-go="1" aria-label="Next slide">&rarr;</button><button type="button" class="ms-pr-btn ms-pr-x" aria-label="Close (Esc)">&times;</button></div>
</div>
<script type="text/markdown" id="msBriefMd">${md}</script>
<script>
${SITE_JS}
</script>
</body>
</html>`;
  }

  const SITE_CSS = `
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
body.ms{margin:0;background:#f4f3f0;color:#17161a;font:15px/1.55 -apple-system,BlinkMacSystemFont,"Inter","Segoe UI",system-ui,sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
.ms *,.ms *::before,.ms *::after{box-sizing:border-box}
.ms-skip{position:absolute;left:-9999px;top:8px;z-index:50;background:#17161a;color:#fff;padding:8px 12px;border-radius:8px}
.ms-skip:focus{left:8px}
.ms-nav{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:20px;padding:12px max(16px,calc((100vw - 1240px)/2));background:rgba(244,243,240,.86);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border-bottom:1px solid rgba(23,22,26,.08)}
.ms-mark{display:flex;align-items:center;gap:10px;color:inherit;text-decoration:none;font-weight:600;letter-spacing:-.01em;min-width:0;margin-right:auto}
.ms-mark span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ms-logo{width:28px;height:28px;object-fit:contain;border-radius:6px}
.ms-initial{display:grid;place-items:center;width:28px;height:28px;border-radius:7px;background:var(--ms-pri);color:var(--ms-on-pri);font:600 14px/1 var(--font-heading)}
.ms-nav nav{display:flex;gap:4px}
.ms-nav nav a{color:#57555c;text-decoration:none;font-size:13px;padding:6px 10px;border-radius:8px}
.ms-nav nav a:hover{color:#17161a;background:rgba(23,22,26,.06)}
.ms-btn{appearance:none;font:inherit;font-size:13px;font-weight:500;color:#17161a;background:#fff;border:1px solid rgba(23,22,26,.16);border-radius:9px;padding:7px 14px;cursor:pointer;white-space:nowrap}
.ms-btn:hover{border-color:rgba(23,22,26,.4)}
.ms-btn-solid{background:#17161a;color:#fff;border-color:#17161a}
.ms-btn-solid:hover{background:#000}
.ms-btn:focus-visible,.ms-slide:focus-visible,.ms-tab:focus-visible,.ms-pr-btn:focus-visible,.ms-nav a:focus-visible{outline:2px solid var(--ms-pri);outline-offset:2px}
.ms-hero{position:relative;overflow:hidden;padding:clamp(56px,10vw,128px) max(16px,calc((100vw - 1240px)/2)) clamp(120px,16vw,200px)}
.ms-hero-in{position:relative;z-index:1;max-width:980px}
.ms-eyebrow{margin:0 0 18px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;opacity:.7}
.ms-title{margin:0;font-family:var(--font-heading);font-weight:700;font-size:clamp(44px,9vw,128px);line-height:.95;letter-spacing:-.02em;overflow-wrap:anywhere}
.ms-tagline{margin:22px 0 0;font-family:var(--font-body);font-size:clamp(18px,2.2vw,26px);line-height:1.35;max-width:36ch;opacity:.85}
.ms-sws{display:flex;flex-wrap:wrap;gap:10px;margin-top:36px}
.ms-sw{position:relative;width:64px;height:64px;border-radius:50%;box-shadow:0 0 0 1px rgba(128,128,128,.35)}
.ms-sw i{position:absolute;left:50%;top:100%;transform:translateX(-50%);margin-top:6px;font:500 10px/1 ui-monospace,"SF Mono",Menlo,monospace;font-style:normal;opacity:.6;white-space:nowrap}
.ms-hero-pat{position:absolute;left:0;right:0;bottom:0;height:clamp(64px,10vw,120px);background-size:cover;background-position:center}
.ms-sec{padding:clamp(56px,8vw,104px) max(16px,calc((100vw - 1240px)/2)) 0}
.ms-head{display:grid;grid-template-columns:auto 1fr auto;align-items:end;gap:4px 18px;margin-bottom:28px;padding-bottom:18px;border-bottom:1px solid rgba(23,22,26,.12)}
.ms-num{grid-row:1/3;align-self:start;font:500 12px/1 ui-monospace,"SF Mono",Menlo,monospace;color:#8a8790;padding-top:9px}
.ms-head h2{margin:0;font-size:clamp(26px,3.4vw,40px);line-height:1.1;letter-spacing:-.02em;font-weight:650}
.ms-head p{grid-column:2;margin:0;color:#57555c;max-width:60ch}
.ms-head .ms-btn{grid-column:3;grid-row:1/3;align-self:center}
.ms-board{max-width:1240px;border-radius:18px;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,.06),0 24px 60px -24px rgba(0,0,0,.25)}
.ms-deck{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,340px),1fr));gap:18px}
.ms-slide{position:relative;display:block;width:100%;aspect-ratio:16/9;padding:0;border:0;border-radius:10px;overflow:hidden;background:#ddd;cursor:zoom-in;box-shadow:0 1px 2px rgba(0,0,0,.08),0 10px 30px -14px rgba(0,0,0,.3);transition:transform .2s ease,box-shadow .2s ease}
.ms-slide:hover{transform:translateY(-2px);box-shadow:0 2px 4px rgba(0,0,0,.08),0 18px 40px -16px rgba(0,0,0,.35)}
.ms-slide-in{position:absolute;left:0;top:0;width:1280px;height:720px;transform-origin:0 0;transform:scale(var(--k,.25));pointer-events:none;text-align:left}
.ms-slide-n{position:absolute;right:8px;bottom:8px;font:500 11px/1 ui-monospace,"SF Mono",Menlo,monospace;background:rgba(0,0,0,.55);color:#fff;padding:4px 6px;border-radius:5px}
.ms-tabs{display:inline-flex;flex-wrap:wrap;gap:2px;padding:3px;margin-bottom:18px;background:#fff;border:1px solid rgba(23,22,26,.12);border-radius:10px}
.ms-tab{appearance:none;font:inherit;font-size:13px;color:#57555c;background:none;border:0;border-radius:7px;padding:7px 14px;cursor:pointer}
.ms-tab[aria-selected="true"]{background:#17161a;color:#fff}
.ms-built{overflow-x:auto;border-radius:20px}
.ms-panel-in{min-width:min(100%,980px)}
.ms-pats{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:18px}
.ms-pat{margin:0;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,.06)}
.ms-pat img{display:block;width:100%;aspect-ratio:8/5;object-fit:cover}
.ms-pat figcaption{display:flex;flex-direction:column;gap:2px;padding:12px 14px 14px;font-size:13px}
.ms-pat figcaption span{color:#6b6870}
.ms-brief .bv.ms-bv,.ms .bv.ms-bv{position:static;inset:auto;z-index:auto;display:block;background:none;min-height:0;overflow:visible}
.ms-brief .bv-doc{animation:none;margin:0 auto;padding-top:0}
.ms-foot{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;margin-top:clamp(64px,8vw,104px);padding:28px max(16px,calc((100vw - 1240px)/2));border-top:1px solid rgba(23,22,26,.12);color:#6b6870;font-size:13px}
.ms-pr{position:fixed;inset:0;z-index:100;background:#0b0b0c;display:flex;align-items:center;justify-content:center;cursor:pointer}
.ms-pr[hidden]{display:none}
.ms-pr-stage{position:relative;width:1280px;height:720px;flex:none;transform-origin:center center}
.ms-pr-slide{position:absolute;inset:0;opacity:0;transition:opacity .35s ease}
.ms-pr-slide.is-on{opacity:1}
@media (prefers-reduced-motion:reduce){.ms-pr-slide{transition:opacity .12s linear}}
.ms-pr-bar{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);display:flex;align-items:center;gap:6px;padding:6px;background:rgba(20,20,22,.78);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-radius:12px;color:#fff;opacity:0;transition:opacity .25s ease;cursor:default}
.ms-pr:hover .ms-pr-bar,.ms-pr.is-awake .ms-pr-bar,.ms-pr-bar:focus-within{opacity:1}
.ms-pr-btn{appearance:none;width:34px;height:34px;border:0;border-radius:8px;background:rgba(255,255,255,.1);color:#fff;font:16px/1 -apple-system,system-ui,sans-serif;cursor:pointer}
.ms-pr-btn:hover{background:rgba(255,255,255,.2)}
.ms-pr-n{min-width:64px;text-align:center;font:500 12px/1 ui-monospace,"SF Mono",Menlo,monospace}
html.ms-presenting,html.ms-presenting body{overflow:hidden}
@media (max-width:720px){
  .ms-nav nav{display:none}
  .ms-head{grid-template-columns:auto 1fr}
  .ms-head .ms-btn{grid-column:1/3;grid-row:auto;justify-self:start;margin-top:10px}
  .ms-sw{width:48px;height:48px}
  .ms-board{border-radius:12px}
}
@media print{.ms-nav,.ms-pr,.ms-btn{display:none!important}}
`;

  // The mini-site's own script: slide thumbnails, present mode, tabs, copy.
  const SITE_JS = `(function(){
var W=1280,H=720,doc=document;
var slides=[].slice.call(doc.querySelectorAll('.ms-slide'));
function fit(){slides.forEach(function(b){var w=b.clientWidth;if(w)b.style.setProperty('--k',(w/W).toFixed(5));});if(pr&&!pr.hidden)layout();}
var pr=doc.querySelector('.ms-pr'),stage=pr.querySelector('.ms-pr-stage'),label=pr.querySelector('.ms-pr-n'),cur=0,back=null,wakeT=0;
function layout(){var k=Math.min(innerWidth/W,innerHeight/H);stage.style.transform='scale('+k+')';}
function show(i){i=Math.max(0,Math.min(slides.length-1,i));var old=stage.querySelector('.ms-pr-slide.is-on');var el=doc.createElement('div');el.className='ms-pr-slide';el.innerHTML=slides[i].querySelector('.ms-slide-in').innerHTML;stage.appendChild(el);void el.offsetWidth;el.classList.add('is-on');if(old){old.classList.remove('is-on');setTimeout(function(){old.remove();},420);}cur=i;label.textContent=(i+1)+' / '+slides.length;}
function open(i){back=doc.activeElement;pr.hidden=false;doc.documentElement.classList.add('ms-presenting');layout();stage.textContent='';show(i||0);wake();pr.focus&&pr.setAttribute('tabindex','-1');pr.focus({preventScroll:true});}
function close(){pr.hidden=true;doc.documentElement.classList.remove('ms-presenting');stage.textContent='';if(doc.fullscreenElement&&doc.exitFullscreen)doc.exitFullscreen().catch(function(){});if(back&&back.focus)back.focus({preventScroll:true});}
function wake(){pr.classList.add('is-awake');clearTimeout(wakeT);wakeT=setTimeout(function(){pr.classList.remove('is-awake');},2200);}
doc.addEventListener('click',function(e){var b=e.target.closest('[data-present]');if(b){e.preventDefault();open(+b.getAttribute('data-present'));}});
pr.addEventListener('click',function(e){if(e.target.closest('.ms-pr-bar')){var g=e.target.closest('[data-go]');if(g)show(cur+(+g.getAttribute('data-go')));else if(e.target.closest('.ms-pr-x'))close();return;}show(e.clientX<innerWidth/3?cur-1:cur+1);});
pr.addEventListener('mousemove',wake);
doc.addEventListener('keydown',function(e){var sb=e.target.closest&&e.target.closest('.ms-slide');if(pr.hidden&&sb&&(e.key==='Enter'||e.key===' ')){e.preventDefault();open(+sb.getAttribute('data-present'));return;}if(pr.hidden||e.metaKey||e.ctrlKey||e.altKey)return;var k=e.key;
if(k==='ArrowRight'||k==='ArrowDown'||k===' '||k==='PageDown'||k==='Enter'){e.preventDefault();show(cur+1);}
else if(k==='ArrowLeft'||k==='ArrowUp'||k==='PageUp'||k==='Backspace'){e.preventDefault();show(cur-1);}
else if(k==='Home'){e.preventDefault();show(0);}else if(k==='End'){e.preventDefault();show(slides.length-1);}
else if(k==='Escape'){e.preventDefault();close();}
else if(k==='f'||k==='F'){var el=doc.documentElement;if(!doc.fullscreenElement&&el.requestFullscreen)el.requestFullscreen().catch(function(){});else if(doc.exitFullscreen)doc.exitFullscreen().catch(function(){});}
else if(/^[0-9]$/.test(k)){show(k==='0'?9:+k-1);}});
addEventListener('resize',fit);if(window.ResizeObserver){var ro=new ResizeObserver(fit);slides.forEach(function(s){ro.observe(s);});}fit();
var tabs=[].slice.call(doc.querySelectorAll('.ms-tab'));
function pick(t){tabs.forEach(function(x){var on=x===t;x.setAttribute('aria-selected',on);x.tabIndex=on?0:-1;var p=doc.getElementById(x.getAttribute('aria-controls'));if(p)p.hidden=!on;});}
tabs.forEach(function(t,i){t.addEventListener('click',function(){pick(t);});t.addEventListener('keydown',function(e){var d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(d){e.preventDefault();var n=tabs[(i+d+tabs.length)%tabs.length];pick(n);n.focus();}});});
var copy=doc.getElementById('msCopy');
if(copy)copy.addEventListener('click',function(){var md=doc.getElementById('msBriefMd').textContent;var done=function(){copy.textContent='Copied';setTimeout(function(){copy.textContent='Copy brief';},1600);};
var old=function(){var ta=doc.createElement('textarea');ta.value=md;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;left:-9999px;top:0';doc.body.appendChild(ta);ta.select();try{doc.execCommand('copy');done();}catch(e){copy.textContent='Select and copy the brief below';}ta.remove();};
if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(md).then(done,old);else old();});
})();`;

  /* ================================================================
     2. Reel
     ================================================================ */

  const REEL_MS = 15000;
  const SHAPES = {
    vertical: { W: 1080, H: 1920, bw: 820, bh: 1230, card: 900 },
    horizontal: { W: 1920, H: 1080, bw: 1280, bh: 720, card: 1500 },
  };

  function pickMime() {
    if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') return null;
    return ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(m => { try { return MediaRecorder.isTypeSupported(m); } catch (err) { return false; } }) || null;
  }

  function fontSpec(face, weight, px) {
    const w = typeof abWeightNear === 'function' ? abWeightNear(face, weight) : weight;
    return `${w} ${Math.round(px)}px ${face.css}`;
  }
  async function loadCanvasFonts(B) {
    if (!document.fonts || !document.fonts.load) return;
    const specs = [fontSpec(B.head, 700, 80), fontSpec(B.head, 400, 80), fontSpec(B.body, 400, 40), fontSpec(B.body, 600, 40)];
    try { await Promise.race([Promise.all(specs.map(s => document.fonts.load(s, B.name + B.tagline + 'Aa'))), sleep(2500)]); } catch (err) { /* system fallback */ }
  }

  // Text fitted to a width: shrinks to `min`, then wraps to two lines.
  function fitText(ctx, text, face, weight, px, maxW, min) {
    // One line while it stays large; past that, two lines at a larger size read better.
    const floor = text.indexOf(' ') > 0 ? Math.max(min, px * 0.7) : min;
    let size = px;
    ctx.font = fontSpec(face, weight, size);
    while (ctx.measureText(text).width > maxW && size > floor) { size -= 2; ctx.font = fontSpec(face, weight, size); }
    if (ctx.measureText(text).width <= maxW) return { size, lines: [text] };
    const words = text.split(' ');
    let best = [text];
    for (let i = 1; i < words.length; i++) {
      const a = words.slice(0, i).join(' '), b = words.slice(i).join(' ');
      if (Math.max(ctx.measureText(a).width, ctx.measureText(b).width) < Math.max(...best.map(l => ctx.measureText(l).width))) best = [a, b];
    }
    size = px;
    ctx.font = fontSpec(face, weight, size);
    while (Math.max(...best.map(l => ctx.measureText(l).width)) > maxW && size > min * 0.6) { size -= 2; ctx.font = fontSpec(face, weight, size); }
    return { size, lines: best };
  }

  function rrect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function coverDraw(ctx, img, x, y, w, h, align) {
    const iw = img.width, ih = img.height;
    const k = Math.max(w / iw, h / ih);
    const sw = w / k, sh = h / k;
    const sx = (iw - sw) / 2, sy = align === 'top' ? 0 : (ih - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }
  function hexA(hex, a) {
    const h = String(hex).replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h.slice(0, 6), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  function cornerColor(cv) {
    try {
      const d = cv.getContext('2d').getImageData(4, 4, 1, 1).data;
      return `rgb(${d[0]},${d[1]},${d[2]})`;
    } catch (err) { return '#888'; }
  }
  function lum(hex) {
    const h = String(hex).replace('#', '');
    const n = parseInt(h.slice(0, 6), 16);
    return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  }

  // Everything the reel draws, prepared up front so each frame is a pure function of time.
  async function reelAssets(shape, J) {
    const B = brandInfo();
    const S = SHAPES[shape];
    await loadCanvasFonts(B);
    const scale = S.card / S.bw;
    const raster = Math.min(2, Math.max(1, scale * 1.05));
    J.set(0.03, 'Drawing the board');
    const own = await rasterBoard(null, S.bw, S.bh, raster, J);
    if (tainted(own.cv)) own.cv = plainBoard(B, S.bw, S.bh, raster);
    J.check();
    const keys = pickAesthetics(12, B.def.key.replace(/^classic:/, ''));
    const boards = await rasterMany(keys, 6, S.bw, S.bh, raster, J, (i, name) => J.set(0.06 + 0.34 * (i / 6), `Drawing ${name}`));
    const sweep = boards.map(r => ({ cv: r.cv, name: r.def.name, desc: r.def.descriptor || '', bg: cornerColor(r.cv) }));
    const pats = patternEntries(B.st, B.def);
    const pat = pats[0] ? patternCanvas(pats[0], B.t, S.W, S.H, 1) : null;
    let logo = null;
    if (B.logo) { try { logo = await loadImage(B.logo); } catch (err) { logo = null; } }
    return { B, S, own: own.cv, ownBg: cornerColor(own.cv), sweep, pat, logo };
  }

  function drawReel(ctx, A, ms) {
    const { B, S } = A;
    const t = B.t;
    const W = S.W, H = S.H;
    const vert = H > W;
    const u = Math.min(W, H) / 1080;              // one unit = 1px at 1080
    const reduce = reduceMotion();
    const T1 = 2400, T2 = 5600, T3 = 12500;
    ctx.save();
    ctx.textBaseline = 'alphabetic';
    ctx.globalAlpha = 1;

    const title = (alpha, rise, withPattern, small) => {
      ctx.fillStyle = t.canvas; ctx.fillRect(0, 0, W, H);
      if (A.pat && withPattern > 0) {
        const bandH = (vert ? 300 : 220) * u * withPattern;
        ctx.save(); ctx.beginPath(); ctx.rect(0, H - bandH, W, bandH); ctx.clip();
        coverDraw(ctx, A.pat, 0, H - bandH, W, bandH);
        ctx.restore();
      }
      ctx.globalAlpha = alpha;
      ctx.fillStyle = t.ink;
      ctx.textAlign = 'center';
      const maxW = W * 0.84;
      const f = fitText(ctx, A.B.name, B.head, 700, (vert ? 150 : 170) * u, maxW, 56 * u);
      const lh = f.size * 1.02;
      const cy = H * (vert ? 0.44 : 0.46) - (f.lines.length - 1) * lh / 2 + rise;
      ctx.font = fontSpec(B.head, 700, f.size);
      f.lines.forEach((l, i) => ctx.fillText(l, W / 2, cy + i * lh));
      if (B.tagline && small > 0) {
        ctx.globalAlpha = alpha * small;
        ctx.fillStyle = t.muted || t.ink;
        const g = fitText(ctx, B.tagline, B.body, 400, 44 * u, maxW, 26 * u);
        ctx.font = fontSpec(B.body, 400, g.size);
        g.lines.forEach((l, i) => ctx.fillText(l, W / 2, cy + (f.lines.length - 1) * lh + 86 * u + i * g.size * 1.25 + rise * 0.5));
      }
      ctx.globalAlpha = 1;
    };

    const cardBox = () => {
      const cw = S.card * (W / (vert ? 1080 : 1920)), ch = cw * S.bh / S.bw;
      return { x: (W - cw) / 2, y: (H - ch) / 2 - (vert ? 40 * u : 20 * u), w: cw, h: ch };
    };
    const drawCard = (img, box, alpha, k, reveal) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
      ctx.translate(cx, cy); ctx.scale(k, k); ctx.translate(-cx, -cy);
      ctx.shadowColor = 'rgba(0,0,0,0.28)'; ctx.shadowBlur = 60 * u; ctx.shadowOffsetY = 24 * u;
      rrect(ctx, box.x, box.y, box.w, box.h, 22 * u);
      ctx.fillStyle = cornerColor(img); ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.clip();
      if (reveal == null) {
        ctx.drawImage(img, box.x, box.y, box.w, box.h);
      } else {
        // The board builds in bands from the top, each sliding up into place.
        const bands = 6;
        for (let i = 0; i < bands; i++) {
          const p = ease((reveal - i * 0.11) / 0.45);
          if (p <= 0) continue;
          const sy = img.height * i / bands, sh = img.height / bands;
          const dy = box.y + box.h * i / bands, dh = box.h / bands;
          ctx.save();
          ctx.globalAlpha = alpha * p;
          ctx.beginPath(); ctx.rect(box.x, dy, box.w, dh + 1); ctx.clip();
          ctx.drawImage(img, 0, sy, img.width, sh, box.x, dy + (1 - p) * 40 * u, box.w, dh);
          ctx.restore();
        }
      }
      ctx.restore();
    };
    const chip = (text, sub, alpha, i, n) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `600 ${Math.round(30 * u)}px -apple-system, "Inter", system-ui, sans-serif`;
      const label = text;
      const tw = ctx.measureText(label).width;
      const numTxt = String(i + 1).padStart(2, '0');
      ctx.font = `500 ${Math.round(22 * u)}px ui-monospace, "SF Mono", Menlo, monospace`;
      const nw = ctx.measureText(numTxt).width;
      const pw = tw + nw + 76 * u, ph = 64 * u;
      const box = cardBox();
      const px = (W - pw) / 2, py = Math.min(H - ph - 48 * u, box.y + box.h + (vert ? 56 : 30) * u);
      rrect(ctx, px, py, pw, ph, ph / 2);
      ctx.fillStyle = 'rgba(16,16,18,0.86)'; ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.textAlign = 'left';
      ctx.fillText(numTxt, px + 28 * u, py + ph / 2 + 8 * u);
      ctx.font = `600 ${Math.round(30 * u)}px -apple-system, "Inter", system-ui, sans-serif`;
      ctx.fillStyle = '#fff';
      ctx.fillText(label, px + 28 * u + nw + 20 * u, py + ph / 2 + 10 * u);
      // progress dots
      const dw = 10 * u, gap = 12 * u, total = n * dw + (n - 1) * gap;
      for (let d = 0; d < n; d++) {
        ctx.beginPath();
        ctx.arc((W - total) / 2 + d * (dw + gap) + dw / 2, py + ph + 30 * u, dw / 2, 0, Math.PI * 2);
        ctx.fillStyle = d === i ? t.ink : hexA(t.ink, 0.22);
        ctx.fill();
      }
      ctx.restore();
    };
    const backdrop = color => {
      ctx.fillStyle = color; ctx.fillRect(0, 0, W, H);
      const g = ctx.createRadialGradient(W * 0.3, H * 0.2, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.8);
      g.addColorStop(0, 'rgba(255,255,255,0.10)'); g.addColorStop(1, 'rgba(0,0,0,0.10)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    };

    if (ms < T1) {
      // 1. Title card: the name rises in, the tagline follows, the pattern band grows.
      const p = reduce ? 1 : ease(ms / 900);
      title(reduce ? clamp(ms / 300, 0, 1) : p, (1 - p) * 60 * u, ease((ms - 500) / 1200), ease((ms - 600) / 700));
    } else if (ms < T2) {
      // 2. The board builds in.
      const local = ms - T1;
      backdrop(t.canvas);
      if (A.pat) { ctx.save(); ctx.globalAlpha = 0.16; coverDraw(ctx, A.pat, 0, 0, W, H); ctx.restore(); }
      const box = cardBox();
      const k = reduce ? 1 : 0.94 + 0.06 * ease(local / 1100);
      drawCard(A.own, box, 1, k, reduce ? null : clamp(local / 1700, 0, 1.2));
      if (local < 450) { ctx.globalAlpha = 1 - local / 450; title(1, 0, 1, 1); ctx.globalAlpha = 1; }
    } else if (ms < T3) {
      // 3. Six aesthetics, cross-faded.
      const n = A.sweep.length || 1;
      const seg = (T3 - T2) / n;
      const local = ms - T2;
      const i = Math.min(n - 1, Math.floor(local / seg));
      const within = local - i * seg;
      const fade = reduce ? 180 : 380;
      const cur = A.sweep[i], prev = i > 0 ? A.sweep[i - 1] : { cv: A.own, bg: A.ownBg, name: '' };
      const a = clamp(within / fade, 0, 1);
      backdrop(prev.bg);
      ctx.save(); ctx.globalAlpha = a; backdrop(cur.bg); ctx.restore();
      const box = cardBox();
      const kick = reduce ? 1 : 1 + 0.012 * Math.sin(Math.PI * clamp(within / seg, 0, 1));
      drawCard(prev.cv, box, 1, 1, null);
      drawCard(cur.cv, box, a, kick, null);
      chip(cur.name, cur.desc, clamp(within / 200, 0, 1), i, n);
    } else {
      // 4. End card.
      const local = ms - T3;
      const last = A.sweep[A.sweep.length - 1];
      const a = reduce ? clamp(local / 200, 0, 1) : ease(local / 600);
      if (last) { backdrop(last.bg); drawCard(last.cv, cardBox(), 1 - a, 1, null); }
      ctx.save(); ctx.globalAlpha = a;
      title(1, (1 - a) * 30 * u, 1, ease((local - 250) / 500));
      // swatches + credit
      const keys = ['primary', 'secondary', 'accent', 'ink'];
      const r = 26 * u, gap = 18 * u, total = keys.length * r * 2 + (keys.length - 1) * gap;
      const y = H * (vert ? 0.62 : 0.70);
      keys.forEach((k2, j) => {
        const p = reduce ? 1 : ease((local - 350 - j * 90) / 400);
        ctx.beginPath();
        ctx.arc((W - total) / 2 + r + j * (2 * r + gap), y, r * p, 0, Math.PI * 2);
        ctx.fillStyle = t[k2]; ctx.fill();
      });
      ctx.globalAlpha = a * 0.6;
      ctx.fillStyle = t.ink;
      ctx.textAlign = 'center';
      ctx.font = `500 ${Math.round(22 * u)}px -apple-system, "Inter", system-ui, sans-serif`;
      ctx.fillText('Made with Branding Designer', W / 2, y + 80 * u);
      ctx.restore();
    }
    ctx.restore();
  }

  async function makeReel(shape) {
    if (Share.busy) return;
    shape = SHAPES[shape] ? shape : 'vertical';
    Share.busy = true;
    const J = job(shape === 'vertical' ? 'Making the vertical video' : 'Making the horizontal video');
    let rec = null;
    try {
      const A = await reelAssets(shape, J);
      const { W, H } = A.S;
      const cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      cv.className = 'sh-reel-cv';
      const ctx = cv.getContext('2d');
      drawReel(ctx, A, 0);
      J.preview(cv);
      const mime = pickMime();
      const canStream = typeof cv.captureStream === 'function';
      const base = `${slug()}-reel-${shape}`;
      if (mime && canStream) {
        J.set(0.42, 'Recording 15 seconds');
        const stream = cv.captureStream(30);
        const chunks = [];
        rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: shape === 'vertical' ? 10e6 : 12e6 });
        rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
        const stopped = new Promise(res => { rec.onstop = res; });
        rec.start(500);
        const t0 = performance.now();
        await new Promise((res, rej) => {
          const tick = () => {
            if (J.cancelled) { rej(CANCEL); return; }
            const ms = performance.now() - t0;
            drawReel(ctx, A, Math.min(ms, REEL_MS));
            J.set(0.42 + 0.56 * Math.min(1, ms / REEL_MS), `Recording: ${Math.min(15, Math.floor(ms / 1000))} of 15 seconds`);
            if (ms >= REEL_MS + 120) res(); else requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
        rec.stop();
        await stopped;
        stream.getTracks().forEach(tr => tr.stop());
        const type = mime.split(';')[0];
        const blob = new Blob(chunks, { type });
        const ext = type === 'video/mp4' ? 'mp4' : 'webm';
        if (!blob.size) throw new Error('empty recording');
        J.set(1, 'Saving');
        await saveBlob(blob, `${base}.${ext}`);
        Share.last = { kind: 'reel', mode: 'video', shape, mime: type, name: `${base}.${ext}`, bytes: blob.size, width: W, height: H, ms: REEL_MS };
        J.done();
        toast(`Video saved (${ext === 'mp4' ? 'MP4' : 'WebM'}, 15 seconds)`);
      } else {
        // No recorder in this engine: a numbered frame sequence and a note on joining it.
        const fps = 12, count = Math.round(REEL_MS / 1000 * fps);
        batch('start');
        try {
          for (let f = 0; f < count; f++) {
            J.check();
            drawReel(ctx, A, f * 1000 / fps);
            await saveBlob(await canvasBlob(cv), `${base}-frame-${String(f + 1).padStart(3, '0')}.png`);
            J.set(0.42 + 0.56 * (f + 1) / count, `Saving frame ${f + 1} of ${count}`);
            await sleep(0);
          }
          const note = `How to make the video\n\nThese ${count} pictures are the frames of a 15-second video of ${B4(A)} at ${fps} frames a second, ${W} by ${H} pixels.\nThis browser could not record video directly, so the frames were saved instead.\n\nTo join them into a video:\n- In the Branding Designer Mac app on macOS 14.1 or later, use Share > Video again: it records the video directly.\n- Or, with ffmpeg installed, run this in the folder with the frames:\n  ffmpeg -framerate ${fps} -i ${base}-frame-%03d.png -c:v libx264 -pix_fmt yuv420p ${base}.mp4\n- Or drop the frames into any video editor as an image sequence at ${fps} frames a second.\n`;
          await saveBlob(new Blob([note], { type: 'text/plain' }), `${base}-how-to-make-the-video.txt`);
        } finally { batch('end'); }
        Share.last = { kind: 'reel', mode: 'frames', shape, frames: count, fps, width: W, height: H };
        J.done();
        toast(`Saved ${count} frames and a note on making the video`);
      }
      return Share.last;
    } catch (err) {
      try { if (rec && rec.state !== 'inactive') rec.stop(); } catch (e) { /* already stopped */ }
      J.done();
      if (err !== CANCEL) { console.error('reel failed', err); toast('The video could not be made'); }
      else toast('Video cancelled');
      return null;
    } finally {
      Share.busy = false;
    }
  }
  const B4 = A => A.B.name;

  /* ================================================================
     3. Pictures (mockup scenes)
     ================================================================ */

  function scene(w, h, k) {
    const cv = document.createElement('canvas');
    cv.width = Math.round(w * k); cv.height = Math.round(h * k);
    const ctx = cv.getContext('2d');
    ctx.scale(k, k);
    ctx.imageSmoothingQuality = 'high';
    return { cv, ctx };
  }

  // The brand mark: the logo if there is one, else the initial in the heading face.
  function drawMark(ctx, P, x, y, s, bg, fg, radius) {
    ctx.save();
    rrect(ctx, x, y, s, s, radius == null ? s * 0.22 : radius);
    ctx.fillStyle = bg; ctx.fill();
    ctx.clip();
    if (P.logo) {
      const pad = s * 0.16;
      const k = Math.min((s - 2 * pad) / P.logo.width, (s - 2 * pad) / P.logo.height);
      const lw = P.logo.width * k, lh = P.logo.height * k;
      ctx.drawImage(P.logo, x + (s - lw) / 2, y + (s - lh) / 2, lw, lh);
    } else {
      ctx.fillStyle = fg;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = fontSpec(P.B.head, 700, s * 0.56);
      ctx.fillText(P.B.initial, x + s / 2, y + s / 2 + s * 0.03);
    }
    ctx.restore();
  }

  function wordmarkPill(ctx, P, cx, cy, px, opts) {
    const { B } = P;
    const t = B.t;
    ctx.save();
    ctx.font = fontSpec(B.head, 700, px);
    const tw = Math.min(ctx.measureText(B.name).width, (opts && opts.maxW) || 1e9);
    const markS = px * 1.5;
    const padX = px * 0.9, gap = px * 0.55;
    const w = padX * 2 + markS + gap + tw, h = markS + px * 0.8;
    const x = (opts && opts.align === 'right') ? cx - w : cx - w / 2, y = cy - h / 2;
    ctx.shadowColor = 'rgba(0,0,0,0.18)'; ctx.shadowBlur = px * 0.8; ctx.shadowOffsetY = px * 0.2;
    rrect(ctx, x, y, w, h, h / 2);
    ctx.fillStyle = hexA(t.canvas, 0.94); ctx.fill();
    ctx.shadowColor = 'transparent';
    drawMark(ctx, P, x + padX * 0.6, y + (h - markS) / 2, markS, t.primary, t.onPrimary, markS / 2);
    ctx.fillStyle = t.ink;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.font = fontSpec(B.head, 700, px);
    ctx.fillText(B.name, x + padX * 0.6 + markS + gap, y + h / 2 + px * 0.04, tw);
    ctx.restore();
  }

  async function pictureParts() {
    const B = brandInfo();
    await loadCanvasFonts(B);
    const pats = patternEntries(B.st, B.def);
    let logo = null;
    if (B.logo) { try { logo = await loadImage(B.logo); } catch (err) { logo = null; } }
    return { B, pats, logo };
  }
  const patFor = (P, w, h, i) => (P.pats.length ? patternCanvas(P.pats[(i || 0) % P.pats.length], P.B.t, w, h, 1) : null);

  // Business card: front (mark + name on the primary colour) and back (pattern), on a desk.
  function drawCardScene(P) {
    const { B } = P, t = B.t;
    const W = 1600, H = 1000, k = 2;
    const { cv, ctx } = scene(W, H, k);
    // the surface
    const surf = lum(t.canvas) > 0.5 ? t.canvas : '#e8e6e1';
    ctx.fillStyle = surf; ctx.fillRect(0, 0, W, H);
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0.12)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const cw = 700, ch = 400, r = 16;
    const card = (cx, cy, rot, paint) => {
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(rot);
      ctx.shadowColor = 'rgba(0,0,0,0.22)'; ctx.shadowBlur = 50; ctx.shadowOffsetX = 8; ctx.shadowOffsetY = 26;
      rrect(ctx, -cw / 2, -ch / 2, cw, ch, r); ctx.fillStyle = '#fff'; ctx.fill();
      ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2; ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.clip();
      ctx.translate(-cw / 2, -ch / 2);
      paint(ctx);
      // paper sheen
      const s = ctx.createLinearGradient(0, 0, cw, ch);
      s.addColorStop(0, 'rgba(255,255,255,0.14)'); s.addColorStop(0.5, 'rgba(255,255,255,0)'); s.addColorStop(1, 'rgba(0,0,0,0.06)');
      ctx.fillStyle = s; ctx.fillRect(0, 0, cw, ch);
      ctx.restore();
    };
    const back = patFor(P, cw * 2, ch * 2, 0);
    card(560, 400, -0.12, c => {
      if (back) c.drawImage(back, 0, 0, cw, ch); else { c.fillStyle = t.secondary; c.fillRect(0, 0, cw, ch); }
      drawMark(c, P, cw / 2 - 44, ch / 2 - 44, 88, t.canvas, t.ink, 44);
    });
    card(1010, 590, 0.05, c => {
      c.fillStyle = t.primary; c.fillRect(0, 0, cw, ch);
      c.fillStyle = t.accent; c.fillRect(cw - 18, 0, 18, ch);
      drawMark(c, P, 48, 46, 76, t.canvas, t.ink, 16);
      c.fillStyle = t.onPrimary; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
      const f = fitText(c, B.name, B.head, 700, 54, cw - 110, 26);
      c.font = fontSpec(B.head, 700, f.size);
      const baseY = ch - 134 - (f.lines.length - 1) * f.size;
      f.lines.forEach((l, i) => c.fillText(l, 48, baseY + i * f.size * 1.05));
      if (B.tagline) {
        c.globalAlpha = 0.85;
        const g2 = fitText(c, B.tagline, B.body, 400, 22, cw - 110, 14);
        c.font = fontSpec(B.body, 400, g2.size);
        c.fillText(g2.lines.join(' '), 48, ch - 92, cw - 110);
      }
      c.globalAlpha = 0.7;
      c.font = fontSpec(B.body, 400, 17);
      const mail = typeof bdMailSlug === 'function' ? bdMailSlug(B.name) : 'brand';
      c.fillText(`hello@${mail}.com`, 48, ch - 46);
      c.globalAlpha = 1;
    });
    return cv;
  }

  const ICON_GLYPHS = ['ring', 'bars', 'grid', 'tri', 'dot', 'wave', 'square', 'cross', 'arc', 'lines', 'half', 'diamond', 'plus', 'stack', 'pill', 'sun'];
  const ICON_NAMES = ['Notes', 'Camera', 'Clock', 'Maps', 'Music', 'Photos', 'Weather', 'Files', 'Calendar', 'Mail', 'Books', 'Health', 'Wallet', 'News', 'Podcasts', 'Settings'];
  function glyph(ctx, kind, x, y, s, col) {
    ctx.save();
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = s * 0.07; ctx.lineCap = 'round';
    const c = s / 2, r = s * 0.22;
    ctx.translate(x, y);
    ctx.beginPath();
    switch (kind) {
      case 'ring': ctx.arc(c, c, r, 0, Math.PI * 2); ctx.stroke(); break;
      case 'bars': [0, 1, 2].forEach(i => ctx.fillRect(s * 0.3 + i * s * 0.15, s * (0.62 - i * 0.1), s * 0.09, s * (0.08 + i * 0.1) + s * 0.08)); break;
      case 'grid': [0, 1].forEach(i => [0, 1].forEach(j => ctx.fillRect(s * 0.3 + i * s * 0.22, s * 0.3 + j * s * 0.22, s * 0.17, s * 0.17))); break;
      case 'tri': ctx.moveTo(c, s * 0.28); ctx.lineTo(s * 0.72, s * 0.7); ctx.lineTo(s * 0.28, s * 0.7); ctx.closePath(); ctx.fill(); break;
      case 'dot': ctx.arc(c, c, r * 0.8, 0, Math.PI * 2); ctx.fill(); break;
      case 'wave': ctx.moveTo(s * 0.26, c); ctx.bezierCurveTo(s * 0.4, s * 0.3, s * 0.5, s * 0.7, s * 0.74, c); ctx.stroke(); break;
      case 'square': rrect(ctx, s * 0.3, s * 0.3, s * 0.4, s * 0.4, s * 0.06); ctx.stroke(); break;
      case 'cross': ctx.moveTo(s * 0.32, s * 0.32); ctx.lineTo(s * 0.68, s * 0.68); ctx.moveTo(s * 0.68, s * 0.32); ctx.lineTo(s * 0.32, s * 0.68); ctx.stroke(); break;
      case 'arc': ctx.arc(c, s * 0.62, r * 1.2, Math.PI, 0); ctx.stroke(); break;
      case 'lines': [0, 1, 2].forEach(i => { ctx.moveTo(s * 0.3, s * (0.36 + i * 0.14)); ctx.lineTo(s * (0.7 - i * 0.08), s * (0.36 + i * 0.14)); }); ctx.stroke(); break;
      case 'half': ctx.arc(c, c, r, Math.PI / 2, Math.PI * 1.5); ctx.fill(); ctx.beginPath(); ctx.arc(c, c, r, 0, Math.PI * 2); ctx.stroke(); break;
      case 'diamond': ctx.moveTo(c, s * 0.28); ctx.lineTo(s * 0.72, c); ctx.lineTo(c, s * 0.72); ctx.lineTo(s * 0.28, c); ctx.closePath(); ctx.stroke(); break;
      case 'plus': ctx.moveTo(c, s * 0.3); ctx.lineTo(c, s * 0.7); ctx.moveTo(s * 0.3, c); ctx.lineTo(s * 0.7, c); ctx.stroke(); break;
      case 'stack': [0, 1, 2].forEach(i => { rrect(ctx, s * 0.3, s * (0.3 + i * 0.13), s * 0.4, s * 0.09, s * 0.03); ctx.fill(); ctx.beginPath(); }); break;
      case 'pill': rrect(ctx, s * 0.26, s * 0.4, s * 0.48, s * 0.2, s * 0.1); ctx.fill(); break;
      default: ctx.arc(c, c, r * 0.6, 0, Math.PI * 2); ctx.fill(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.moveTo(c + Math.cos(a) * r * 0.95, c + Math.sin(a) * r * 0.95); ctx.lineTo(c + Math.cos(a) * r * 1.35, c + Math.sin(a) * r * 1.35); } ctx.stroke();
    }
    ctx.restore();
  }

  // Phone home screen: the brand's app icon among plain neutral icons, on its pattern.
  function drawHomeScene(P) {
    const { B } = P, t = B.t;
    const W = 1000, H = 1400, k = 2;
    const { cv, ctx } = scene(W, H, k);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, hexA(t.canvas, 1)); g.addColorStop(1, lum(t.canvas) > 0.5 ? '#d9d6d0' : '#0d0d0f');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const pw = 560, ph = 1160, px = (W - pw) / 2, py = (H - ph) / 2, pr = 88;
    // body + shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 70; ctx.shadowOffsetY = 36;
    rrect(ctx, px, py, pw, ph, pr); ctx.fillStyle = '#1b1b1d'; ctx.fill();
    ctx.restore();
    rrect(ctx, px + 2, py + 2, pw - 4, ph - 4, pr - 2); ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 2; ctx.stroke();
    const bz = 16, sx = px + bz, sy = py + bz, sw = pw - 2 * bz, sh = ph - 2 * bz;
    ctx.save();
    rrect(ctx, sx, sy, sw, sh, pr - bz); ctx.clip();
    const wall = patFor(P, sw * 2, sh * 2, 0);
    if (wall) ctx.drawImage(wall, sx, sy, sw, sh); else { ctx.fillStyle = t.primary; ctx.fillRect(sx, sy, sw, sh); }
    ctx.fillStyle = 'rgba(0,0,0,0.24)'; ctx.fillRect(sx, sy, sw, sh);
    // status bar + island
    ctx.fillStyle = '#fff';
    ctx.font = '600 21px -apple-system, "Inter", system-ui, sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 6;
    ctx.fillText('9:41', sx + 52, sy + 40);
    [0, 1, 2, 3].forEach(i => ctx.fillRect(sx + sw - 136 + i * 8, sy + 46 - (i + 1) * 4.5, 5, (i + 1) * 4.5));
    rrect(ctx, sx + sw - 92, sy + 31, 40, 19, 6); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    rrect(ctx, sx + sw - 89, sy + 34, 28, 13, 3); ctx.fill();
    ctx.shadowColor = 'transparent';
    rrect(ctx, sx + sw / 2 - 62, sy + 22, 124, 36, 18); ctx.fillStyle = '#000'; ctx.fill();
    // icon grid: 4 x 5, the brand's icon second row, second column
    const cols = 4, is = 92, gapX = (sw - 2 * 34 - cols * is) / (cols - 1), top = sy + 110, rowH = 142;
    let n = 0;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < cols; col++) {
        const x = sx + 34 + col * (is + gapX), y = top + row * rowH;
        const brand = row === 1 && col === 1;
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 5;
        if (brand) {
          drawMark(ctx, P, x, y, is, t.primary, t.onPrimary, is * 0.23);
        } else {
          rrect(ctx, x, y, is, is, is * 0.23);
          ctx.fillStyle = 'rgba(246,246,248,0.92)'; ctx.fill();
          ctx.shadowColor = 'transparent';
          glyph(ctx, ICON_GLYPHS[n % ICON_GLYPHS.length], x, y, is, '#6e6e76');
        }
        ctx.restore();
        ctx.save();
        ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
        ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 5;
        ctx.font = (brand ? '600 ' : '500 ') + '17px -apple-system, "Inter", system-ui, sans-serif';
        let label = brand ? B.name : ICON_NAMES[n % ICON_NAMES.length];
        while (ctx.measureText(label).width > is + 22 && label.length > 4) label = label.slice(0, -2) + '…';
        if (label.endsWith('……')) label = label.replace(/…+$/, '…');
        ctx.fillText(label, x + is / 2, y + is + 27);
        ctx.restore();
        if (!brand) n++;
      }
    }
    // page dots + dock
    const dockH = 128, dockY = sy + sh - dockH - 26;
    [0, 1, 2].forEach(i => { ctx.beginPath(); ctx.arc(sx + sw / 2 - 16 + i * 16, dockY - 26, 4.5, 0, Math.PI * 2); ctx.fillStyle = i === 0 ? '#fff' : 'rgba(255,255,255,0.45)'; ctx.fill(); });
    rrect(ctx, sx + 18, dockY, sw - 36, dockH, 44); ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.fill();
    for (let i = 0; i < 4; i++) {
      const x = sx + 34 + i * (is + gapX), y = dockY + (dockH - is) / 2;
      rrect(ctx, x, y, is, is, is * 0.23); ctx.fillStyle = 'rgba(246,246,248,0.92)'; ctx.fill();
      glyph(ctx, ICON_GLYPHS[(n + i + 3) % ICON_GLYPHS.length], x, y, is, '#6e6e76');
    }
    rrect(ctx, sx + sw / 2 - 70, sy + sh - 14, 140, 5, 3); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fill();
    ctx.restore();
    // side buttons
    ctx.fillStyle = '#2a2a2d';
    rrect(ctx, px - 4, py + 230, 5, 70, 2); ctx.fill();
    rrect(ctx, px - 4, py + 320, 5, 70, 2); ctx.fill();
    rrect(ctx, px + pw - 1, py + 280, 5, 110, 2); ctx.fill();
    return cv;
  }

  function drawWallpaper(P, W, H, where) {
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    const pat = patFor(P, W, H, 0);
    if (pat) ctx.drawImage(pat, 0, 0); else { ctx.fillStyle = P.B.t.primary; ctx.fillRect(0, 0, W, H); }
    if (where === 'phone') wordmarkPill(ctx, P, W / 2, H - 300, 40, { maxW: W * 0.6 });
    else wordmarkPill(ctx, P, W - 72, H - 150, 30, { align: 'right', maxW: W * 0.3 });
    return cv;
  }

  // Comparison poster: the brand in twelve aesthetics, four by three, with labels.
  async function drawPoster(P, J, from, to) {
    const { B } = P;
    const keys = [B.def.key.replace(/^classic:/, '')].concat(pickAesthetics(17, B.def.key.replace(/^classic:/, '')));
    const BW = 900, BH = 1125, cellW = 420, cellH = cellW * BH / BW, gap = 28, m = 72, head = 300, lab = 64;
    const W = m * 2 + 4 * cellW + 3 * gap, H = head + 3 * (cellH + lab) + 2 * gap + 150;
    // 2x, unless that passes WebKit's canvas limit (about 16.7 million pixels).
    const k = Math.min(2, Math.floor(Math.sqrt(16e6 / (W * H)) * 100) / 100);
    const ownR = await rasterBoard(null, BW, BH, (cellW * k) / BW, J);
    if (tainted(ownR.cv)) ownR.cv = plainBoard(B, BW, BH, (cellW * k) / BW);
    const rest = await rasterMany(keys.slice(1), 11, BW, BH, (cellW * k) / BW, J,
      (i, name) => J.set(from + (to - from) * ((i + 1) / 12), `Drawing ${name} (${i + 2} of 12)`));
    const cells = [ownR].concat(rest);
    const { cv, ctx } = scene(W, H, k);
    ctx.fillStyle = '#111113'; ctx.fillRect(0, 0, W, H);
    // header
    ctx.fillStyle = '#f4f2ee'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    const f = fitText(ctx, B.name, B.head, 700, 104, W - 2 * m - 360, 48);
    ctx.font = fontSpec(B.head, 700, f.size);
    ctx.fillText(f.lines.join(' '), m, m + f.size * 0.92, W - 2 * m - 360);
    ctx.font = '500 26px -apple-system, "Inter", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(244,242,238,0.62)';
    ctx.fillText(`One brand, ${cells.length} design languages`, m, m + f.size + 56);
    // swatches, right
    const sk = ['canvas', 'ink', 'primary', 'secondary', 'accent'];
    sk.forEach((kk, i) => {
      ctx.beginPath(); ctx.arc(W - m - 30 - (sk.length - 1 - i) * 62, m + 44, 26, 0, Math.PI * 2);
      ctx.fillStyle = B.t[kk]; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1.5; ctx.stroke();
    });
    ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(m, head - 34); ctx.lineTo(W - m, head - 34); ctx.stroke();
    cells.forEach((c, i) => {
      const col = i % 4, row = Math.floor(i / 4);
      const x = m + col * (cellW + gap), y = head + row * (cellH + lab + gap);
      ctx.save();
      rrect(ctx, x, y, cellW, cellH, 12); ctx.clip();
      ctx.drawImage(c.cv, x, y, cellW, cellH);
      ctx.restore();
      rrect(ctx, x + 0.5, y + 0.5, cellW - 1, cellH - 1, 12); ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.stroke();
      ctx.textAlign = 'left';
      ctx.font = '500 17px ui-monospace, "SF Mono", Menlo, monospace';
      ctx.fillStyle = 'rgba(244,242,238,0.45)';
      ctx.fillText(String(i + 1).padStart(2, '0'), x, y + cellH + 36);
      ctx.font = '600 22px -apple-system, "Inter", system-ui, sans-serif';
      ctx.fillStyle = '#f4f2ee';
      ctx.fillText(c.def.name, x + 38, y + cellH + 36, cellW - 38);
      if (i === 0) {
        ctx.font = '500 15px -apple-system, "Inter", system-ui, sans-serif';
        ctx.fillStyle = B.t.accent;
        ctx.textAlign = 'right';
        ctx.fillText('THE BRAND', x + cellW, y + cellH + 36);
      }
    });
    ctx.textAlign = 'left';
    ctx.font = '500 18px -apple-system, "Inter", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(244,242,238,0.4)';
    ctx.fillText(B.tagline || '', m, H - 72, W / 2);
    ctx.textAlign = 'right';
    ctx.fillText('Made with Branding Designer', W - m, H - 72);
    return cv;
  }

  const PICTURES = {
    card: { label: 'Business card', file: 'business-card' },
    home: { label: 'Phone home screen', file: 'phone-home-screen' },
    phone: { label: 'Phone wallpaper', file: 'phone-wallpaper' },
    desktop: { label: 'Desktop wallpaper', file: 'desktop-wallpaper' },
    poster: { label: 'Poster', file: 'poster-12-looks' },
  };

  async function makePictures(which) {
    if (Share.busy) return;
    const list = which === 'all' ? Object.keys(PICTURES) : [which].filter(k => PICTURES[k]);
    if (!list.length) return;
    Share.busy = true;
    const J = job(list.length > 1 ? 'Making the pictures' : `Making the ${PICTURES[list[0]].label.toLowerCase()}`);
    const saved = [];
    try {
      const P = await pictureParts();
      const outs = [];
      for (let i = 0; i < list.length; i++) {
        const kind = list[i];
        const from = i / list.length, to = (i + 1) / list.length;
        J.set(from, `Drawing the ${PICTURES[kind].label.toLowerCase()}`);
        await sleep(30);
        J.check();
        let cv;
        if (kind === 'card') cv = drawCardScene(P);
        else if (kind === 'home') cv = drawHomeScene(P);
        else if (kind === 'phone') cv = drawWallpaper(P, 1290, 2796, 'phone');
        else if (kind === 'desktop') cv = drawWallpaper(P, 2560, 1440, 'desktop');
        else cv = await drawPoster(P, J, from, to);
        outs.push({ kind, cv });
        J.set(to);
      }
      J.set(1, 'Saving');
      if (outs.length > 1) batch('start');
      try {
        for (const o of outs) {
          const blob = await canvasBlob(o.cv);
          const name = `${slug()}-${PICTURES[o.kind].file}.png`;
          await saveBlob(blob, name);
          saved.push({ kind: o.kind, name, width: o.cv.width, height: o.cv.height, bytes: blob.size });
        }
      } finally { if (outs.length > 1) batch('end'); }
      Share.last = { kind: 'pictures', saved };
      J.done();
      toast(saved.length > 1 ? `${saved.length} pictures saved` : `${PICTURES[saved[0].kind].label} saved`);
      return Share.last;
    } catch (err) {
      J.done();
      if (err !== CANCEL) { console.error('pictures failed', err && err.name, err && err.message, err); toast('The pictures could not be made'); }
      else toast('Cancelled');
      return null;
    } finally {
      Share.busy = false;
    }
  }

  /* ---------------- the menu ---------------- */

  function wireMenu() {
    const btn = document.getElementById('shareBtn');
    const menu = document.getElementById('shareMenu');
    if (!btn || !menu) return;
    const items = () => [...menu.querySelectorAll('[role="menuitem"]')].filter(el => !el.disabled && !el.hidden);
    const open = () => {
      menu.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      const first = items()[0];
      if (first) first.focus({ preventScroll: true });
    };
    const close = refocus => {
      if (menu.hidden) return;
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      if (refocus) btn.focus({ preventScroll: true });
    };
    btn.addEventListener('click', e => { e.stopPropagation(); if (menu.hidden) open(); else close(false); });
    document.addEventListener('click', e => { if (!menu.hidden && !menu.contains(e.target) && e.target !== btn) close(false); });
    menu.addEventListener('keydown', e => {
      const list = items();
      const at = list.indexOf(document.activeElement);
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); (list[at + 1] || list[0]).focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); (list[at - 1] || list[list.length - 1]).focus(); }
      else if (e.key === 'Home') { e.preventDefault(); list[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); list[list.length - 1].focus(); }
      else if (e.key === 'Tab') close(false);
    });
    menu.addEventListener('click', e => {
      const it = e.target.closest('[role="menuitem"]');
      if (!it) return;
      close(false);
      const a = it.dataset.share;
      if (!a) return;   // e.g. the colour palette item, wired by app.js
      if (a === 'site') makeSite();
      else if (a === 'reel-v') makeReel('vertical');
      else if (a === 'reel-h') makeReel('horizontal');
      else if (a.indexOf('pic-') === 0) makePictures(a.slice(4));
    });
  }

  window.Share = Share;
  Share.site = makeSite;
  Share.reel = makeReel;
  Share.picture = makePictures;
  Share._draw = { drawReel, reelAssets, rasterBoard, pickAesthetics };
  window.Show.share = { site: makeSite, reel: makeReel, picture: makePictures };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireMenu);
  else wireMenu();
})();
