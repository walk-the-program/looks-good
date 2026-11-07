/* ---------------------------------------------------------------------
   studio-round.js — the round panel of the aesthetic studio: the right column of the editor (#studioRound).
   Variations (three one-axis versions with live previews, Keep / Kill), the open round's changes, notes pinned on
   the preview, Close round (rounds.json + a version snapshot) and History (compare with / go back to a round).

   Uses only the public APIs: Studio (js/studio.js) and StudioRounds (js/studio-rounds.js). The round log lives in
   the stored bundle (Studio.patchBundle); the only things kept here are working state that rounds.json has no
   field for: pin positions (fractions of the preview), the variation cards and the "seen" marker of agent rounds.
   Pins are not saved: they show while the round is open in this session.
------------------------------------------------------------------------ */

const StudioRound = (function () {
  'use strict';

  const root = document.getElementById('studioRound');
  if (!root || typeof Studio === 'undefined' || typeof StudioRounds === 'undefined') return {};
  const SR = StudioRounds;
  const SEEN_PREFIX = 'bd.studio.seen.';
  const BOARD_TARGETS = [['general', 'General'], ['board.hero', 'Board: hero'], ['board.palette', 'Board: palette'], ['deck.cover', 'Deck cover']];

  const esc = s => escapeHtml(String(s == null ? '' : s));
  const clone = v => JSON.parse(JSON.stringify(v));
  const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* not remembered */ } };
  const todayStr = () => { const d = new Date(), p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; };
  const stage = () => Studio.previewEl();
  const tabOf = () => (stage() && stage().dataset.stuTab) || 'board';

  /* ---------------- working state (reset on open / close) ---------------- */
  let ctx = null;
  let catalog = null;
  let layerObserver = null;

  const fresh = key => ({
    key, axis: 'any', seed: 0, cards: [], previewing: null, compare: null,
    pinMode: false, draft: null, pins: {}, pinSeq: 0, hot: null, closing: false, flash: '',
  });

  /* ---------------- reading and writing the round log ---------------- */
  const now = () => Studio.current();
  function roundsOf(c) { return (c || now()).bundle.rounds || { rounds: [] }; }
  const list = r => (r && Array.isArray(r.rounds) ? r.rounds : []);
  const openOf = r => SR.current(r);
  const lastN = r => list(r).reduce((m, x) => Math.max(m, x.n), 0);
  const nextN = r => { const o = openOf(r); return o ? o.n : lastN(r) + 1; };

  /* Runs fn(rounds) -> rounds on an open round (opened here when needed) and stores the result. */
  function write(fn) {
    const cur = now();
    if (!cur) return null;
    let r = SR.openRound(cur.bundle.rounds || { rounds: [] }, { by: 'studio' });
    r = fn(r) || r;
    Studio.patchBundle({ rounds: r });
    return r;
  }

  /* ---------------- skeleton ---------------- */
  function build() {
    root.innerHTML = `
      <div class="rd-head" id="rdHead"></div>
      <div class="rd-banner" id="rdBanner" hidden></div>
      <section class="rd-sec" aria-labelledby="rdVarH">
        <h3 class="rd-h" id="rdVarH">Variations</h3>
        <div class="rd-vbar">
          <label class="rd-axis" for="rdAxis"><span>Change</span><select id="rdAxis" aria-label="Which axis the variations change">${SR.AXES.map(a => `<option value="${esc(a.id)}">${esc(a.label)}</option>`).join('')}</select></label>
          <button type="button" class="btn btn-primary btn-small" id="rdVar">Variations</button>
        </div>
        <p class="rd-note" id="rdVMsg" role="status"></p>
        <ul class="rd-cards" id="rdCards"></ul>
      </section>
      <section class="rd-sec" aria-labelledby="rdChH"><h3 class="rd-h" id="rdChH">Changes</h3><div id="rdChanges"></div></section>
      <section class="rd-sec" aria-labelledby="rdNoH">
        <h3 class="rd-h" id="rdNoH">Notes</h3>
        <div class="rd-btnrow">
          <button type="button" class="btn btn-ghost btn-small" id="rdPin" aria-pressed="false">Pin a note</button>
          <button type="button" class="btn btn-ghost btn-small" id="rdNoteBtn">Add a note</button>
        </div>
        <p class="rd-note" id="rdPinHint" hidden>Click the preview to place a pin. Esc stops.</p>
        <form class="rd-draft" id="rdDraft" hidden>
          <label class="rd-f"><span>Note</span><textarea id="rdDraftText" rows="3" maxlength="400"></textarea></label>
          <label class="rd-f" for="rdDraftTarget"><span>About</span><select id="rdDraftTarget" aria-label="What the note is about"></select></label>
          <div class="rd-btnrow"><button type="submit" class="btn btn-primary btn-small">Add note</button><button type="button" class="btn btn-ghost btn-small" id="rdDraftCancel">Cancel</button></div>
        </form>
        <div id="rdNotes"></div>
      </section>
      <section class="rd-sec" aria-labelledby="rdClH">
        <h3 class="rd-h" id="rdClH">Close round</h3>
        <div id="rdClose"></div>
      </section>
      <section class="rd-sec" aria-labelledby="rdHiH"><h3 class="rd-h" id="rdHiH">History</h3><div id="rdHistory"></div></section>`;
    const st = stage();
    if (st && st.parentNode && !st.parentNode.querySelector(':scope > .rd-strip')) {
      const strip = document.createElement('div');
      strip.className = 'rd-strip'; strip.id = 'rdStrip'; strip.hidden = true;
      st.parentNode.insertBefore(strip, st);
    }
  }
  const $ = id => document.getElementById(id);

  /* ---------------- header and banner ---------------- */
  function renderHead() {
    const r = roundsOf(), o = openOf(r);
    $('rdHead').innerHTML = `<h2 class="rd-title">Round ${esc(nextN(r))}</h2><span class="rd-date">${esc(o ? `${o.date} · ${o.by}` : `${todayStr()} · ready to start`)}</span>`;
  }

  function seenN(key) { return parseInt(lsGet(SEEN_PREFIX + key) || '0', 10) || 0; }
  function markSeen(n) { if (ctx && n > seenN(ctx.key)) lsSet(SEEN_PREFIX + ctx.key, String(n)); }

  function renderBanner() {
    const r = roundsOf();
    const newest = list(r).filter(x => !x.open).sort((a, b) => b.n - a.n)[0];
    const el = $('rdBanner');
    const waiting = newest && newest.by === 'agent' && newest.n > seenN(ctx.key);
    el.hidden = !waiting;
    el.innerHTML = waiting ? `<button type="button" class="rd-banner-go" data-act="review" data-n="${esc(newest.n)}">Round ${esc(newest.n)} from an agent is waiting for review</button><button type="button" class="rd-banner-x" data-act="seen" data-n="${esc(newest.n)}" aria-label="Dismiss">×</button>` : '';
  }

  /* ---------------- variations ---------------- */
  function strip() { return $('rdStrip'); }

  function renderStrip() {
    const s = strip();
    if (!s) return;
    if (ctx.previewing) {
      const c = ctx.cards.find(x => x.v.id === ctx.previewing);
      s.hidden = false;
      s.innerHTML = `<span>Previewing variant ${esc(ctx.previewing)}${c ? ` · ${esc(c.v.change)}` : ''}</span><button type="button" class="btn btn-ghost btn-small" data-act="back">Back to current</button>`;
    } else if (ctx.compare) {
      s.hidden = false;
      s.innerHTML = `<span>Comparing round ${esc(ctx.compare.n)} with the current style</span><button type="button" class="btn btn-ghost btn-small" data-act="end-compare">End compare</button>`;
    } else { s.hidden = true; s.innerHTML = ''; }
  }

  function fitCardPreview(host) {
    const w = host.clientWidth || 280;
    host.style.setProperty('--rd-k', (w / 900).toFixed(4));
  }

  /* Where a variant's change lands: colour, type and art show on the board top; material, kit and edges on the
     Kit tab, cropped around the first component the variant changed (a move scoped to the board stays on the board). */
  function planOf(v, base) {
    if (['colour', 'type', 'art'].includes(v.axis)) return { tab: 'board' };
    const a = base.kit || {}, b = v.spec.kit || {};
    const keys = Object.keys(Object.assign({}, a, b)).filter(k => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
    const comp = keys.find(k => KIT_COMPONENTS[k]) || null;
    if (comp) return { tab: 'kit', comp };
    const A = (base.moves || []).map(e => JSON.stringify(e)), B = (v.spec.moves || []).map(e => JSON.stringify(e));
    const changed = (v.spec.moves || []).filter(e => !A.includes(JSON.stringify(e))).concat((base.moves || []).filter(e => !B.includes(JSON.stringify(e))));
    if (changed.length && changed.every(e => (e.scope || 'all') === 'board')) return { tab: 'board' };
    // a move on the kit: the component its param points at, else the first kit cell (where frames and corners show)
    const ids = [...new Set(changed.map(e => e.move))];
    if (ids.includes('kit-cell-frame')) return { tab: 'kit', comp: null, sel: '.sb-k-spec', label: 'kit cell', corner: true };
    const names = [];
    const was = Object.fromEntries((base.moves || []).map(e => [e.move, e.params || {}]));
    (v.spec.moves || []).forEach(e => { const o = was[e.move] || {}, n = e.params || {}; Object.keys(Object.assign({}, o, n)).forEach(k => { if (JSON.stringify(o[k]) !== JSON.stringify(n[k])) names.push(k); }); });
    const hint = names.some(n => /control|button/i.test(n)) ? 'button-primary' : names.some(n => /card|panel/i.test(n)) ? 'card' : names.some(n => /field|input/i.test(n)) ? 'field' : null;
    return hint ? { tab: 'kit', comp: hint } : { tab: 'kit', comp: null, sel: '.sb-k-spec', label: 'kit cell', corner: true };
  }
  const planSel = plan => (plan.comp ? KIT_COMPONENTS[plan.comp].join(',') : plan.sel || '');

  function cropKit(host, plan) {
    const kit = host.querySelector('.stu-kit');
    if (!kit) return;
    const w = host.clientWidth || 280, h = host.clientHeight || 150;
    kit.style.transformOrigin = '0 0';
    kit.style.transform = 'none';
    let el = null;
    if (planSel(plan)) { try { el = kit.querySelector(planSel(plan)); } catch (e) { el = null; } }
    let k = w / 900, tx = 0, ty = 0;
    if (el && plan.corner) {              // frames and edges: the cell's top-left corner, close up
      const kr = kit.getBoundingClientRect(), er = el.getBoundingClientRect();
      k = 0.8;
      tx = Math.min(0, 28 - (er.left - kr.left) * k);
      ty = Math.min(0, 28 - (er.top - kr.top) * k);
    } else if (el) {
      const kr = kit.getBoundingClientRect(), er = el.getBoundingClientRect();
      k = Math.min(0.6, (w * 0.9) / Math.max(er.width, 1), (h * 0.9) / Math.max(er.height, 1));
      k = Math.max(k, w / 900);
      tx = Math.min(0, w / 2 - (er.left - kr.left + er.width / 2) * k);
      ty = Math.min(0, h / 2 - (er.top - kr.top + er.height / 2) * k);
    }
    kit.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${k.toFixed(4)})`;
  }

  function paintPreview(host, spec, plan) {
    host.dataset.tab = plan.tab;
    const r = Studio.renderInto(host, spec, { tab: plan.tab });
    if (!r.ok) { host.innerHTML = '<span class="rd-note">This variant could not be drawn.</span>'; return; }
    if (plan.tab === 'kit') cropKit(host, plan); else fitCardPreview(host);
  }

  function showBefore(li, on) {
    const c = ctx && ctx.cards.find(x => x.v.id === li.dataset.id);
    if (!c) return;
    const pv = li.querySelector('.rd-pv'), before = li.querySelector('.rd-vbefore'), btn = li.querySelector('.rd-ba');
    if (on && !before.firstChild) paintPreview(before, c.base, c.plan);
    pv.classList.toggle('is-before', on);
    btn.textContent = on ? 'Before' : 'Hold: before';
  }

  function renderCards() {
    const ul = $('rdCards');
    ul.innerHTML = ctx.cards.map(c => `<li class="rd-card${c.stale ? ' is-stale' : ''}${ctx.previewing === c.v.id ? ' is-on' : ''}" data-id="${esc(c.v.id)}">
        <div class="rd-pv">
          <button type="button" class="rd-vprev" data-act="enlarge" data-id="${esc(c.v.id)}" aria-label="Show variant ${esc(c.v.id)} in the main preview"></button>
          <div class="rd-vprev rd-vbefore" aria-hidden="true"></div>
          <button type="button" class="rd-ba" title="Hover, focus or hold to see the current version at the same crop">Hold: before</button>
        </div>
        <div class="rd-card-b">
          <p class="rd-card-h"><b>Variant ${esc(c.v.id)}</b><span class="rd-chip">${esc(axisLabel(c.v.axis))}</span>${c.plan.comp || c.plan.label ? `<span class="rd-chip">${esc(c.plan.comp || c.plan.label)}</span>` : ''}</p>
          <p class="rd-change">${esc(c.v.change)}</p>
          ${c.v.note ? `<p class="rd-note">${esc(c.v.note)}</p>` : ''}
          ${c.stale ? '<p class="rd-note rd-stale">Based on the earlier version</p>' : ''}
          <div class="rd-btnrow">${c.stale ? '' : `<button type="button" class="btn btn-primary btn-small" data-act="keep" data-id="${esc(c.v.id)}">Keep</button>`}<button type="button" class="btn btn-ghost btn-small" data-act="kill" data-id="${esc(c.v.id)}">Kill</button></div>
        </div>
      </li>`).join('');
    ctx.cards.forEach(c => {
      const li = ul.querySelector(`.rd-card[data-id="${CSS.escape(c.v.id)}"]`);
      if (!li) return;
      paintPreview(li.querySelector('.rd-vprev[data-act]'), c.v.spec, c.plan);
      const ba = li.querySelector('.rd-ba');
      ['mouseenter', 'focus', 'pointerdown'].forEach(t => ba.addEventListener(t, () => showBefore(li, true)));
      ['mouseleave', 'blur', 'pointerup', 'pointercancel'].forEach(t => ba.addEventListener(t, () => showBefore(li, false)));
    });
  }
  const axisLabel = id => (SR.AXES.find(a => a.id === id) || { label: id }).label;

  /* Does a variant change anything the style draws? Material, kit and edges variants are compared by the stylesheet
     the runtime generates for each spec (registered for a moment under a temporary key). Colour, type and art variants
     are always taken as visible: the runtime has no way to read their tokens without drawing. */
  function cssOf(spec, art) {
    const key = 'studio--vis';
    const copy = clone(spec); copy.key = key;
    let css = null;
    try {
      const def = registerSpecAesthetic(copy, { untrusted: true, files: art || {}, errors: [], file: 'studio visibility check', quietHooks: true });
      if (def) { css = String(SPEC_LAB.css[key] || '').split(key).join('@'); unregisterSpecAesthetic(key); }
    } catch (e) { css = null; try { unregisterSpecAesthetic(key); } catch (e2) { /* not registered */ } }
    return css;
  }
  function visibleFn(art) {
    let baseJson = '', baseCss = null;
    return (base, variant, v) => {
      if (!['material', 'kit', 'edges'].includes(v.axis)) return true;
      const bj = JSON.stringify(base);
      if (bj !== baseJson) { baseJson = bj; baseCss = cssOf(base, art); }
      const vc = cssOf(variant, art);
      return baseCss == null || vc == null || vc !== baseCss;
    };
  }

  function makeVariations() {
    const cur = now();
    endPreview(true);
    ctx.seed += 1;
    const out = SR.variations(cur.spec, { axis: ctx.axis, seed: ctx.seed, count: 3, catalog, visible: visibleFn(cur.bundle.art) });
    write(r => r);            // opens the round
    // A card's letter is the tail of the id it is recorded under (r<n><letter>), so cards a, b, c in a later batch
    // take the letters the round has not used yet.
    const letters = SR.freeLetters(roundsOf(), out.length);
    out.forEach((v, i) => { if (letters[i]) v.id = letters[i]; });
    ctx.cards = out.map(v => ({ v, stale: false, base: clone(cur.spec), plan: planOf(v, cur.spec) }));
    $('rdVMsg').textContent = out.length ? '' : 'Nothing more to vary on this style.';
    renderHead(); renderCards(); renderClose();
  }

  function dropCard(id) { ctx.cards = ctx.cards.filter(c => c.v.id !== id); if (ctx.previewing === id) endPreview(); renderCards(); }

  function keep(id) {
    const c = ctx.cards.find(x => x.v.id === id);
    if (!c || c.stale) return;
    Studio.apply(c.v.spec, { label: c.v.change });
    write(r => SR.recordVariant(r, { change: c.v.change, verdict: 'keep', letter: c.v.id }));
    ctx.cards = ctx.cards.filter(x => x.v.id !== id);
    ctx.cards.forEach(x => { x.stale = true; });
    ctx.previewing = null;
    renderStrip(); renderCards(); renderHead(); renderChanges(); renderClose();
  }
  function kill(id) {
    const c = ctx.cards.find(x => x.v.id === id);
    if (!c) return;
    write(r => SR.recordVariant(r, { change: c.v.change, verdict: 'kill', letter: c.v.id }));
    dropCard(id);
    renderHead(); renderClose();
  }

  function enlarge(id) {
    const c = ctx.cards.find(x => x.v.id === id);
    if (!c) return;
    ctx.compare = null;
    const draw = () => {
      ctx.previewing = id;
      Studio.renderInto(stage(), c.v.spec, { tab: c.plan.tab });
      if (c.plan.tab === 'kit' && planSel(c.plan)) {
        let el = null;
        try { el = stage().querySelector(planSel(c.plan)); } catch (e) { el = null; }
        if (el) el.scrollIntoView({ block: 'center', inline: 'nearest' });
      }
      paintLayer(); renderStrip(); markOn();
    };
    if (c.plan.tab === 'kit' && tabOf() !== 'kit') {
      const btn = document.querySelector('#sdTabs [data-tab="kit"]');
      if (btn) { btn.click(); setTimeout(() => { if (ctx && ctx.cards.includes(c)) draw(); }, 80); return; }
    }
    draw();
  }
  function endPreview(quiet) {
    if (!ctx.previewing) return;
    ctx.previewing = null;
    if (!quiet) drawCurrent();
    renderStrip();
    markOn();
  }
  function markOn() { document.querySelectorAll('#rdCards .rd-card').forEach(li => li.classList.toggle('is-on', !!ctx && li.dataset.id === ctx.previewing)); }
  function drawCurrent() {
    Studio.renderInto(stage(), now().spec, { tab: tabOf() });
    paintLayer();
  }

  /* ---------------- changes ---------------- */
  function renderChanges() {
    const o = openOf(roundsOf());
    const ch = o ? o.changes : [];
    $('rdChanges').innerHTML = ch.length ? `<ul class="rd-list">${ch.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : '<p class="rd-note">Dial edits appear here as plain words.</p>';
  }

  function onChange(e) {
    if (!ctx || e.source === 'apply') return;
    let lines = [];
    try { lines = SR.diff(e.before, e.after, catalog); } catch (err) { console.error('studio round: diff failed', err); }
    if (!lines.length) return;
    if (ctx.cards.some(c => !c.stale)) { ctx.cards.forEach(c => { c.stale = true; }); renderCards(); }   // they vary the version before this edit
    write(r => SR.recordChanges(r, lines));
    renderHead(); renderChanges(); renderClose();
  }

  /* ---------------- notes and pins ---------------- */
  const noteTargets = () => BOARD_TARGETS.concat(Object.keys(KIT_COMPONENTS).map(k => ['kit.' + k, 'Kit: ' + k]));

  function allNotes(r) {
    const out = [];
    list(r).forEach(x => (x.notes || []).forEach(n => out.push(Object.assign({ round: x.n, roundOpen: !!x.open }, n))));
    return out;
  }

  function noteHtml(n) {
    const pin = ctx.pins[n.id];
    const done = n.status === 'done';
    const text = pin ? `<button type="button" class="rd-note-text" data-act="hot" data-id="${esc(n.id)}" title="Show the pin">${esc(n.text)}</button>` : `<span class="rd-note-text">${esc(n.text)}</span>`;
    return `<li class="rd-notei${ctx.hot === n.id ? ' is-hot' : ''}${done ? ' is-done' : ''}" data-note="${esc(n.id)}">
      <div class="rd-notei-t">${pin ? `<span class="rd-pinno" aria-label="Pin ${esc(pin.num)}">${esc(pin.num)}</span>` : ''}<span class="st-note-target">${esc(n.target)}</span><span class="rd-round-tag">Round ${esc(n.round)}${done && n.doneIn ? ` · done in ${esc(n.doneIn)}` : ''}</span></div>
      <div class="rd-notei-b">${text}<button type="button" class="btn btn-ghost btn-small" data-act="${done ? 'reopen' : 'done'}" data-id="${esc(n.id)}">${done ? 'Reopen' : 'Done'}</button></div>
    </li>`;
  }

  function renderNotes() {
    const notes = allNotes(roundsOf());
    const open = notes.filter(n => n.status !== 'done'), done = notes.filter(n => n.status === 'done');
    $('rdNotes').innerHTML = (open.length ? `<ul class="rd-notes">${open.map(noteHtml).join('')}</ul>` : '<p class="rd-note">No open notes.</p>')
      + (done.length ? `<details class="rd-done"><summary>Done (${done.length})</summary><ul class="rd-notes">${done.map(noteHtml).join('')}</ul></details>` : '');
  }

  function setPinMode(on) {
    if (on) { ctx.compare = null; endPreview(); renderStrip(); }
    ctx.pinMode = !!on;
    $('rdPin').setAttribute('aria-pressed', String(!!on));
    $('rdPinHint').hidden = !on;
    stage().classList.toggle('is-pinning', !!on);
    paintLayer();
  }

  function openDraft(target, pos) {
    ctx.draft = pos ? { x: pos.x, y: pos.y, tab: pos.tab } : { x: null, y: null, tab: null };
    const sel = $('rdDraftTarget');
    sel.innerHTML = noteTargets().map(([v, t]) => `<option value="${esc(v)}">${esc(t)}</option>`).join('');
    sel.value = target;
    $('rdDraft').hidden = false;
    $('rdDraftText').value = '';
    $('rdDraftText').focus();
    $('rdDraft').scrollIntoView({ block: 'nearest' });
    paintLayer();
  }
  function closeDraft() { ctx.draft = null; $('rdDraft').hidden = true; paintLayer(); }

  function submitDraft(ev) {
    ev.preventDefault();
    const text = $('rdDraftText').value.replace(/[<>]/g, '').trim();
    if (!text) { $('rdDraftText').focus(); return; }
    const target = $('rdDraftTarget').value;
    const draft = ctx.draft;
    let made = null;
    write(r => { const o = SR.addNote(r, { target, text }); made = o.note; return o.rounds; });
    if (made && draft && draft.x != null) ctx.pins[made.id] = { x: draft.x, y: draft.y, tab: draft.tab, num: ++ctx.pinSeq };
    ctx.draft = null; $('rdDraft').hidden = true;
    setPinMode(false);
    renderHead(); renderNotes(); renderClose(); paintLayer();
  }

  function setStatus(id, status) {
    write(r => SR.setNote(r, id, { status }));
    renderHead(); renderNotes(); renderClose();
  }

  /* what is under a point of the preview -> a note target, by geometry (the board is inert, so no hit testing) */
  let kitSel = null;
  function kitSelectors() {
    if (kitSel) return kitSel;
    kitSel = Object.keys(KIT_COMPONENTS).map(name => [name, KIT_COMPONENTS[name].join(',')]);
    return kitSel;
  }
  function kitOf(node) {
    for (const [name, sel] of kitSelectors()) { try { if (node.matches(sel)) return name; } catch (err) { /* a selector this browser lacks */ } }
    return '';
  }
  function detectTarget(host, tab, cx, cy) {
    if (tab === 'deck') return 'deck.cover';
    if (tab === 'stress') return 'general';
    const hits = [];
    host.querySelectorAll('*').forEach(n => {
      if (n.closest('.rd-layer')) return;
      const b = n.getBoundingClientRect();
      if (b.width > 0 && b.height > 0 && cx >= b.left && cx <= b.right && cy >= b.top && cy <= b.bottom) hits.push([n, b.width * b.height]);
    });
    if (!hits.length) return 'general';
    hits.sort((a, b) => a[1] - b[1]);       // smallest first: the part under the pointer before the block around it
    if (tab === 'board') {
      if (hits.some(([n]) => n.classList.contains('ab-hero'))) return 'board.hero';
      if (hits.some(([n]) => n.classList.contains('ab-palette'))) return 'board.palette';
    }
    for (const [n] of hits) { const kit = kitOf(n); if (kit) return 'kit.' + kit; }
    return 'general';
  }

  function anchorOf(host) { return host.querySelector('.stu-frame, .stu-kit, .stu-deck') || host; }

  function paintLayer() {
    const host = stage();
    if (!host || !ctx) return;
    const old = host.querySelector(':scope > .rd-layer');
    if (old) old.remove();
    if (ctx.previewing || ctx.compare) return;
    const tab = tabOf();
    const pins = [];
    const o = openOf(roundsOf());
    if (o) o.notes.forEach(n => { const p = ctx.pins[n.id]; if (p && p.tab === tab && n.status !== 'done') pins.push({ id: n.id, p, num: p.num }); });
    if (ctx.draft && ctx.draft.x != null && ctx.draft.tab === tab) pins.push({ id: '', p: ctx.draft, num: ctx.pinSeq + 1, draft: true });
    if (!ctx.pinMode && !pins.length) return;
    const layer = document.createElement('div');
    layer.className = 'rd-layer';
    if (ctx.pinMode) layer.innerHTML = '<div class="rd-capture" aria-hidden="true"></div>';
    host.appendChild(layer);
    const a = anchorOf(host).getBoundingClientRect(), h = host.getBoundingClientRect();
    pins.forEach(({ id, p, num, draft }) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'rd-pin' + (draft ? ' is-draft' : '') + (id && ctx.hot === id ? ' is-hot' : '');
      b.textContent = String(num);
      if (id) b.dataset.note = id; else b.tabIndex = -1;
      b.setAttribute('aria-label', draft ? 'New pin' : `Pin ${num}`);
      b.style.left = (a.left - h.left + host.scrollLeft + p.x * a.width) + 'px';
      b.style.top = (a.top - h.top + host.scrollTop + p.y * a.height) + 'px';
      layer.appendChild(b);
    });
  }

  function onStageClick(e) {
    if (!ctx) return;
    const pin = e.target.closest('.rd-pin');
    if (pin && pin.dataset.note) { ctx.hot = pin.dataset.note; renderNotes(); paintLayer(); const li = document.querySelector(`.rd-notei[data-note="${CSS.escape(pin.dataset.note)}"]`); if (li) li.scrollIntoView({ block: 'nearest' }); return; }
    if (!ctx.pinMode || !e.target.closest('.rd-capture')) return;
    const host = stage(), tab = tabOf();
    const a = anchorOf(host).getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - a.left) / (a.width || 1)));
    const y = Math.min(1, Math.max(0, (e.clientY - a.top) / (a.height || 1)));
    const target = detectTarget(host, tab, e.clientX, e.clientY);
    ctx.pinMode = false;
    $('rdPin').setAttribute('aria-pressed', 'false'); $('rdPinHint').hidden = true; host.classList.remove('is-pinning');
    openDraft(target, { x, y, tab });
  }

  /* ---------------- close round ---------------- */
  function renderClose() {
    const r = roundsOf(), o = openOf(r), box = $('rdClose');
    if (!o) { box.innerHTML = '<p class="rd-note">Nothing to close yet. The round opens with your first change, variation or note.</p>'; ctx.closing = false; return; }
    if (ctx.closing && $('rdCloseForm')) return;
    if (!ctx.closing) { box.innerHTML = `<button type="button" class="btn btn-ghost btn-small" data-act="close-start">Close round ${esc(o.n)}</button>`; return; }
    let dflt = '';
    try { dflt = SR.closeRound(r, {}).rounds.find(x => x.n === o.n).summary; } catch (e) { dflt = ''; }
    box.innerHTML = `<form class="rd-closef" id="rdCloseForm"><label class="rd-f"><span>One line on this round</span><input type="text" id="rdSummary" maxlength="300" placeholder="${esc(dflt)}" autocomplete="off" /></label><div class="rd-btnrow"><button type="submit" class="btn btn-primary btn-small">Close round ${esc(o.n)}</button><button type="button" class="btn btn-ghost btn-small" data-act="close-cancel">Cancel</button></div></form>`;
    $('rdSummary').focus();
  }

  function closeRound(summary) {
    const cur = now(), o = openOf(roundsOf(cur));
    if (!o) return;
    const closed = SR.closeRound(cur.bundle.rounds, { summary });
    const snap = SR.snapshot(Object.assign({}, cur.bundle, { rounds: closed }), o.n, cur.spec);
    Studio.patchBundle({ rounds: closed, versions: snap.versions });
    markSeen(o.n);
    ctx.pins = {}; ctx.pinSeq = 0; ctx.hot = null; ctx.closing = false; ctx.draft = null;
    $('rdDraft').hidden = true;
    renderAll();
  }

  /* ---------------- history ---------------- */
  function histHtml(r, versions) {
    const has = versions.some(v => v.round === r.n);
    const ch = (r.changes || []), vs = (r.variants || []), ns = (r.notes || []);
    const chip = (cls, t) => `<span class="st-chip st-chip-${esc(String(cls).toLowerCase().replace(/[^a-z]/g, ''))}">${esc(t)}</span>`;
    return `<details class="st-round rd-hround" data-n="${esc(r.n)}">
      <summary class="rd-hsum"><span class="st-round-head"><strong>Round ${esc(r.n)}</strong><span>${esc([r.date, r.by].filter(Boolean).join(' · '))}</span></span></summary>
      ${r.summary ? `<p class="st-round-sum">${esc(r.summary)}</p>` : ''}
      ${ch.length ? `<div class="st-sub">Changes</div><ul class="st-changes">${ch.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
      ${vs.length ? `<div class="st-sub">Variants</div><ul class="st-vars">${vs.map(v => `<li>${chip(v && v.verdict || 'open', v && v.verdict || 'open')}<span>${esc(v && v.change)}</span></li>`).join('')}</ul>` : ''}
      ${ns.length ? `<div class="st-sub">Notes</div><ul class="st-notes">${ns.map(n => `<li>${chip(n && n.status || 'open', (n && n.status || 'open') + (n && n.status === 'done' && n.doneIn ? ` in ${n.doneIn}` : ''))}<span class="st-note-target">${esc(n && n.target)}</span><span>${esc(n && n.text)}</span></li>`).join('')}</ul>` : ''}
      ${has ? `<div class="rd-btnrow"><button type="button" class="btn btn-ghost btn-small" data-act="compare" data-n="${esc(r.n)}">${ctx.compare && ctx.compare.n === r.n ? 'Comparing' : 'Compare'}</button><button type="button" class="btn btn-ghost btn-small" data-act="goback" data-n="${esc(r.n)}">Go back to this round</button></div>` : ''}
    </details>`;
  }

  function renderHistory() {
    const cur = now();
    const closed = list(roundsOf(cur)).filter(r => !r.open).sort((a, b) => b.n - a.n);
    const versions = cur.bundle.versions || [];
    $('rdHistory').innerHTML = closed.length ? closed.map(r => histHtml(r, versions)).join('') : '<p class="rd-note">Closed rounds appear here.</p>';
  }

  function revealRound(n) {
    const d = document.querySelector(`.rd-hround[data-n="${CSS.escape(String(n))}"]`);
    if (!d) return;
    d.open = true;
    d.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    const s = d.querySelector('summary'); if (s) s.focus({ preventScroll: true });
  }

  /* compare: the preview splits into the chosen round and the current style (a toggle on narrow screens) */
  function renderCompare() {
    const c = ctx.compare, host = stage();
    if (!c || !host) return;
    const cur = now();
    host.innerHTML = `<div class="rd-compare" data-side="both"><div class="rd-cmp-tog seg" role="group" aria-label="Which version to show"><button type="button" data-side="old" aria-pressed="false">Round ${esc(c.n)}</button><button type="button" data-side="new" aria-pressed="true">Current</button></div><div class="rd-cmp-cols"><section class="rd-cmp-col" data-col="old"><h4>Round ${esc(c.n)}</h4><div class="rd-cmp-b"></div></section><section class="rd-cmp-col" data-col="new"><h4>Current</h4><div class="rd-cmp-b"></div></section></div></div>`;
    const tab = tabOf();
    const bodies = host.querySelectorAll('.rd-cmp-b');
    Studio.renderInto(bodies[0], c.spec, { tab });
    Studio.renderInto(bodies[1], cur.spec, { tab });
    host.dataset.stuTab = tab;
    const wrap = host.querySelector('.rd-compare');
    wrap.dataset.side = 'both';
    wrap.querySelectorAll('.rd-cmp-tog button').forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.side === 'new')); });
    wrap.dataset.narrow = 'new';
  }

  function startCompare(n) {
    const v = (now().bundle.versions || []).find(x => x.round === n);
    if (!v) return;
    setPinMode(false); ctx.previewing = null;
    ctx.compare = { n, spec: clone(v.aesthetic) };
    renderCompare(); renderStrip(); renderHistory(); renderCards();
  }
  function endCompare() {
    if (!ctx.compare) return;
    ctx.compare = null;
    drawCurrent(); renderStrip(); renderHistory();
  }

  function goBack(n) {
    const v = (now().bundle.versions || []).find(x => x.round === n);
    if (!v) return;
    if (!window.confirm(`Go back to round ${n}? Your current style is replaced by that round's version. You can undo this.`)) return;
    ctx.compare = null; ctx.previewing = null;
    Studio.apply(v.aesthetic, { label: `Back to round ${n}` });
    write(r => SR.recordChanges(r, [`Went back to round ${n}`]));
    ctx.cards.forEach(c => { c.stale = true; });
    renderStrip(); renderAll();
  }

  /* ---------------- wiring ---------------- */
  function renderAll() {
    if (!ctx) return;
    renderHead(); renderBanner(); renderCards(); renderChanges(); renderNotes(); renderClose(); renderHistory(); renderStrip();
    paintLayer();
  }

  function onClick(e) {
    if (!ctx) return;
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act, id = b.dataset.id, n = parseInt(b.dataset.n || '0', 10);
    if (act === 'keep') keep(id);
    else if (act === 'kill') kill(id);
    else if (act === 'enlarge') { if (ctx.previewing === id) endPreview(); else enlarge(id); }
    else if (act === 'back') endPreview();
    else if (act === 'end-compare') endCompare();
    else if (act === 'done') setStatus(id, 'done');
    else if (act === 'reopen') setStatus(id, 'open');
    else if (act === 'hot') { ctx.hot = ctx.hot === id ? null : id; renderNotes(); paintLayer(); }
    else if (act === 'close-start') { ctx.closing = true; renderClose(); }
    else if (act === 'close-cancel') { ctx.closing = false; renderClose(); }
    else if (act === 'review') { markSeen(n); renderBanner(); revealRound(n); }
    else if (act === 'seen') { markSeen(n); renderBanner(); }
    else if (act === 'compare') { if (ctx.compare && ctx.compare.n === n) endCompare(); else startCompare(n); }
    else if (act === 'goback') goBack(n);
  }

  function wire() {
    root.addEventListener('click', onClick);
    const st = stage();
    st.addEventListener('click', e => {
      const t = e.target.closest('.rd-cmp-tog button');
      if (t) {
        const wrap = st.querySelector('.rd-compare');
        wrap.dataset.narrow = t.dataset.side;
        wrap.querySelectorAll('.rd-cmp-tog button').forEach(x => x.setAttribute('aria-pressed', String(x === t)));
        return;
      }
      if (e.target.closest('#rdStrip')) return;
      onStageClick(e);
    });
    const stripHost = st.parentNode;
    stripHost.addEventListener('click', e => { if (e.target.closest('#rdStrip')) onClick(e); });
    root.addEventListener('change', e => { if (e.target.id === 'rdAxis' && ctx) ctx.axis = e.target.value; });
    root.addEventListener('submit', e => {
      if (e.target.id === 'rdDraft') submitDraft(e);
      else if (e.target.id === 'rdCloseForm') { e.preventDefault(); closeRound($('rdSummary').value); }
    });
    root.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'rdDraftText' && (e.metaKey || e.ctrlKey)) submitDraft(e); });
    document.addEventListener('keydown', e => {
      if (!ctx || e.key !== 'Escape' || document.body.classList.contains('has-dialog')) return;
      if (ctx.pinMode) { e.preventDefault(); setPinMode(false); }
      else if (ctx.draft && root.contains(document.activeElement)) { e.preventDefault(); closeDraft(); }
    }, true);
  }

  let wired = false;
  Studio.on('open', ({ key }) => {
    catalog = SPEC_LAB.catalog();
    ctx = fresh(key);
    build();
    if (!wired) { wire(); wired = true; }
    // the buttons that live in the skeleton need handlers on each build
    $('rdVar').addEventListener('click', makeVariations);
    $('rdPin').addEventListener('click', () => setPinMode(!ctx.pinMode));
    $('rdNoteBtn').addEventListener('click', () => { setPinMode(false); openDraft('general', null); });
    $('rdDraftCancel').addEventListener('click', closeDraft);
    $('rdVar').disabled = false;
    renderAll();
    const host = stage();
    if (layerObserver) layerObserver.disconnect();
    if ('ResizeObserver' in window) { layerObserver = new ResizeObserver(() => { if (ctx && !ctx.previewing && !ctx.compare) paintLayer(); }); layerObserver.observe(host); }
  });
  Studio.on('close', () => {
    if (layerObserver) { layerObserver.disconnect(); layerObserver = null; }
    const host = stage();
    if (host) host.classList.remove('is-pinning');
    const s = strip(); if (s) { s.hidden = true; s.innerHTML = ''; }
    ctx = null;
    root.innerHTML = '';
  });
  Studio.on('change', onChange);
  Studio.on('preview', () => {
    if (!ctx) return;
    const was = ctx.previewing;
    ctx.previewing = null;
    if (ctx.compare) renderCompare();
    else paintLayer();
    renderStrip();
    if (was) markOn();
    renderHead(); renderChanges();
  });

  return { detectTarget };
})();
