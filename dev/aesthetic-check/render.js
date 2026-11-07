/* Render checks and shots for dev/aesthetic-check.js. Headless playwright-cli, one unique in-memory
   session, localhost only, no cookie / localStorage commands, always closed (same rules as
   dev/move-lab/shoot.sh and the clearpath-playwright-review skill). */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const cp = require('child_process');

/* ---- WCAG (own implementation) ---- */
const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
function lum(hex) {
  const [r, g, b] = hexRgb(hex).map(v => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a, b) { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }

/* ---- stress palettes (primary; the rest derived by the app's own derivePalette) ---- */
const PALETTES = [
  { id: 'muted-beige', primary: '#d8cbb4' },
  { id: 'neon-green', primary: '#39ff14' },
  { id: 'deep-navy', primary: '#0b1d4a' },
  { id: 'near-white', primary: '#f7f7f2' },
  { id: 'pure-red', primary: '#ff0000' },
  { id: 'grey-only', primary: '#808080' },
];

/* ---- probes: real elements, measured in the page. min = WCAG ratio that must hold ---- */
const PROBES = {
  board: { root: '#previewCard .ab', list: [
    { id: 'body-text', sel: '.ab-subcopy, .ab-card-body', min: 4.5 },
    { id: 'primary-button', sel: '.ab-cta', min: 4.5 },
    { id: 'field-text', sel: '.ab-input', min: 4.5 },
    { id: 'secondary-text', sel: '.ab-sw-job, .ab-row-status, .ab-label', min: 3 },
    /* WARN-only probes (display text; 3:1 is the large-text floor): the headline highlight word, text drawn in the accent */
    { id: 'highlight-word', sel: '.ab-hl', min: 3, warn: true },
    { id: 'accent-text', accent: true, min: 3, warn: true },
  ] },
  kit: { root: '#builtView .ab', list: [
    { id: 'body-text', sel: '.sb-k-para, .sb-k-intro, .sb-k-title', min: 4.5 },
    { id: 'primary-button', sel: '.sb-k-btn', min: 4.5 },
    { id: 'field-text', sel: '.sb-k-field input, .sb-k-field textarea', min: 4.5 },
    { id: 'secondary-text', sel: '.sb-k-sub, .sb-k-help', min: 3 },
    { id: 'accent-text', accent: true, min: 3, warn: true },
  ] },
};

/* Fixed preview brand for --shots so every round renders with the SAME input (override the primary with --palette) */
const SHOT_BRAND = { primary: '#2f5d8a', scheme: 'analogous', heading: 'Inter', body: 'Inter' };

/* In-page probe. Colours are normalised through a 1x1 canvas (handles color(srgb ...), color-mix, oklch);
   disabled controls (exempt from WCAG) are skipped; text alpha and every translucent ancestor background are composited over white, bottom up. */
const PROBE_JS = `window.__lgp=function(rootSel,probes){
const root=document.querySelector(rootSel);if(!root)return JSON.stringify({error:'no root '+rootSel});
const cv=document.createElement('canvas');cv.width=cv.height=1;const cx=cv.getContext('2d',{willReadFrequently:true});
const rgba=s=>{cx.clearRect(0,0,1,1);cx.fillStyle='#000';cx.fillStyle=s;cx.fillRect(0,0,1,1);const d=cx.getImageData(0,0,1,1).data;return[d[0],d[1],d[2],d[3]/255]};
const over=(f,b)=>{const a=f[3];return[f[0]*a+b[0]*(1-a),f[1]*a+b[1]*(1-a),f[2]*a+b[2]*(1-a),1]};
const hex=c=>'#'+c.slice(0,3).map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
const hasText=e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())||/^(INPUT|TEXTAREA|SELECT)$/.test(e.tagName);
const visible=e=>{const r=e.getBoundingClientRect();const s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'};
const textEl=e=>hasText(e)?e:[...e.querySelectorAll('*')].find(x=>hasText(x)&&visible(x));
const out=[];
for(const p of probes){
 const near=(a,b)=>Math.abs(a[0]-b[0])<=6&&Math.abs(a[1]-b[1])<=6&&Math.abs(a[2]-b[2])<=6;
 const accs=p.accent?['--ab-accent','--ab-accent-text'].map(v=>getComputedStyle(root).getPropertyValue(v).trim()).filter(Boolean).map(rgba):[];
 const pool=p.accent?[...root.querySelectorAll('*')].filter(e=>hasText(e)&&!e.matches('.ab-hl,button,.ab-cta,.sb-k-btn,input,textarea,select')&&!e.closest('.ab-hl')&&accs.some(a=>near(rgba(getComputedStyle(e).color),a))):[...root.querySelectorAll(p.sel)];
 const found=pool.filter(e=>visible(e)&&!e.closest('[disabled],[aria-disabled="true"],.is-disabled,.sb-k-disabled'));
 let n=0;
 for(const el of found){
  const t=textEl(el);if(!t)continue;if(++n>6)break;
  const layers=[];let img=false,op=1;
  for(let e=t;e;e=e.parentElement){const cs=getComputedStyle(e);const bg=rgba(cs.backgroundColor);if(bg[3]>0)layers.push(bg);if(cs.backgroundImage!=='none')img=true;op*=parseFloat(cs.opacity);if(bg[3]>=1)break}
  let back=[255,255,255,1];for(let i=layers.length-1;i>=0;i--)back=over(layers[i],back);
  const f=rgba(getComputedStyle(t).color);f[3]*=op;const fg=over(f,back);
  out.push({probe:p.id,sel:p.sel,el:(t.tagName.toLowerCase()+(t.className&&t.className.baseVal===undefined?'.'+String(t.className).trim().split(/\\s+/).join('.'):'')).slice(0,60),text:(t.value||t.textContent||'').trim().slice(0,24),fg:hex(fg),bg:hex(back),img});
 }
 if(!n)out.push({probe:p.id,sel:p.sel,missing:true});
}
return JSON.stringify({rows:out,mode:root.dataset.mode,ae:root.dataset.ae})}`;

function sleep(ms) { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }

function run({ port, key, R, ROOT, shots, outDir, palette }) {
  const session = `-s=lg-check-${process.pid}`;
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'lg-check-'));   // playwright-cli drops .playwright-cli/ in its cwd
  const url = `http://localhost:${port}/?movelab=1`;
  const pw = (...args) => cp.spawnSync('playwright-cli', [session, ...args], { cwd: work, encoding: 'utf8', timeout: 60000 });
  const ev = js => {
    const r = pw('--raw', 'eval', js);
    const lines = ((r.stdout || '') + (r.stderr || '')).split('\n').filter(l => l.trim());
    return lines.length ? lines[lines.length - 1] : '';
  };
  const evJson = js => { const l = ev(js); try { const v = JSON.parse(l); return typeof v === 'string' ? JSON.parse(v) : v; } catch (e) { return { error: 'unparsable eval result: ' + l.slice(0, 120) }; } };
  const consoleStat = () => {
    const out = (pw('console').stdout || '');
    const m = out.match(/Errors:\s*(\d+),\s*Warnings:\s*(\d+)/);
    return { errors: m ? +m[1] : 0, warnings: m ? +m[2] : 0, text: out };
  };
  let table = { rows: [], text: '' };
  try {
    const open = pw('open', '--browser=chromium', url);
    if (open.status !== 0) { R.fail('render', `playwright-cli could not open ${url}: ${((open.stderr || open.stdout) || '').trim().slice(0, 160)} (is the server running at the repo root?)`); return table; }
    pw('resize', '1440', '1000');
    ev("(()=>{document.body.dataset.view='editor';window.showToast=()=>{};return 'ok'})()");
    const has = ev(`AESTHETICS.some(a=>a.key==='${key}')`);
    if (has !== 'true') {
      const c = consoleStat();
      R.fail('render-load', `"${key}" is not registered at ${url} (add its folder to dev/move-lab/specs/index.json; ${c.errors} console error(s) at load${c.errors ? ': ' + c.text.split('\n').filter(l => /error/i.test(l)).slice(0, 2).join(' | ').slice(0, 200) : ''})`);
      return table;
    }
    ev(PROBE_JS.replace(/\n/g, ''));

    const setup = (mode, view, extra) => `(()=>{if(state.aesthetic!=='${key}')chooseAesthetic('${key}');state.aesthetic='${key}';${extra || ''}state.bgMode='${mode}';` +
      (view === 'kit' ? "Show.built('kit');" : view === 'deck' ? "setBoardView('deck');" : "setBoardView('board');") +
      `render();${view === 'deck' ? 'if(window.renderBrandDeckNow)renderBrandDeckNow();' : ''}return 'ok'})()`;

    /* 1. console errors: board, kit, deck x light, dark (default palette) */
    let prev = consoleStat();
    const initial = prev.errors;
    if (initial) R.fail('render-console', `${initial} console error(s)/at load: ${prev.text.split('\n').filter(l => /\[ERROR\]|error/i.test(l)).slice(0, 3).join(' | ').slice(0, 300)}`);
    for (const view of ['board', 'kit', 'deck']) {
      for (const mode of ['light', 'dark']) {
        const r = ev(setup(mode, view));
        if (view === 'deck') sleep(1200); else sleep(250);
        const c = consoleStat();
        const dErr = c.errors - prev.errors, dWarn = c.warnings - prev.warnings;
        if (dErr > 0) R.fail('render-console', `${view} ${mode}: ${dErr} new console error(s): ${c.text.split('\n').filter(l => /\[ERROR\]|error/i.test(l)).slice(-2).join(' | ').slice(0, 300)}`);
        else if (dWarn > 0) R.warn('render-console', `${view} ${mode}: ${dWarn} new console warning(s)`);
        else if (r !== '"ok"') R.fail('render-console', `${view} ${mode}: switch script failed: ${r.slice(0, 120)}`);
        else R.pass('render-console', `${view} ${mode}: 0 console errors`);
        prev = c;
      }
    }

    /* 2. stress palettes x light/dark x board/kit */
    const rows = [];
    for (const pal of PALETTES) {
      const palJs = `state.colors=derivePalette('${pal.primary}','analogous');state.scheme='analogous';state.hue=Math.round(hexToHsl('${pal.primary}').h);`;
      for (const mode of ['light', 'dark']) {
        for (const view of ['board', 'kit']) {
          ev(setup(mode, view, palJs));
          sleep(200);
          const P = PROBES[view];
          const got = evJson(`window.__lgp(${JSON.stringify(P.root)},${JSON.stringify(P.list)})`);
          if (got.error) { rows.push({ pal: pal.id, mode, view, probe: '-', error: got.error }); continue; }
          if (got.mode !== mode) rows.push({ pal: pal.id, mode, view, probe: '-', note: `root data-mode is ${got.mode}` });
          for (const p of P.list) {
            const mine = got.rows.filter(x => x.probe === p.id);
            if (mine.some(x => x.missing) && mine.length === 1) { if (p.warn) continue; rows.push({ pal: pal.id, mode, view, probe: p.id, missing: true, min: p.min }); continue; }
            let worst = null;
            for (const x of mine) { if (x.missing) continue; const r = ratio(x.fg, x.bg); if (!worst || r < worst.ratio) worst = Object.assign({ ratio: r }, x); }
            if (!worst) { if (!p.warn) rows.push({ pal: pal.id, mode, view, probe: p.id, missing: true, min: p.min }); continue; }
            rows.push({ pal: pal.id, mode, view, probe: p.id, min: p.min, ratio: worst.ratio, el: worst.el, text: worst.text, fg: worst.fg, bg: worst.bg, img: worst.img });
          }
        }
      }
    }
    const end = consoleStat();
    if (end.errors > prev.errors) R.fail('render-console', `${end.errors - prev.errors} console error(s) while applying stress palettes`);

    /* report */
    const isWarn = id => (PROBES.board.list.concat(PROBES.kit.list).find(p => p.id === id) || {}).warn;
    const warnRows = rows.filter(r => isWarn(r.probe));
    rows.splice(0, rows.length, ...rows.filter(r => !isWarn(r.probe)));
    const fails = rows.filter(r => r.ratio !== undefined && r.ratio < r.min - 1e-9);
    const missing = rows.filter(r => r.missing);
    const errs = rows.filter(r => r.error);
    for (const f of fails) R.fail('render-contrast', `${f.pal}/${f.mode} ${f.view} ${f.probe}: ${f.ratio.toFixed(2)} < ${f.min} on <${f.el}> "${f.text}" (text ${f.fg} on ${f.bg}${f.img ? ', backdrop has an image/gradient: colour only' : ''})`);
    for (const e of errs) R.fail('render-contrast', `${e.pal}/${e.mode} ${e.view}: ${e.error}`);
    const missKeys = [...new Set(missing.map(m => `${m.view}:${m.probe}`))];
    if (missKeys.length) R.warn('render-contrast', `no visible element to measure for ${missKeys.join(', ')}`);
    if (!fails.length && !errs.length) R.pass('render-contrast', `${rows.filter(r => r.ratio !== undefined).length} measurements across ${PALETTES.length} stress palettes x light/dark hold their minimums`);

    /* coloured display text: WARN only, one line per probe naming palette, mode and element */
    for (const id of ['highlight-word', 'accent-text']) {
      const mine = warnRows.filter(r => r.probe === id && r.ratio !== undefined);
      if (!mine.length) continue;
      const low = mine.filter(r => r.ratio < r.min - 1e-9);
      if (!low.length) { R.pass('render-text', `${id}: ${mine.length} measurements hold 3:1 across the stress palettes`); continue; }
      const shown = low.slice(0, 4).map(f => `${f.pal}/${f.mode} ${f.view} ${f.ratio.toFixed(2)} on <${f.el}> "${f.text}" (${f.fg} on ${f.bg}${f.img ? ', backdrop image/gradient: colour only' : ''})`).join('; ');
      R.warn('render-text', `${id} under 3:1 in ${low.length} of ${mine.length} cases: ${shown}${low.length > 4 ? '; ...' : ''}`);
    }

    const lines = ['Stress contrast (worst element per probe; min 4.5 body/primary/field, 3 secondary):',
      'palette       mode   view   body  primary  field  secondary'];
    for (const pal of PALETTES) for (const mode of ['light', 'dark']) for (const view of ['board', 'kit']) {
      const cell = id => { const r = rows.find(x => x.pal === pal.id && x.mode === mode && x.view === view && x.probe === id); if (!r || r.missing || r.ratio === undefined) return '  n/a'.padEnd(7); const s = r.ratio.toFixed(2) + (r.ratio < r.min ? '!' : ' '); return s.padStart(6) + ' '; };
      lines.push(`${pal.id.padEnd(13)} ${mode.padEnd(6)} ${view.padEnd(5)} ${cell('body-text')}${cell('primary-button')}${cell('field-text')}${cell('secondary-text')}`.replace(/ +$/, ''));
    }
    table = { rows, text: lines.join('\n').split('\n').map(l => '  ' + l).join('\n') };
  } finally {
    pw('close');
    fs.rmSync(work, { recursive: true, force: true });
  }

  if (shots) {
    if (!outDir) { R.fail('shots', 'no output folder (pass --out <dir> for a key-only run)'); return table; }
    runShots({ port, key, R, ROOT, outDir, palette });
  }
  return table;
}

function runShots({ port, key, R, ROOT, outDir, palette }) {
  fs.mkdirSync(outDir, { recursive: true });
  const brand = Object.assign({}, SHOT_BRAND, palette ? { primary: palette } : {});
  const session = `-s=lg-shoot-${process.pid}`;
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'lg-shoot-'));
  const pw = (...args) => cp.spawnSync('playwright-cli', [session, ...args], { cwd: work, encoding: 'utf8', timeout: 60000 });
  const ev = js => { const l = ((pw('--raw', 'eval', js).stdout || '')).split('\n').filter(x => x.trim()); return l.length ? l[l.length - 1] : ''; };
  let bad = 0;
  try {
    const open = pw('open', '--browser=chromium', `http://localhost:${port}/?movelab=1`);
    if (open.status !== 0) { R.fail('shots', 'playwright-cli could not open the page for shots'); return; }
    pw('resize', '1440', '1000');
    ev("(()=>{document.body.dataset.view='editor';window.showToast=()=>{};return 'ok'})()");
    /* the pinned brand: same palette, scheme and fonts for every round (the app's own derivePalette and font table) */
    const pin = `state.colors=derivePalette('${brand.primary}','${brand.scheme}');state.scheme='${brand.scheme}';state.hue=Math.round(hexToHsl('${brand.primary}').h);state.headingFont=fontByName('${brand.heading}')||state.headingFont;state.bodyFont=fontByName('${brand.body}')||state.bodyFont;`;
    for (const mode of ['light', 'dark']) for (const view of ['board', 'kit', 'deck']) {
      const setView = view === 'board' ? "setBoardView('board');" : view === 'deck' ? "setBoardView('deck');" : "Show.built('kit');";
      ev(`(()=>{if(state.aesthetic!=='${key}')chooseAesthetic('${key}');state.aesthetic='${key}';${pin}state.bgMode='${mode}';${setView}render();return 'ok'})()`);
      ev('document.fonts.ready.then(()=>1)');
      sleep(view === 'deck' ? 2000 : 500);
      const sel = view === 'board' ? '#previewCard' : view === 'deck' ? '#deckGrid .deck-card:nth-child(1)' : '#builtView';
      const f = path.join(outDir, `${key}-${view}-${mode}.png`);
      const r = pw('screenshot', sel, `--filename=${f}`);
      if (r.status !== 0 || !fs.existsSync(f)) { bad++; R.fail('shots', `screenshot failed: ${path.basename(f)}`); }
    }
  } finally { pw('close'); fs.rmSync(work, { recursive: true, force: true }); }
  if (bad) return;
  fs.writeFileSync(path.join(outDir, 'palette.txt'), `Preview brand used for these shots (same for every round; override the primary with --palette <hex>)\nprimary: ${brand.primary}\nscheme: ${brand.scheme} (app derivePalette)\nheading font: ${brand.heading}\nbody font: ${brand.body}\n`);
  const made = [];
  for (const mode of ['light', 'dark']) {
    const kit = path.join(outDir, `${key}-kit-${mode}.png`);
    if (!fs.existsSync(kit)) continue;
    const dim = cp.spawnSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', kit], { encoding: 'utf8' }).stdout || '';
    const w = +(dim.match(/pixelWidth:\s*(\d+)/) || [])[1], h = +(dim.match(/pixelHeight:\s*(\d+)/) || [])[1];
    const top = path.join(outDir, `${key}-kit-top-${mode}.png`);
    /* crop from the top-left, never wider/taller than the image (sips pads when asked for more) */
    const c = cp.spawnSync('sips', ['-c', String(Math.min(4000, h || 4000)), String(Math.min(944, w || 944)), '--cropOffset', '0', '0', kit, '--out', top], { encoding: 'utf8' });
    if (c.status === 0) { fs.rmSync(kit, { force: true }); made.push(path.basename(top)); }
    else R.warn('shots', `sips crop failed for ${path.basename(kit)}: ${(c.stderr || '').trim().slice(0, 100)}`);
  }
  for (const f of fs.readdirSync(outDir)) if (f.startsWith(key + '-') && !made.includes(f)) made.push(f);
  R.pass('shots', `${made.sort().join(', ')} in ${outDir} (palette.txt: primary ${brand.primary}, ${brand.heading}/${brand.body})`);
}

module.exports = { run };
