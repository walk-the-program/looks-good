/* ---------------------------------------------------------------------
   product-screens.js — the Built view's "Product" tab.

   Draws every screen of the loaded product sheet (state.product, parsed by
   js/product-sheet.js, contract docs/product-sheet-format.md) as a phone comp in
   the current aesthetic, light and dark, from the shared UI kit with the sheet's
   real content. The owner approves each screen or asks for changes; the approvals
   (state.productApprovals) gate the App brief.

   App screens use only the UI kit (js/ui-kit.js) styled by the aesthetic: no board
   hero art, patterns or decorative bands. Phones are laid out at 390 x 844 and
   scaled down as a whole device; a screen taller than 844 is drawn in full with a
   fold line above the tab bar and the part below the fold veiled.

   Entry points:
     ProductScreens.renderInto(host, state, opts)   draw the tab into `host`
     ProductScreens.compPng(state, screenId, mode)  Promise<Uint8Array> PNG, 390 x 844 at 2x
   The kit pieces come from SeeBuilt.api (js/see-built.js). Plain <script>, no modules.
------------------------------------------------------------------------ */

(function () {
  const PHONE_H = 844;
  const TAB_H = 83;       // UI_KIT_PHONE.tabBarHeight, home-indicator area included
  const HOME_H = 34;      // home indicator area when there is no tab bar
  const api = () => (window.SeeBuilt && window.SeeBuilt.api) || null;

  // Module-level UI state that must survive the re-render a change triggers.
  const ui = { replace: false, paste: '', warnings: [], drafts: {}, hint: {} };

  const esc = s => escapeHtml(String(s == null ? '' : s));
  const slug = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const parts = v => (Array.isArray(v) ? v : String(v == null ? '' : v).split(';')).map(x => String(x).trim()).filter(Boolean);
  const nums = v => (Array.isArray(v) ? v : String(v == null ? '' : v).split(',')).map(Number).filter(n => Number.isFinite(n));
  const truthy = v => /^(yes|true|on|1)$/i.test(String(v == null ? '' : v).trim());

  /* ---------------- blocks: contract "Draws as" column ---------------- */

  // Space above a block, from what sits above it: related lines stay close, groups breathe.
  function gapOf(prev, cur) {
    if (!prev) return 'first';
    const t = cur.type, p = prev.type;
    if (t === 'text' && (p === 'title' || p === 'hero-numeral' || p === 'text')) return 'tight';
    if (t === 'link' && (p === 'action' || p === 'action-secondary')) return 'tight';
    if (t === 'action-secondary' && p === 'action') return 'tight';
    if (['list', 'stats', 'chart', 'tiles', 'segmented', 'card', 'keypad', 'action', 'field', 'toggle'].includes(t)) {
      if (t === 'field' && p === 'field') return 'std';
      if (t === 'toggle' && p === 'toggle') return 'flush';
      return 'wide';
    }
    return 'std';
  }

  function titleHtml(b) {
    const text = String(b.text || '');
    const hl = String((b.props && b.props.highlight) || '').trim();
    let inner = esc(text);
    if (hl) {
      const i = text.toLowerCase().indexOf(hl.toLowerCase());
      if (i >= 0) inner = `${esc(text.slice(0, i))}<span class="ab-hl">${esc(text.slice(i, i + hl.length))}</span>${esc(text.slice(i + hl.length))}`;
    }
    return `<h2 class="ab-headline sb-ob-h ps-title">${inner}</h2>`;
  }

  function chartHtml(A, b) {
    const pts = nums(b.props && b.props.points);
    const caption = b.text ? `<p class="ab-label ps-chart-cap">${A.e(b.text)}</p>` : '';
    if (pts.length < 2) return `<div class="ab-card sb-k-card ps-chart"${A.win(b.text || 'chart')}>${caption}</div>`;
    const W = 300, H = 96, pad = 8;
    const lo = Math.min(...pts), hi = Math.max(...pts), span = hi - lo || 1;
    const xy = pts.map((v, i) => [(i / (pts.length - 1)) * W, H - pad - ((v - lo) / span) * (H - pad * 2)]);
    const line = xy.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
    const last = xy[xy.length - 1];
    return `<div class="ab-card sb-k-card ps-chart"${A.win(b.text || 'chart')}>${caption}
      <div class="ps-plot"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path class="ps-c-area" d="${line} L${W},${H} L0,${H} Z"/><path class="ps-c-line" d="${line}" vector-effect="non-scaling-stroke"/></svg>
        <span class="ps-dot" style="left:${(last[0] / W) * 100}%;top:${(last[1] / H) * 100}%"></span></div></div>`;
  }

  function listRows(A, rows) {
    // A trailing value longer than LONG characters would crowd the title, so it moves to the subtitle line.
    const LONG = 14, SHORT = 10;
    return rows.map(r => {
      const p = r.split('—').map(x => x.trim()).filter((x, i) => i === 0 || x);
      const row = { title: p[0] };
      const trail = t => `${A.e(t)}${A.chev()}`;
      if (p.length === 2) { if (p[1].length > LONG) { row.sub = p[1]; row.trail = A.chev(); } else row.trail = trail(p[1]); }
      else if (p.length >= 3) {
        const mid = p[1], last = p.slice(2).join(' — ');
        if (last.length <= LONG) { row.sub = mid; row.trail = trail(last); }
        else if (mid.length <= SHORT) { row.sub = last; row.trail = trail(mid); }
        else { row.sub = mid + ' · ' + last; row.trail = A.chev(); }
      } else row.trail = A.chev();
      return row;
    });
  }

  function blockHtml(A, X, b, ctx) {
    const pr = b.props || {};
    const meta = pr.meta ? `<p class="ps-meta">${A.mid(pr.meta)}</p>` : '';
    switch (b.type) {
      case 'title': return titleHtml(b);
      case 'hero-numeral': {
        const n = String(b.text || '').length;
        const size = n <= 6 ? 76 : n <= 9 ? 64 : n <= 14 ? 48 : 34;
        return `<div class="ps-hero">${pr.label ? `<p class="ab-label ps-hero-label">${A.e(pr.label)}</p>` : ''}
          <p class="ab-card-title ps-numeral" style="--ps-num:${size}px">${A.e(b.text)}</p>
          ${pr.meta ? `<span class="ab-fit ps-hero-meta" data-fit="match">${A.mid(pr.meta)}</span>` : ''}</div>`;
      }
      case 'text':
        if (/^large$/i.test(pr.size || '')) return `<p class="ab-card-title ps-text-large">${A.mid(b.text)}</p>`;
        return `<p class="ab-subcopy ps-text${truthy(pr.muted) ? ' is-muted' : ''}">${A.mid(b.text)}</p>`;
      case 'action': {
        if (ctx.primaryRank !== b.rank) return `<button type="button" class="ab-type-apply sb-k-btn2" tabindex="-1">${A.e(b.text)}</button>${meta}`;
        return `${A.cta(b.text, '', 'sb-k-btn').replace(/ data-done="[^"]*"/, '')}${meta}`;
      }
      case 'action-secondary': return `<button type="button" class="ab-type-apply sb-k-btn2" tabindex="-1">${A.e(b.text)}</button>${meta}`;
      case 'link': return `<button type="button" class="sb-k-textbtn ps-link" tabindex="-1">${A.e(b.text)}</button>`;
      case 'card': return `<div class="ab-card sb-k-card ps-card-b"${A.win(b.text)}>
          <h3 class="ab-card-title">${A.mid(b.text)}</h3>
          ${pr.meta ? `<p class="ab-card-body">${A.mid(pr.meta)}</p>` : ''}
          ${pr.body ? `<p class="ab-card-body">${A.mid(pr.body)}</p>` : ''}</div>`;
      case 'list': {
        const rows = listRows(A, parts(pr.rows));
        return `${b.text ? A.kSection(b.text) : ''}${A.kList(rows)}`;
      }
      case 'stats': {
        const items = parts(pr.items).map(s => { const i = s.indexOf('='); return i < 0 ? [s, ''] : [s.slice(0, i).trim(), s.slice(i + 1).trim()]; });
        const cols = !items.length ? 1 : items.length <= 2 ? items.length : items.some(it => it[1].length > 6) ? 2 : 3;
        return `${b.text ? A.kSection(b.text) : ''}<div class="ps-stats" style="--ps-cols:${cols}">${items.map(([l, v]) =>
          `<div class="ab-card sb-k-card ps-stat"${A.win(l)}><p class="ab-label">${A.e(l)}</p><p class="ab-card-title ps-stat-v">${A.e(v)}</p></div>`).join('')}</div>`;
      }
      case 'chart': return chartHtml(A, b);
      case 'segmented': {
        const opts = parts(pr.options);
        if (!opts.length) return '';
        const sel = String(pr.selected == null ? '' : pr.selected).trim().toLowerCase();
        let at = opts.findIndex(o => o.toLowerCase() === sel);
        if (at < 0 && /^\d+$/.test(sel) && +sel >= 1 && +sel <= opts.length) at = +sel - 1;
        // options that cannot share one row wrap inside their cell, or stack when they are long
        const stack = opts.some(o => o.length > 14) || opts.join('').length > 34;
        return `${b.text ? A.kSection(b.text) : ''}<div class="ps-seg${stack ? ' is-stack' : ''}">${A.seg(opts.map((o, i) => [String(i), o]), Math.max(0, at), 'ps', b.text || 'Options')}</div>`;
      }
      case 'toggle': return A.toggle(X, b.text, truthy(pr.on), pr.meta || '');
      case 'field': {
        const v = pr.value || '';
        return `<div class="sb-field sb-k-field is-rest"><label class="ab-fieldlabel">${A.e(b.text)}</label><input class="ab-input" type="text" value="${A.e(v)}" placeholder="${A.e(pr.placeholder || '')}" readonly tabindex="-1" autocomplete="off" /></div>`;
      }
      case 'keypad': {
        const keys = String(pr.keys || '1 2 3 4 5 6 7 8 9 . 0 ⌫').trim().split(/\s+/).filter(Boolean);
        return `<div class="ps-keypad">${keys.map(k => `<button type="button" class="ab-type-apply sb-k-btn2" tabindex="-1">${A.e(k)}</button>`).join('')}</div>`;
      }
      case 'tiles': {
        const vals = nums(pr.values);
        return `${b.text ? `<p class="ab-label ps-tiles-cap">${A.e(b.text)}</p>` : ''}<div class="ps-tiles">${vals.map(v => `<i style="--ps-v:${Math.round(Math.max(0, Math.min(1, v)) * 100)}%"></i>`).join('')}</div>`;
      }
      default: return b.text ? `<p class="ab-subcopy ps-text">${A.mid(b.text)}</p>` : '';
    }
  }

  /* ---------------- chrome ---------------- */

  const TAB_ICON_RULES = [[/home|today|feed/i, 'home'], [/stat|progress|chart|insight|report/i, 'chart'], [/setting|more/i, 'gear'], [/profile|account|^me$/i, 'user'],
    [/people|team|friend|social/i, 'users'], [/shop|bag|order|box|store/i, 'box'], [/search|explore/i, 'search'], [/save|fav|like/i, 'heart'], [/mode|list|browse|library|plan/i, 'list']];
  const TAB_ICON_CYCLE = ['home', 'list', 'chart', 'heart', 'user'];
  const tabIcon = (name, i) => (TAB_ICON_RULES.find(r => r[0].test(name)) || [0, TAB_ICON_CYCLE[i % TAB_ICON_CYCLE.length]])[1];

  function tabNames(product) {
    if (product.tabs && product.tabs.length) return product.tabs;
    return product.screens.filter(s => s.chrome === 'tabbar').map(s => s.name);
  }

  function tabBarHtml(A, product, screen) {
    const tabs = tabNames(product);
    if (!tabs.length) return '';
    return `<nav class="sb-tabs ps-tabs" aria-label="App" style="grid-template-columns:repeat(${tabs.length},minmax(0,1fr))">${tabs.map((t, i) => {
      const on = slug(t) === screen.id || t.toLowerCase() === screen.name.toLowerCase();
      return `<button type="button" class="sb-tab"${on ? ' aria-current="page"' : ''} tabindex="-1">${A.icon(tabIcon(t, i), 24)}<span>${A.e(t)}</span></button>`;
    }).join('')}</nav>`;
  }

  /* ---------------- one screen ---------------- */

  // The phone screen for `screen` in the look of context X. opts.fold: draw the fold line and
  // the below-the-fold veil (the Product tab); false for the PNG comp.
  function screenHtml(A, X, product, screen, opts) {
    const o = opts || {};
    const blocks = (screen.blocks || []).slice().sort((p, q) => p.rank - q.rank);
    // pin: bottom (actions) and the keypad sit in a bottom bar above the tab bar or home indicator
    const isPin = b => b.type === 'keypad' || ((b.type === 'action' || b.type === 'action-secondary') && /^bottom$/i.test((b.props && b.props.pin) || ''));
    const flow = blocks.filter(b => !isPin(b)), pins = blocks.filter(isPin);
    const withTabs = screen.chrome === 'tabbar' && tabNames(product).length > 0;
    const foldY = PHONE_H - (withTabs ? TAB_H : HOME_H);
    const acts = blocks.filter(b => b.type === 'action');
    const primary = acts.find(b => screen.primary && b.text.toLowerCase() === String(screen.primary).toLowerCase()) || acts[0];
    const ctx = { primaryRank: primary ? primary.rank : -1 };
    let prev = null;
    const body = flow.map(b => {
      const html = blockHtml(A, X, b, ctx);
      if (!html) return '';
      const gap = gapOf(prev, b);
      const hero = prev === null && b === blocks[0];
      prev = b;
      return `<div class="ps-b" data-type="${A.e(b.type)}" data-gap="${gap}"${hero ? ' data-hero="1"' : ''}>${html}</div>`;
    }).join('');
    const pinHtml = pins.map(b => `<div class="ps-pb" data-type="${A.e(b.type)}">${blockHtml(A, X, b, ctx)}</div>`).join('');
    const top = screen.chrome === 'topbar'
      ? `<div class="ps-top">${A.kTopbar(A.kPlain('back', 'Back'), A.e(screen.name), '')}</div>` : '';
    const cls = ['sb-screen', 'sb-kit', 'ps-screen', o.fold ? 'has-fold' : 'is-comp', withTabs ? 'has-tabs' : '', `ps-chrome-${screen.chrome || 'topbar'}`].filter(Boolean).join(' ');
    return `${A.rootOpen(X, cls, ` data-fold-y="${foldY}" data-screen="${A.e(screen.id)}"`)}
      <div class="sb-phone-in ps-in">
        ${A.statusBar()}
        ${top}
        ${body}
        ${pinHtml ? `<div class="ps-pinbar">${pinHtml}</div>` : ''}
        ${withTabs ? tabBarHtml(A, product, screen) : ''}
        <div class="sb-homebar" aria-hidden="true"></div>
        ${o.fold ? `<div class="ps-veil" aria-hidden="true" style="top:${foldY}px"></div><div class="ps-fold" aria-hidden="true" style="top:${foldY}px"><span>Fold${withTabs ? ' · tab bar' : ''}</span></div>` : ''}
      </div></section>`;
  }

  /* ---------------- approval ---------------- */

  function statusOf(st, screen) {
    const ap = (st.productApprovals || {})[screen.id];
    if (!ap) return { key: 'pending', label: 'Pending', ap: null };
    if (ap.status === 'changes') return { key: 'changes', label: 'Changes requested', ap };
    const cur = typeof productScreenSig === 'function' ? productScreenSig(st, screen) : ap.sig;
    if (ap.sig !== cur) return { key: 'stale', label: 'Changed since approved', ap };
    const d = ap.at ? new Date(ap.at) : null;
    const when = d && !isNaN(d) ? ' ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
    return { key: 'approved', label: 'Approved' + when, ap };
  }

  function setApproval(id, rec) {
    const screen = ((state.product || {}).screens || []).find(s => s.id === id);
    if (!screen) return;
    const next = Object.assign({}, state.productApprovals || {});
    if (rec) {
      next[id] = {
        status: rec.status, note: rec.note || '',
        sig: typeof productScreenSig === 'function' ? productScreenSig(state, screen) : '',
        at: new Date().toISOString(),
      };
    } else delete next[id];
    state.productApprovals = next;
    delete ui.drafts[id];
    delete ui.hint[id];
    redraw();
  }

  /* ---------------- loading a sheet ---------------- */

  function loadSheet(text, name) {
    if (typeof parseProductSheet !== 'function') { ui.warnings = [{ line: 0, message: 'Product sheet support is not loaded.' }]; return redraw(); }
    let res;
    try { res = parseProductSheet(text, name || 'pasted'); } catch (err) { res = null; }
    if (!res || !res.product) {
      ui.warnings = ((res && res.warnings) || []).concat([{ line: 0, message: 'That file has no product in it. A sheet starts with "# Product: <name>".' }]);
      return redraw();
    }
    const keep = {}, old = state.productApprovals || {};
    (res.product.screens || []).forEach(s => { if (old[s.id]) keep[s.id] = old[s.id]; });   // the signature decides whether they still count
    state.product = res.product;
    state.productApprovals = keep;
    ui.warnings = res.warnings || [];
    ui.replace = false;
    ui.paste = '';
    redraw();
  }

  function removeProduct() {
    if (typeof window.confirm === 'function' && !window.confirm('Remove the product sheet and every screen approval?')) return;
    state.product = null;
    state.productApprovals = {};
    ui.warnings = [];
    ui.replace = false;
    redraw();
  }

  // Re-render the whole app (which also marks the brand unsaved from its serialized state),
  // keeping the page where it was.
  function redraw() {
    const host = document.querySelector('#builtView .ps-host');
    let sc = host;
    while (sc && sc !== document.body) {
      const oy = getComputedStyle(sc).overflowY;
      if ((oy === 'auto' || oy === 'scroll') && sc.scrollHeight > sc.clientHeight) break;
      sc = sc.parentElement;
    }
    const top = sc && sc !== document.body ? sc.scrollTop : window.scrollY;
    if (typeof render === 'function') render(); else if (window.SeeBuilt) SeeBuilt.render();
    const put = () => { if (sc && sc !== document.body) sc.scrollTop = top; else window.scrollTo(0, top); };
    put();
    requestAnimationFrame(put);
  }

  /* ---------------- the tab ---------------- */

  function loaderHtml(loaded) {
    return `<div class="ps-loader">
      <div class="ps-loader-row">
        <label class="btn btn-primary ps-file"><input type="file" accept=".md,.markdown,.txt,text/markdown,text/plain" data-ps="file" />Load product sheet</label>
        <span class="ps-or">or paste it below</span>
        ${loaded ? '<button type="button" class="btn btn-ghost" data-ps="cancel-replace">Cancel</button>' : ''}
      </div>
      <textarea class="ps-paste" data-ps="paste" rows="7" spellcheck="false" placeholder="# Product: Signl&#10;Purpose: …&#10;Core action: …&#10;&#10;## Screen: Home&#10;Job: …">${esc(ui.paste)}</textarea>
      <button type="button" class="btn" data-ps="use-paste">Use pasted sheet</button>
    </div>`;
  }

  function warningsHtml() {
    if (!ui.warnings.length) return '';
    return `<aside class="ps-warn" role="status"><b>${ui.warnings.length} ${ui.warnings.length === 1 ? 'note' : 'notes'} from reading the sheet</b>
      <ul>${ui.warnings.map(w => `<li>${w.line ? `<span class="ps-ln">Line ${esc(w.line)}</span> ` : ''}${esc(w.message)}</li>`).join('')}</ul></aside>`;
  }

  function guideHtml(st) {
    const key = String(st.aesthetic || '').replace(/--classic$/, '');
    const P = window.AESTHETIC_PRINCIPLES && window.AESTHETIC_PRINCIPLES[key];
    const rules = P && P.principles ? P.principles.slice(0, 3).map(p => p.rule) : [];
    const base = ['One hero per screen: the rank 1 block.', 'One primary action.', 'Generous gaps between groups.'];
    return `<details class="ps-guide"><summary>How the comps are composed</summary>
      <ul>${base.concat(rules).map(r => `<li>${esc(r)}</li>`).join('')}</ul></details>`;
  }

  function infoRow(k, v) { return v ? `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>` : ''; }

  function cardHtml(A, st, product, screen, Xl, Xd) {
    const s = statusOf(st, screen);
    const note = ui.drafts[screen.id] != null ? ui.drafts[screen.id] : (s.ap && s.ap.note) || '';
    const states = screen.states || {};
    const stateRows = [['Empty', states.empty], ['Loading', states.loading], ['Error', states.error], ['First run', states.firstRun]]
      .map(([k, v]) => `<li><b>${k}</b> ${esc(v || 'not specified')}</li>`).join('');
    const phone = (X, label) => `<figure class="ps-phone"><div class="sb-dev ps-dev" inert><div class="sb-phone-frame"><span class="sb-island" aria-hidden="true"></span>${screenHtml(A, X, product, screen, { fold: true })}</div></div><figcaption>${label}</figcaption></figure>`;
    const hint = ui.hint[screen.id] ? `<p class="ps-hint" role="alert">${esc(ui.hint[screen.id])}</p>` : '';
    const noteBlock = s.ap && s.ap.note && ui.drafts[screen.id] == null ? `<p class="ps-note-shown"><b>Your note</b> ${esc(s.ap.note)}</p>` : '';
    return `<article class="ps-card" data-screen="${esc(screen.id)}" data-status="${s.key}">
      <div class="ps-pair">${phone(Xl, 'Light')}${phone(Xd, 'Dark')}</div>
      <div class="ps-info">
        <header class="ps-info-h"><h3>${esc(screen.name)}</h3><span class="ps-chip" data-status="${s.key}">${esc(s.label)}</span></header>
        <p class="ps-job">${esc(screen.job)}</p>
        <dl class="ps-facts">
          ${infoRow('Primary action', screen.primary || 'none')}
          ${infoRow('Chrome', screen.chrome)}
          ${infoRow('Fold', screen.fold)}
          ${infoRow('Signature', screen.signature)}
        </dl>
        <div class="ps-actions">
          <button type="button" class="btn btn-primary" data-ps="approve" data-id="${esc(screen.id)}"${s.key === 'approved' ? ' disabled' : ''}>${s.key === 'stale' ? 'Approve again' : 'Approve'}</button>
          ${s.key !== 'pending' ? `<button type="button" class="btn btn-ghost" data-ps="reset" data-id="${esc(screen.id)}">Reset</button>` : ''}
        </div>
        <label class="ps-note-l" for="ps-note-${esc(screen.id)}">Request changes</label>
        <textarea class="ps-note" id="ps-note-${esc(screen.id)}" data-ps="note" data-id="${esc(screen.id)}" rows="3" placeholder="What should change on this screen?">${esc(note)}</textarea>
        ${hint}
        <button type="button" class="btn" data-ps="changes" data-id="${esc(screen.id)}">Request changes</button>
        ${noteBlock}
        <details class="ps-states"><summary>Screen states</summary><ul>${stateRows}</ul></details>
        ${(screen.notes || []).length ? `<details class="ps-states"><summary>Notes from the sheet</summary><ul>${screen.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul></details>` : ''}
      </div>
    </article>`;
  }

  function summaryHtml(st, product) {
    const total = product.screens.length;
    const stat = product.screens.map(s => statusOf(st, s).key);
    const approved = stat.filter(k => k === 'approved').length;
    const stale = stat.filter(k => k === 'stale').length;
    const changes = stat.filter(k => k === 'changes').length;
    const extra = [stale ? `${stale} changed since approved` : '', changes ? `${changes} with changes requested` : ''].filter(Boolean).join(' · ');
    return `<div class="ps-summary" data-done="${approved === total && total > 0}">
      <b>${approved} of ${total} screens approved</b>${extra ? `<span>${esc(extra)}</span>` : ''}
      <i class="ps-bar" aria-hidden="true"><u style="width:${total ? Math.round((approved / total) * 100) : 0}%"></u></i></div>`;
  }

  function renderInto(host, st, opts) {
    if (!host) return null;
    st = st || (typeof state !== 'undefined' ? state : {});
    const A = api();
    host.classList.add('ps-host');
    if (!A) { host.innerHTML = '<p class="ps-empty-note">The UI kit is not loaded.</p>'; return host; }
    const product = st.product && Array.isArray(st.product.screens) && st.product.screens.length ? st.product : null;
    if (!host._psWired) wire(host);
    if (!product) {
      host.innerHTML = `<section class="ps-empty">
        <h2>Product</h2>
        <p class="ps-lede">A product sheet lists your app's screens, what each one is for and its real content. Branding Designer draws each screen in this look so you can approve it before any agent builds.</p>
        ${typeof parseProductSheet === 'function' ? '' : '<p class="ps-hint">Product sheet support is not loaded in this build.</p>'}
        ${loaderHtml(false)}${warningsHtml()}</section>`;
      return host;
    }
    // One look per mode: the same state with the background mode set.
    const ctxFor = mode => A.contextFor('brand', Object.assign({}, st, { bgMode: mode }));
    const Xl = ctxFor('light'), Xd = ctxFor('dark');
    if (typeof setBoardFonts === 'function') setBoardFonts(host);
    const tabs = product.tabs && product.tabs.length ? product.tabs.join(', ') : '';
    host.innerHTML = `<header class="ps-head">
        <div class="ps-head-t"><p class="ps-eyebrow">Product sheet${product.source ? ' · ' + esc(product.source) : ''}</p><h2>${esc(product.name)}</h2><p class="ps-lede">${esc(product.purpose)}</p>
          <dl class="ps-facts">${infoRow('Core action', product.coreAction)}${infoRow('Tabs', tabs)}</dl></div>
        <div class="ps-head-a"><button type="button" class="btn" data-ps="replace">Replace</button><button type="button" class="btn btn-ghost" data-ps="remove">Remove product</button></div>
      </header>
      ${ui.replace ? loaderHtml(true) : ''}${warningsHtml()}
      ${summaryHtml(st, product)}${guideHtml(st)}
      <div class="ps-cards">${product.screens.map(s => cardHtml(A, st, product, s, Xl, Xd)).join('')}</div>`;
    A.finish(host, Xl.def);
    measure(host);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => measure(host));
    setTimeout(() => measure(host), 200);
    return host;
  }

  // Fit one screen to its fold. Content that crosses the fold is compacted first, a step at a time
  // (section gaps 28 to 20, chart 64pt, hero numeral one step down); only what still overflows is
  // veiled. The pinned bottom bar always sits just above the tab bar or home indicator.
  function fitScreen(scr) {
    const inn = scr.querySelector('.ps-in');
    if (!inn) return 0;
    const foldY = Number(scr.dataset.foldY);
    const bar = scr.querySelector('.ps-pinbar');
    const barH = bar ? bar.offsetHeight : 0;
    if (bar) bar.style.top = (foldY - 8 - barH) + 'px';
    const limit = foldY - (bar ? 8 + barH + 12 : 0);
    const bottomOf = () => {
      const kids = [...inn.children].filter(k => k.classList.contains('ps-b') || k.classList.contains('ps-top'));
      const last = kids[kids.length - 1];
      return last ? last.offsetTop + last.offsetHeight : 0;
    };
    ['ps-c1', 'ps-c2', 'ps-c3'].forEach(c => scr.classList.remove(c));
    let bottom = bottomOf();
    for (const c of ['ps-c1', 'ps-c2', 'ps-c3']) {
      if (bottom <= limit) break;
      scr.classList.add(c);
      bottom = bottomOf();
    }
    const over = bottom > limit;
    scr.classList.toggle('ps-tall', over);
    const veil = scr.querySelector('.ps-veil');
    if (veil) veil.style.top = limit + 'px';
    return bottom + (parseFloat(getComputedStyle(inn).paddingBottom) || 0);
  }

  // Each screen is as tall as its content needs (never under 844). Both looks of a screen share the
  // taller height.
  function measure(host) {
    if (!host.isConnected) return;
    host.querySelectorAll('.ps-pair').forEach(pair => {
      let h = PHONE_H;
      pair.querySelectorAll('.ps-screen').forEach(scr => { h = Math.max(h, Math.ceil(fitScreen(scr))); });
      pair.style.setProperty('--ps-h', h + 'px');
    });
  }

  function wire(host) {
    host._psWired = true;
    host.addEventListener('click', ev => {
      const b = ev.target.closest('[data-ps]');
      if (!b || b.tagName === 'TEXTAREA' || b.tagName === 'INPUT') return;
      const id = b.dataset.id;
      switch (b.dataset.ps) {
        case 'replace': ui.replace = !ui.replace; redraw(); break;
        case 'cancel-replace': ui.replace = false; redraw(); break;
        case 'remove': removeProduct(); break;
        case 'use-paste': {
          const ta = host.querySelector('textarea[data-ps="paste"]');
          const text = ta ? ta.value : ui.paste;
          if (!String(text).trim()) { ui.warnings = [{ line: 0, message: 'Paste a product sheet first.' }]; redraw(); break; }
          loadSheet(text, 'pasted');
          break;
        }
        case 'approve': setApproval(id, { status: 'approved', note: '' }); break;
        case 'reset': setApproval(id, null); break;
        case 'changes': {
          const ta = host.querySelector(`textarea[data-ps="note"][data-id="${CSS.escape(id)}"]`);
          const note = ta ? ta.value.trim() : '';
          if (!note) {
            ui.hint[id] = 'Say what should change before you send it back.';
            ui.drafts[id] = '';
            redraw();
            setTimeout(() => { const t = document.querySelector(`#builtView textarea[data-ps="note"][data-id="${CSS.escape(id)}"]`); if (t) t.focus(); }, 0);
            break;
          }
          setApproval(id, { status: 'changes', note });
          break;
        }
        default:
      }
    });
    host.addEventListener('input', ev => {
      const t = ev.target;
      if (t.dataset && t.dataset.ps === 'note') ui.drafts[t.dataset.id] = t.value;
      else if (t.dataset && t.dataset.ps === 'paste') ui.paste = t.value;
    });
    host.addEventListener('change', ev => {
      const t = ev.target;
      if (!t.dataset || t.dataset.ps !== 'file' || !t.files || !t.files[0]) return;
      const f = t.files[0];
      const rd = new FileReader();
      rd.onload = () => loadSheet(String(rd.result || ''), f.name);
      rd.onerror = () => { ui.warnings = [{ line: 0, message: 'Could not read that file.' }]; redraw(); };
      rd.readAsText(f);
    });
  }

  /* ---------------- the PNG comp ---------------- */

  // One screen, offscreen, at 390 x 844 and 2x, in `mode` ('light' | 'dark'). No frame, fold line or
  // veil. Uses the same html2canvas clean-up as the deck export (brand-deck.js) for colour-mix colours,
  // switch knobs and rounded shadows. Resolves to the PNG bytes.
  async function compPng(st, screenId, mode) {
    const A = api();
    st = st || state;
    if (!A) throw new Error('UI kit is not loaded');
    if (typeof html2canvas !== 'function') throw new Error('html2canvas is not loaded');
    const product = st.product;
    const screen = product && (product.screens || []).find(s => s.id === screenId);
    if (!screen) throw new Error('No product screen "' + screenId + '"');
    const host = document.createElement('div');
    host.className = 'ps-export-host';
    document.body.appendChild(host);
    try {
      if (typeof setBoardFonts === 'function') setBoardFonts(host);
      Object.entries(A.kitVars()).forEach(([k, v]) => host.style.setProperty(k, v));
      const X = A.contextFor('brand', Object.assign({}, st, { bgMode: mode === 'dark' ? 'dark' : 'light' }));
      host.innerHTML = screenHtml(A, X, product, screen, { fold: false });
      A.finish(host, X.def);
      const el = host.querySelector('.ps-screen');
      fitScreen(el);
      if (document.fonts && document.fonts.ready) {
        try { await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]); } catch (err) { /* proceed */ }
      }
      await new Promise(r => setTimeout(r, 50));
      if (typeof bdPrepareExportClone === 'function') await bdPrepareExportClone(el);
      const canvas = await html2canvas(el, {
        scale: 2, useCORS: true, backgroundColor: getComputedStyle(el).getPropertyValue('--ab-canvas').trim() || '#ffffff',
        width: 390, height: PHONE_H, windowWidth: 390, windowHeight: PHONE_H, scrollX: 0, scrollY: 0,
        onclone: (doc, root) => { if (typeof bdSanitizeClone === 'function') bdSanitizeClone(doc, root); },
      });
      const blob = await new Promise((res, rej) => canvas.toBlob(b => (b ? res(b) : rej(new Error('PNG encode failed'))), 'image/png'));
      return new Uint8Array(await blob.arrayBuffer());
    } finally {
      host.remove();
    }
  }

  window.ProductScreens = { renderInto, compPng };
})();
