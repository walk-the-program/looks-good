/* dev/deck-gore.js — the brand deck "no UI gore" detector, for test harnesses
   only. Load it after js/brand-deck.js. Not shipped in the app. */

// deckGoreReport(slideEl) -> [{ type, el, text, detail }] — the automated "no UI
// gore" check for one built slide (`.ab-slide` root). Empty array = clean. For
// every visible text-bearing element it reports:
//   overflow   text runs past its own box / scrollWidth > clientWidth / ellipsis
//   broken     a single word wrapped across lines (Range per word, >1 line rect)
//   overlap    text of two unrelated elements intersects (> 2px both ways)
//   clipped    text cut off by an ancestor with overflow hidden/clip (or the slide)
//   small      computed size < 12px (< 11px for tracked uppercase labels), after
//              the slide's fit scale
//   contrast   text under 3:1 against its effective background (only where that
//              background is flat colours: skipped under gradients and images)
// Decorative art (anything aria-hidden, .ab-deck-pattern, svg) is not text and is
// skipped. An intentional overlay can opt out of overlap/clipped with
// data-gore-ok="reason" on the element or an ancestor; the reason is mandatory
// (empty values do not count). The array's `.stats` holds element counts.
function deckGoreReport(slideEl) {
  const issues = [];
  const stats = { text: 0, contrastSkipped: 0, whitelisted: 0 };
  issues.stats = stats;
  const key = slideEl.dataset.slide || '';
  const zoom = slideEl.offsetWidth ? slideEl.getBoundingClientRect().width / slideEl.offsetWidth : 1;
  const tol = 2 * zoom;
  const wrap = slideEl.querySelector('.ab-slide-body') && slideEl.querySelector('.ab-slide-body').firstElementChild;
  const fitScale = parseFloat(slideEl.dataset.fitScale) || 1;

  const short = el => {
    const c = (el.getAttribute('class') || '').split(/\s+/).filter(Boolean).slice(0, 2).join('.');
    return el.tagName.toLowerCase() + (c ? '.' + c : '');
  };
  const add = (type, el, detail) => issues.push({
    type, slide: key, el: short(el),
    text: (el.value != null && el.tagName === 'INPUT' ? el.value : el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40),
    detail,
  });
  const ownText = el => [...el.childNodes].filter(n => n.nodeType === 3 && n.nodeValue.trim());
  const rectsOf = el => {
    const out = [];
    ownText(el).forEach(n => {
      const r = document.createRange();
      r.selectNodeContents(n);
      [...r.getClientRects()].forEach(q => { if (q.width > 0.5 && q.height > 0.5) out.push(q); });
    });
    return out;
  };
  const parseColor = s => {
    let m = String(s).match(/^rgba?\(([^)]+)\)$/);
    if (m) {
      const p = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    }
    m = String(s).match(/^color\(srgb\s+([^)]+)\)$/);
    if (m) {
      const p = m[1].split(/[\s\/]+/).filter(Boolean).map(Number);
      return { r: p[0] * 255, g: p[1] * 255, b: p[2] * 255, a: p.length > 3 ? p[3] : 1 };
    }
    return null;
  };
  const lum = c => {
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  // Flat background behind an element, or null when a gradient/image is in the way.
  const arts = [...slideEl.querySelectorAll('.ab-art, .ab-deck-pattern, .ab-deck-stage')].map(a => a.getBoundingClientRect());
  const backdrop = (el, textBox) => {
    // Text laid over the art or a pattern: whatever is behind it is a picture.
    if (!el.closest('.ab-art, .ab-deck-stage') && arts.some(a => a.width > 0 && Math.min(a.right, textBox.r) - Math.max(a.left, textBox.l) > 1 && Math.min(a.bottom, textBox.b) - Math.max(a.top, textBox.t) > 1)) return null;
    const layers = [];
    for (let a = el; a && a !== document.documentElement; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return null;
      for (const ps of (a === slideEl || a.matches('.ab-in, .ab-slide-in, .ab-slide-body')) ? [] : ['::before', '::after']) {
        const pc = getComputedStyle(a, ps);
        if (pc.content !== 'none' && pc.content !== 'normal' && pc.display !== 'none' && (pc.backgroundImage !== 'none' || (parseColor(pc.backgroundColor) || { a: 0 }).a > 0.05) && pc.position === 'absolute') return null;
      }
      const c = parseColor(cs.backgroundColor);
      if (c && c.a > 0) { layers.push(c); if (c.a >= 0.999) break; }
      if (a === slideEl) break;
    }
    if (!layers.length || layers[layers.length - 1].a < 0.999) return null;
    let bg = layers.pop();
    while (layers.length) bg = over(layers.pop(), bg);
    return bg;
  };
  // The part of a text rect that carries ink: the content area (font ascent + descent)
  // is taller than the glyphs, so a tight line-height clips empty space, not letters.
  const inkOf = (q, fs, k) => {
    const h = Math.min(q.height, fs * k * zoom);
    const mid = (q.top + q.bottom) / 2;
    return { l: q.left, r: q.right, t: mid - h / 2, b: mid + h / 2 };
  };
  const okReason = el => { const h = el.closest('[data-gore-ok]'); return h && h.getAttribute('data-gore-ok').trim() ? h : null; };

  const items = [];
  const artItems = [];
  // Visually hidden boxes (an aesthetic that draws its headline in the art keeps the
  // real one as a 1px clipped box for screen readers): their text is not on the slide.
  const hiddenBoxes = [...slideEl.querySelectorAll('*')].filter(n => {
    const r = n.getBoundingClientRect();
    if (r.width > 2 || r.height > 2) return false;
    const c = getComputedStyle(n);
    return c.overflowX !== 'visible' || c.overflowY !== 'visible' || c.clip !== 'auto' || c.clipPath !== 'none';
  });
  // A rect cut down to what its ancestors (up to `stop`) leave visible.
  const clipTo = (q, el, stop) => {
    let l = q.l, r = q.r, t = q.t, b = q.b;
    for (let a = el.parentElement; a && a !== stop; a = a.parentElement) {
      const c = getComputedStyle(a);
      if (c.overflowX === 'visible' && c.overflowY === 'visible') continue;
      const x = a.getBoundingClientRect();
      if (c.overflowX !== 'visible') { l = Math.max(l, x.left); r = Math.min(r, x.right); }
      if (c.overflowY !== 'visible') { t = Math.max(t, x.top); b = Math.min(b, x.bottom); }
    }
    return { l, r, t, b };
  };
  slideEl.querySelectorAll('*').forEach(el => {
    if (hiddenBoxes.some(h => h.contains(el))) return;
    if (el.closest('.ab-deck-pattern, svg')) return;
    if (el.tagName === 'STYLE' || el.tagName === 'SCRIPT') return;
    if (el.closest('[aria-hidden="true"]')) {
      // Text drawn inside the art is not checked itself, but content text must not
      // collide with it (a floating button over the subcopy).
      if (el.closest('.ab-art') && ownText(el).length) {
        const q = rectsOf(el);
        const fs0 = parseFloat(getComputedStyle(el).fontSize) || 0;
        const acs = getComputedStyle(el);
        if (q.length && acs.visibility !== 'hidden') {
          // A painted label in the art (a floating button, a chip) covers what it sits on:
          // its whole box counts, not just its text.
          const edge = ['Top', 'Right', 'Bottom', 'Left'].some(sd => parseFloat(acs['border' + sd + 'Width']) > 0);
          const filled = (parseColor(acs.backgroundColor) || { a: 0 }).a > 0.5 || acs.backgroundImage !== 'none';
          const bx = el.getBoundingClientRect();
          const art = el.closest('.ab-art');
          const boxes = (edge || filled) && bx.width > 4 && bx.height > 4 ? [{ l: bx.left, r: bx.right, t: bx.top, b: bx.bottom }] : q.map(r => inkOf(r, fs0, 0.8));
          artItems.push({ el, boxes: boxes.map(b => clipTo(b, el, art.parentElement)).filter(b => b.r - b.l > 1 && b.b - b.t > 1) });
        }
      }
      return;
    }
    const isInput = el.tagName === 'INPUT' && el.type !== 'checkbox';
    if (!isInput && !ownText(el).length) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.05) return;
    const box = el.getBoundingClientRect();
    if (box.width <= 2 || box.height <= 2) return;                 // gone, or visually hidden
    stats.text++;
    const rects = isInput ? [box] : rectsOf(el);
    if (!rects.length) return;
    const fs = parseFloat(cs.fontSize) || 0;
    const inks = rects.map(q => inkOf(q, fs, 0.9));
    const U = { l: Math.min(...inks.map(r => r.l)), r: Math.max(...inks.map(r => r.r)), t: Math.min(...inks.map(r => r.t)), b: Math.max(...inks.map(r => r.b)) };

    // 1. overflow / truncation
    if (!isInput) {
      if (U.r > box.right + tol || U.l < box.left - tol) add('overflow', el, `text ${Math.round(U.l - box.left)}..${Math.round(U.r - box.right)} outside its box`);
      // scrollWidth / scrollHeight only count where the box clips (overflow not visible):
      // a visible-overflow box that is wider than itself because of a decorative
      // pseudo-element (a highlight band that runs on) is not text trouble; its text
      // rects, checked above, are.
      else if (cs.display !== 'inline' && cs.overflowX !== 'visible' && el.scrollWidth > el.clientWidth + 1) add('overflow', el, `scrollWidth ${el.scrollWidth} > clientWidth ${el.clientWidth}`);
      else if (cs.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth) add('overflow', el, 'ellipsis truncation');
      else if (cs.display !== 'inline' && cs.overflowY !== 'visible' && el.scrollHeight > el.clientHeight + 1) add('overflow', el, `scrollHeight ${el.scrollHeight} > clientHeight ${el.clientHeight}`);
    } else if (el.scrollWidth > el.clientWidth + 1) add('overflow', el, 'input value truncated');

    // 2. a word broken across lines
    if (!isInput) {
      let broken = '';
      ownText(el).forEach(n => {
        if (broken) return;
        const re = /[^\s\-‐-―\/]+/g;
        let m;
        while ((m = re.exec(n.nodeValue))) {
          if (m[0].length < 2) continue;
          const r = document.createRange();
          r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length);
          const q = [...r.getClientRects()].filter(x => x.width > 0.5);
          if (q.length > 1 && Math.max(...q.map(x => x.top)) - Math.min(...q.map(x => x.top)) > fs * 0.3 * zoom) { broken = m[0]; break; }
        }
      });
      if (broken) add('broken', el, `"${broken}" wraps mid-word`);
    }

    // 4. clipped by an ancestor
    for (let a = el.parentElement; a; a = a.parentElement) {
      const acs = getComputedStyle(a);
      if (acs.display === 'contents') { if (a === slideEl) break; continue; }
      const cx = acs.overflowX !== 'visible', cy = acs.overflowY !== 'visible';
      if (cx || cy) {
        const c = a.getBoundingClientRect();
        const side = [cx && U.l < c.left - tol ? 'left' : '', cx && U.r > c.right + tol ? 'right' : '', cy && U.t < c.top - tol ? 'top' : '', cy && U.b > c.bottom + tol ? 'bottom' : ''].filter(Boolean);
        if (side.length) {
          if (okReason(el)) stats.whitelisted++;
          else add('clipped', el, `cut off at ${side.join('/')} by ${short(a)}`);
          break;
        }
      }
      if (a === slideEl) break;
    }

    // 5. text size (after the slide's fit scale)
    const eff = fs * (wrap && wrap.contains(el) ? fitScale : 1);
    const txt = (el.textContent || '').trim();
    const caps = (cs.textTransform === 'uppercase' || (/[A-Z]/.test(txt) && txt === txt.toUpperCase())) && parseFloat(cs.letterSpacing) > 0;
    if (eff < (caps ? 11 : 12) - 0.25) add('small', el, `${eff.toFixed(1)}px${caps ? ' (caps label)' : ''}`);

    // 6. contrast
    const fill = parseColor(cs.webkitTextFillColor) || parseColor(cs.color);
    if (fill && fill.a > 0) {
      const bg = backdrop(el, U);
      if (!bg) stats.contrastSkipped++;
      else {
        const fg = over(fill, bg);
        const L1 = lum(fg), L2 = lum(bg);
        const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
        if (ratio < 3) add('contrast', el, `${ratio.toFixed(2)}:1`);
      }
    }
    items.push({ el, boxes: rects.map(q => inkOf(q, fs, 0.8)) });
  });

  // 3. overlapping text of unrelated elements (art text counts as the second party)
  const pool = items.concat(artItems);
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < pool.length; j++) {
      const A = items[i], B = pool[j];
      if (A.el.contains(B.el) || B.el.contains(A.el)) continue;
      const hit = A.boxes.some(a => B.boxes.some(b => Math.min(a.r, b.r) - Math.max(a.l, b.l) > tol && Math.min(a.b, b.b) - Math.max(a.t, b.t) > tol));
      if (!hit) continue;
      if (okReason(A.el) || okReason(B.el)) { stats.whitelisted++; continue; }
      add('overlap', A.el, `overlaps ${short(B.el)} "${(B.el.textContent || '').trim().slice(0, 24)}"`);
    }
  }
  return issues;
}
