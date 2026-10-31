#!/usr/bin/env node
/* Per-style UI kit check (headless only; never opens a visible window).

   For every style (and every classic version) it opens the Built view's UI kit and proves,
   for each of the 39 newer kit components, whether the style's OWN css file changes it:
   the computed-style signature of the component's parts is taken with the style's
   <link> enabled and again with it disabled; identical signatures = "unstyled" by that style.
   It also reports horizontal overflow, parts that stick out of their cell, page errors,
   and saves one screenshot per kit group that holds new components.

   Needs a static server on the repo root (default http://localhost:8090/) and Playwright
   resolved from outside the repo (no package.json here):
     PLAYWRIGHT_PATH=/path/to/node_modules/playwright node dev/kit-style-check.js [options]
   or  node dev/kit-style-check.js --playwright /path/to/node_modules/playwright

   Options
     --url <url>         page to open               (default http://localhost:8090/)
     --out <dir>         report + kitshots go here  (default <os tmpdir>/kit-style-check)
     --only a,b,c        only these style keys (a classic run is "<key>--classic")
     --jobs <n>          parallel pages             (default 3)
     --no-shots          skip screenshots
     --playwright <p>    playwright package path (or env PLAYWRIGHT_PATH)
     --chromium <p>      browser executable (or env CHROMIUM_PATH); default: the cached
                         chromium_headless_shell under ~/Library/Caches/ms-playwright
   Output: <out>/kit-style-report.json  ({style: {unstyled, overflow, outside, errors, ...}})
           <out>/kitshots/<style>/<group>.png
   Exit code: 0 = ran to completion (findings or not), 2 = the check itself failed. */

'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');

const NEW_IDS = ('btn-split fab link icon combo listbox stepper knob date-field calendar wheel wheel-date accordion ' +
  'carousel matrix overlay dialog side-sheet popover popup-tip tooltip lightbox navbar nav-menu drawer breadcrumbs ' +
  'anchor back-top scrollbar dropdown-menu context-menu submenu expandable-menu megamenu menubar ribbon pie-menu ' +
  'spinner skeleton').split(' ');

const PART_CLASSES = ('acc acc-sum acc-body cal cal-head cal-t day car-card dots cmdmenu kbd menu-sep combo crumbs ' +
  'crumb-sep date-ico dialog dialog-t drawer fab icon knob-arc knob-dial knob-ind knob-val lb-cap lb-close lb-img ' +
  'link listbox match mx-tile mx-row mega-panel mega-col menubar navbar nb-links nm-item nm-children ph pie pie-hub ' +
  'pie-item pop pop-arrow tip tip-t tip-b tooltip rb-btn rb-group rb-label ribbon sbar sbar-thumb scrim scrollbox ' +
  'side spin spinner skel-av skel-line skel-block split-main split-more step step-val stepper wheel wheel-band ' +
  'wheel-item backtop anchors anchors-label mx-label ctx subwrap sidebox dialogbox drawerbox overlaybox').split(' ');

const SIG_PROPS = ['backgroundColor', 'backgroundImage', 'borderTopColor', 'borderTopWidth', 'borderTopStyle',
  'borderLeftWidth', 'borderTopLeftRadius', 'boxShadow', 'color', 'fontFamily', 'textTransform', 'letterSpacing',
  'fontWeight', 'outlineStyle', 'clipPath', 'filter'];

const GROUPS = ['Actions', 'Inputs', 'Pickers', 'Containers', 'Overlays', 'Navigation', 'Menus', 'Feedback'];

// ---- options -------------------------------------------------------------
const argv = process.argv.slice(2);
const opt = { url: 'http://localhost:8090/', out: path.join(os.tmpdir(), 'kit-style-check'), jobs: 3, shots: true };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  const next = () => argv[++i];
  if (a === '--url') opt.url = next();
  else if (a === '--out') opt.out = path.resolve(next());
  else if (a === '--only') opt.only = next().split(',').map(s => s.trim()).filter(Boolean);
  else if (a === '--jobs') opt.jobs = Math.max(1, parseInt(next(), 10) || 1);
  else if (a === '--no-shots') opt.shots = false;
  else if (a === '--playwright') opt.pw = next();
  else if (a === '--chromium') opt.chromium = next();
  else if (a === '-h' || a === '--help') { console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0]); process.exit(0); }
  else { console.error('unknown option ' + a); process.exit(2); }
}
opt.pw = opt.pw || process.env.PLAYWRIGHT_PATH;
opt.chromium = opt.chromium || process.env.CHROMIUM_PATH;

function die(msg) { console.error('CHECK FAILED: ' + msg); process.exit(2); }

function loadPlaywright() {
  const tries = [opt.pw, 'playwright', 'playwright-core'].filter(Boolean);
  for (const t of tries) { try { return require(t); } catch (e) { /* next */ } }
  die('cannot load playwright. Set PLAYWRIGHT_PATH (or --playwright) to its package directory.');
}

function findHeadlessShell() {
  if (opt.chromium) return opt.chromium;
  const base = path.join(os.homedir(), 'Library/Caches/ms-playwright');
  let dirs = [];
  try { dirs = fs.readdirSync(base).filter(d => d.startsWith('chromium_headless_shell-')).sort(); } catch (e) { return undefined; }
  for (const d of dirs.reverse()) {
    const dir = path.join(base, d);
    for (const sub of fs.readdirSync(dir)) {
      const exe = path.join(dir, sub, 'chrome-headless-shell');
      if (fs.existsSync(exe)) return exe;
    }
  }
  return undefined;
}

// ---- in-page helpers (serialised into the page; no closures) --------------
// Brings the page to <task> with the style's kit rendered in light mode.
async function pageSetup(task) {
  if (typeof state === 'undefined' || typeof chooseAesthetic !== 'function') throw new Error('app globals missing');
  if (state.aestheticVersion === 'classic' && hasClassicAesthetic(state.aesthetic)) setAestheticVersion('current');
  chooseAesthetic(task.key);
  if (task.classic) {
    if (!hasClassicAesthetic(task.key)) throw new Error('no classic version for ' + task.key);
    setAestheticVersion('classic');
  }
  state.bgMode = 'light';
  render();
  Show.built('kit');
}

function pageReady(arg) {
  const root = document.querySelector('.sb-ab[data-ae="' + arg.ae + '"] .sb-kitpage');
  if (!root || document.fonts.status !== 'loaded') return false;
  if (root.closest('.sb-ab').dataset.mode !== 'light') return false;
  const r = root.getBoundingClientRect();
  if (r.width < 300) return false;
  for (const id of arg.ids) if (!root.querySelector('.sb-k-cell[data-k="' + id + '"]')) return false;
  const sig = root.scrollHeight + ':' + root.querySelectorAll('*').length + ':' + document.fonts.size;
  window.__kitStable = window.__kitStable && window.__kitStable.sig === sig
    ? { sig, n: window.__kitStable.n + 1 } : { sig, n: 0 };
  return window.__kitStable.n >= 8;           // ~8 consecutive identical animation frames
}

// Signature of every new cell's parts (+ pseudo-elements) under the current stylesheet state.
function pageSignatures(arg) {
  const out = {};
  const sel = arg.parts.map(c => '.sb-k-' + c).join(',');
  const cs = (el, pseudo) => {
    const s = getComputedStyle(el, pseudo || null);
    return arg.props.map(p => s[p]).join('|') + (pseudo ? '|' + s.content + '|' + s.display : '');
  };
  for (const id of arg.ids) {
    const cell = document.querySelector('.sb-kitpage .sb-k-cell[data-k="' + id + '"]');
    if (!cell) { out[id] = null; continue; }
    out[id] = [...cell.querySelectorAll(sel)].map(el =>
      cs(el) + '#' + cs(el, '::before') + '#' + cs(el, '::after')).join('\n');
    out[id] = { sig: out[id], parts: cell.querySelectorAll(sel).length };
  }
  return out;
}

// Horizontal overflow + parts sticking out of their cell, for every new cell.
function pageGeometry(arg) {
  const overflow = {}, outside = {};
  const skipTrack = '.sb-k-car-track, .sb-k-mx-track, .sb-k-scrollbox';
  const desc = el => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string'
    ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
  for (const id of arg.ids) {
    const cell = document.querySelector('.sb-kitpage .sb-k-cell[data-k="' + id + '"]');
    if (!cell) continue;
    const cr = cell.getBoundingClientRect();
    const els = [cell, ...cell.querySelectorAll('*')];
    for (const el of els) {
      if (el.matches(skipTrack)) continue;                 // intentionally scrollable
      if (el.closest(skipTrack) && el !== cell) continue;  // contents of those tracks
      // body of a closed <details> is not rendered, yet Chromium still reports a layout box for it
      if (el !== cell) { const dt = el.closest('details'); if (dt && !dt.open && !el.closest('summary')) continue; }
      if (el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0 && getComputedStyle(el).display !== 'inline') {
        (overflow[id] = overflow[id] || []).push(desc(el) + ' sw=' + el.scrollWidth + ' cw=' + el.clientWidth);
      }
      if (el === cell) continue;
      const cst = getComputedStyle(el);
      if (cst.display === 'none' || cst.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      // visible rect = own rect clipped by every clipping ancestor inside the cell
      let L = r.left, R = r.right, T = r.top, B = r.bottom, clippedAway = false;
      for (let p = el.parentElement; p && p !== cell; p = p.parentElement) {
        const ps = getComputedStyle(p);
        if (ps.overflowX !== 'visible' || ps.overflowY !== 'visible') {
          const pr = p.getBoundingClientRect();
          L = Math.max(L, pr.left); R = Math.min(R, pr.right); T = Math.max(T, pr.top); B = Math.min(B, pr.bottom);
        }
      }
      if (R <= L || B <= T) clippedAway = true;
      if (clippedAway) continue;
      const dx = Math.max(cr.left - L, R - cr.right, 0), dy = Math.max(cr.top - T, B - cr.bottom, 0);
      if (dx > 1 || dy > 1) (outside[id] = outside[id] || []).push(desc(el) + ' dx=' + Math.round(dx) + ' dy=' + Math.round(dy));
    }
  }
  return { overflow, outside };
}

// ---- per-task run ----------------------------------------------------------
async function runTask(page, task, errBucket, pwShots) {
  const name = task.classic ? task.key + '--classic' : task.key;
  const ae = name;
  await page.evaluate(`(${pageSetup.toString()})(${JSON.stringify(task)})`);
  await page.waitForFunction(`(${pageReady.toString()})(${JSON.stringify({ ae, ids: NEW_IDS })})`,
    null, { polling: 'raf', timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);

  const arg = { ids: NEW_IDS, parts: PART_CLASSES, props: SIG_PROPS };
  const sigOf = () => page.evaluate(`(${pageSignatures.toString()})(${JSON.stringify(arg)})`);
  const href = task.classic ? `css/aesthetics/classic/${task.key}.css` : `css/aesthetics/${task.key}.css`;
  const setLink = on => page.evaluate(({ href, on }) => {
    const l = [...document.querySelectorAll('link[rel="stylesheet"]')].find(x => x.getAttribute('href') === href);
    if (!l) throw new Error('stylesheet link not found: ' + href);
    l.disabled = !on;
    return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  }, { href, on });

  const withCss = await sigOf();
  await setLink(false);
  const withoutCss = await sigOf();
  await setLink(true);

  const unstyled = [], zeroParts = [];
  for (const id of NEW_IDS) {
    const a = withCss[id], b = withoutCss[id];
    if (!a || !b) throw new Error('cell missing: ' + id);
    if (a.parts === 0) zeroParts.push(id);
    if (a.sig === b.sig) unstyled.push(id);
  }
  const geo = await page.evaluate(`(${pageGeometry.toString()})(${JSON.stringify(arg)})`);

  const shots = [];
  if (pwShots) {
    const dir = path.join(opt.out, 'kitshots', name);
    fs.mkdirSync(dir, { recursive: true });
    // The in-app Built view is a fixed-size window over the board, so element shots of it garble.
    // Draw the same kit with SeeBuilt.kitInto into a 1440px-wide fixed host instead (the AI brief's
    // own off-screen route), shift each group to the top and clip to it.
    await page.evaluate(() => {
      const host = document.createElement('div');
      host.id = '__kitShotHost';
      host.className = 'sb-view';
      host.style.cssText = 'position:fixed;left:0;top:0;width:1440px;z-index:2147483000;display:block;background:#fff;';
      document.body.appendChild(host);
      SeeBuilt.kitInto(host, { mode: 'light' });
    });
    await page.evaluate(() => document.fonts.ready);
    for (const g of GROUPS) {
      const sel = `#__kitShotHost .sb-kitpage .sb-k-group[aria-label="${g}"]`;
      if (await page.locator(sel).count() === 0) throw new Error('kit group missing: ' + g);
      await page.evaluate(() => { document.getElementById('__kitShotHost').style.top = '0px'; });
      const h = await page.evaluate(s => Math.ceil(document.querySelector(s).getBoundingClientRect().height), sel);
      await page.setViewportSize({ width: 1440, height: Math.min(16000, Math.max(900, h + 20)) });
      const box = await page.evaluate(s => {
        const host = document.getElementById('__kitShotHost');
        const r = document.querySelector(s).getBoundingClientRect();
        host.style.top = (-r.top) + 'px';
        return new Promise(res => requestAnimationFrame(() => requestAnimationFrame(() => {
          const q = document.querySelector(s).getBoundingClientRect(); res({ x: q.left, y: q.top, width: q.width, height: q.height });
        })));
      }, sel);
      const f = path.join(dir, g.toLowerCase() + '.png');
      await page.screenshot({ path: f, animations: 'disabled', clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: Math.min(box.width, 1440), height: Math.min(box.height, 16000) } });
      shots.push(f);
    }
    await page.evaluate(() => { const h = document.getElementById('__kitShotHost'); if (h) h.remove(); });
    await page.setViewportSize({ width: 1440, height: 900 });
  }
  return {
    unstyled,
    overflow: Object.keys(geo.overflow),
    outside: Object.keys(geo.outside),
    errors: errBucket.splice(0),
    details: { overflow: geo.overflow, outside: geo.outside },
    cellsWithNoParts: zeroParts,
    shots: shots.length
  };
}

// The Built view only shows inside the editor: open a throwaway brand in this (in-memory) context.
async function openEditor(page) {
  await page.waitForFunction(() => typeof AESTHETICS !== 'undefined' && typeof Show !== 'undefined' && typeof BrandSession !== 'undefined');
  await page.evaluate(() => BrandSession.createBrand('Kit Check', 'Per-style kit check'));
  await page.waitForFunction(() => document.body.dataset.view === 'editor', null, { timeout: 15000 });
}

// ---- main -------------------------------------------------------------------
(async () => {
  const t0 = Date.now();
  const { chromium } = loadPlaywright();
  const exe = findHeadlessShell();
  const browser = await chromium.launch({ headless: true, executablePath: exe, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, bypassCSP: false });
  // a fresh context has no cache; also tell the server not to serve stale files
  await context.setExtraHTTPHeaders({ 'Cache-Control': 'no-cache' });
  await context.addInitScript(() => { try { localStorage.clear(); } catch (e) { /* ignore */ } });

  // discover styles from the live page
  const probe = await context.newPage();
  await probe.goto(opt.url, { waitUntil: 'load' });
  await probe.waitForFunction(() => typeof AESTHETICS !== 'undefined' && typeof Show !== 'undefined' && typeof UI_KIT !== 'undefined');
  const meta = await probe.evaluate(() => ({
    keys: AESTHETICS.filter(a => !a.classicOf).map(a => a.key),
    classic: AESTHETICS.filter(a => !a.classicOf).map(a => a.key).filter(k => hasClassicAesthetic(k)),
    kitIds: UI_KIT.flatMap(g => g.items.map(i => i.id))
  }));
  await probe.close();
  const missing = NEW_IDS.filter(id => !meta.kitIds.includes(id));
  if (missing.length) die('UI_KIT lacks expected ids: ' + missing.join(' '));

  let tasks = [];
  for (const k of meta.keys) { tasks.push({ key: k, classic: false }); if (meta.classic.includes(k)) tasks.push({ key: k, classic: true }); }
  if (opt.only) tasks = tasks.filter(t => opt.only.includes(t.classic ? t.key + '--classic' : t.key));
  if (!tasks.length) die('no styles selected');
  console.log(`styles to check: ${tasks.length} (${meta.keys.length} current + ${meta.classic.length} classic), jobs=${opt.jobs}, exe=${exe || 'playwright default'}`);

  fs.mkdirSync(opt.out, { recursive: true });
  const report = {}, harnessFailures = {};
  let cursor = 0, done = 0;

  async function worker() {
    const page = await context.newPage();
    const bucket = [];
    page.on('pageerror', e => bucket.push('pageerror: ' + String(e.message || e).slice(0, 300)));
    page.on('console', m => { if (m.type() === 'error') bucket.push('console: ' + m.text().slice(0, 300)); });
    await page.goto(opt.url, { waitUntil: 'load' });
    await openEditor(page);
    bucket.length = 0;
    while (cursor < tasks.length) {
      const task = tasks[cursor++];
      const name = task.classic ? task.key + '--classic' : task.key;
      try {
        report[name] = await runTask(page, task, bucket, opt.shots);
      } catch (e) {
        harnessFailures[name] = String(e.message || e).split('\n')[0];
        bucket.length = 0;
        // reload so one bad run cannot poison the next
        await page.goto(opt.url, { waitUntil: 'load' }).catch(() => {});
        await openEditor(page).catch(() => {});
      }
      done++;
      process.stdout.write(`\r${done}/${tasks.length} ${name}                    `);
    }
    await page.close();
  }
  await Promise.all(Array.from({ length: Math.min(opt.jobs, tasks.length) }, worker));
  process.stdout.write('\n');
  await browser.close();

  const ordered = {};
  for (const t of tasks) { const n = t.classic ? t.key + '--classic' : t.key; if (report[n]) ordered[n] = report[n]; }
  const secs = Math.round((Date.now() - t0) / 100) / 10;
  const file = path.join(opt.out, 'kit-style-report.json');
  fs.writeFileSync(file, JSON.stringify(Object.assign({}, ordered, Object.keys(harnessFailures).length ? { _harnessFailures: harnessFailures } : {}), null, 2));

  // summary
  const rows = Object.entries(ordered);
  const cnt = f => rows.filter(([, r]) => r[f].length).length;
  console.log(`checked ${rows.length}/${tasks.length} in ${secs}s -> ${file}`);
  console.log(`styles with unstyled ids: ${cnt('unstyled')}; overflow: ${cnt('overflow')}; outside-cell: ${cnt('outside')}; errors: ${cnt('errors')}`);
  for (const [n, r] of rows) {
    const bits = [];
    if (r.unstyled.length) bits.push('unstyled=' + r.unstyled.join(','));
    if (r.overflow.length) bits.push('overflow=' + r.overflow.join(','));
    if (r.outside.length) bits.push('outside=' + r.outside.join(','));
    if (r.errors.length) bits.push('errors=' + r.errors.length);
    if (bits.length) console.log(`  ${n}: ${bits.join('  ')}`);
  }
  const hf = Object.keys(harnessFailures);
  if (hf.length) { console.error(`CHECK FAILED for ${hf.length} style(s):`); hf.forEach(n => console.error(`  ${n}: ${harnessFailures[n]}`)); process.exit(2); }
})().catch(e => die(e && e.stack || String(e)));
