#!/usr/bin/env node
/* Looks Good command line for AI agents (docs/agent-interface/PLAN.md). Thin dispatcher: page scripts and
   helpers live in dev/lg/. Plain Node, no npm dependencies, headless playwright-cli (one in-memory session per
   run, always closed) against a read-only static server of the repo root on 127.0.0.1 that dies with the run. */
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const U = require('./lg/util.js');
const F = require('./lg/format.js');
const server = require('./lg/server.js');
const { openSession } = require('./lg/browser.js');
const D = require('./lg-direction.js');

const { ROOT, fail } = U;
const USAGE = `Usage: node dev/lg.js <command> [options]      (add --json to any command for machine output)

Learn the styles
  styles [--query q] [--family f]     every style: key, name, descriptor, family, mode, built-in or custom
      node dev/lg.js styles --query glass
  style <key>                         meta, build recipe, do/don't rules, fonts; custom styles also moves and kit materials
      node dev/lg.js style soft-form
  components [--spec]                 the UI kit: id, group, name, use, states, iOS mapping, and the spec kit name(s) that style it
      node dev/lg.js components            (--spec lists every spec-v2 "kit" name with the valid material and state names)
      node dev/lg.js components --spec --json
  fonts                               the font library by category (names to use in look.json)
      node dev/lg.js fonts
  moves                               the spec-v2 move catalog (same as aesthetic-check.js --list-moves)
      node dev/lg.js moves --json

See how a style draws a component (real computed values, motion timing, the matching CSS)
  inspect <component> --style <key|folder> [--state s] [--look file] [--mode light|dark] [--png out.png]
      node dev/lg.js inspect btn-primary --style soft-form --png /tmp/btn.png
  compare <component> --styles a,b,c [--state s] [--look file] [--mode light|dark] [--png strip.png]
      node dev/lg.js compare btn-primary --styles soft-form,raw-brutalist,liquid-glass --png /tmp/strip.png

See the colours a look resolves to
  palette [--primary #hex] [--scheme s] [--look file]   the state.colors the screens are drawn with (default: the preview brand)
      node dev/lg.js palette --primary #7f8cc6

Direction first, then rounds reviewed by a critic, then the build pack (ui-direction skill)
  direction <folder|key> [--init] [--gate brief|pack] [--json]
      node dev/lg.js direction custom-aesthetics/my-app-look --init   (copies the template to <folder>/app/direction.md)
      node dev/lg.js direction custom-aesthetics/my-app-look          (brief gate, then pack gate; exit 1 on a FAIL in --gate, default pack)
                                      no browser, instant. brief gate = direction sections 1-5 filled in; pack gate = the whole
                                      direction + 3 contiguous rounds, each with app/reviews/r<n>.json, the last one passing
  shot <html-file> --out <png> [--size WxH] [--mode light|dark] [--full] [--json]
      node dev/lg.js shot custom-aesthetics/my-app-look/app/mocks/chart.html --out custom-aesthetics/my-app-look/app/renders/r2/chart.png
                                      renders an HTML mock (under the repo root) to a 2x PNG; default 1280x800, --full = whole page,
                                      --mode sets prefers-color-scheme and appends ?mode=<mode> to the URL

Render an app's own screens and export the build pack
  screens <key|folder> [--look file] [--sheet file] [--round n] [--out dir] [--direction file]
                                      refuses until the direction passes the brief gate, and until round n-1 has a critic review
      node dev/lg.js screens custom-aesthetics/my-app-look        (reads <folder>/app/look.json + product-sheet.md,
                                                                   writes <folder>/app/renders/r<n>/ PNGs + index.html)
  pack <key|folder> [--look file] [--sheet file] [--target web|swiftui|both] [--surface app|web|both] [--out file] [--draft]
      node dev/lg.js pack custom-aesthetics/my-app-look --target swiftui   (writes <folder>/app/build-pack.md)
                                      refuses (writes nothing) until the pack gate passes. --draft skips the gate and writes
                                      <folder>/app/draft-pack.md with a "DRAFT: not for building" banner.
                                      Every pack starts with the app's direction ("## Direction (read before building)").

Options
  --json         machine output          --port <n>   use a server already running at the repo root (default: own, random port)
  <key|folder>   a registered style key, or a spec-v2 folder (an unlisted folder is packed and imported under a
                 temporary key for the run and removed afterwards)
  look.json      { app, brandName, style, blend, primary, scheme, colors, heading, body, typography, pureBg, modes }
                 colors is optional and partial: { primary, secondary, accent, neutralDark, neutralLight } as #rrggbb, each one
                 replaces the value derived from primary + scheme (the others stay derived); unknown keys warn.
                 See the resolved palette: node dev/lg.js palette --primary #7f8cc6 --scheme analogous
                 no look file = the checker's preview brand (primary #2f5d8a, analogous, Inter / Inter)
Everything runs headless and in memory; writes go only to <folder>/app/ or the --out path.
Exit 0 when the output was written (pack prints brief-gate and lint findings as NOTE lines, and as "notes" in --json); exit 1 when nothing was written.`;

/* ------------------------------------------------------------------ page session */
const cleanups = [];
async function runCleanups() { while (cleanups.length) { try { await cleanups.pop()(); } catch (e) { /* best effort */ } } }
['SIGINT', 'SIGTERM', 'SIGHUP'].forEach(sig => process.on(sig, () => { runCleanups().then(() => process.exit(130)); }));

const PAGE_SRC = fs.readFileSync(path.join(__dirname, 'lg', 'page.js'), 'utf8');

async function openPage(flags, extras, opts) {
  opts = opts || {};
  let srv = null, port = flags.port ? +flags.port : 0;
  if (flags.port && !(port > 0)) fail(`--port needs a number (got "${flags.port}")`);
  if (!port) { srv = await server.start(ROOT, 0, extras); port = srv.port; cleanups.push(() => srv.close()); }
  const base = `http://127.0.0.1:${port}`;
  const sess = await openSession(`${base}/${opts.lab ? '?movelab=1' : ''}`);
  cleanups.push(() => sess.close());
  await sess.eval(`(()=>{${PAGE_SRC}\nreturn '"ok"'})()`);
  const P = {
    sess, port, ownServer: !!srv,
    call: (fn, arg) => sess.eval(`(async()=>{try{return JSON.stringify(await __lg.${fn}(${JSON.stringify(arg == null ? {} : arg)}))}catch(e){return JSON.stringify({__lgError:String((e&&e.message)||e).slice(0,600)})}})()`),
    shot: (sel, file) => sess.screenshot(sel, file),
  };
  P.known = await P.call('boot');
  return P;
}

/* A <key-or-folder> argument as the page will know it: registered key, or an unlisted folder packed under a temporary key. */
function prepareStyle(arg, i, extras, ownServer) {
  const t = U.resolveTarget(arg);
  const out = { arg, label: t.key, key: t.key, folder: t.folder, lab: t.lab, inject: null };
  if (t.folder && !t.listed) {
    const { packBundle } = require('./aesthetic-check.js');
    const packed = packBundle(t.folder);
    if (!packed.ok) fail(`cannot pack ${t.folder}: ${packed.problems.join('; ')}`);
    const tmp = ('lg-' + t.key).slice(0, 48).replace(/-+$/, '');
    const b = JSON.parse(packed.text);
    b.aesthetic.key = tmp; delete b.versions;
    const text = JSON.stringify(b);
    const route = `/__lg/bundle-${i}.json`;
    extras[route] = text;
    out.key = tmp; out.inject = { url: route, text, tmp };
  }
  return out;
}
async function importStyles(P, specs) {
  for (const s of specs) {
    if (!s.inject) continue;
    const r = await P.call('importBundle', P.ownServer ? { url: s.inject.url } : { text: s.inject.text });
    if (!r.ok) fail(`could not import ${s.folder} into the page: ${r.error || 'no answer'}`);
    cleanups.push(() => P.call('removeKey', { key: s.inject.tmp }));
    U.checkStyle(s.key, await P.call('boot'));
  }
  P.known = await P.call('boot');
}

const out = (o, flags, text) => { process.stdout.write((flags.json ? JSON.stringify(o, null, 2) : text) + '\n'); };
const warn = m => process.stderr.write('warning: ' + m + '\n');
const mkdirp = d => fs.mkdirSync(d, { recursive: true });

/* ------------------------------------------------------------------ commands */
async function cmdStyles(a) {
  const P = await openPage(a.flags, {});
  let rows = await P.call('styles');
  const q = (a.flags.query || '').toLowerCase(), fam = (a.flags.family || '').toLowerCase();
  if (q) rows = rows.filter(r => [r.key, r.name, r.descriptor, r.summary, r.family].join(' ').toLowerCase().includes(q));
  if (fam) rows = rows.filter(r => r.family.toLowerCase() === fam);
  if (!rows.length) { out([], a.flags, 'No styles match.'); return; }
  out(rows, a.flags, F.styles(rows));
}

async function cmdStyle(a) {
  const arg = a._[1];
  if (!arg) fail('style needs a key: node dev/lg.js style <key>');
  const extras = {}, spec = prepareStyle(arg, 0, extras);
  const P = await openPage(a.flags, extras, { lab: spec.lab });
  await importStyles(P, [spec]);
  U.checkStyle(spec.key, P.known);
  const s = await P.call('style', { key: spec.key });
  s.key = spec.label;
  out(s, a.flags, F.style(s));
}

async function cmdComponents(a) {
  const P = await openPage(a.flags, {});
  if (a.flags.spec) { const c = await P.call('specCatalog'); return out(c, a.flags, F.specCatalog(c)); }
  const r = await P.call('components');
  const o = { components: r.rows, specOnly: r.unmatched };
  out(o, a.flags, F.components({ rows: r.rows, specOnly: r.unmatched }));
}
async function cmdPalette(a) {
  const warnings = [];
  const look = lookFor(a, warnings, null);
  if (a.flags.primary) { if (!U.HEX.test(a.flags.primary)) fail(`--primary "${a.flags.primary}" is not a #rrggbb colour`); look.primary = a.flags.primary; }
  if (a.flags.scheme) look.scheme = a.flags.scheme;
  const P = await openPage(a.flags, {});
  U.checkLook(look, P.known);
  warnings.forEach(warn);
  const r = await P.call('palette', { primary: look.primary, scheme: look.scheme, colors: look.colors });
  const o = { primary: r.primary, scheme: r.scheme, hue: r.hue, colors: r.resolved, derived: r.derived, fromLook: r.overridden, look: look.file };
  out(o, a.flags, `palette for primary ${r.primary}, scheme ${r.scheme}, hue ${r.hue}${look.file ? ' (look ' + path.basename(look.file) + ')' : ''}\n` +
    U.COLOR_KEYS.map(k => `  ${k.padEnd(12)} ${r.resolved[k]}${r.overridden.includes(k) ? '   (from look.json colors; derived would be ' + r.derived[k] + ')' : ''}`).join('\n') +
    `\nThis is state.colors. In look.json, "colors": { ... } takes any subset of these keys.`);
}
async function cmdFonts(a) { const P = await openPage(a.flags, {}); const rows = await P.call('fonts'); out(rows, a.flags, F.fonts(rows)); }

function cmdMoves(a) {
  const args = [path.join(__dirname, 'aesthetic-check.js'), '--list-moves'].concat(a.flags.json ? ['--json'] : []);
  const r = cp.spawnSync(process.execPath, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) fail('aesthetic-check.js --list-moves failed: ' + (r.stderr || r.stdout || '').trim().slice(0, 300));
  process.stdout.write(r.stdout);
}

function modeFlag(a) {
  const m = a.flags.mode || 'light';
  if (m !== 'light' && m !== 'dark') fail(`--mode must be light or dark (got "${m}")`);
  return m;
}
function lookFor(a, warnings, folder, optionalFolderFile) {
  let file = a.flags.look ? path.resolve(a.flags.look) : null;
  if (!file && folder && fs.existsSync(path.join(folder, 'app', 'look.json'))) file = path.join(folder, 'app', 'look.json');
  if (a.flags.look && !fs.existsSync(file)) fail(`look file not found: ${file}`);
  return U.readLook(file, warnings);
}

async function cmdInspect(a, compare) {
  const component0 = a._[1];
  if (!component0) fail(`${compare ? 'compare' : 'inspect'} needs a component id: node dev/lg.js components`);
  const list = compare ? String(a.flags.styles || '').split(',').map(s => s.trim()).filter(Boolean) : (a.flags.style ? [a.flags.style] : []);
  if (compare && list.length < 2) fail('compare needs --styles a,b[,c...] (two or more)');
  if (!compare && !list.length) {
    const guess = a.flags.look ? U.readLook(path.resolve(a.flags.look), []).style : null;
    if (!guess) fail('inspect needs --style <key>');
    list.push(guess);
  }
  const warnings = [];
  const look = lookFor(a, warnings, null);
  const mode = modeFlag(a);
  const extras = {}, specs = list.map((s, i) => prepareStyle(s, i, extras));
  const P = await openPage(a.flags, extras, { lab: specs.some(s => s.lab) });
  await importStyles(P, specs);
  let component = component0;
  if (!P.known.components.includes(component) && P.known.specKit.includes(component)) {
    const ids = (await P.call('resolveKit', { name: component })).ids;
    if (!ids.length) fail(`"${component}" is a spec kit name but no UI kit specimen draws it. List them with: node dev/lg.js components`);
    warn(`"${component}" is a spec kit name; showing UI kit "${ids[0]}"${ids.length > 1 ? ` (it also styles: ${ids.slice(1, 4).join(', ')})` : ''}`);
    component = ids[0];
  }
  if (!P.known.components.includes(component)) fail(`unknown component "${component}".${U.didYouMean(component, P.known.components.concat(P.known.specKit)) || ' List them with: node dev/lg.js components'}`);
  specs.forEach(s => U.checkStyle(s.key, P.known));
  U.checkLook(look, P.known);
  warnings.forEach(warn);
  const png = a.flags.png ? path.resolve(a.flags.png) : null;
  const res = await P.call('inspect', { component, styles: specs.map(s => s.key), look: { ...look, style: specs[0].key }, mode, stateFilter: a.flags.state || null, keepStage: !!png, colWidth: compare ? 640 : 944 });
  res.forEach((r, i) => { r.style = specs[i].label; });
  const bad = res.find(r => r.error);
  if (bad) fail(`${bad.style}: ${bad.error}`);
  if (png) {
    mkdirp(path.dirname(png));
    await P.shot(compare ? '#lg-stage' : `#lg-stage .lg-col .sb-k-cell[data-k="${component}"]`, png);
    await P.call('clearStage');
  }
  if (!compare) {
    const r = res[0];
    const o = { component, style: r.style, origin: r.origin, mode, states: r.states, rules: r.rules, markup: r.markup, png };
    return out(o, a.flags, F.inspect({ ...o, png }));
  }
  res.forEach(r => { r.pick = r.states.find(s => s.state === (a.flags.state || 'rest')) || r.states[0]; });
  const o = { component, mode, styles: res.map(r => ({ style: r.style, origin: r.origin, states: r.states, rules: r.rules, markup: r.markup })), png };
  out(o, a.flags, F.compare({ component, mode, styles: res, stateLabel: a.flags.state || 'rest (first drawn if none)', png }));
}

/* the folder + look + sheet a screens / pack run works from */
async function prepareRun(a, cmd, gate) {
  const arg = a._[1];
  if (!arg) fail(`${cmd} needs a key or folder: node dev/lg.js ${cmd} <key-or-folder>`);
  const warnings = [];
  const extras = {};
  const spec = prepareStyle(arg, 0, extras);
  const look = lookFor(a, warnings, spec.folder);
  const sheetFile = a.flags.sheet ? path.resolve(a.flags.sheet) : (spec.folder && fs.existsSync(path.join(spec.folder, 'app', 'product-sheet.md')) ? path.join(spec.folder, 'app', 'product-sheet.md') : null);
  if (a.flags.sheet && !fs.existsSync(sheetFile)) fail(`sheet not found: ${sheetFile}`);
  if (sheetFile) extras['/__lg/sheet.md'] = fs.readFileSync(sheetFile, 'utf8');
  // the look's style: the folder's own key (temporary key when imported) unless look.json names another one
  const lookStyle = look.style && look.style !== spec.label ? look.style : null;
  let other = null;
  if (lookStyle) { other = prepareStyle(lookStyle, 1, extras); }
  if (gate) gate({ spec, sheetFile });
  const P = await openPage(a.flags, extras, { lab: spec.lab });
  await importStyles(P, [spec].concat(other ? [other] : []));
  const styleKey = other ? other.key : spec.key;
  U.checkStyle(styleKey, P.known);
  U.checkLook(look, P.known);
  warnings.forEach(warn);
  const sheet = sheetFile ? { url: '/__lg/sheet.md', text: P.ownServer ? undefined : extras['/__lg/sheet.md'], name: path.basename(sheetFile) } : null;
  return { P, spec, look, styleKey, sheet, sheetFile };
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function contactSheet(info) {
  const rows = info.screens.map(s => `<section><h2>${esc(s.name)}</h2><p class="job">${esc(s.job || '')}</p><div class="pair">${info.modes.map(m => `<figure><img src="${esc(s.id)}-${m}.png" alt="${esc(s.name)} ${m}"><figcaption>${m} (${s.sizes[m].width} x ${s.sizes[m].height})</figcaption></figure>`).join('')}</div></section>`).join('\n');
  const kit = info.modes.map(m => `<figure><img src="kit-${m}.png" alt="kit ${m}"><figcaption>UI kit, ${m}</figcaption></figure>`).join('');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${esc(info.title)}</title>
<style>body{font:14px/1.45 system-ui,sans-serif;margin:24px;background:#f2f2f0;color:#1d1d1b}h1{font-size:22px;margin:0 0 4px}h2{font-size:17px;margin:28px 0 2px}.job{margin:0 0 10px;color:#555}.meta{color:#555;margin:0 0 8px}
.pair{display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap}figure{margin:0}figure img{display:block;max-height:760px;max-width:46vw;width:auto;height:auto;border:1px solid #bbb;background:#fff}figcaption{font-size:12px;color:#666;padding-top:4px}.warn{color:#8a4b00}</style></head><body>
<h1>${esc(info.title)}</h1>
<p class="meta">style ${esc(info.style)} · ${esc(info.when)} · look ${esc(info.look)} · sheet ${esc(info.sheet)}</p>
${info.warnings.length ? `<ul class="warn">${info.warnings.map(w => `<li>${esc(w)}</li>`).join('')}</ul>` : ''}
${rows}
<section><h2>UI kit (top)</h2><div class="pair">${kit}</div></section>
</body></html>
`;
}

const showPath = p => { const r = path.relative(process.cwd(), p); return r && !r.startsWith('..') ? r : p; };
function gateFail(what, res, folder) {
  const bad = res.filter(r => r.status === 'FAIL');
  fail(`${what}:\n${bad.map(r => '  ' + D.fmt(r)).join('\n')}\nSee the full state: node dev/lg.js direction ${folder ? showPath(folder) : '<folder>'}`);
}

async function cmdScreens(a) {
  let outDir, redoNote = null;
  const run = await prepareRun(a, 'screens', ({ spec, sheetFile }) => {
    if (a.flags.out) outDir = path.resolve(a.flags.out);
    else {
      if (!spec.folder) fail('a key without a folder needs --out <dir>');
      const renders = path.join(spec.folder, 'app', 'renders');
      let n;
      if (a.flags.round) n = +a.flags.round;
      else { const nx = D.nextScreensRound(path.join(spec.folder, 'app')); n = nx.n; if (nx.redo) redoNote = `r${n} has no critic review yet: re-rendering into r${n} (PNGs and index.html replaced) instead of starting r${n + 1}`; }
      if (!(n >= 1)) fail('--round needs a number >= 1');
      outDir = path.join(renders, 'r' + n);
    }
    const dirFile = a.flags.direction ? path.resolve(a.flags.direction)
      : sheetFile ? path.join(path.dirname(sheetFile), 'direction.md')
      : spec.folder ? path.join(spec.folder, 'app', 'direction.md') : null;
    if (!dirFile) fail('screens needs a direction: pass --direction <file>');
    const res = D.checkScreensGate(dirFile, outDir);
    if (D.hasFail(res)) gateFail('screens refused: the direction gate has not passed', res, spec.folder);
  });
  const { P, spec, look, styleKey, sheet } = run;
  if (!P.known.exportInto) fail('ProductScreens.exportInto is missing: update Looks Good');
  if (!sheet) fail('screens needs a product sheet: pass --sheet <file> or add <folder>/app/product-sheet.md');
  mkdirp(outDir);
  if (redoNote) { warn(redoNote); for (const f of fs.readdirSync(outDir)) if (/\.(png|html)$/i.test(f)) fs.rmSync(path.join(outDir, f)); }
  const files = [], screens = [];
  let sheetWarnings = [];
  for (const mode of look.modes) {
    const ap = await P.call('apply', { look: { ...look, style: styleKey }, mode, style: styleKey, sheet });
    sheetWarnings = ap.warnings;
    for (const s of ap.screens) {
      const size = await P.call('screen', { id: s.id, mode });
      const f = path.join(outDir, `${s.id}-${mode}.png`);
      await P.shot('#lg-screen-host', f);
      files.push(f);
      let rec = screens.find(x => x.id === s.id);
      if (!rec) screens.push(rec = { ...s, sizes: {} });
      rec.sizes[mode] = size;
    }
    await P.call('kit', { mode });
    const kf = path.join(outDir, `kit-${mode}.png`);
    await P.shot('#lg-kit-host', kf);
    files.push(kf);
    await P.call('clearStage');
  }
  const wl = sheetWarnings.map(w => `sheet line ${w.line}: ${w.message}`);
  const html = path.join(outDir, 'index.html');
  fs.writeFileSync(html, contactSheet({ title: `${look.brandName || spec.label} - ${spec.label}`, style: spec.label, when: new Date().toISOString().slice(0, 16).replace('T', ' '), look: look.file ? path.basename(look.file) : 'preview brand', sheet: run.sheetFile ? path.basename(run.sheetFile) : '-', warnings: wl, screens, modes: look.modes }));
  files.push(html);
  const o = { out: outDir, redo: !!redoNote, style: spec.label, modes: look.modes, screens: screens.map(s => ({ id: s.id, name: s.name, sizes: s.sizes })), files, warnings: wl };
  out(o, a.flags, (redoNote ? redoNote + '\n' : '') + `rendered ${screens.length} screen(s) x ${look.modes.length} mode(s) in ${spec.label} -> ${outDir}\n` + files.map(f => '  ' + path.relative(outDir, f)).join('\n') + (wl.length ? '\nsheet warnings:\n' + wl.map(w => '  ' + w).join('\n') : '\nsheet warnings: none'));
}

/* direction.md for pack: --direction, else beside the resolved sheet, else <folder>/app/direction.md */
function packDirectionFile(a, spec, sheetFile) {
  if (a.flags.direction) return path.resolve(a.flags.direction);
  if (sheetFile && fs.existsSync(path.join(path.dirname(sheetFile), 'direction.md'))) return path.join(path.dirname(sheetFile), 'direction.md');
  return spec.folder ? path.join(spec.folder, 'app', 'direction.md') : null;
}

async function cmdPack(a) {
  const draft = !!a.flags.draft;
  let outFile;
  const run = await prepareRun(a, 'pack', ({ spec }) => {
    for (const [flag, ok] of [['target', ['web', 'swiftui', 'both']], ['surface', ['app', 'web', 'both']]]) if (a.flags[flag] && !ok.includes(a.flags[flag])) fail(`--${flag} must be one of ${ok.join(', ')} (got "${a.flags[flag]}")`);
    if (!draft) {
      if (!spec.folder) fail('pack needs a style folder with app/direction.md (or use --draft for an unfinished pack)');
      const appDir = path.join(spec.folder, 'app');
      const res = D.checkDirection(path.join(appDir, 'direction.md'), 'pack').concat(D.checkRounds(appDir));  // the gate always reads <folder>/app/direction.md
      if (D.hasFail(res)) gateFail('pack refused: the direction and refinement gates have not passed (nothing written; --draft writes an unfinished pack)', res, spec.folder);
    }
    if (a.flags.out) outFile = path.resolve(a.flags.out);
    else {
      if (!spec.folder) fail('a key without a folder needs --out <file>');
      outFile = path.join(spec.folder, 'app', draft ? 'draft-pack.md' : 'build-pack.md');
    }
  });
  const { P, spec, look, styleKey, sheet } = run;
  const mode = look.modes[0] || 'light';
  const ap = await P.call('apply', { look: { ...look, style: styleKey }, mode, style: styleKey, sheet });
  const r = await P.call('pack', { target: a.flags.target || null, surface: a.flags.surface || null });
  const appDir = spec.folder ? path.join(spec.folder, 'app') : null;
  const dirFile = packDirectionFile(a, spec, run.sheetFile);
  let md = D.insertDirection(r.md, dirFile, dirFile ? path.dirname(dirFile) : '');
  if (draft) md = `> DRAFT: not for building. The direction and refinement gates have not passed (node dev/lg.js direction ${spec.folder ? showPath(spec.folder) : '<folder>'}).\n\n` + md;
  mkdirp(path.dirname(outFile));
  fs.writeFileSync(outFile, md);
  const notes = ap.warnings.map(w => `sheet line ${w.line}: ${w.message}`);
  if (r.blocked) notes.push('brief gate (the app would block Copy/Download until fixed, the pack is written anyway): ' + r.blocked);
  r.issues.forEach(m => { if (m !== r.blocked) notes.push('brief lint: ' + m); });
  const o = { out: outFile, bytes: Buffer.byteLength(md), draft, style: spec.label, target: r.target, surface: r.surface, notes };
  out(o, a.flags, `${draft ? 'DRAFT ' : ''}build pack for ${spec.label} (target ${r.target}, surface ${r.surface}) -> ${outFile} (${(o.bytes / 1024).toFixed(1)} KB)` + (notes.length ? '\n' + notes.map(n => 'NOTE: ' + n).join('\n') : ''));
}

/* ------------------------------------------------------------------ direction and shot */
function folderOf(arg) {
  if (!arg) fail('direction needs a folder or key: node dev/lg.js direction <folder|key>');
  const abs = path.resolve(arg);
  if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) return abs;
  const f = path.join(ROOT, 'custom-aesthetics', arg);
  if (!/[\\/]/.test(arg) && fs.existsSync(f) && fs.statSync(f).isDirectory()) return f;
  fail(`no style folder "${arg}" (give a folder path or a key under custom-aesthetics/)`);
}

function cmdDirection(a) {
  const folder = folderOf(a._[1]);
  const appDir = path.join(folder, 'app');
  const file = path.join(appDir, 'direction.md');
  if (a.flags.init) {
    if (fs.existsSync(file)) fail(`${file} already exists: fill it in, or delete it to start again`);
    const tpl = path.join(ROOT, '.claude', 'skills', 'ui-direction', 'templates', 'direction.md');
    if (!fs.existsSync(tpl)) fail(`template not found: ${tpl}`);
    for (const d of ['', 'reviews', 'mocks']) mkdirp(path.join(appDir, d));
    fs.copyFileSync(tpl, file);
    const next = `Fill every {{...}} in ${showPath(file)}, section by section (thinking guide: .claude/skills/ui-direction/references/thinking.md), then run: node dev/lg.js direction ${showPath(folder)}`;
    return out({ created: file, next }, a.flags, `created ${file}\n${next}`);
  }
  const gate = a.flags.gate || 'pack';
  if (gate !== 'brief' && gate !== 'pack') fail(`--gate must be brief or pack (got "${gate}")`);
  const brief = D.checkDirection(file, 'brief');
  const briefOnly = gate === 'brief';
  const packRes = briefOnly ? [] : D.checkDirection(file, 'pack').concat(D.checkRounds(appDir));
  const o = { folder, gate, brief: { pass: !D.hasFail(brief), results: brief } };
  if (!briefOnly) o.pack = { pass: !D.hasFail(packRes), results: packRes };
  const text = ['brief gate (direction sections 1-5):'].concat(brief.map(r => '  ' + D.fmt(r)),
    briefOnly ? [] : ['pack gate (whole direction + reviewed rounds):'].concat(packRes.map(r => '  ' + D.fmt(r))),
    [`brief gate: ${o.brief.pass ? 'pass' : 'fail'}`], briefOnly ? [] : [`pack gate: ${o.pack.pass ? 'pass' : 'fail'}`]).join('\n');
  out(o, a.flags, text);
  return o[gate].pass ? 0 : 1;
}

async function cmdShot(a) {
  const arg = a._[1];
  if (!arg) fail('shot needs an HTML file: node dev/lg.js shot <html-file> --out <png>');
  if (!a.flags.out) fail('shot needs --out <png>');
  const file = path.resolve(arg);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) fail(`html file not found: ${file}`);
  const rel = path.relative(ROOT, file);
  if (rel.startsWith('..') || path.isAbsolute(rel)) fail('put mocks under custom-aesthetics/<key>/app/mocks/ (shot serves files from the Looks Good folder only)');
  const mode = modeFlag(a);
  const sm = /^(\d+)x(\d+)$/i.exec(a.flags.size || '1280x800');
  if (!sm || !(+sm[1] > 0) || !(+sm[2] > 0)) fail(`--size must look like 1280x800 (got "${a.flags.size}")`);
  const w = +sm[1], h = +sm[2];
  const png = path.resolve(a.flags.out);
  mkdirp(path.dirname(png));
  const srv = await server.start(ROOT, 0, {});
  cleanups.push(() => srv.close());
  const work = fs.mkdtempSync(path.join(require('os').tmpdir(), 'lg-shot-'));
  const name = `lg-shot-${process.pid}-${Date.now().toString(36)}`;
  const cfg = path.join(work, 'cfg.json');
  fs.writeFileSync(cfg, JSON.stringify({ browser: { browserName: 'chromium', launchOptions: { headless: true }, contextOptions: { deviceScaleFactor: 2, viewport: { width: w, height: h }, colorScheme: mode } } }));
  const pw = (...args) => new Promise(resolve => {
    const c = cp.spawn('playwright-cli', ['-s=' + name, ...args], { cwd: work, stdio: ['ignore', 'pipe', 'pipe'] });
    let o = '', e = '';
    const t = setTimeout(() => c.kill('SIGKILL'), 120000);
    c.stdout.on('data', d => { o += d; }); c.stderr.on('data', d => { e += d; });
    c.on('error', er => { clearTimeout(t); resolve({ status: 127, stdout: o, stderr: String(er) }); });
    c.on('close', code => { clearTimeout(t); resolve({ status: code, stdout: o, stderr: e }); });
  });
  cleanups.push(async () => { await pw('close'); fs.rmSync(work, { recursive: true, force: true }); });
  const url = `http://127.0.0.1:${srv.port}/${rel.split(path.sep).map(encodeURIComponent).join('/')}?mode=${mode}`;
  const o1 = await pw('open', '--browser=chromium', `--config=${cfg}`, url);
  if (o1.status !== 0 || /### Error/.test(o1.stdout)) fail('playwright-cli could not open the mock: ' + (o1.stderr || o1.stdout).trim().slice(0, 200));
  const ev = await pw('--raw', 'eval', '(async()=>{await document.fonts.ready;await new Promise(r=>setTimeout(r,400));return JSON.stringify("ok")})()');
  if (ev.status !== 0 || !/ok/.test(ev.stdout)) fail('mock did not settle: ' + (ev.stderr || ev.stdout).trim().slice(0, 200));
  const sh = await pw('screenshot', '--hires', ...(a.flags.full ? ['--full-page'] : []), `--filename=${png}`);
  if (sh.status !== 0 || !fs.existsSync(png)) fail('screenshot failed: ' + (sh.stderr || sh.stdout).trim().slice(0, 200));
  const o = { out: png, size: `${w}x${h}`, mode, full: !!a.flags.full };
  out(o, a.flags, `rendered ${showPath(file)} (${mode}, ${w}x${h}${a.flags.full ? ', full page' : ''}, 2x) -> ${png}`);
}

/* flags the shared parser (dev/lg/util.js) does not know */
function extractFlags(argv) {
  const valued = new Set(['direction', 'gate', 'size']), bools = new Set(['init', 'draft', 'full']);
  const rest = [], extra = {};
  for (let i = 0; i < argv.length; i++) {
    const m = /^--([a-z]+)(?:=(.*))?$/s.exec(argv[i]);
    if (m && valued.has(m[1])) {
      let v = m[2];
      if (v === undefined) { v = argv[++i]; if (v === undefined || v.startsWith('--')) fail(`--${m[1]} needs a value`); }
      extra[m[1]] = v;
    } else if (m && bools.has(m[1])) extra[m[1]] = true;
    else rest.push(argv[i]);
  }
  return { rest, extra };
}

/* ------------------------------------------------------------------ main */
async function main() {
  const x = extractFlags(process.argv.slice(2));
  const a = U.parseArgs(x.rest);
  Object.assign(a.flags, x.extra);
  const cmd = a._[0];
  if (a.flags.help || !cmd || cmd === 'help') { console.log(USAGE); return cmd || a.flags.help ? 0 : 1; }
  const table = { styles: cmdStyles, style: cmdStyle, components: cmdComponents, fonts: cmdFonts, palette: cmdPalette, moves: cmdMoves, inspect: x => cmdInspect(x, false), compare: x => cmdInspect(x, true), screens: cmdScreens, pack: cmdPack, direction: cmdDirection, shot: cmdShot };
  if (!table[cmd]) fail(`unknown command "${cmd}".${U.didYouMean(cmd, Object.keys(table))} See: node dev/lg.js --help`);
  return (await table[cmd](a)) || 0;
}

main().then(c => { process.exitCode = c; }, e => {
  process.stderr.write(`lg: ${e instanceof U.Fail ? e.message : (e && e.stack) || e}\n`);
  process.exitCode = 1;
}).finally(runCleanups);
