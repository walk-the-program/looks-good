/* ---------------------------------------------------------------------
   logos/attach.js — LogoAttach: use a Logos document as a brand's logo (contract §6).

   A brand's `content.logo` keeps the shape that brandLogo() and the brief read, plus
   `ref: { logoId, updatedAt, name, sig }` (sig = signature of the brand tokens it was
   rendered with). Files are rendered with the brand's own colours and fonts, so one linked
   logo looks right in every brand that uses it.

     LogoAttach.filesFor(doc, brandState)  -> content.logo object for that brand
     LogoAttach.tokensOf(brandState)       -> LogoDoc tokens (works for saved records and the live state)
     LogoAttach.attach(logoId, brandIds)   / detach(logoId, brandIds)
     LogoAttach.openPicker(logoId)         -> the "Use in brand…" dialog
     LogoAttach.onSaved(doc)               -> called by the editor after each save; refreshes attached brands
     LogoAttach.fitNodes(nodes, board, share)

   Brand records are written through LibraryStore (saved and draft state). The brand that is open
   in this window goes through BrandSession.adoptLogo so its live state and record stay in step.
   Depends on LogoDoc, LogoRender, LogoEngine, LogoStore, LibraryStore.
------------------------------------------------------------------------ */
const LogoAttach = (function () {
  'use strict';

  const WHITE = '#FFFFFF';
  const toast = function (m) { if (typeof showToast === 'function') showToast(m); };
  const esc = function (s) { return typeof escapeHtml === 'function' ? escapeHtml(String(s == null ? '' : s)) : String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  let chain = Promise.resolve();
  const serial = function (fn) { const p = chain.then(fn); chain = p.catch(function () {}); return p; };

  /* ======================= tokens ======================= */

  // LogoDoc.tokensFromBrandState reads st.headingFont.name (the live state); a saved record
  // carries headingFontName / bodyFontName instead. Accept both.
  function tokensOf(st) {
    if (!st) return LogoDoc.defaultTokens();
    if ((!st.headingFont && st.headingFontName) || (!st.bodyFont && st.bodyFontName)) {
      st = Object.assign({}, st, {
        headingFont: st.headingFont || { name: st.headingFontName },
        bodyFont: st.bodyFont || { name: st.bodyFontName }
      });
    }
    return LogoDoc.tokensFromBrandState(st);
  }
  function tokenSig(t) {
    const c = t.colors, f = t.fonts;
    return [c.ink, c.primary, c.secondary, c.accent, c.canvas, f.heading.family, f.heading.weight, f.body.family, f.body.weight].join('|');
  }

  /* ======================= files for one brand ======================= */

  // Visible text nodes with absolute y (group offsets added), top of the artboard first.
  function textNodes(nodes, ox, oy, out) {
    out = out || [];
    (nodes || []).forEach(function (n) {
      if (!n || n.hidden) return;
      if (n.type === 'group') textNodes(n.children, ox + (n.x || 0), oy + (n.y || 0), out);
      else if (n.type === 'text' && String(n.text || '').trim()) out.push({ n: n, y: oy + (n.y || 0), x: ox + (n.x || 0) });
    });
    return out;
  }

  async function filesFor(doc, st) {
    const tokens = tokensOf(st);
    await LogoEngine.ready();
    const full = {
      ink: await LogoRender.toSVG(doc, tokens, { box: 'content' }),
      white: await LogoRender.toSVG(doc, tokens, { box: 'content', fill: WHITE })
    };
    const texts = textNodes(doc.nodes, 0, 0).sort(function (a, b) { return a.y - b.y || a.x - b.x; });
    const first = texts[0] && texts[0].n;
    const second = texts[1] && texts[1].n;
    const family = function (n) { return n ? LogoDoc.resolveFont(n.font, tokens).family : null; };

    // monogram: first letter of the topmost text, in its resolved font
    const letter = Array.from(String((first && first.text) || doc.name || 'A')).filter(function (c) { return !/\s/.test(c); })[0] || 'A';
    const spec = first ? LogoDoc.resolveFont(first.font, tokens) : LogoDoc.resolveFont({ ref: 'heading', weight: 700, style: 'normal' }, tokens);
    let mono;
    {
      const face = await LogoRender.faceFor(first ? first.font : { ref: 'heading', weight: 700, style: 'normal' }, tokens);
      const layout = LogoEngine.monogram({
        word: letter, case: first && (first.case === 'upper' || first.case === 'lower') ? first.case : 'none',
        wordFont: { family: spec.family, weight: spec.weight, style: spec.style }, device: { type: 'none' }, mono: { letters: 1 }
      }, { word: face });
      const ink = tokens.colors.ink;
      mono = {
        light: LogoEngine.toSVG(layout, { fill: ink, bg: WHITE }),
        dark: LogoEngine.toSVG(layout, { fill: WHITE, bg: ink })
      };
    }

    // rough smallest width at which the smallest text keeps a 6 px cap height
    let minPx = 48;
    const b = LogoRender.boundsSync(doc.nodes, tokens);
    if (b && texts.length) {
      const w = b[2] - b[0];
      let smallest = Infinity;
      for (const t of texts) {
        const f = await LogoRender.faceFor(t.n.font, tokens);
        smallest = Math.min(smallest, f.capHeight * t.n.size / f.upem);
      }
      if (smallest > 0 && isFinite(smallest)) minPx = Math.max(48, Math.ceil(6 * w / smallest));
    }

    const now = Date.now();
    return {
      v: 1,
      ref: { logoId: doc.id, updatedAt: doc.updatedAt || now, name: doc.name || '', sig: tokenSig(tokens) },
      files: { full: full, wordmark: { ink: full.ink, white: full.white }, mono: mono },
      minPx: { full: minPx, wordmark: minPx },
      clearSpace: 0.25,
      fonts: { word: family(first) || spec.family, secondary: second ? family(second) : null },
      updatedAt: now
    };
  }

  /* ======================= brand records ======================= */

  const refOf = function (st) { const l = st && st.content && st.content.logo; return l && l.ref ? l.ref : null; };
  const usesLogo = function (st, id) { const r = refOf(st); return !!r && r.logoId === id; };
  function isFresh(doc, st) {
    const r = refOf(st);
    return !!r && r.logoId === doc.id && r.updatedAt === doc.updatedAt && r.name === (doc.name || '') && r.sig === tokenSig(tokensOf(st));
  }
  const openId = function () { return typeof BrandSession !== 'undefined' && BrandSession.currentId ? BrandSession.currentId() : null; };

  // action 'set' | 'remove'. Returns true when the brand exists. Remove only touches a logo that
  // belongs to this document.
  async function applyToBrand(brandId, doc, action) {
    const live = openId() === brandId;
    const rec = live ? BrandSession.record() : await LibraryStore.get(brandId);
    if (!rec) return false;
    const pick = async function (st) {
      if (!st) return undefined;
      if (action === 'remove') return usesLogo(st, doc.id) ? null : undefined;
      return isFresh(doc, st) ? undefined : await filesFor(doc, st);
    };
    const out = { saved: await pick(rec.savedState), draft: await pick(rec.draftState) };
    if (live) out.live = await pick(state);
    if (live) {
      await BrandSession.adoptLogo(brandId, out);
      return true;
    }
    const put = function (st, lg) {
      if (!st || lg === undefined) return false;
      st.content = Object.assign({}, st.content);
      if (lg) st.content.logo = lg; else delete st.content.logo;
      return true;
    };
    const a = put(rec.savedState, out.saved), b = put(rec.draftState, out.draft);
    if (a || b) await LibraryStore.put(rec);
    return true;
  }

  async function setAttached(docId, change) {
    const doc = await LogoStore.get(docId);
    if (!doc) return null;
    const next = (doc.attached || []).slice();
    change(next);
    const uniq = next.filter(function (v, i) { return next.indexOf(v) === i; });
    if (JSON.stringify(uniq) !== JSON.stringify(doc.attached || [])) { doc.attached = uniq; await LogoStore.put(doc); }
    return doc;
  }

  async function currentLogoDoc(logoId) {
    if (typeof LogosHome !== 'undefined') { try { await LogosHome.saveNow(); } catch (e) { /* the stored copy is used */ } }
    return LogoStore.get(logoId);
  }

  function attach(logoId, brandIds) {
    return serial(async function () {
      const doc = await currentLogoDoc(logoId);
      if (!doc) throw new Error('That logo isn’t here any more');
      const done = [];
      for (const id of brandIds) { if (await applyToBrand(id, doc, 'set')) done.push(id); }
      await setAttached(logoId, function (list) { done.forEach(function (id) { list.push(id); }); });
      return done;
    });
  }

  function detach(logoId, brandIds) {
    return serial(async function () {
      const doc = await LogoStore.get(logoId);
      const done = [];
      for (const id of brandIds) {
        if (doc) { if (await applyToBrand(id, doc, 'remove')) done.push(id); }
        else done.push(id);
      }
      if (doc) await setAttached(logoId, function (list) { done.forEach(function (id) { const i = list.indexOf(id); if (i >= 0) list.splice(i, 1); }); });
      return done;
    });
  }

  /* ======================= propagation ======================= */

  let saveTimer = null, saveDoc = null;
  // Called after every logo save. Debounced; runs in the background.
  function onSaved(doc) {
    if (!doc || !doc.id) return;
    saveDoc = doc.id;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      const id = saveDoc;
      serial(async function () {
        const d = await LogoStore.get(id);
        if (!d || !(d.attached || []).length) return;
        const gone = [];
        for (const bid of d.attached.slice()) {
          try { if (!(await applyToBrand(bid, d, 'set'))) gone.push(bid); }
          catch (e) { console.warn('Logos: could not refresh a brand logo', e); }
        }
        if (gone.length) await setAttached(id, function (list) { gone.forEach(function (g) { const i = list.indexOf(g); if (i >= 0) list.splice(i, 1); }); });
      }).catch(function (e) { console.warn('Logos: attached brands not refreshed', e); });
    }, 300);
  }

  /* ======================= picker dialog ======================= */

  async function openPicker(logoId) {
    const doc = await currentLogoDoc(logoId);
    if (!doc) { toast('That logo isn’t here any more'); return false; }
    let brands = [];
    try { brands = (await LibraryStore.list()).sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); }); } catch (e) { /* none */ }
    return new Promise(function (resolve) {
      const previousFocus = document.activeElement;
      const overlay = document.createElement('div');
      overlay.className = 'dlg-overlay';
      const rows = brands.map(function (b, i) {
        const st = b.savedState || {};
        const uses = usesLogo(st, doc.id) || usesLogo(b.draftState, doc.id);
        const other = !uses && (refOf(st) || (st.content && st.content.logo && st.content.logo.files));
        const note = [];
        if (other) note.push('Replaces its current logo');
        if (st.logoDataUrl) note.push('Has an uploaded logo, which still shows in the brand views');
        return '<label style="display:flex;gap:10px;align-items:flex-start;padding:8px 2px;cursor:pointer">' +
          '<input type="checkbox" data-i="' + i + '"' + (uses ? ' checked' : '') + ' style="margin-top:3px" />' +
          '<span><b>' + esc(b.name || 'Untitled brand') + '</b>' +
          (uses ? ' <small>Uses this logo</small>' : '') +
          (note.length ? '<br><small>' + esc(note.join(' · ')) + '</small>' : '') + '</span></label>';
      }).join('');
      overlay.innerHTML =
        '<form class="dlg lg-dlg" role="dialog" aria-modal="true" aria-label="Use in brand" novalidate>' +
        '<h2 class="dlg-title">Use “' + esc(doc.name) + '” in brands</h2>' +
        '<p class="dlg-message">Each brand shows the logo in its own colours and fonts, and it follows every edit you make here.</p>' +
        (brands.length ? '<div style="max-height:46vh;overflow:auto;margin:6px 0">' + rows + '</div>' : '<p class="dlg-message">Save a brand first, then attach the logo to it.</p>') +
        '<p class="dlg-error" hidden></p>' +
        '<div class="dlg-actions"><button type="button" class="btn btn-ghost" data-id="cancel">Cancel</button>' +
        '<button type="submit" class="btn btn-primary" data-id="apply"' + (brands.length ? '' : ' disabled') + '>Apply</button></div></form>';
      document.body.appendChild(overlay);
      document.body.classList.add('has-dialog');
      const form = overlay.querySelector('form');
      const err = overlay.querySelector('.dlg-error');
      const boxes = Array.from(overlay.querySelectorAll('input[type=checkbox]'));
      const close = function (v) {
        overlay.remove();
        if (!document.querySelector('.dlg-overlay')) document.body.classList.remove('has-dialog');
        if (previousFocus && previousFocus.focus) try { previousFocus.focus(); } catch (e) { /* gone */ }
        resolve(v);
      };
      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const add = [], drop = [];
        boxes.forEach(function (bx) {
          const b = brands[Number(bx.dataset.i)];
          const uses = usesLogo(b.savedState, doc.id) || usesLogo(b.draftState, doc.id) || (doc.attached || []).indexOf(b.id) >= 0;
          if (bx.checked && !usesLogo(b.savedState, doc.id)) add.push(b);
          if (!bx.checked && uses) drop.push(b);
        });
        const replacing = add.filter(function (b) { const l = b.savedState && b.savedState.content && b.savedState.content.logo; return l && l.files && !usesLogo(b.savedState, doc.id); });
        if (replacing.length && typeof Dialogs !== 'undefined' && Dialogs.choose) {
          const ch = await Dialogs.choose({
            title: 'Replace the current logo?',
            message: replacing.map(function (b) { return b.name; }).join(', ') + (replacing.length > 1 ? ' already have' : ' already has') + ' a logo from Logo Studio or Logos. This one replaces it.',
            buttons: [{ id: 'replace', label: 'Replace', primary: true }, { id: 'cancel', label: 'Cancel' }]
          });
          if (ch !== 'replace') return;
        }
        form.querySelector('[data-id="apply"]').disabled = true;
        try {
          if (add.length) await attach(doc.id, add.map(function (b) { return b.id; }));
          if (drop.length) await detach(doc.id, drop.map(function (b) { return b.id; }));
        } catch (ex) {
          err.textContent = String(ex && ex.message || ex); err.hidden = false;
          form.querySelector('[data-id="apply"]').disabled = false;
          return;
        }
        if (add.length || drop.length) toast((add.length ? 'Using this logo in ' + add.length + (add.length > 1 ? ' brands' : ' brand') : '') + (add.length && drop.length ? '; ' : '') + (drop.length ? 'removed from ' + drop.length : ''));
        close({ added: add.length, removed: drop.length });
      });
      overlay.querySelector('[data-id="cancel"]').addEventListener('click', function () { close(null); });
      overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) close(null); });
      overlay.addEventListener('keydown', function (e) {
        e.stopPropagation();
        if (e.key === 'Escape') { e.preventDefault(); close(null); }
        if (e.key === 'Tab') {
          const items = Array.from(overlay.querySelectorAll('input, button:not([disabled])'));
          const f = items[0], l = items[items.length - 1];
          if (e.shiftKey && document.activeElement === f) { e.preventDefault(); l.focus(); }
          else if (!e.shiftKey && document.activeElement === l) { e.preventDefault(); f.focus(); }
        }
      });
      (boxes[0] || overlay.querySelector('[data-id="cancel"]')).focus();
    });
  }

  /* ======================= helpers shared with Logo Studio ======================= */

  // Scales a fromRecipe layout (engine units) to `share` of the artboard and centres it.
  function fitNodes(nodes, board, share) {
    if (!nodes.length) return nodes;
    const x0 = Math.min.apply(null, nodes.map(function (n) { return n.x; })), y0 = Math.min.apply(null, nodes.map(function (n) { return n.y; }));
    const x1 = Math.max.apply(null, nodes.map(function (n) { return n.x + n.w; })), y1 = Math.max.apply(null, nodes.map(function (n) { return n.y + n.h; }));
    const k = Math.min(board.w * share / (x1 - x0 || 1), board.h * share / (y1 - y0 || 1));
    const dx = (board.w - (x1 - x0) * k) / 2, dy = (board.h - (y1 - y0) * k) / 2;
    const scale = function (n, top) {
      const o = Object.assign({}, n, { x: top ? (n.x - x0) * k + dx : n.x * k, y: top ? (n.y - y0) * k + dy : n.y * k, w: n.w * k, h: n.h * k });
      ['size', 'strokeWidth', 'radius'].forEach(function (p) { if (typeof n[p] === 'number') o[p] = n[p] * k; });
      if (n.children) o.children = n.children.map(function (c) { return scale(c, false); });
      return o;
    };
    return nodes.map(function (n) { return scale(n, true); });
  }

  return {
    filesFor: filesFor, tokensOf: tokensOf, tokenSig: tokenSig, attach: attach, detach: detach,
    openPicker: openPicker, onSaved: onSaved, fitNodes: fitNodes
  };
})();
