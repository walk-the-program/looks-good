/* In-page helpers for dev/lg.js. Evaluated once into the headless Looks Good page as window.__lg; every
   function takes and returns plain JSON. Nothing here touches the owner's storage: the page runs in a fresh
   in-memory browser context. Plain script, no modules. */
(function () {
  if (window.__lg) return;
  const L = {};
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const SKIP_SHEETS = ['css/styles.css'];                      // editor chrome (the build pack skips it too)

  /* ---------- boot / lookups ---------- */
  L.boot = async () => {
    if (window.CustomAesthetics) await CustomAesthetics.ready;
    document.body.dataset.view = 'editor';
    window.showToast = () => {};
    return {
      styles: AESTHETICS.map(a => a.key), fonts: FONTS.map(f => f.name), schemes: Object.keys(COLOR_SCHEMES),
      components: UI_KIT.flatMap(g => g.items.map(i => i.id)), specKit: Object.keys(KIT_COMPONENTS),
      exportInto: !!(window.ProductScreens && typeof ProductScreens.exportInto === 'function'),
    };
  };

  L.fonts = () => FONTS.map(f => ({ name: f.name, category: f.category, cls: f.cls || '', weights: f.weights || '' }));

  const srcOf = key => (window.CustomAesthetics ? CustomAesthetics.source(key) : null) || 'builtin';

  L.styles = () => AESTHETICS.map(a => {
    const src = srcOf(a.key);
    return { key: a.key, name: a.name, descriptor: a.descriptor || '', family: (typeof aestheticFamilyOf === 'function' && aestheticFamilyOf(a.key)) || '', summary: a.summary || '', mode: a.mode || '', origin: src === 'builtin' ? 'built-in' : 'custom' };
  });

  L.style = async ({ key }) => {
    const def = AESTHETICS.find(a => a.key === key);
    if (!def) throw new Error('unknown style ' + key);
    const meta = (typeof aestheticMeta === 'function' && aestheticMeta(key)) || null;
    let build = null;
    try { const b = aestheticBuild(key); build = b && { name: b.name, sw: b.sw, cls: b.cls, line: b.line, sh: b.sh, press: b.press, motion: b.motion, surface: b.surface, pressText: b.pressText, states: b.states, reduceMotion: b.reduceMotion, icons: b.icons, ambient: b.ambient || null }; } catch (e) { /* no build record */ }
    const out = {
      key, name: def.name, descriptor: def.descriptor, origin: srcOf(key) === 'builtin' ? 'built-in' : 'custom', family: meta && meta.family || '',
      summary: def.summary, influences: def.influences, coreTrick: def.coreTrick || '', motto: def.motto, kicker: def.kicker, mode: def.mode,
      labels: def.labels || null, rules: def.rules || null, fonts: meta && meta.fonts || null, build,
      materials: Array.isArray(def.materials) ? def.materials.map(m => ({ name: m.name, css: m.css })) : [],
      type: def.type ? { ui: def.type.ui, label: def.type.label, display: def.type.display } : null,
    };
    if (out.origin === 'custom' && window.CustomAesthetics) {
      try {
        const b = await CustomAesthetics.bundle(key);
        const a = b && b.aesthetic;
        if (a) { out.lineage = a.lineage || null; out.colour = a.colour || null; out.moves = a.moves || []; out.kit = a.kit || {}; }
      } catch (e) { out.bundleError = String(e.message || e); }
    }
    return out;
  };

  /* Which spec-v2 kit names (KIT_COMPONENTS) style which UI kit ids: a name's selector fragments are matched against the drawn
     .sb-k-cell[data-k=<id>] specimens. depth = how deep inside the specimen the nearest match sits (0 = the specimen's own
     element). `spec` lists names matching at depth <= 2 (what the specimen shows), `inside` the ones that only style a part
     deeper in (a button inside a dialog, a row inside a menu). */
  const DIRECT_DEPTH = 2;
  function kitMap() {
    const st = stage();
    const host = document.createElement('div');
    host.className = 'sb-view'; host.style.cssText = 'width:944px;';
    st.appendChild(host);
    SeeBuilt.kitInto(host, { mode: 'light' });
    const names = Object.keys(KIT_COMPONENTS);
    const depthOf = (root, el) => { let d = 0; for (let n = el; n && n !== root; n = n.parentElement) d++; return d; };
    const minDepth = (spec, frags) => {
      let best = Infinity;
      frags.forEach(f => { try { if (spec.matches(f)) best = Math.min(best, 0); spec.querySelectorAll(f).forEach(el => { best = Math.min(best, depthOf(spec, el)); }); } catch (e) { /* unusable fragment */ } });
      return best;
    };
    const byId = {}, used = new Set();
    UI_KIT.forEach(g => g.items.forEach(i => {
      const cell = host.querySelector(`.sb-k-cell[data-k="${i.id}"]`);
      const hits = [];
      byId[i.id] = { hits, direct: [], inside: [] };
      if (!cell) return;
      const specs = Array.from(cell.querySelectorAll('.sb-k-spec'));
      names.forEach(n => {
        const d = Math.min(Infinity, ...specs.map(sp => minDepth(sp, KIT_COMPONENTS[n])));
        if (d === Infinity) return;
        used.add(n); hits.push({ name: n, depth: d });
      });
      hits.sort((a, b) => a.depth - b.depth);
      byId[i.id].direct = hits.filter(h => h.depth <= DIRECT_DEPTH).map(h => h.name);
      byId[i.id].inside = hits.filter(h => h.depth > DIRECT_DEPTH).map(h => h.name);
    }));
    stage().remove();
    return { byId, unmatched: names.filter(n => !used.has(n)) };
  }

  L.components = () => {
    const map = kitMap();
    return {
      rows: UI_KIT.flatMap(g => g.items.map(i => ({ id: i.id, group: g.group, name: i.name, use: i.use, states: i.states, ios: i.ios, web: !!i.web, spec: map.byId[i.id].direct, specInside: map.byId[i.id].inside }))),
      unmatched: map.unmatched,
    };
  };

  /* every kit name a spec-v2 `kit` map may use, with the material and state names it may be given */
  L.specCatalog = () => {
    const mats = Object.keys(SPEC_LAB.materials).sort().map(n => ({ name: n, move: SPEC_LAB.materials[n].move && SPEC_LAB.materials[n].move.id }));
    const states = Object.keys(SPEC_LAB.states).sort().map(n => ({ name: n, move: SPEC_LAB.states[n].move && SPEC_LAB.states[n].move.id }));
    const map = kitMap();
    return { components: Object.keys(KIT_COMPONENTS).map(n => ({ name: n, ui: rankIds(map, n).slice(0, 3) })), materials: mats, states };
  };

  // spec kit name -> the UI kit ids it styles, best first: the nearest match to the specimen's own element, then the cell
  // that is styled by the fewest other names (the specimen that is "about" this component), then kit order.
  const rankIds = (map, name) => {
    const order = UI_KIT.flatMap(g => g.items.map(i => i.id));
    const ids = order.map((id, k) => { const r = map.byId[id], h = r.hits.find(x => x.name === name); return h ? { id, depth: h.depth, n: r.direct.length, k } : null; })
      .filter(Boolean).sort((a, b) => a.depth - b.depth || a.n - b.n || a.k - b.k).map(x => x.id);
    return ids;
  };
  L.resolveKit = ({ name }) => ({ ids: KIT_COMPONENTS[name] ? rankIds(kitMap(), name) : [] });

  // The palette a look resolves to (state.colors): derived from primary + scheme, then look.colors merged over it.
  L.palette = ({ primary, scheme, colors }) => {
    const derived = derivePalette(primary, scheme);
    const resolved = Object.assign({}, derived, colors || {});
    return { primary, scheme, hue: Math.round(hexToHsl(resolved.primary).h), derived, resolved, overridden: Object.keys(colors || {}) };
  };

  /* ---------- the look ---------- */
  // look: { style, brandName, primary, scheme, colors, heading, body, typography, pureBg, blend }. Returns the sheet warnings.
  L.apply = async ({ look, mode, style, sheet }) => {
    const saved = serializeState(state);
    saved.aestheticKey = style || look.style;
    saved.aestheticVersion = 'current';
    saved.headingFontName = look.heading; saved.bodyFontName = look.body;
    saved.scheme = look.scheme;
    saved.colors = Object.assign(derivePalette(look.primary, look.scheme), look.colors || {});   // colors: partial, merged over the derived palette
    saved.hue = Math.round(hexToHsl(saved.colors.primary).h);
    saved.bgMode = mode || 'light';
    saved.pureBg = look.pureBg === true;
    saved.blend = look.blend || null;
    saved.combo = null;
    if (look.typography) saved.typography = Object.assign({}, saved.typography, look.typography);
    saved.content = Object.assign({}, saved.content, { brandName: look.brandName });
    saved.logoDataUrl = null;
    let warnings = [];
    if (sheet) {
      const text = sheet.text != null ? sheet.text : await (await fetch(sheet.url, { cache: 'no-store' })).text();
      const r = parseProductSheet(text, sheet.name);
      warnings = r.warnings || [];
      if (!r.product) throw new Error('the product sheet has no usable product: ' + warnings.map(w => `line ${w.line}: ${w.message}`).join('; '));
      saved.product = r.product; saved.productApprovals = {};
    }
    await applySavedSessionToState(saved, state);
    render();
    return { warnings, style: state.aesthetic, screens: state.product ? state.product.screens.map(s => ({ id: s.id, name: s.name, job: s.job })) : [] };
  };

  /* ---------- the stage: a visible, top-left, opaque container the screenshots are taken from ---------- */
  function stage() {
    let s = document.getElementById('lg-stage');
    if (s) s.remove();
    s = document.createElement('div');
    s.id = 'lg-stage';
    s.style.cssText = 'position:absolute;left:0;top:0;z-index:2147483000;background:#9a9a9a;display:flex;gap:16px;padding:16px;align-items:flex-start;box-sizing:border-box;';
    document.documentElement.style.overflow = 'auto'; document.body.style.overflow = 'visible'; document.body.style.height = 'auto';
    document.body.appendChild(s);
    return s;
  }

  /* ---------- computed values ---------- */
  const SIDES = ['top', 'right', 'bottom', 'left'];
  const r1 = n => Math.round(n * 10) / 10;
  function values(el) {
    const cs = getComputedStyle(el);
    const bw = SIDES.map(s => `${cs.getPropertyValue('border-' + s + '-width')} ${cs.getPropertyValue('border-' + s + '-style')} ${cs.getPropertyValue('border-' + s + '-color')}`);
    const none = b => /^0px|\bnone\b/.test(b);
    let border;
    if (bw.every(b => b === bw[0])) border = none(bw[0]) ? 'none' : bw[0];
    else { border = {}; SIDES.forEach((s, i) => { if (!none(bw[i])) border[s] = bw[i]; }); }
    const pad = SIDES.map(s => cs.getPropertyValue('padding-' + s));
    const rect = el.getBoundingClientRect();
    const bgi = cs.backgroundImage.replace(/(, )?none$/, '');
    const outline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0 ? `${cs.outlineWidth} ${cs.outlineStyle} ${cs.outlineColor} offset ${cs.outlineOffset}` : 'none';
    return {
      element: el.localName + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).join('.') : ''),
      background: cs.backgroundColor + (bgi && bgi !== 'none' ? ' + ' + bgi : ''), color: cs.color, border, 'border-radius': cs.borderRadius,
      'box-shadow': cs.boxShadow, outline, 'backdrop-filter': cs.backdropFilter || cs.webkitBackdropFilter || 'none', filter: cs.filter,
      padding: pad.every(p => p === pad[0]) ? pad[0] : pad.join(' '), height: r1(rect.height) + 'px', width: r1(rect.width) + 'px',
      'font-family': cs.fontFamily, 'font-size': cs.fontSize, 'font-weight': cs.fontWeight, 'letter-spacing': cs.letterSpacing, 'text-transform': cs.textTransform,
      opacity: cs.opacity,
      'transition-property': cs.transitionProperty, 'transition-duration': cs.transitionDuration, 'transition-timing-function': cs.transitionTimingFunction, 'transition-delay': cs.transitionDelay,
      transform: cs.transform, 'animation-name': cs.animationName, 'animation-duration': cs.animationDuration,
      'animation-timing-function': cs.animationName !== 'none' ? cs.animationTimingFunction : 'none',
    };
  }

  // The element(s) of a specimen that carry the component: its outer element and, when that is a wrapper, the real control.
  function subjects(spec) {
    const outer = spec.firstElementChild || spec;
    const out = { outer };
    const ctl = outer.matches('button,input,select,textarea,a,[role=switch],[role=button]') ? null : outer.querySelector('button,input:not([type=hidden]),select,textarea,[role=switch],[role=button]');
    if (ctl) out.control = ctl;
    return out;
  }

  /* ---------- CSS rules (CSSOM, the way the build pack scans) ---------- */
  const DYN = '(?:hover|active|focus-visible|focus-within|focus|visited|target)';
  function probe(sel) {
    let s = sel.replace(new RegExp(':not\\(\\s*:' + DYN + '\\s*\\)', 'g'), '')
      .replace(/::?(?:before|after|marker|placeholder|selection|first-line|first-letter|backdrop|file-selector-button|-webkit-[\w-]+|-moz-[\w-]+)(?![\w-])(?:\([^)]*\))?/g, '')
      .replace(new RegExp(':' + DYN + '(?![\\w-])', 'g'), '');
    if (/[\s>+~]$/.test(s) || !s.trim()) s += '*';
    return s.trim();
  }
  function splitTop(str, sep) {
    const out = []; let depth = 0, q = '', cur = '';
    for (let i = 0; i < str.length; i++) {
      const c = str[i];
      if (q) { cur += c; if (c === '\\') cur += str[++i] || ''; else if (c === q) q = ''; continue; }
      if (c === '"' || c === "'") { q = c; cur += c; continue; }
      if (c === '(' || c === '[') depth++; else if (c === ')' || c === ']') depth--;
      if (c === sep && depth === 0) { out.push(cur); cur = ''; continue; }
      cur += c;
    }
    if (cur.trim()) out.push(cur);
    return out.map(s => s.trim()).filter(Boolean);
  }
  const sheetName = sh => {
    if (sh.href) { try { return new URL(sh.href).pathname.replace(/^\//, ''); } catch (e) { return sh.href; } }
    const n = sh.ownerNode;
    return 'inline <style' + (n && n.id ? '#' + n.id : '') + '>';
  };
  const kindOf = r => (r && r.constructor && r.constructor.name) || '';
  const PSEUDO_OF_INTEREST = /:(hover|active|focus|focus-visible|focus-within|disabled|checked|invalid|placeholder-shown)\b/;

  // specs: [{ name, el }]. Returns deduped rules that match any element inside any specimen.
  function rulesFor(specs) {
    const out = new Map();
    const cache = new WeakMap();
    const visit = (rules, ctx, src) => {
      for (const rule of Array.from(rules)) {
        const k = kindOf(rule);
        if (k === 'CSSStyleRule') {
          let info = cache.get(rule);
          if (!info) { info = splitTop(rule.selectorText, ',').map(sel => ({ sel, probe: probe(sel) })); cache.set(rule, info); }
          const hit = [];
          const on = new Set();
          for (const it of info) {
            if (/^\*(?![\w.#\[:-])/.test(it.sel) && !/\s/.test(it.sel)) continue;     // bare universal rules
            let any = false;
            for (const sp of specs) {
              let m = false;
              try { m = sp.el.matches(it.probe) || !!sp.el.querySelector(it.probe); } catch (e) { m = false; }
              if (m) { any = true; on.add(sp.name); }
            }
            if (any) hit.push(it.sel);
          }
          if (hit.length) {
            const id = src + '|' + ctx + '|' + hit.join(',') + '|' + rule.style.cssText;
            let o = out.get(id);
            if (!o) out.set(id, o = { selector: hit.join(', '), declarations: splitTop(rule.style.cssText, ';').map(d => d + ';'), source: src, context: ctx || undefined, states: [], dynamic: hit.some(h => PSEUDO_OF_INTEREST.test(h)) || undefined });
            on.forEach(n => { if (!o.states.includes(n)) o.states.push(n); });
          }
        } else if (k === 'CSSImportRule') {
          try { if (rule.styleSheet) visit(rule.styleSheet.cssRules, ctx, sheetName(rule.styleSheet)); } catch (e) { /* cross-origin */ }
        } else if (k === 'CSSMediaRule') {
          if (window.matchMedia(rule.conditionText || rule.media.mediaText).matches) visit(rule.cssRules, (ctx ? ctx + ' ' : '') + '@media ' + (rule.conditionText || rule.media.mediaText), src);
        } else if (k === 'CSSSupportsRule') {
          if (CSS.supports(rule.conditionText)) visit(rule.cssRules, (ctx ? ctx + ' ' : '') + '@supports ' + rule.conditionText, src);
        } else if (rule.cssRules && k !== 'CSSKeyframesRule' && k !== 'CSSFontFaceRule') visit(rule.cssRules, ctx, src);
      }
    };
    Array.from(document.styleSheets).forEach(sh => {
      if (sh.disabled) return;
      const name = sheetName(sh);
      if (SKIP_SHEETS.includes(name)) return;
      let rules;
      try { rules = sh.cssRules; } catch (e) { return; }
      visit(rules, '', name);
    });
    return Array.from(out.values());
  }

  function markupOf(spec) {
    return spec.innerHTML.replace(/\s+/g, ' ').replace(/ (id|for|aria-hidden)="[^"]*"/g, '').trim().slice(0, 1600);
  }

  /* ---------- inspect / compare ---------- */
  const groupIndexOf = id => UI_KIT.findIndex(g => g.items.some(i => i.id === id));

  // styles: [key]; returns one record per style. Leaves the drawn cells in #lg-stage (one column per style) for screenshots.
  L.inspect = async ({ component, styles, look, mode, stateFilter, keepStage, colWidth, sheet }) => {
    const gi = groupIndexOf(component);
    if (gi < 0) throw new Error('unknown component ' + component);
    const st = stage();
    const results = [];
    for (const key of styles) {
      await L.apply({ look, mode, style: key, sheet });
      const col = document.createElement('div');
      col.className = 'lg-col'; col.dataset.lgStyle = key;
      const cap = document.createElement('div');
      cap.textContent = key; cap.style.cssText = 'font:600 14px/1.2 system-ui,sans-serif;color:#fff;padding:0 0 8px;';
      const host = document.createElement('div');
      host.className = 'sb-view';
      host.style.cssText = `width:${colWidth || 944}px;`;
      col.append(cap, host);
      st.appendChild(col);
      SeeBuilt.kitInto(host, { mode: mode || 'light', groups: [gi] });
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      const cell = host.querySelector(`.sb-k-cell[data-k="${component}"]`);
      if (!cell) { results.push({ style: key, error: 'the kit did not draw ' + component }); continue; }
      let states = Array.from(cell.querySelectorAll('.sb-k-state')).map(s => ({ name: (s.querySelector('.sb-k-slabel') || {}).textContent || 'rest', spec: s.querySelector('.sb-k-spec') })).filter(s => s.spec);
      if (stateFilter) states = states.filter(s => s.name.trim().toLowerCase() === stateFilter.toLowerCase());
      if (!states.length) { results.push({ style: key, error: 'no drawn state "' + stateFilter + '" (drawn: ' + Array.from(cell.querySelectorAll('.sb-k-slabel')).map(x => x.textContent).join(', ') + ')' }); continue; }
      const recs = states.map(s => {
        const sub = subjects(s.spec);
        const rec = { state: s.name.trim(), values: {} };
        Object.keys(sub).forEach(k => { rec.values[k] = values(sub[k]); });
        return rec;
      });
      results.push({
        style: key, origin: srcOf(key) === 'builtin' ? 'built-in' : 'custom', component,
        states: recs,
        rules: rulesFor(states.map(s => ({ name: s.name.trim(), el: s.spec }))),
        markup: markupOf(states[0].spec),
      });
      // keep only this component's cell visible (the screenshots crop to it)
      for (let n = cell; n && n !== host; n = n.parentElement) Array.from(n.parentElement.children).forEach(c => { if (c !== n) c.style.display = 'none'; });
    }
    if (!keepStage) stage().remove();
    return results;
  };

  /* ---------- screens ---------- */
  // Draws one screen x mode into a fresh host (ProductScreens.exportInto). Run twice: fonts that load late change line breaks.
  L.screen = async ({ id, mode }) => {
    const st = stage();
    st.style.padding = '0'; st.style.background = 'transparent'; st.style.display = 'block';
    const host = document.createElement('div');
    host.id = 'lg-screen-host';
    st.appendChild(host);
    let size = ProductScreens.exportInto(host, state, id, mode);
    if (document.fonts && document.fonts.ready) await Promise.race([document.fonts.ready, sleep(2500)]);
    await sleep(150);
    size = ProductScreens.exportInto(host, state, id, mode);
    host.style.width = size.width + 'px'; host.style.height = size.height + 'px';
    await sleep(120);
    return size;
  };

  // The Built kit for the current look, top 944 x 4000 (like the checker's kit-top).
  L.kit = async ({ mode }) => {
    const st = stage();
    st.style.padding = '0'; st.style.background = 'transparent'; st.style.display = 'block';
    const host = document.createElement('div');
    host.id = 'lg-kit-host'; host.className = 'sb-view';
    host.style.cssText = 'width:944px;max-height:4000px;overflow:hidden;';
    st.appendChild(host);
    SeeBuilt.kitInto(host, { mode });
    if (document.fonts && document.fonts.ready) await Promise.race([document.fonts.ready, sleep(2500)]);
    await sleep(300);
    return { height: Math.round(host.getBoundingClientRect().height) };
  };
  // Imports a packed bundle (an unlisted folder) under the key inside it; removed again by removeKey.
  L.importBundle = async ({ url, text }) => {
    if (text == null) text = await (await fetch(url, { cache: 'no-store' })).text();
    const r = await CustomAesthetics.importText(text);
    return { ok: !!r.ok, error: r.error || '', key: r.key || null };
  };
  L.removeKey = async ({ key }) => { try { await CustomAesthetics.remove(key); } catch (e) { /* gone already */ } return true; };
  L.clearStage = () => { const s = document.getElementById('lg-stage'); if (s) s.remove(); return true; };

  /* ---------- the build pack ---------- */
  L.pack = async ({ target, surface }) => {
    if (typeof BuildPack === 'undefined') throw new Error('BuildPack is missing: update Looks Good');
    if (target) aibSetTarget(state, target);
    if (surface) aibSetSurface(state, surface);
    const checked = buildAiBriefChecked(state);
    const block = typeof briefProductBlock === 'function' ? briefProductBlock(checked.issues) : null;
    // BuildPack.run (the buttons) stops on a product block and asks to confirm lint problems; headless we build anyway
    // through BuildPack.build (no gates) and hand the same problems back as warnings.
    const { md } = await BuildPack.build({ briefMd: checked.md });
    return { md, issues: (checked.issues || []).map(i => i.message), blocked: block ? block.message : null, target: aibGetTarget(state), surface: aibGetSurface(state) };
  };

  window.__lg = L;
})();
