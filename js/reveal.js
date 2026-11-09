/* ---------------------------------------------------------------------
   reveal.js — the show features that make switching and arriving feel
   like a transformation (docs/commercial-brainstorm.md ideas 1, 4, 5, 6, 29):

     Show.reveal()      the board assembles itself full-window (new brands get it)
     Show.morphBoard()  render hook: an aesthetic switch morphs (View Transitions)
     Show.spaceDown()   Space shortcut hook: tap shuffles, hold spins a reel
     Show.worlds()      zoom out to the brand in every aesthetic, click one to zoom in

   Timings and easings come from the tokens in css/motion.css. With
   prefers-reduced-motion every move becomes a short cross-fade, and when the
   page has CSS animations switched off the sequences are skipped outright.
------------------------------------------------------------------------ */

(function () {
  'use strict';
  const Show = window.Show = window.Show || {};

  /* ---------------- shared helpers ---------------- */

  let busy = null;   // 'reveal' | 'worlds' | 'spin' while one of them owns the board
  let closeActive = null;   // closes the open reveal or worlds overlay (Show.dismiss)

  const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const tok = (name, fallback) => {
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
    return Number.isFinite(v) ? v : fallback;
  };
  const after = ms => new Promise(r => setTimeout(r, ms));
  const nextFrame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  const inEditor = () => document.body.dataset.view === 'editor' && !!document.getElementById('previewCard');
  const curView = () => (typeof boardView !== 'undefined' ? boardView : 'board');

  // False when the page has CSS animations switched off (a stylesheet forcing
  // animation:none): nothing would move, so the sequences end at once.
  function animationsOn() {
    const p = document.createElement('div');
    p.className = 'm-probe';
    p.style.cssText = 'position:fixed;width:0;height:0;visibility:hidden;animation:m-fade 1s infinite';
    document.body.appendChild(p);
    const on = typeof p.getAnimations === 'function' && p.getAnimations().length > 0;
    p.remove();
    return on;
  }

  // Every aesthetic, or the curated set in showcase mode (js/showcase.js).
  const curated = list => (typeof showcaseFilter === 'function' ? showcaseFilter(list) : list);

  function ensureBoardView() {
    if (curView() !== 'board' && typeof setBoardView === 'function') setBoardView('board');
  }

  // The current board, exactly as renderMainBoard draws it, into `box`.
  function drawCurrentBoard(box) {
    setBoardFonts(box);
    const v = abView();
    box.innerHTML = boardHtml(v.state, v.def);
    finishBlend(box.firstElementChild, v.def);
  }
  function finishBlend(el, def) {
    if (el && def.blend && typeof blendClearArtText === 'function') {
      blendClearArtText(el);
      if (typeof blendLegibility === 'function') blendLegibility(el);
    }
  }

  const camTransform = c => `translate(${c.x}px, ${c.y}px) scale(${c.s})`;

  /* ---------------- 1. brand reveal ---------------- */

  // Each part of the board gets a move (data-m) and a start time (--m-delay).
  function mark(el, move, delay) {
    if (!el) return;
    el.dataset.m = move;
    el.style.setProperty('--m-delay', Math.round(delay) + 'ms');
  }

  // The headline sets letter by letter. Text inside a gradient-clipped headline
  // can't fade per letter (the clip ignores animated children), so it types in
  // with a stepped wipe instead.
  function setHeadline(h2, start, span) {
    if (!h2) return start;
    const text = h2.textContent.replace(/\s+/g, '');
    const n = text.length;
    if (!n) return start;
    const clipped = [h2].concat(Array.from(h2.querySelectorAll('*'))).some(el => {
      const cs = getComputedStyle(el);
      return cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text';
    });
    if (clipped || n > 90) {
      mark(h2, 'wipe', start);
      h2.style.setProperty('animation-timing-function', `steps(${Math.min(n, 40)}, end)`, 'important');
      return start + tok('--m-dur-draw', 1100);
    }
    const per = Math.max(18, Math.min(55, span / n));
    const walker = document.createTreeWalker(h2, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    let i = 0;
    nodes.forEach(node => {
      if (!node.nodeValue.trim()) return;
      const frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
        const word = document.createElement('span');
        word.className = 'm-word';
        for (const ch of part) {
          const c = document.createElement('span');
          c.className = 'm-ch';
          c.textContent = ch;
          mark(c, 'letter', start + i++ * per);
          word.appendChild(c);
        }
        frag.appendChild(word);
      });
      node.parentNode.replaceChild(frag, node);
    });
    return start + n * per;
  }

  // Stroked SVG shapes in the hero art draw along their path.
  function drawStrokes(art, start) {
    let count = 0;
    art.querySelectorAll('path, line, polyline, polygon, circle, ellipse, rect').forEach(el => {
      if (count >= 80) return;
      const cs = getComputedStyle(el);
      if (!cs.stroke || cs.stroke === 'none' || parseFloat(cs.strokeWidth) === 0) return;
      if (cs.strokeDasharray && cs.strokeDasharray !== 'none') return;
      el.setAttribute('pathLength', '1');
      mark(el, 'stroke', start + (count % 12) * 40);
      count++;
    });
  }

  // The staged timeline (ms). Durations of each move come from the tokens.
  const T = {
    surface: 150, head: 2050, rules: 800, paletteLabel: 950, swatches: 1050, swatchGap: 120,
    toHero: 1850, kicker: 2350, letters: 2450, lettersSpan: 1000, art: 2850, subcopy: 3500,
    toWhole: 3900, typeBlock: 4050, ui: 4250, uiGap: 110, foot: 4900, land: 5400,
  };

  function stageBoard(ab) {
    mark(ab, 'surface', T.surface);
    mark(ab.querySelector('.ab-head .ab-brand'), 'rise', T.head);
    mark(ab.querySelector('.ab-head .ab-tag'), 'fade', T.head + 150);   // seen as the camera arrives on the hero
    Array.from(ab.querySelectorAll('.ab-rule')).forEach((r, i) => mark(r, 'rule', T.rules + i * 90));

    const pal = ab.querySelector('.ab-palette');
    if (pal) {
      mark(pal.querySelector('.ab-labelrow'), 'fade', T.paletteLabel);
      Array.from(pal.querySelectorAll('.ab-swatch')).forEach((s, i) => mark(s, 'drop', T.swatches + i * T.swatchGap));
    }

    const hero = ab.querySelector('.ab-hero');
    if (hero) {
      mark(hero.querySelector('.ab-kicker'), 'rise', T.kicker);
      setHeadline(hero.querySelector('.ab-headline'), T.letters, T.lettersSpan);
      mark(hero.querySelector('.ab-subcopy'), 'rise', T.subcopy);
      const art = hero.querySelector('.ab-art');
      if (art) { mark(art, 'art', T.art); drawStrokes(art, T.art + 150); }
    }

    let t = T.typeBlock;
    const type = ab.querySelector('.ab-type');
    if (type) Array.from(type.children).forEach((c, i) => mark(c, 'rise', t + i * 90));

    t = T.ui;
    ab.querySelectorAll('.ab-sections .ab-sec').forEach(sec => {
      Array.from(sec.children).forEach(c => { mark(c, c.classList.contains('ab-labelrow') ? 'fade' : 'settle', t); t += T.uiGap; });
    });
    mark(ab.querySelector('.ab-foot'), 'fade', Math.max(T.foot, t));
  }

  // Camera framings for a board of width W and height H in a vw x vh window:
  // the whole board, and close-ups on the palette and on the hero (with the
  // head when the hero sits right under it).
  function framings(ab, W, H) {
    const vw = window.innerWidth, vh = window.innerHeight, pad = Math.min(48, vw * 0.04);
    const s = Math.min((vw - 2 * pad) / W, (vh - 2 * pad) / H, 1);
    const whole = { s, x: (vw - W * s) / 2, y: Math.max(pad, (vh - H * s) / 2) };
    const top0 = ab.getBoundingClientRect().top;
    const region = (top, bottom) => {
      const rh = bottom - top;
      const k = Math.min((vw - 2 * pad) / W, (vh - 2 * pad) / rh, 1.3);
      return { s: k, x: (vw - W * k) / 2, y: (vh - rh * k) / 2 - top * k };
    };
    const near = (el, extra) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return region(Math.max(0, r.top - top0 - extra), Math.min(H, r.bottom - top0 + extra));
    };
    let hero = whole;
    const h = ab.querySelector('.ab-hero');
    if (h) {
      let p = h.previousElementSibling;
      if (p && p.classList.contains('ab-rule')) p = p.previousElementSibling;
      hero = p && p.classList.contains('ab-head')
        ? region(0, h.getBoundingClientRect().bottom - top0 + 24)
        : near(h, 24);
    }
    const palette = near(ab.querySelector('.ab-palette'), 56) || whole;
    return { whole, hero, palette };
  }

  function reveal() {
    if (busy || !inEditor()) return Promise.resolve(false);
    ensureBoardView();
    const host = document.getElementById('previewCard');
    if (!host.firstElementChild) return Promise.resolve(false);

    if (reduced()) {
      host.animate([{ opacity: 0 }, { opacity: 1 }], { duration: tok('--m-dur-morph', 450), easing: 'ease-out' });
      return Promise.resolve(true);
    }

    busy = 'reveal';
    window.scrollTo(0, 0);
    const W = host.clientWidth;
    const ov = document.createElement('div');
    ov.className = 'm-reveal';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-label', 'Brand reveal');
    ov.innerHTML = '<div class="m-reveal-bg"></div><div class="m-reveal-cam"><div class="m-reveal-board" inert></div></div>'
      + '<p class="m-reveal-hint">Click or press Esc to skip</p>';
    const cam = ov.querySelector('.m-reveal-cam');
    const box = ov.querySelector('.m-reveal-board');
    box.style.width = W + 'px';
    cam.style.transition = 'none';
    document.body.appendChild(ov);
    drawCurrentBoard(box);
    document.body.classList.add('m-revealing');

    const ab = box.firstElementChild;
    const H = ab.getBoundingClientRect().height;
    const frame = framings(ab, W, H);
    stageBoard(ab);
    cam.style.transform = camTransform(frame.palette);

    let done;
    const finished = new Promise(r => { done = r; });
    const timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    let landing = false;

    // Each part hands its own styles back once it has arrived.
    ov.addEventListener('animationend', e => {
      if (e.target !== ov && e.target.dataset && e.target.dataset.m && /^m-/.test(e.animationName)) delete e.target.dataset.m;
    });

    function cleanup() {
      timers.forEach(clearTimeout);
      document.removeEventListener('keydown', onKey, true);
      ov.remove();
      document.body.classList.remove('m-revealing');
      busy = null;
      closeActive = null;
      done(true);
    }
    function land(fast) {
      if (landing) return;
      landing = true;
      timers.forEach(clearTimeout);
      ov.getAnimations({ subtree: true }).forEach(a => {
        if (/^m-/.test(a.animationName || '') && !a.target?.classList?.contains('m-reveal-bg')) { try { a.finish(); } catch (err) { /* infinite: leave it */ } }
      });
      const r = host.getBoundingClientRect();
      ov.classList.add('is-landing');
      if (fast) ov.classList.add('is-fast');
      cam.style.transition = '';
      cam.style.transform = camTransform({ s: 1, x: r.left, y: r.top });
      setTimeout(cleanup, fast ? tok('--m-dur-base', 320) : tok('--m-dur-camera', 1050));
    }
    function onKey(e) {
      if (e.key === 'Escape' || e.key === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        e.stopPropagation();
        if (!e.repeat) land(true);
      }
    }
    ov.addEventListener('click', () => land(true));
    document.addEventListener('keydown', onKey, true);
    closeActive = () => { land(true); return finished; };

    // Nothing animates (CSS animations switched off): end at once.
    if (!animationsOn()) { cleanup(); return finished; }

    // Let the brand's web fonts arrive before the headline sets (briefly; never blocks).
    const fontsReady = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, after(500)]) : Promise.resolve();
    fontsReady.then(nextFrame).then(() => {
      if (landing) return;
      cam.style.transition = '';
      at(T.toHero, () => { cam.style.transform = camTransform(frame.hero); });
      at(T.toWhole, () => { cam.style.transform = camTransform(frame.whole); });
      at(T.land, () => land(false));
    });
    return finished;
  }

  /* ---------------- 2. morphing aesthetic switch ---------------- */

  // What the board is "wearing": a change here (picker, prev/next, shuffle,
  // blend, Classic/Current, undo) morphs; edits to copy or colours render instantly.
  let lastLook = null;
  let activeMorph = null;
  const lookKey = () => {
    const s = state;
    return [s.aesthetic, s.aestheticVersion || 'current', s.blend ? JSON.stringify(s.blend) : '', curView()].join('|');
  };
  // Opening another brand or going to the library starts a new run: no morph across it.
  // The view switch is read synchronously (takeRecords) because openBrand renders right after it.
  const viewWatch = new MutationObserver(() => { lastLook = null; });
  viewWatch.observe(document.body, { attributes: true, attributeFilter: ['data-view'] });

  // The flood starts at the click that caused the switch, else the middle of the
  // board's visible part; its radius reaches the farthest window corner.
  let lastPointer = null;
  document.addEventListener('pointerdown', e => { lastPointer = { x: e.clientX, y: e.clientY, t: performance.now() }; }, true);
  function floodOrigin(host) {
    const vw = window.innerWidth, vh = window.innerHeight;
    let x, y;
    if (lastPointer && performance.now() - lastPointer.t < 1500) ({ x, y } = lastPointer);
    else {
      const r = host.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = (Math.max(0, r.top) + Math.min(vh, r.bottom)) / 2;
    }
    const r = Math.ceil(Math.hypot(Math.max(x, vw - x), Math.max(y, vh - y)));
    return { x: Math.round(x), y: Math.round(y), r };
  }

  /* Keep the reader where they are across a board re-render. renderAestheticBoard replaces the
     board's content, so the stage collapses for a moment and the browser clamps the scroll to the
     top. Pin the stage height, put the same section back at the same offset, then let go. */
  let holdTok = 0;        // a newer render cancels the previous hold's pending frames
  let holdMin = null;     // { el, prev }: the pinned element and its inline min-height before the pin
  let lastSig = null;     // editor view at the previous render; a view change is not a re-render in place
  const PIN_IDS = ['previewCard', 'compareGrid', 'patternsView', 'builtView', 'deckSection'];

  function scrollerOf(host) {
    for (let n = host && host.parentElement; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
      const oy = getComputedStyle(n).overflowY;
      if ((oy === 'auto' || oy === 'scroll') && n.scrollHeight > n.clientHeight + 1) return n;
    }
    return document.scrollingElement || document.documentElement;
  }

  function scrollSet(sc, top) {
    const t = Math.max(0, Math.round(top));
    if (Math.abs(sc.scrollTop - t) < 1) return;
    if (sc === document.scrollingElement || sc === document.documentElement) window.scrollTo({ top: t, behavior: 'instant' });
    else sc.scrollTo({ top: t, behavior: 'instant' });
  }

  function withScrollKept(renderBoard) {
    const sig = inEditor() ? curView() : null;
    const keep = !!sig && sig === lastSig;
    lastSig = sig;
    const pinEl = keep && PIN_IDS.map(id => document.getElementById(id)).find(el => el && !el.hidden && el.offsetHeight > 0);
    if (!keep || !pinEl) return renderBoard;
    const sc = scrollerOf(pinEl);
    const top0 = sc.scrollTop;
    const base = sc === document.scrollingElement || sc === document.documentElement ? 0 : sc.getBoundingClientRect().top;
    // The first board section that reaches into the viewport, remembered by its class (the order
    // can change with the style) and by its index, with how far from the top edge it sits.
    const secs = [...pinEl.querySelectorAll('.ab-sec')];
    const at = secs.find(el => el.getBoundingClientRect().bottom > base + 1);
    const anchor = at && {
      cls: [...at.classList].find(c => /^ab-sec-/.test(c)) || null,
      i: secs.indexOf(at),
      off: at.getBoundingClientRect().top - base,
    };
    const tok = ++holdTok;
    if (!holdMin || holdMin.el !== pinEl) {
      if (holdMin) holdMin.el.style.minHeight = holdMin.prev;
      holdMin = { el: pinEl, prev: pinEl.style.minHeight };
    }
    pinEl.style.minHeight = pinEl.offsetHeight + 'px';
    let touched = false;
    const mark = () => { touched = true; };
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(t => window.addEventListener(t, mark, { passive: true, once: true }));
    const restore = () => {
      if (tok !== holdTok || touched) return;
      let want = top0;
      if (anchor) {
        const now = [...pinEl.querySelectorAll('.ab-sec')];
        const el = (anchor.cls && now.find(n => n.classList.contains(anchor.cls))) || now[anchor.i];
        if (el) want = sc.scrollTop + (el.getBoundingClientRect().top - base) - anchor.off;
      }
      scrollSet(sc, want);
    };
    return () => {
      renderBoard();
      restore();
      requestAnimationFrame(() => {
        restore();
        requestAnimationFrame(() => {
          if (tok === holdTok && holdMin) { holdMin.el.style.minHeight = holdMin.prev; holdMin = null; }
          restore();
          // Late web fonts and fit passes reflow the sections above; settle once more.
          const done = () => {
            restore();
            ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(t => window.removeEventListener(t, mark));
          };
          const fonts = document.fonts && document.fonts.ready;
          if (!fonts) { setTimeout(done, 300); return; }
          Promise.race([fonts, new Promise(r => setTimeout(r, 900))]).then(() => { restore(); setTimeout(done, 250); });
        });
      });
    };
  }

  function morphBoard(renderBoardRaw) {
    const renderBoard = withScrollKept(renderBoardRaw);
    if (viewWatch.takeRecords().length) lastLook = null;
    const key = inEditor() ? lookKey() : null;
    const prev = lastLook;
    lastLook = key;
    const host = document.getElementById('previewCard');
    const can = prev && key && prev !== key && !busy && typeof document.startViewTransition === 'function'
      && !reduced() && !document.hidden && curView() === 'board' && host && !host.hidden && animationsOn();
    // One morph at a time: a switch during a running morph renders straight into it.
    if (!can || activeMorph) { renderBoard(); return; }
    const root = document.documentElement;
    const o = floodOrigin(host);
    root.style.setProperty('--m-vt-x', o.x + 'px');
    root.style.setProperty('--m-vt-y', o.y + 'px');
    root.style.setProperty('--m-vt-r', o.r + 'px');
    root.classList.add('m-morphing');
    let vt;
    try {
      vt = document.startViewTransition(() => { renderBoard(); });
    } catch (err) {
      root.classList.remove('m-morphing');
      renderBoard();
      return;
    }
    activeMorph = vt;
    const end = () => { if (activeMorph === vt) activeMorph = null; root.classList.remove('m-morphing'); };
    const quiet = () => {};
    vt.ready.catch(quiet);
    vt.updateCallbackDone.catch(quiet);
    vt.finished.then(end, end);
  }

  /* ---------------- 3. hold Space: the reel ---------------- */

  const HOLD_MS = 260;          // longer than a tap
  let hold = null;              // { tap, timer, spinning, ... }

  function spaceDown(tap) {
    if (hold || busy) return;
    hold = { tap, timer: setTimeout(startSpin, HOLD_MS), spinning: false };
  }

  function reelPool() {
    // visibleAesthetics() already honours the family filter and showcase mode.
    const list = typeof visibleAesthetics === 'function' ? visibleAesthetics() : curated(AESTHETICS);
    const pool = list.filter(a => a.key !== state.aesthetic);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.length ? pool : curated(AESTHETICS).filter(a => a.key !== state.aesthetic);
  }

  function reelHud() {
    const host = document.getElementById('previewCard');
    const r = host.getBoundingClientRect();
    const hud = document.createElement('div');
    hud.className = 'm-reel';
    hud.setAttribute('role', 'status');
    hud.innerHTML = '<span class="m-reel-k">Spinning</span><span class="m-reel-window"><span class="m-reel-name"></span></span>';
    hud.style.top = Math.max(16, r.top + 16) + 'px';
    document.body.appendChild(hud);
    hud.style.left = Math.round(r.left + (r.width - hud.offsetWidth) / 2) + 'px';   // fixed width: centred once
    return hud;
  }

  function reelShow(hud, name) {
    const win = hud.querySelector('.m-reel-window');
    win.innerHTML = '<span class="m-reel-name"></span>';
    win.firstChild.textContent = name;
  }

  function startSpin() {
    if (!hold) return;
    hold.timer = null;
    if (state.locks && state.locks.aesthetic) {
      hold.spinning = 'locked';
      showToast('Unlock aesthetic to spin');
      return;
    }
    if (!inEditor()) { hold.spinning = 'off'; return; }
    busy = 'spin';
    hold.spinning = true;
    ensureBoardView();
    beginShuffle();                 // one undo step for the whole spin
    hold.pool = reelPool();
    hold.i = 0;
    const still = reduced() || !animationsOn();
    hold.still = still;
    hold.hud = reelHud();
    const tick = () => {
      if (!hold || !hold.spinning) return;
      step();
      hold.loop = setTimeout(tick, still ? tok('--m-dur-base', 320) : tok('--m-dur-tick', 85));
    };
    tick();
  }

  function step() {
    const def = hold.pool[hold.i++ % hold.pool.length];
    applyAesthetic(def.key);
    renderAestheticBoard();
    reelShow(hold.hud, def.name);
    if (!hold.still) {
      const host = document.getElementById('previewCard');
      host.classList.remove('m-tick', 'm-landed');
      void host.offsetWidth;
      host.classList.add('m-tick');
    }
  }

  // Release: the reel slows over a few decelerating ticks and lands.
  async function releaseSpin() {
    const h = hold;
    clearTimeout(h.loop);
    h.spinning = false;
    if (!h.still) {
      const base = tok('--m-dur-tick', 85);
      for (let k = 1; k <= 6; k++) {
        await after(base * Math.pow(1.3, k));
        hold = h; step();
      }
    }
    hold = null;
    busy = null;
    followAestheticFonts();           // fonts follow the landed style (no-op when Type is locked)
    lastLook = lookKey();
    render();                         // the full render: deck, findings, save state
    lastLook = lookKey();
    const host = document.getElementById('previewCard');
    host.classList.remove('m-tick');
    if (!h.still) { void host.offsetWidth; host.classList.add('m-landed'); }
    h.hud.classList.add('is-landed');
    h.hud.querySelector('.m-reel-k').textContent = 'Landed on';
    reelShow(h.hud, resolveAestheticDef(state).name);
    await after(tok('--m-dur-settle', 680) + 400);
    h.hud.classList.add('is-out');
    await after(tok('--m-dur-base', 320));
    h.hud.remove();
    host.classList.remove('m-landed');
  }

  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && e.repeat && hold) e.preventDefault();
  }, true);
  document.addEventListener('keyup', e => {
    if (e.code !== 'Space' || !hold) return;
    e.preventDefault();
    if (hold.timer) {                 // a tap: the old shortcut, unchanged
      clearTimeout(hold.timer);
      const tap = hold.tap;
      hold = null;
      tap();
    } else if (hold.spinning === true) {
      releaseSpin();
    } else {
      hold = null;                    // locked / not available: nothing to land
    }
  }, true);
  window.addEventListener('blur', () => {
    if (!hold) return;
    if (hold.timer) { clearTimeout(hold.timer); hold = null; } else if (hold.spinning === true) releaseSpin(); else hold = null;
  });

  /* ---------------- 4. worlds zoom ---------------- */

  const WORLD_ASPECT = 1.5;          // a tile shows the top of the board, 3:2

  function worldDefs() {
    return curated(AESTHETICS);
  }

  function worldLayout(n) {
    const vw = window.innerWidth, vh = window.innerHeight;
    const pad = vw < 700 ? 16 : 32, head = 72, gap = vw < 700 ? 10 : 14, label = 26;
    let best = null;
    for (let cols = 1; cols <= n; cols++) {
      const rows = Math.ceil(n / cols);
      const byW = (vw - 2 * pad - (cols - 1) * gap) / cols;
      const byH = ((vh - head - pad - (rows - 1) * gap) / rows - label) * WORLD_ASPECT;
      const w = Math.min(byW, byH);
      if (!best || w > best.w) best = { cols, rows, w };
    }
    // Too small to read: keep tiles legible and let the wall scroll.
    const min = Math.min(150, (vw - 2 * pad));
    if (best.w < min) {
      const cols = Math.max(1, Math.floor((vw - 2 * pad + gap) / (min + gap)));
      best = { cols, rows: Math.ceil(n / cols), w: (vw - 2 * pad - (cols - 1) * gap) / cols };
    }
    const w = Math.floor(best.w);
    const gridW = best.cols * w + (best.cols - 1) * gap;
    const h = Math.round(w / WORLD_ASPECT);
    const rows = Math.ceil(n / best.cols);
    const gridH = rows * (h + label) + (rows - 1) * gap;
    const top = head + Math.max(0, Math.round((vh - head - pad - gridH) / 2));
    return { pad, head, gap, label, cols: best.cols, w, h, left: Math.round((vw - gridW) / 2), top };
  }

  // A tile shows only the top of a board, so everything below its first two
  // blocks is dropped before it reaches the page (35 full boards are slow to lay out).
  function tileBoard(def) {
    const tpl = document.createElement('template');
    const f = aestheticFontsFor(def.key);
    tpl.innerHTML = boardHtml(Object.assign({}, state, { bgMode: def.mode, headingFont: f.heading, bodyFont: f.body }), def);
    const ab = tpl.content.firstElementChild;
    const inner = ab && ab.querySelector('.ab-in');
    if (inner) {
      let blocks = 0;
      Array.from(inner.children).forEach(el => {
        if (el.classList.contains('ab-head') || el.classList.contains('ab-rule')) { if (blocks >= 2) el.remove(); return; }
        if (blocks >= 2) el.remove(); else blocks++;
      });
    }
    return tpl.content;
  }

  function worlds() {
    if (busy || !inEditor()) return Promise.resolve(false);
    ensureBoardView();
    const host = document.getElementById('previewCard');
    const W = host.clientWidth || 900;
    const defs = worldDefs();
    const L = worldLayout(defs.length);
    // Tiles are the real board at the page's width, scaled down with a transform:
    // CSS zoom would trip WebKit's minimum font size and blow the small text up.
    const zoom = L.w / W;
    const still = reduced() || !animationsOn();
    busy = 'worlds';
    // Focus goes back to a keyboard opener; after a mouse click it is dropped so
    // Space keeps meaning "shuffle" instead of re-opening the wall.
    const opener = document.activeElement;
    const keyboardOpen = !!(opener && opener !== document.body && opener.matches && opener.matches(':focus-visible'));
    const e = escapeHtml;
    const brand = effectiveContent().brandName;

    const ov = document.createElement('div');
    ov.className = 'm-worlds';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', `${brand} in every aesthetic`);
    ov.style.setProperty('--m-pad', L.pad + 'px');
    ov.style.setProperty('--m-head', L.head + 'px');
    ov.innerHTML = `<div class="m-worlds-bg"></div>
      <div class="m-worlds-cam"><div class="m-worlds-grid"></div></div>
      <header class="m-worlds-head">
        <div><h2 class="m-worlds-title">${e(brand)} in ${defs.length} worlds</h2>
        <p class="m-worlds-sub">Choose one to step into it.</p></div>
        <button type="button" class="m-worlds-close">Close <span aria-hidden="true">Esc</span></button>
      </header>`;
    const cam = ov.querySelector('.m-worlds-cam');
    const grid = ov.querySelector('.m-worlds-grid');
    Object.assign(grid.style, {
      left: L.left + 'px', top: L.top + 'px',
      gridTemplateColumns: `repeat(${L.cols}, ${L.w}px)`, gap: `${L.gap}px`,
      paddingBottom: L.pad + 'px',
    });
    if (still) ov.style.overflowY = 'auto';
    cam.style.transition = 'none';

    const cur = state.aesthetic;
    let curTile = null;
    defs.forEach(def => {
      const isCur = def.key === cur;
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'm-world' + (isCur ? ' is-current' : '');
      tile.dataset.key = def.key;
      tile.setAttribute('aria-label', `Use ${def.name}`);
      tile.innerHTML = `<div class="m-world-frame" style="height:${L.h}px"><div class="m-world-board" inert style="width:${W}px;transform:scale(${zoom.toFixed(4)})"></div></div>
        <span class="m-world-name"><i>${aestheticNumber(def.key)}</i>${e(def.name)}</span>`;
      grid.appendChild(tile);
      const box = tile.querySelector('.m-world-board');
      if (isCur) curTile = tile;
      else tile._def = def;
    });
    document.body.appendChild(ov);
    document.body.classList.add('m-worlds-open');
    if (curTile) drawCurrentBoard(curTile.querySelector('.m-world-board'));

    let done;
    const finished = new Promise(r => { done = r; });

    // Tiles arrive outward from the current one. Their boards are drawn a few at a
    // time, nearest first, so the zoom starts at once instead of after 35 boards.
    const tiles = Array.from(grid.children);
    const ci = curTile ? tiles.indexOf(curTile) : Math.floor(tiles.length / 2);
    const dist = new Map();
    tiles.forEach((t, i) => {
      const dr = Math.floor(i / L.cols) - Math.floor(ci / L.cols), dc = (i % L.cols) - (ci % L.cols);
      dist.set(t, Math.hypot(dr, dc));
      t.style.setProperty('--m-delay', Math.round(dist.get(t) * 55 + 120) + 'ms');
    });
    // Drawing all 34 boards in one go is a ~0.4 s task (measured in WebKit) right in the
    // middle of the zoom. Instead they are drawn nearest first in ~12 ms slices, one
    // slice per task, so frames keep coming while the wall fills in from the centre out.
    const queue = tiles.filter(t => t._def).sort((a, b) => dist.get(a) - dist.get(b));
    const fill = () => {
      if (!ov.isConnected) return;
      const t0 = performance.now();
      do {
        const t = queue.shift();
        if (!t) return;
        const box = t.querySelector('.m-world-board');
        setBoardFonts(box, aestheticFontsFor(t._def.key));
        box.appendChild(tileBoard(t._def));
        t.classList.add('is-filled');
      } while (performance.now() - t0 < 12);
      setTimeout(fill, 0);
    };
    setTimeout(fill, still ? 0 : 60);

    // The camera transform that puts `tile`'s frame over the top of the page's board.
    function onBoard(tile) {
      const r = host.getBoundingClientRect();
      const f = tile.querySelector('.m-world-frame').getBoundingClientRect();
      const c = cam.getBoundingClientRect();   // cam is at the identity when measured
      const k = r.width / f.width;
      return { s: k, x: r.left - (f.left - c.left) * k, y: r.top - (f.top - c.top) * k };
    }

    if (!still && curTile) {
      ov.classList.add('is-zooming');
      cam.style.transform = camTransform(onBoard(curTile));
      void cam.offsetWidth;
      cam.style.transition = '';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        cam.style.transform = 'none';
        setTimeout(() => ov.classList.remove('is-zooming'), tok('--m-dur-camera', 1050));
      }));
    } else if (!still) {
      cam.style.transition = '';
    } else {
      ov.animate([{ opacity: 0 }, { opacity: 1 }], { duration: tok('--m-dur-base', 320), easing: 'ease-out' });
    }
    (curTile || tiles[0]).focus({ preventScroll: true });

    let closing = false;
    async function pick(key) {
      if (closing) return;
      closing = true;
      document.removeEventListener('keydown', onKey, true);
      const tile = key ? grid.querySelector(`.m-world[data-key="${CSS.escape(key)}"]`) : null;
      if (key && key !== state.aesthetic) chooseAesthetic(key);   // one undo step; the morph stays off while busy
      if (still || !tile) {
        await ov.animate([{ opacity: 1 }, { opacity: 0 }], { duration: tok('--m-dur-base', 320), easing: 'ease-out' }).finished;
        return close();
      }
      tile.classList.add('is-picked');
      ov.classList.add('is-closing');
      cam.style.transition = 'none';
      cam.style.transform = 'none';
      const target = onBoard(tile);
      void cam.offsetWidth;
      cam.style.transition = '';
      cam.style.transform = camTransform(target);
      await after(tok('--m-dur-camera', 1050));
      ov.classList.add('is-done');
      await after(tok('--m-dur-base', 320));
      close();
    }
    function close() {
      ov.remove();
      document.body.classList.remove('m-worlds-open');
      busy = null;
      closeActive = null;
      lastLook = lookKey();
      if (keyboardOpen && opener.isConnected) opener.focus({ preventScroll: true });
      else if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      done(true);
    }
    function onKey(ev) {
      if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); pick(cur); return; }
      if (ev.code === 'Space' || ev.key === 'Enter') {   // also keeps Space from shuffling behind the wall
        ev.preventDefault();
        ev.stopPropagation();
        const t = ev.target && ev.target.closest ? ev.target.closest('.m-world, .m-worlds-close') : null;
        if (t) pick(t.classList.contains('m-world') ? t.dataset.key : cur);
        return;
      }
      if (ev.key.startsWith('Arrow')) {
        const i = tiles.indexOf(document.activeElement);
        if (i < 0) return;
        const d = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -L.cols, ArrowDown: L.cols }[ev.key];
        const t = tiles[i + d];
        if (t) { ev.preventDefault(); t.focus(); }
      }
      if (ev.key === 'Tab') {               // keep focus inside the wall
        const f = [ov.querySelector('.m-worlds-close')].concat(tiles);
        const i = f.indexOf(document.activeElement);
        const n = f[(i + (ev.shiftKey ? -1 : 1) + f.length) % f.length];
        ev.preventDefault();
        n.focus();
      }
    }
    document.addEventListener('keydown', onKey, true);
    closeActive = () => { pick(cur); return finished; };
    ov.addEventListener('click', ev => {
      if (ev.target.closest('.m-worlds-close')) return pick(cur);
      const t = ev.target.closest('.m-world');
      if (t) pick(t.dataset.key);
    });
    return finished;
  }

  // The toolbar's Show menu (index.html, wired in js/present.js) calls Show.reveal and
  // Show.worlds.

  // Closes the reveal or the worlds wall if one is open (the demo loop calls it
  // between beats). Resolves once the overlay is gone.
  function dismiss() {
    return closeActive ? closeActive() : Promise.resolve(false);
  }

  Object.assign(Show, { reveal, worlds, dismiss, morphBoard, spaceDown, busy: () => busy });
})();
