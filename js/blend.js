/* ---------------------------------------------------------------------
   blend.js — blend two aesthetics (docs/blend.md).

   state.aesthetic is the BASE: it owns structure (layout, components, CSS
   scope, default mode) and wins every conflict on structure and accessibility.
   state.blend = null | { with: <donor key>, strength, channels } names a DONOR
   and the channels it supplies:
     art       the donor's hero art, inside the base's art box (board hero, deck
               cover and Material slide), drawn in a nested `.ab[data-ae=donor]`
               scope so the donor's own CSS styles it
     type      the donor's first recommended pairing (unless typography is
               locked) plus its headline casing / tracking / weight / style and
               its interface-face choices
     color     the donor's highlight treatment, canvas tint and printed primary
               (body text keeps >= 4.5:1, base mode wins)
     patterns  the pattern suite interleaves base and donor families
     material  the donor's material recipes (the states row of 02) and its
               ornament layer (root textures) behind the 02 panel
   Nothing is hand-tuned per pair: a new aesthetic works as a base or a donor
   as soon as it is registered.

   One entry point for render surfaces: aestheticView(state) -> { state, def,
   blend }. Without an active blend it returns the very same state object and
   aestheticByKey(state.aesthetic), so unblended output is byte-identical.

   Kill switch: BLEND_ENABLED. false = no UI, state.blend ignored by the board,
   deck, patterns and brief; saved blends still load and save unchanged.
   Plain <script>, no modules. Loaded after aesthetic-board.js.
------------------------------------------------------------------------ */

const BLEND_ENABLED = true;

const BLEND_CHANNELS = ['art', 'type', 'color', 'patterns', 'material'];
const BLEND_STRENGTHS = ['subtle', 'balanced', 'bold', 'custom'];
const BLEND_PRESETS = {
  subtle: { art: true, type: false, color: false, patterns: true, material: false },
  balanced: { art: true, type: true, color: false, patterns: true, material: false },
  bold: { art: true, type: true, color: true, patterns: true, material: true },
};
const BLEND_CHANNEL_LABEL = { art: 'Art', type: 'Type', color: 'Color', patterns: 'Patterns', material: 'Material' };
const BLEND_STRENGTH_LABEL = { subtle: 'Subtle', balanced: 'Balanced', bold: 'Bold', custom: 'Custom' };

/* ---------------- state (pure: also used by persistence.js and tests) ---------------- */

function blendPreset(strength) {
  return Object.assign({}, BLEND_PRESETS[strength] || BLEND_PRESETS.balanced);
}

// The named preset these channels match, else 'custom'.
function blendStrengthOf(channels) {
  const hit = Object.keys(BLEND_PRESETS).find(k => BLEND_CHANNELS.every(c => !!BLEND_PRESETS[k][c] === !!channels[c]));
  return hit || 'custom';
}

// A clean copy of a saved / snapshot / UI blend, or null. Null when: not an object,
// the donor key is unknown or equals the base, a channel is not a boolean, or no
// channel is on. A named strength without channels takes that preset. The strength
// is re-derived from the channels so the two never disagree.
function normalizeBlend(raw, baseKey) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const key = raw.with;
  if (typeof key !== 'string' || !key || key === baseKey) return null;
  if (typeof AESTHETICS === 'undefined' || !AESTHETICS.some(a => a.key === key)) return null;
  let channels;
  if (raw.channels != null) {
    if (typeof raw.channels !== 'object' || Array.isArray(raw.channels)) return null;
    channels = {};
    for (const c of BLEND_CHANNELS) {
      const v = raw.channels[c];
      if (v !== undefined && typeof v !== 'boolean') return null;
      channels[c] = v === true;
    }
  } else if (BLEND_PRESETS[raw.strength]) {
    channels = blendPreset(raw.strength);
  } else {
    return null;
  }
  if (!BLEND_CHANNELS.some(c => channels[c])) return null;
  return { with: key, strength: blendStrengthOf(channels), channels };
}

function blendCopy(b) {
  return b ? { with: b.with, strength: b.strength, channels: Object.assign({}, b.channels) } : null;
}

// The blend the renderers use: null when the kill switch is off or the blend is invalid.
function blendActive(st) {
  if (!BLEND_ENABLED || !st) return null;
  return normalizeBlend(st.blend, st.aesthetic);
}

/* ---------------- naming ---------------- */

function blSplit(text, sep) {
  return String(text || '').split(sep).map(s => s.trim()).filter(Boolean);
}

// "Warm · Graphic · Tactile" + "Thorned · Silver · Cold" -> "Warm · Graphic · Thorned".
function blendDescriptor(a, b) {
  const A = blSplit(a, '·');
  const B = blSplit(b, '·').filter(w => !A.some(x => x.toLowerCase() === w.toLowerCase()));
  return A.slice(0, 2).concat(B.slice(0, 1)).join(' · ') || String(a || '');
}

function blendInfluences(a, b) {
  const A = blSplit(a, '/');
  const B = blSplit(b, '/').filter(w => !A.includes(w));
  return A.slice(0, 2).concat(B.slice(0, 1)).join(' / ') || String(a || '');
}

function blendKicker(base, donor) {
  const a = base.kicker || blSplit(base.descriptor, '·')[0] || base.name;
  const b = donor.kicker || donor.name;
  return (a + b).length <= 40 ? `${a} × ${b}` : `${a} × ${donor.name}`;
}

/* ---------------- merged rules ---------------- */

// Topics a rule can legislate, and who owns each in a blend: a channel name (the
// donor owns it when that channel is granted) or 'base' (structure and
// accessibility, always the base's). Matched against a rule's first clause only.
const BL_TOPICS = [
  ['gradients', 'color', /gradient/i],
  ['the highlight word', 'color', /highlight|headline word|accent word/i],
  ['the accent', 'color', /\baccent/i],
  ['color treatment', 'color', /\b(palette|saturat\w*|desaturat\w*|neon|pastels?|fluoro|day-?glo|monochrome|duotone)\b/i],
  ['shadows', 'material', /shadow|elevation|emboss|bevel/i],
  ['blur and glass', 'material', /blur|frost|glass|translucen|backdrop/i],
  ['texture', 'material', /grain|noise|texture|halftone|scan-?lines?|speckle|dither/i],
  ['glow', 'material', /glow|bloom/i],
  ['letter case', 'type', /upper-?case|all[- ]caps|lower-?case|small caps|capitals/i],
  ['typefaces', 'type', /serif|typeface|\bfonts?\b|\bmono(space)?\b|display face|script/i],
  ['tracking', 'type', /tracking|letter-?spacing|tracked/i],
  ['italics', 'type', /italic/i],
  ['illustration', 'art', /illustrat|\bart\b|artwork|emblem|sigil|figure|drawing|ornament/i],
  ['patterns', 'patterns', /pattern/i],
  ['corner radius', 'base', /radius|rounded|round corners|square corners|sharp corners|\bpills?\b|capsule/i],
  ['borders', 'base', /border|outline|hairline|stroke/i],
  ['layout', 'base', /\bgrid\b|column|layout|spacing|white ?space|margin|gutter|align/i],
  ['motion', 'base', /animat|motion|transition|bounce|parallax/i],
  ['legibility', 'base', /contrast|legib|readab|accessib/i],
];

function blRuleHead(rule) {
  if (typeof bdRuleParts === 'function') return bdRuleParts(rule).head;
  return String(rule || '').split(/[;:]| — /)[0];
}

function blTopics(rule) {
  const head = blRuleHead(rule);
  return BL_TOPICS.filter(tp => tp[2].test(head)).map(tp => tp[0]);
}

const blTopicOwner = name => (BL_TOPICS.find(tp => tp[0] === name) || [])[1] || 'base';

function blQuote(rule) {
  const s = String(blRuleHead(rule) || '').replace(/\s+/g, ' ').trim();
  return s.length > 90 ? s.slice(0, 88).replace(/\s+\S*$/, '') + '…' : s;
}

// Base rules + the donor's rules about its granted channels. Where a base rule and a
// donor rule legislate the same topic, the topic's owner keeps its rule and the
// other one is dropped and listed in `conflicts`.
function blendRules(base, donor, ch) {
  const granted = BLEND_CHANNELS.filter(c => ch[c]);
  const br = { do: ((base.rules || {}).do || []).slice(), dont: ((base.rules || {}).dont || []).slice() };
  const dr = (donor.rules || {});
  const touches = r => blTopics(r).some(tp => granted.includes(blTopicOwner(tp)));
  const cand = { do: (dr.do || []).filter(touches).slice(0, 4), dont: (dr.dont || []).filter(touches).slice(0, 4) };
  const dropBase = new Set();
  const dropDonor = new Set();
  const conflicts = [];
  const kinds = ['do', 'dont'];
  kinds.forEach(bk => br[bk].forEach(b => {
    if (dropBase.has(b)) return;
    const bt = blTopics(b);
    kinds.forEach(dk => cand[dk].forEach(r => {
      if (dropBase.has(b) || dropDonor.has(r)) return;
      const shared = blTopics(r).filter(tp => bt.includes(tp));
      if (!shared.length) return;
      // A donor-owned topic, if any is shared, decides; otherwise the base owns it.
      const topic = shared.find(tp => granted.includes(blTopicOwner(tp))) || shared[0];
      const donorWins = granted.includes(blTopicOwner(topic));
      if (donorWins) dropBase.add(b); else dropDonor.add(r);
      conflicts.push({
        topic,
        owner: donorWins ? 'donor' : 'base',
        kept: donorWins ? { from: donor.name, kind: dk, text: blQuote(r) } : { from: base.name, kind: bk, text: blQuote(b) },
        dropped: donorWins ? { from: base.name, kind: bk, text: blQuote(b) } : { from: donor.name, kind: dk, text: blQuote(r) },
        why: donorWins ? `${donor.name} supplies ${blTopicOwner(topic)} in this blend` : (blTopicOwner(topic) === 'base'
          ? `${topic} belongs to the base structure` : `${base.name} keeps ${blTopicOwner(topic)} in this blend`),
      });
    }));
  }));
  const donorKept = { do: cand.do.filter(r => !dropDonor.has(r)).slice(0, 3), dont: cand.dont.filter(r => !dropDonor.has(r)).slice(0, 3) };
  return {
    rules: { do: br.do.filter(r => !dropBase.has(r)).concat(donorKept.do), dont: br.dont.filter(r => !dropBase.has(r)).concat(donorKept.dont) },
    donorKept,
    baseDropped: dropBase.size,
    conflicts,
  };
}

// Deck copy: the base's own short lines (or its kept rules shortened) with one donor line.
function blendDeck(base, donor, merged) {
  const d = Object.assign({}, base.deck || {});
  const short = r => (typeof bdWords === 'function' ? bdWords(blRuleHead(r), 10) + '.' : blQuote(r));
  ['do', 'dont'].forEach(kind => {
    const own = base.deck && Array.isArray(base.deck[kind]) && base.deck[kind].length && !merged.baseDropped
      ? base.deck[kind].slice(0, 2).map(String)
      : merged.rules[kind].filter(r => !merged.donorKept[kind].includes(r)).slice(0, 2).map(short);
    const extra = merged.donorKept[kind][0];
    d[kind] = extra ? own.concat(short(extra)) : own.slice();
  });
  const pr = typeof bdPrinciples === 'function' ? bdPrinciples(base).slice(0, 2) : [];
  const dk = merged.donorKept.do[0];
  if (pr.length && dk && typeof bdRuleParts === 'function' && typeof bdWords === 'function') {
    const x = bdRuleParts(dk);
    d.principles = pr.concat([[bdWords(x.head, 4), x.tail ? bdWords(x.tail, 12) + '.' : '']]);
  }
  return d;
}

/* ---------------- the blended definition ---------------- */

const BL_DEF_CACHE = new Map();

function blendTypePair(key) {
  const meta = typeof aestheticMeta === 'function' ? aestheticMeta(key) : null;
  const pair = meta && meta.fonts && meta.fonts.pairings && meta.fonts.pairings[0];
  if (!pair || typeof FONTS === 'undefined') return null;
  const h = FONTS.find(f => f.name === pair[0]);
  const b = FONTS.find(f => f.name === pair[1]);
  return h && b ? [h, b] : null;
}

// A shallow copy of the base def with the donor's granted hooks swapped in. `key`
// stays the base's, so the base CSS scope, layout and components are untouched.
function blendDef(base, donor, b, typeFrom, typeLocked) {
  const ck = [base.key, donor.key, BLEND_CHANNELS.map(c => (b.channels[c] ? 1 : 0)).join(''), typeFrom || '', typeLocked ? 1 : 0].join('|');
  if (BL_DEF_CACHE.has(ck)) return BL_DEF_CACHE.get(ck);
  const ch = b.channels;
  const d = Object.assign({}, base);
  const merged = blendRules(base, donor, ch);
  const granted = BLEND_CHANNELS.filter(c => ch[c]);
  d.blend = {
    base, donor, strength: b.strength, channels: Object.assign({}, ch),
    typeFrom: typeFrom || null, typeLocked: !!typeLocked,
    conflicts: merged.conflicts, donorRules: merged.donorKept,
  };
  d.name = `${base.name} × ${donor.name}`;
  d.descriptor = blendDescriptor(base.descriptor, donor.descriptor);
  d.influences = blendInfluences(base.influences, donor.influences);
  d.kicker = blendKicker(base, donor);
  d.summary = `${base.summary ? base.summary.trim() + ' ' : ''}Blended with ${donor.name}, which supplies the ${blendList(granted.map(c => BLEND_CHANNEL_LABEL[c].toLowerCase()))}.`;
  d.rules = merged.rules;
  d.deck = blendDeck(base, donor, merged);

  if (ch.art && typeof donor.art === 'function') d.art = ctx => blendArtHtml(donor, ctx);
  if (ch.type) {
    d.type = Object.assign({ ui: 'body', label: null, display: 1 }, donor.type);
    if (donor.typeNotes) d.typeNotes = donor.typeNotes; else delete d.typeNotes;
  }
  if (ch.color) {
    d.highlight = donor.highlight;
    d.highlightNote = donor.highlightNote;
    d.printPrimary = donor.printPrimary;
    // The donor's canvas tint, but base mode and body contrast win: a tint that
    // drops ink below 4.5:1 falls back to the base's own canvas.
    d.canvas = typeof donor.canvas === 'function' ? (bs => {
      const own = typeof base.canvas === 'function' ? (base.canvas(bs) || bs.canvas) : bs.canvas;
      let c = null;
      try { c = donor.canvas(bs); } catch (err) { c = null; }
      if (typeof c !== 'string' || !/^#[0-9a-f]{6}$/i.test(c)) return own;
      return contrastRatio(bs.ink, c) >= 4.5 ? c : own;
    }) : base.canvas;
  }
  if (ch.material) {
    const mats = blendSampleMaterials(donor);
    d.materials = (donor.materials || []).slice();
    d.labels = Object.assign({}, base.labels, {
      material: (donor.labels && donor.labels.material) || (base.labels && base.labels.material),
      states: mats.length ? blendMatNames(mats.map(m => m.name)) : (base.labels && base.labels.states),
    });
  }
  BL_DEF_CACHE.set(ck, d);
  return d;
}

function blendList(words) {
  if (words.length <= 1) return words.join('');
  return words.slice(0, -1).join(', ') + ' and ' + words[words.length - 1];
}

// The single entry point for render surfaces (board, deck, patterns, brief).
function aestheticView(st) {
  const base = aestheticByKey(st.aesthetic);
  const b = blendActive(st);
  if (!b) return { state: st, def: base, blend: null };
  const donor = aestheticByKey(b.with);
  if (!donor || donor.key === base.key) return { state: st, def: base, blend: null };
  let vs = st;
  let typeFrom = null;
  const locked = !!(st.locks && st.locks.typography);
  if (b.channels.type && !locked) {
    const pair = blendTypePair(donor.key);
    if (pair) {
      vs = Object.assign({}, st, { headingFont: pair[0], bodyFont: pair[1] });
      typeFrom = donor.key;
    }
  }
  return { state: vs, def: blendDef(base, donor, b, typeFrom, b.channels.type && locked), blend: b };
}

/* ---------------- patterns ---------------- */

// The pattern suite for a (possibly blended) def. Interleaved 3 + 3 without
// repeating a family; the donor leads when the blend is Bold or patterns is the
// donor's only channel, otherwise the base leads.
function blendSuite(def) {
  if (typeof Patterns === 'undefined' || typeof Patterns.suiteFor !== 'function') return [];
  const bd = def && def.blend;
  if (!bd || !bd.channels.patterns) return Patterns.suiteFor(def.key);
  const donorFirst = bd.strength === 'bold' || BLEND_CHANNELS.every(c => (c === 'patterns') === !!bd.channels[c]);
  const A = Patterns.suiteFor(bd.base.key).slice();
  const B = Patterns.suiteFor(bd.donor.key).slice();
  const queues = donorFirst ? [B, A] : [A, B];
  const out = [];
  const seen = new Set();
  let turn = 0;
  while (out.length < 6 && (queues[0].length || queues[1].length)) {
    const q = queues[turn % 2].length ? queues[turn % 2] : queues[(turn + 1) % 2];
    while (q.length) {
      const s = q.shift();
      if (!seen.has(s.key)) { seen.add(s.key); out.push(s); break; }
    }
    turn++;
  }
  return out;
}

// The suite for the current state (Patterns view).
function blendSuiteFor(st) {
  return blendSuite(aestheticView(st).def);
}

/* ---------------- nested donor scopes (art, ornament, material samples) ---------------- */

const BL_HERO_RATIO = { split: '1', centered: '16 / 7', poster: '1', scene: '21 / 10' };

function blendDonorTokens(donor, t) {
  if (typeof donor.tokens !== 'function') return {};
  try { return donor.tokens(t) || {}; } catch (err) { return {}; }
}

function blStyle(vars) {
  return Object.entries(vars).map(([k, v]) => `${k}:${String(v).replace(/"/g, "'")}`).join(';');
}

// Opening tag of a `.ab[data-ae=donor]` scope inside a base board: the donor's CSS
// matches everything inside it, css/blend.css neutralises the root-level surface.
function blScopeOpen(donor, t, state, cls, extraStyle) {
  const dl = abLayoutOf(donor);
  const vars = blendDonorTokens(donor, t);
  const hf = (state && state.headingFont) || {};
  const bf = (state && state.bodyFont) || {};
  const style = blStyle(vars) + (extraStyle ? ';' + extraStyle : '');
  return `<div class="ab ${cls}" data-ae="${donor.key}" data-mode="${t.isDark ? 'dark' : 'light'}" data-accent-text="${t.accentLow ? 'low' : 'ok'}" data-hero="${dl.hero}" data-palette="${dl.palette}" data-sections="${dl.sections}" data-highlight="${abHighlightOf(donor)}" data-states="swatch" data-subcopy="on" data-hcls="${escapeHtml(hf.cls || '')}" data-bcls="${escapeHtml(bf.cls || '')}" aria-hidden="true"${style ? ` style="${style}"` : ''}>`;
}

// The donor's art, filling the base's art box (and cropped by it).
function blendArtHtml(donor, ctx) {
  let inner = '';
  try { inner = donor.art(Object.assign({}, ctx, { key: donor.key })) || ''; } catch (err) {
    console.error(`blend: ${donor.key} art failed`, err);
    inner = '';
  }
  const dl = abLayoutOf(donor);
  const vars = blendDonorTokens(donor, ctx.t);
  // Only used where the base's art box takes its height from its content (aspect-ratio
  // auto): the donor's own ratio, never squarer than 3:2 on a board or 16:9 on a slide,
  // so a full-width box does not turn into a tall square.
  const raw = String(vars['--ab-art-ratio'] || BL_HERO_RATIO[dl.hero] || '1');
  const m = raw.match(/^\s*([\d.]+)\s*(?:\/\s*([\d.]+))?\s*$/);
  const num = m ? Number(m[1]) / (Number(m[2]) || 1) : 1;
  const r = n => (Math.max(num || 1, n)).toFixed(3);
  return `${blScopeOpen(donor, ctx.t, ctx.state, 'ab-blend-art', `--bl-art-ratio:${r(1.5)};--bl-art-ratio-deck:${r(16 / 9)}`)}<div class="ab-art ab-blend-inner">${inner}</div></div>`;
}

// Materials that can be shown as a sample: recipes that paint a background. Recipes
// that would read on the canvas (a gradient, an image, a shadow or an opaque fill) come
// first; a near-transparent wash is only used when nothing else is left. Three at most.
function blendSampleMaterials(donor) {
  const paints = m => m && /(^|[;\s])background(-color|-image)?\s*:/.test(String(m.css || ''));
  const visible = m => {
    const css = String(m.css || '').replace(/\/\*[\s\S]*?\*\//g, '');
    if (/gradient\(|url\(|box-shadow\s*:/.test(css)) return true;
    const bg = (css.match(/background(?:-color)?\s*:\s*([^;]+)/) || [])[1] || '';
    const a = bg.match(/rgba\([^)]*,\s*([\d.]+)\s*\)/);
    return !(a && Number(a[1]) < 0.85) && !/transparent/.test(bg);
  };
  const all = (donor.materials || []).filter(paints);
  return all.filter(visible).concat(all.filter(m => !visible(m))).slice(0, 3);
}

function blendMatNames(names) {
  if (typeof bdMatNames === 'function') return bdMatNames(names);
  return names.map(n => String(n || '').replace(/\s*\([^)]*\)/g, '').trim());
}

const blKebab = name => name.replace(/[A-Z]/g, m => '-' + m.toLowerCase());

// {placeholder} -> t[name], else the donor's extra var --ab-<kebab(name)> (as its value).
function blendResolveMaterial(css, t, extras) {
  return String(css || '').replace(/\{([A-Za-z][A-Za-z0-9]*)\}/g, (whole, name) => {
    const own = t[name];
    if (typeof own === 'string' || typeof own === 'number') return String(own);
    const extra = extras['--ab-' + blKebab(name)];
    return extra != null ? String(extra) : 'transparent';
  });
}

// A recipe as an inline style for its sample: comments dropped, and url() references
// that are only descriptive ("url(mottle.svg)") neutralised so nothing is fetched.
function blendSampleCss(css, t, extras) {
  return blendResolveMaterial(String(css || '').replace(/\/\*[\s\S]*?\*\//g, ''), t, extras)
    .replace(/url\(\s*(?!['"]?data:)[^)]*\)/gi, 'linear-gradient(transparent, transparent)');
}

/* ---------------- computed treatments (type, highlight) ---------------- */

// The donor's headline treatment and highlight word, read from a hidden probe board in
// the donor's scope with the same tokens. Cached per donor + style. Null without a DOM.
const BL_PROBE_CACHE = new Map();
const BL_PROBE_LAST = {};
const BL_HL_PROPS = [
  ['color', 'color'], ['-webkit-text-fill-color', 'fill'], ['background-color', 'bgc'], ['background-image', 'bgi'],
  ['background-size', 'bgs'], ['background-position', 'bgp'], ['background-repeat', 'bgr'], ['background-clip', 'clip'],
  ['box-shadow', 'bsh'], ['text-shadow', 'tsh'], ['text-decoration-line', 'tdl'], ['text-decoration-color', 'tdc'],
  ['text-decoration-style', 'tds'], ['font-style', 'fst'], ['display', 'disp'], ['transform', 'tf'],
  ['-webkit-text-stroke-width', 'tsw'], ['-webkit-text-stroke-color', 'tsc'],
];

function blendProbe(donor, P) {
  if (typeof document === 'undefined' || !document.body || typeof getComputedStyle !== 'function') return null;
  const t = P.t;
  const extra = blStyle(blendDonorTokens(donor, t));
  const ck = donor.key + '|' + P.style + '|' + extra;
  if (BL_PROBE_CACHE.has(ck)) return BL_PROBE_CACHE.get(ck);
  const dl = abLayoutOf(donor);
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = 'position:fixed;left:-20000px;top:0;width:1000px;visibility:hidden;pointer-events:none;';
  host.innerHTML = `<section class="ab" data-ae="${donor.key}" data-mode="${t.isDark ? 'dark' : 'light'}" data-accent-text="${t.accentLow ? 'low' : 'ok'}" data-hero="${dl.hero}" data-palette="${dl.palette}" data-sections="${dl.sections}" data-highlight="${abHighlightOf(donor)}" data-states="swatch" data-subcopy="on" data-hcls="${escapeHtml(P.state.headingFont.cls || '')}" data-bcls="${escapeHtml(P.state.bodyFont.cls || '')}" style="${P.style};${extra}"><div class="ab-in"><section class="ab-hero"><div class="ab-hero-copy"><p class="ab-kicker">Probe</p><h2 class="ab-headline">Good design <span class="ab-hl">alive</span></h2></div></section></div></section>`;
  document.body.appendChild(host);
  let out = null;
  try {
    const h = host.querySelector('.ab-headline');
    const hl = host.querySelector('.ab-hl');
    const cs = getComputedStyle(h);
    const fs = parseFloat(cs.fontSize) || 16;
    const ls = cs.letterSpacing === 'normal' ? 0 : (parseFloat(cs.letterSpacing) || 0) / fs;
    const hcs = getComputedStyle(hl);
    const hlv = {};
    BL_HL_PROPS.forEach(([prop, k]) => { hlv[k] = hcs.getPropertyValue(prop); });
    const em = px => ((parseFloat(px) || 0) / fs).toFixed(3) + 'em';
    hlv.pad = [hcs.paddingTop, hcs.paddingRight, hcs.paddingBottom, hcs.paddingLeft].map(em).join(' ');
    hlv.rad = em(hcs.borderTopLeftRadius);
    hlv.tdt = /px$/.test(hcs.textDecorationThickness) ? em(hcs.textDecorationThickness) : hcs.textDecorationThickness;
    hlv.tuo = /px$/.test(hcs.textUnderlineOffset) ? em(hcs.textUnderlineOffset) : hcs.textUnderlineOffset;
    if (!hlv.clip || hlv.clip === 'border-box') hlv.clip = hcs.getPropertyValue('-webkit-background-clip') || 'border-box';
    // A highlight the donor draws only with pseudo-elements (or not at all) reads as
    // plain headline text here: flag it so the blend falls back to the accent-ink word.
    const clear = v => !v || v === 'none' || v === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(v);
    const plain = hlv.color === cs.color && clear(hlv.bgc) && clear(hlv.bgi) && clear(hlv.tsh) && clear(hlv.bsh)
      && (hlv.tdl || 'none') === 'none' && (parseFloat(hlv.tsw) || 0) === 0 && (hlv.fst === cs.fontStyle);
    // ...and so does one whose text would not read on this canvas (a white word meant
    // for the donor's own scene): the 3:1 large-text floor wins over the donor's look.
    const rgbHex = v => { const n = String(v).match(/[\d.]+/g); return n && n.length >= 3 ? '#' + n.slice(0, 3).map(x => Math.round(Number(x)).toString(16).padStart(2, '0')).join('') : null; };
    const filled = !/rgba\([^)]*,\s*0\)$/.test(hlv.fill || '') && hlv.fill !== 'transparent';
    const bgA = (String(hlv.bgc).match(/[\d.]+/g) || []).map(Number);
    const ground = bgA.length >= 3 && (bgA.length < 4 || bgA[3] > 0.9) ? rgbHex(hlv.bgc) : (clear(hlv.bgi) ? t.canvas : null);
    const ink = rgbHex(hlv.color);
    const unreadable = filled && ground && ink && contrastRatio(ink, ground) < 3;
    out = {
      tt: cs.textTransform || 'none',
      ls: Math.max(-0.12, Math.min(0.3, ls)),
      fw: cs.fontWeight || '400',
      fst: cs.fontStyle || 'normal',
      // Line height travels with the faces (a tall display face needs the donor's leading).
      lh: Math.max(0.86, Math.min(1.25, cs.lineHeight === 'normal' ? 1.15 : (parseFloat(cs.lineHeight) || fs * 1.1) / fs)),
      hl: hlv,
      // Clipped-gradient text whose gradient this engine did not compute would vanish.
      hlPlain: plain || unreadable || ((!filled || clear(hlv.color)) && clear(hlv.bgi)),
    };
  } catch (err) {
    out = null;
  }
  host.remove();
  if (BL_PROBE_CACHE.size > 60) BL_PROBE_CACHE.delete(BL_PROBE_CACHE.keys().next().value);
  BL_PROBE_CACHE.set(ck, out);
  if (out) BL_PROBE_LAST[donor.key] = out;
  return out;
}

/* ---------------- board parts hook (called by abBoardParts) ---------------- */

// Rewires the parts of a blended board: root attributes and vars, the 02 states row
// (donor materials) and its ornament layer. Art and naming come from the def itself.
function blendParts(P) {
  const bd = P.def.blend;
  if (!bd) return P;
  const donor = bd.donor;
  const ch = bd.channels;
  const on = BLEND_CHANNELS.filter(c => ch[c]);
  let attrs = ` data-blend="${donor.key}" data-blend-ch="${on.join(' ')}"`;
  const vars = [];
  const needProbe = ch.type || (ch.color && abHighlightOf(donor) === 'custom');
  const probe = needProbe ? blendProbe(donor, P) : null;
  if (ch.type) {
    if (bd.typeFrom) vars.push(`--ab-font-h:${P.state.headingFont.css}`, `--ab-font-b:${P.state.bodyFont.css}`);
    if (probe) {
      attrs += ' data-blend-type="on"';
      vars.push(`--blt-tt:${probe.tt}`, `--blt-ls:${probe.ls.toFixed(3)}em`, `--blt-fw:${probe.fw}`, `--blt-fs:${probe.fst}`, `--blt-lh:${probe.lh.toFixed(3)}`);
    }
  }
  if (ch.color) {
    const kind = abHighlightOf(donor);
    if (kind !== 'custom') attrs += ` data-blend-hl="${kind}"`;
    else if (!probe || probe.hlPlain) attrs += ' data-blend-hl="ink"';
    else {
      attrs += ' data-blend-hl="probe"';
      Object.entries(probe.hl).forEach(([k, v]) => vars.push(`--blh-${k}:${String(v || 'initial')}`));
    }
  }
  if (vars.length) P.style += ';' + vars.map(v => v.replace(/"/g, "'")).join(';');
  const ro = P.rootOpen;
  P.rootOpen = (extraClass = '', extraAttrs = '') => ro(extraClass, extraAttrs + attrs);

  if (ch.material) {
    const mats = blendSampleMaterials(donor);
    const extras = blendDonorTokens(donor, P.t);
    if (mats.length) {
      const names = P.labels.states || [];
      P.states = () => `<div class="ab-states ab-blend-states" data-kind="blend">${mats.map((m, i) =>
        `<div class="ab-state ab-blend-state" data-s="${i}">${blScopeOpen(donor, P.t, P.state, 'ab-blend-scope')}<span class="ab-blend-sw" style="${escapeHtml(blendSampleCss(m.css, P.t, extras))}"></span></div><span class="ab-state-name">${escapeHtml(names[i] || m.name)}</span></div>`).join('')}</div>`;
    }
    P.panelPre = () => `${blScopeOpen(donor, P.t, P.state, 'ab-blend-orn')}</div>`;
  }
  return P;
}

/* ---------------- after layout ---------------- */

// A base that dissolves its art box (`display: contents`, so its own art pieces join
// the hero grid) leaves the donor's art as a bare grid item at full width. On a slide,
// cap that at a stage height so the cover does not have to scale down. Runs before
// the deck fit.
function blendFitArt(root) {
  if (!root || !root.querySelectorAll) return;
  root.querySelectorAll('.ab-blend-art').forEach(w => {
    w.style.removeProperty('max-height');
    const box = w.parentElement;
    if (box && getComputedStyle(box).display === 'contents' && root.classList.contains('ab-slide')) {
      w.style.setProperty('max-height', '300px', 'important');
    }
  });
}

// Where the base lays its copy over the art (a sticker field behind the headline, a
// scene panel), any text inside the donor's art would run under the base's words.
// Hide those art captions (visibility, so nothing moves); the art's shapes stay.
// Called after the board renders and after the deck fits.
function blendClearArtText(root) {
  if (!root || !root.querySelector) return;
  const inner = root.querySelector('.ab-hero .ab-blend-inner');
  const copies = [...root.querySelectorAll('.ab-hero .ab-hero-copy, .ab-deck-cover-meta')];
  if (!inner || !copies.length) return;
  inner.querySelectorAll('[data-bl-hidden]').forEach(el => { el.style.visibility = ''; el.removeAttribute('data-bl-hidden'); });
  const rectsOf = el => {
    const r = document.createRange();
    r.selectNodeContents(el);
    return [...r.getClientRects()].filter(q => q.width > 1 && q.height > 1);
  };
  const words = [].concat(...copies.map(rectsOf));
  if (!words.length) return;
  const hit = (a, b) => a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1;
  inner.querySelectorAll('*').forEach(el => {
    if (![...el.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim())) return;
    const box = el.getBoundingClientRect();   // the caption's block, not just its glyphs
    if (words.some(b => hit(box, b))) {
      el.style.visibility = 'hidden';
      el.setAttribute('data-bl-hidden', '1');
    }
  });
}

/* ---------------- AI brief section ---------------- */

// "## Blend" lines for buildAiBrief (js/ai-brief.js). `state` is the view state.
function blendBriefLines(state, def, t) {
  const bd = def.blend;
  if (!bd) return [];
  const base = bd.base;
  const donor = bd.donor;
  const ch = bd.channels;
  const src = c => (ch[c] ? donor.name : base.name);
  const probe = BL_PROBE_LAST[donor.key];
  const cell = s => String(s).replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
  const rows = [];
  rows.push(['Art', src('art'), ch.art
    ? `${donor.name}'s hero illustration, drawn in the brand tokens and framed and cropped by ${base.name}'s art box (board hero, deck cover, Material slide).`
    : `${base.name}'s own hero illustration.`]);
  let typeText;
  if (!ch.type) typeText = `${base.name}'s type treatment and the brand's own fonts.`;
  else {
    const caseWord = probe ? (probe.tt === 'none' ? 'mixed-case' : probe.tt) : '';
    const trk = probe ? `${probe.ls >= 0 ? '' : '−'}${Math.abs(probe.ls).toFixed(3)}em tracking, weight ${probe.fw}${probe.fst !== 'normal' ? ', ' + probe.fst : ''}` : '';
    const faces = bd.typeFrom ? `${state.headingFont.name} / ${state.bodyFont.name} (${donor.name}'s first recommended pairing)` : 'the brand\'s own fonts (typography is locked, so the blend does not change them)';
    typeText = `Faces: ${faces}.${probe ? ` Headlines: ${caseWord}, ${trk}.` : ''}`;
  }
  rows.push(['Type', bd.typeFrom || ch.type ? donor.name : base.name, typeText]);
  rows.push(['Color', src('color'), ch.color
    ? `${donor.name}'s palette treatment: its highlight word (${abHighlightOf(donor)}), its canvas tint${t.printed ? ` and its printed primary ${t.printPrimary}` : ''}. ${base.name}'s mode and the contrast rules still win (body text 4.5:1 or better).`
    : `${base.name}'s palette treatment.`]);
  const suite = blendSuite(def);
  rows.push(['Patterns', ch.patterns ? `${base.name} + ${donor.name}` : base.name, ch.patterns
    ? `Suite interleaves both systems, no family twice: ${suite.map(s => s.name).join(', ')}.`
    : `${base.name}'s pattern suite.`]);
  rows.push(['Material', src('material'), ch.material
    ? `${donor.name}'s material recipes (below) and its ornament layer behind material panels; ${base.name}'s components keep their structure.`
    : `${base.name}'s materials.`]);
  const out = [`## Blend: ${def.name}`, '',
    `This brand blends two design languages. **${base.name}** is the dominant system: it owns structure (layout, components, spacing, shapes), the ${t.isDark ? 'dark' : 'light'} mode and every accessibility rule. **${donor.name}** is the supporting system at ${BLEND_STRENGTH_LABEL[bd.strength].toLowerCase()} strength: it controls only the channels marked below. Where the two disagree, the owner of that channel wins.`, '',
    '| Channel | Source | What it controls |', '| --- | --- | --- |',
    ...rows.map(r => `| ${r.map(cell).join(' | ')} |`), ''];
  out.push('### Resolved conflicts', '');
  if (bd.conflicts.length) {
    const kw = k => (k === 'do' ? 'do' : "don't");
    const groups = new Map();
    bd.conflicts.forEach(c => {
      const id = c.topic + '|' + c.kept.from + '|' + c.kept.text;
      if (!groups.has(id)) groups.set(id, { c, dropped: [] });
      groups.get(id).dropped.push(c.dropped);
    });
    groups.forEach(({ c, dropped }) => {
      const drops = dropped.map(d => `${d.from}'s ${kw(d.kind)} "${d.text}"`).join(' and ');
      out.push(`- ${c.topic.charAt(0).toUpperCase() + c.topic.slice(1)}: kept ${c.kept.from}'s ${kw(c.kept.kind)} "${c.kept.text}"; dropped ${drops} (${c.why}).`);
    });
  } else {
    out.push(`- None. ${donor.name}'s rules for its channels do not contradict ${base.name}'s; both sets are merged under Do and Don't.`);
  }
  out.push('');
  return out;
}

/* ---------------- UI: "Blend with…" in the Aesthetic panel ---------------- */

let blendQuery = '';

function blendSetState(next) {
  const b = next ? normalizeBlend(next, state.aesthetic) : null;
  const cur = state.blend ? JSON.stringify(blendCopy(normalizeBlend(state.blend, state.aesthetic))) : 'null';
  if (JSON.stringify(b) === cur) return false;
  pushUndoSnapshot(state);
  state.blend = b;
  render();
  return true;
}

function blendChooseDonor(key) {
  if (!key) { blendSetState(null); return; }
  const cur = normalizeBlend(state.blend, state.aesthetic);
  const strength = cur ? cur.strength : 'balanced';
  const channels = cur ? cur.channels : blendPreset('balanced');
  blendSetState({ with: key, strength, channels });
}

// Surprise blend: a random donor and strength. Respects the aesthetic lock; one undo step.
function surpriseBlend() {
  if (state.locks && state.locks.aesthetic) { showToast('Unlock aesthetic to shuffle the blend'); return; }
  const pool = AESTHETICS.filter(a => a.key !== state.aesthetic && !(state.blend && a.key === state.blend.with));
  if (!pool.length) return;
  const donor = pool[Math.floor(Math.random() * pool.length)];
  const strength = ['subtle', 'balanced', 'bold'][Math.floor(Math.random() * 3)];
  blendSetState({ with: donor.key, strength, channels: blendPreset(strength) });
}

function blendOptionsHtml() {
  const q = blendQuery.trim().toLowerCase();
  const cur = normalizeBlend(state.blend, state.aesthetic);
  const opts = AESTHETICS.filter(a => a.key !== state.aesthetic)
    .filter(a => !q || `${a.name} ${a.descriptor} ${a.influences || ''}`.toLowerCase().includes(q));
  const none = !q ? `<button type="button" class="blend-opt blend-none" data-key="" aria-pressed="${!cur}"><span class="ae-name">None</span><span class="ae-desc">${escapeHtml(aestheticByKey(state.aesthetic).name)} on its own</span></button>` : '';
  if (!opts.length) return none + '<p class="blend-empty">No aesthetic matches.</p>';
  return none + opts.map(a => `<button type="button" class="ae-tile blend-opt" data-key="${a.key}" aria-pressed="${!!cur && cur.with === a.key}">
      <span class="ae-motif" data-motif="${a.key}" aria-hidden="true"></span>
      <span class="ae-num">${String(a.order).padStart(2, '0')}</span>
      <span class="ae-name">${escapeHtml(a.name)}</span>
      <span class="ae-desc">${escapeHtml(a.descriptor)}</span>
    </button>`).join('');
}

function blendRenderOptions() {
  const host = document.getElementById('blendOpts');
  if (host) host.innerHTML = blendOptionsHtml();
}

function blendOpen(open) {
  const pop = document.getElementById('blendPop');
  const btn = document.getElementById('blendPick');
  if (!pop || !btn) return;
  pop.hidden = !open;
  btn.setAttribute('aria-expanded', String(open));
  if (open) {
    blendRenderOptions();
    const s = document.getElementById('blendSearch');
    if (s) { s.value = blendQuery; s.focus(); }
  }
}

function syncBlendUi() {
  const box = document.getElementById('blendCtl');
  if (!box) return;
  box.hidden = !BLEND_ENABLED;
  if (!BLEND_ENABLED) return;
  const cur = normalizeBlend(state.blend, state.aesthetic);
  const donor = cur ? aestheticByKey(cur.with) : null;
  document.getElementById('blendPickName').textContent = donor ? donor.name : 'None';
  const body = document.getElementById('blendBody');
  body.hidden = !cur;
  if (cur) {
    document.querySelectorAll('input[name="blendStrength"]').forEach(r => { r.checked = r.value === cur.strength; });
    document.querySelectorAll('#blendChannels input[type="checkbox"]').forEach(c => { c.checked = !!cur.channels[c.value]; });
    const custom = document.getElementById('blendCustom');
    if (custom) custom.hidden = cur.strength !== 'custom';
    const note = document.getElementById('blendNote');
    const base = aestheticByKey(state.aesthetic);
    const lines = [`${base.name} keeps structure and layout; ${donor.name} supplies ${blendList(BLEND_CHANNELS.filter(c => cur.channels[c]).map(c => BLEND_CHANNEL_LABEL[c].toLowerCase()))}.`];
    if (cur.channels.type && state.locks.typography) lines.push(`Typography is locked, so your fonts stay; ${donor.name}'s casing and tracking still apply.`);
    else if (cur.channels.type && !blendTypePair(donor.key)) lines.push(`${donor.name} has no font pairing, so your fonts stay.`);
    note.textContent = lines.join(' ');
  }
  const pop = document.getElementById('blendPop');
  if (pop && !pop.hidden) blendRenderOptions();
}

function initBlendUi() {
  const box = document.getElementById('blendCtl');
  if (!box) return;
  if (!BLEND_ENABLED) { box.hidden = true; return; }
  const pick = document.getElementById('blendPick');
  const pop = document.getElementById('blendPop');
  const opts = document.getElementById('blendOpts');
  const search = document.getElementById('blendSearch');
  pick.addEventListener('click', () => blendOpen(pop.hidden));
  search.addEventListener('input', () => { blendQuery = search.value; blendRenderOptions(); });
  search.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { const f = opts.querySelector('.blend-opt'); if (f) { e.preventDefault(); f.focus(); } }
    if (e.key === 'Enter') { const f = opts.querySelector('.blend-opt:not(.blend-none)'); if (f) { e.preventDefault(); f.click(); } }
  });
  opts.addEventListener('click', e => {
    const b = e.target.closest('.blend-opt');
    if (!b) return;
    blendChooseDonor(b.dataset.key);
    blendOpen(false);
    pick.focus();
  });
  opts.addEventListener('keydown', e => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const all = [...opts.querySelectorAll('.blend-opt')];
    const i = all.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    if (e.key === 'ArrowUp' && i === 0) { search.focus(); return; }
    const n = all[Math.max(0, Math.min(all.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))];
    if (n) n.focus();
  });
  // Escape closes the list; Space inside it never triggers the global shuffle shortcut.
  box.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !pop.hidden) { e.stopPropagation(); blendOpen(false); pick.focus(); }
    if (e.key === ' ' && e.target !== search) e.stopPropagation();
  });
  document.addEventListener('click', e => { if (!pop.hidden && !box.contains(e.target)) blendOpen(false); });
  document.querySelectorAll('input[name="blendStrength"]').forEach(r => r.addEventListener('change', () => {
    const cur = normalizeBlend(state.blend, state.aesthetic);
    if (!cur || !r.checked) return;
    blendSetState({ with: cur.with, strength: r.value, channels: blendPreset(r.value) });
  }));
  document.querySelectorAll('#blendChannels input[type="checkbox"]').forEach(c => c.addEventListener('change', () => {
    const cur = normalizeBlend(state.blend, state.aesthetic);
    if (!cur) return;
    const channels = Object.assign({}, cur.channels, { [c.value]: c.checked });
    if (!BLEND_CHANNELS.some(k => channels[k])) {
      c.checked = true;
      showToast('Keep one channel on, or choose None');
      return;
    }
    blendSetState({ with: cur.with, strength: 'custom', channels });
  }));
  document.getElementById('surpriseBlend').addEventListener('click', surpriseBlend);
  syncBlendUi();
}
