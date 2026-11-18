/* Compact readable text for dev/lg.js (the default; --json gives the raw data). */
'use strict';

const wrap = (s, w, pad) => {
  const out = []; let line = '';
  String(s).split(/\s+/).forEach(word => { if (line && (line + ' ' + word).length > w) { out.push(line); line = word; } else line = line ? line + ' ' + word : word; });
  if (line) out.push(line);
  return out.map(l => pad + l).join('\n');
};
const list = (title, items, pad) => items && items.length ? `${title}\n${items.map(i => `${pad || '  '}- ${i}`).join('\n')}` : '';

function styles(rows) {
  const w = Math.max(...rows.map(r => r.key.length));
  return rows.map(r => `${r.key.padEnd(w)}  ${r.name} - ${r.descriptor}  [${[r.family, r.mode, r.origin].filter(Boolean).join(', ')}]${r.madeFor ? ' built for ' + r.madeFor : ''}`).join('\n') + `\n${rows.length} styles (${rows.filter(r => r.origin === 'custom').length} custom). Details: node dev/lg.js style <key>`;
}

function style(s) {
  const L = [];
  L.push(`${s.key}: ${s.name} - ${s.descriptor}  [${[s.family, s.mode, s.origin].filter(Boolean).join(', ')}]`);
  L.push(wrap(s.summary || '', 100, ''));
  if (s.influences) L.push('Influences: ' + s.influences);
  if (s.coreTrick) L.push('Core trick:\n' + wrap(s.coreTrick, 100, '  '));
  if (s.motto) L.push(`Motto: ${s.motto}   Kicker: ${s.kicker || ''}`);
  if (s.labels) L.push(`Labels: ${s.labels.material || ''} / states ${(s.labels.states || []).join(', ')}`);
  if (s.rules) { L.push(list('Do', s.rules.do)); L.push(list("Don't", s.rules.dont)); }
  if (s.fonts) {
    const f = s.fonts, picks = x => x ? `${(x.classes || []).join('/')} ${x.picks ? '(' + x.picks.join(', ') + ')' : ''}`.trim() : '-';
    L.push(`Fonts: heading ${picks(f.heading)}; body ${picks(f.body)}${f.mono ? '; mono ' + picks(f.mono) : ''}`);
    if (f.pairings) L.push('  pairings: ' + f.pairings.map(p => p.join(' + ')).join('; '));
    if (f.avoid) L.push('  avoid: ' + f.avoid.join(', '));
    if (f.why) L.push('  why: ' + wrap(f.why, 96, '').replace(/\n/g, '\n       '));
  }
  const b = s.build;
  if (b) {
    L.push(`Build recipe: ${b.name || b.cls || ''} (${b.sw || ''}), line ${b.line}pt${b.sh ? ', rest shadow ' + JSON.stringify(b.sh) : ''}`);
    if (b.motion) L.push(`  motion: fast ${b.motion.fast}ms, base ${b.motion.base}ms, slow ${b.motion.slow}ms, ease ${b.motion.ease}`);
    if (b.press) L.push(`  press: ${JSON.stringify(b.press)}`);
    if (b.surface) L.push('  surface: ' + b.surface);
    if (b.pressText) L.push('  press text: ' + b.pressText);
    if (b.ambient) L.push('  ambient: ' + b.ambient);
  }
  if (s.materials && s.materials.length) L.push('Materials:\n' + s.materials.map(m => `  ${m.name}: ${m.css}`).join('\n'));
  if (s.moves) {
    L.push(`Moves (${s.moves.length}):\n` + s.moves.map(m => `  ${m.move}${m.scope && m.scope !== 'all' ? ' [' + m.scope + ']' : ''} ${m.params ? JSON.stringify(m.params) : ''}`).join('\n'));
    const kit = Object.entries(s.kit || {});
    L.push(`Kit (${kit.length} components):\n` + kit.map(([c, v]) => `  ${c}: ${v.material}${v.state ? ' + ' + [].concat(v.state).join(', ') : ''}${v.params ? ' ' + JSON.stringify(v.params) : ''}`).join('\n'));
    if (s.colour) L.push('Colour: ' + JSON.stringify(s.colour));
  }
  return L.filter(Boolean).join('\n');
}

function components(data) {
  const rows = data.rows;
  const L = []; let g = '';
  rows.forEach(r => {
    if (r.group !== g) { g = r.group; L.push(`\n${g}`); }
    L.push(`  ${r.id.padEnd(14)} ${r.name} - ${r.use}  [states: ${r.states.join(', ')}; ios: ${r.ios}${r.web ? '; web only' : ''}]`);
    const sp = r.spec.length ? r.spec.join(', ') : '-';
    L.push(`  ${''.padEnd(14)} spec kit name: ${sp}${r.specInside.length ? '   (also inside: ' + r.specInside.join(', ') + ')' : ''}`);
  });
  const only = data.specOnly.length ? `\nSpec kit names with no UI kit specimen of their own: ${data.specOnly.join(', ')}` : '';
  return L.join('\n').trim() + only + `\n${rows.length} components. Inspect one: node dev/lg.js inspect <id or spec kit name> --style <key>\nSpec kit names, materials and states for a spec-v2 "kit" map: node dev/lg.js components --spec`;
}

function specCatalog(c) {
  const L = [`Kit names for a spec-v2 "kit" map (${c.components.length}); each takes { "material": <name>, "state": <name or [names]>, "params"?, "scope"? }`];
  c.components.forEach(k => L.push(`  ${k.name.padEnd(18)} ${k.ui.length ? 'UI kit: ' + k.ui.join(', ') : '(no UI kit specimen of its own)'}`));
  L.push(`\nMaterials (${c.materials.length}), the "material" value:`, wrap(c.materials.map(m => m.name + (m.move && m.move !== m.name ? ' (' + m.move + ')' : '')).join(', '), 110, '  '));
  L.push(`\nStates (${c.states.length}), the "state" value (a name or an array of names):`, wrap(c.states.map(m => m.name + (m.move && m.move !== m.name ? ' (' + m.move + ')' : '')).join(', '), 110, '  '));
  L.push('\nA name in brackets is the move that provides it (node dev/lg.js moves). Names are exact: the focus state is focus-outline, not focus-ring.');
  return L.join('\n');
}

function fonts(rows) {
  const by = {};
  rows.forEach(r => { (by[r.category] = by[r.category] || []).push(r); });
  return Object.entries(by).map(([c, fs]) => `${c} (${fs.length})\n` + wrap(fs.map(f => `${f.name}${f.cls ? ' [' + f.cls + ']' : ''}`).join(', '), 110, '  ')).join('\n') + `\n${rows.length} fonts.`;
}

/* ---- inspect / compare ---- */
const OMIT = { outline: 'none', 'backdrop-filter': 'none', filter: 'none', opacity: '1', transform: 'none', 'text-transform': 'none', 'letter-spacing': 'normal' };
const top = str => { const o = []; let d = 0, cur = ''; for (const c of String(str)) { if (c === '(') d++; if (c === ')') d--; if (c === ',' && !d) { o.push(cur.trim()); cur = ''; } else cur += c; } if (cur.trim()) o.push(cur.trim()); return o; };
function motion(v) {
  const bits = [];
  const prop = v['transition-property'], dur = v['transition-duration'];
  if (prop === 'none' || (prop === 'all' && /^0s(, 0s)*$/.test(dur))) bits.push('transition none');
  else {
    const P = top(prop), D = top(dur), T = top(v['transition-timing-function']), Y = top(v['transition-delay']);
    bits.push('transition ' + P.map((p, i) => `${p} ${D[i % D.length]} ${T[i % T.length]}${Y[i % Y.length] === '0s' ? '' : ' delay ' + Y[i % Y.length]}`).join(', '));
  }
  if (v.transform !== 'none') bits.push('transform ' + v.transform);
  if (v['animation-name'] !== 'none') bits.push(`animation ${v['animation-name']} ${v['animation-duration']} ${v['animation-timing-function']}`);
  return bits.join('; ');
}
const lines = v => {
  const o = {};
  Object.keys(v).forEach(k => { if (k === 'element' || k === 'width' || /^(transition|animation)-/.test(k) || k === 'transform') return; if (OMIT[k] === v[k]) return; o[k] = typeof v[k] === 'object' ? JSON.stringify(v[k]) : v[k]; });
  o.motion = motion(v);
  return o;
};

function inspect(res) {
  const L = [];
  const origin = res.origin ? `, ${res.origin}` : '';
  L.push(`${res.component} in ${res.style}${origin} (${res.mode})`);
  const first = {};
  res.states.forEach((st, i) => {
    L.push(`\nstate: ${st.state}`);
    Object.keys(st.values).forEach(sub => {
      const cur = lines(st.values[sub]);
      const prev = i === 0 ? null : first[sub];
      if (i === 0) first[sub] = cur;
      L.push(`  ${sub} <${st.values[sub].element}>${prev ? ' (changes vs ' + res.states[0].state + ')' : ''}`);
      let any = false;
      Object.keys(cur).forEach(k => { if (prev && prev[k] === cur[k]) return; any = true; L.push(`    ${k}: ${cur[k]}`); });
      if (prev) Object.keys(prev).forEach(k => { if (!(k in cur)) { any = true; L.push(`    ${k}: (default)`); } });
      if (!any) L.push('    (same as ' + res.states[0].state + ')');
    });
  });
  L.push(`\nmatching CSS rules (${res.rules.length}; [states] = specimens they match)`);
  res.rules.forEach(r => L.push(`  ${r.source}${r.context ? ' ' + r.context : ''}${r.dynamic ? '  (dynamic/state rule)' : ''}  [${r.states.join(', ')}]\n    ${r.selector} { ${r.declarations.join(' ')} }`));
  L.push(`\nmarkup (${res.states[0].state}):\n  ${res.markup}`);
  if (res.png) L.push(`\npng: ${res.png}`);
  return L.join('\n');
}

function compare(res) {
  const names = res.styles.map(s => s.style);
  const L = [`${res.component}, ${res.mode}; state: ${res.stateLabel}`];
  const rows = {};
  res.styles.forEach(s => {
    const st = s.pick;
    Object.keys(st.values).forEach(sub => {
      const v = lines(st.values[sub]);
      Object.keys(v).forEach(k => { const row = `${sub === 'outer' && !Object.keys(st.values).includes('control') ? '' : sub + ' '}${k}`; (rows[row] = rows[row] || {})[s.style] = v[k]; });
    });
  });
  const short = [], long = [];
  Object.entries(rows).forEach(([k, vals]) => (names.every(n => String(vals[n] == null ? '-' : vals[n]).length <= 30) ? short : long).push([k, vals]));
  const kw = Math.max(8, ...short.map(r => r[0].length));
  const cw = names.map(n => Math.max(n.length, ...short.map(r => String(r[1][n] == null ? '-' : r[1][n]).length)));
  L.push(''.padEnd(kw) + '  ' + names.map((n, i) => n.padEnd(cw[i])).join('  '));
  short.forEach(([k, vals]) => L.push(k.padEnd(kw) + '  ' + names.map((n, i) => String(vals[n] == null ? '-' : vals[n]).padEnd(cw[i])).join('  ').trimEnd()));
  long.forEach(([k, vals]) => { L.push(`${k}:`); names.forEach(n => L.push(`  ${n.padEnd(Math.max(...names.map(x => x.length)))}  ${vals[n] == null ? '-' : vals[n]}`)); });
  L.push('rules matching: ' + res.styles.map(s => `${s.style} ${s.rules.length}`).join(', ') + '  (full text: node dev/lg.js inspect ' + res.component + ' --style <key>)');
  if (res.png) L.push('png: ' + res.png);
  return L.join('\n');
}

module.exports = { styles, style, components, specCatalog, fonts, inspect, compare };
