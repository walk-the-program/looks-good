/* Helpers for dev/lg.js: argument parsing, close matches, the look file, target resolution. */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const CUSTOM_DIR = path.join(ROOT, 'custom-aesthetics');
const SPECS_DIR = path.join(ROOT, 'dev', 'move-lab', 'specs');

class Fail extends Error {}
const fail = msg => { throw new Fail(msg); };

/* flags that take a value; every other --flag is a boolean */
const VALUE_FLAGS = new Set(['style', 'styles', 'state', 'look', 'sheet', 'png', 'out', 'port', 'round', 'target', 'surface', 'mode', 'query', 'family']);
function parseArgs(argv) {
  const o = { _: [], flags: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      let [k, v] = a.slice(2).split(/=(.*)/s);
      if (VALUE_FLAGS.has(k)) { if (v === undefined) { v = argv[++i]; if (v === undefined || v.startsWith('--')) fail(`--${k} needs a value`); } o.flags[k] = v; }
      else if (k === 'json' || k === 'help') o.flags[k] = true;
      else fail(`unknown option --${k} (node dev/lg.js --help)`);
    } else if (a === '-h') o.flags.help = true;
    else o._.push(a);
  }
  return o;
}

function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
function closeMatches(name, list, n) {
  const q = String(name).toLowerCase();
  return list.map(x => { const l = String(x).toLowerCase(); return { x, s: l.includes(q) || q.includes(l) ? 0 : lev(q, l) }; })
    .sort((a, b) => a.s - b.s).slice(0, n || 5).filter(m => m.s <= Math.max(3, Math.floor(q.length / 2))).map(m => m.x);
}
const didYouMean = (name, list) => { const m = closeMatches(name, list); return m.length ? ` Close matches: ${m.join(', ')}.` : ''; };

/* ---- the look (docs/agent-interface/PLAN.md: look.json) ---- */
const LOOK_KEYS = ['app', 'repo', 'brandName', 'style', 'blend', 'primary', 'scheme', 'colors', 'heading', 'body', 'typography', 'pureBg', 'modes'];
const PINNED = { primary: '#2f5d8a', scheme: 'analogous', heading: 'Inter', body: 'Inter' };   // the checker's preview brand
const HEX = /^#[0-9a-f]{6}$/i;

function readLook(file, warnings) {
  let raw = {};
  if (file) {
    try { raw = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { fail(`cannot read look file ${file}: ${e.message}`); }
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) fail(`${file} must be a JSON object`);
    Object.keys(raw).forEach(k => { if (!LOOK_KEYS.includes(k)) warnings.push(`look.json: unknown key "${k}" ignored (known: ${LOOK_KEYS.join(', ')})`); });
  }
  const look = {
    brandName: raw.brandName || raw.app || null, style: raw.style || null, blend: raw.blend || null,
    primary: raw.primary || PINNED.primary, scheme: raw.scheme || PINNED.scheme, colors: raw.colors || null,
    heading: raw.heading || PINNED.heading, body: raw.body || PINNED.body,
    typography: raw.typography || null, pureBg: raw.pureBg === true,
    modes: Array.isArray(raw.modes) && raw.modes.length ? raw.modes : ['light', 'dark'], file: file || null,
  };
  if (!HEX.test(look.primary)) fail(`look primary "${look.primary}" is not a #rrggbb colour`);
  look.modes.forEach(m => { if (m !== 'light' && m !== 'dark') fail(`look modes may only be "light" and "dark" (got "${m}")`); });
  if (look.colors) {
    const keys = ['primary', 'secondary', 'accent', 'neutralDark', 'neutralLight'];
    if (typeof look.colors !== 'object' || !keys.every(k => HEX.test(look.colors[k] || ''))) fail(`look colors needs ${keys.join(', ')} as #rrggbb`);
  }
  return look;
}

/* validates the look against what the page knows; throws Fail with close matches */
function checkLook(look, known) {
  if (!known.schemes.includes(look.scheme)) fail(`unknown colour scheme "${look.scheme}".${didYouMean(look.scheme, known.schemes)} Schemes: ${known.schemes.join(', ')}`);
  for (const [what, name] of [['heading', look.heading], ['body', look.body]]) {
    if (!known.fonts.includes(name)) fail(`unknown ${what} font "${name}".${didYouMean(name, known.fonts) || ' List them with: node dev/lg.js fonts'}`);
  }
  if (look.blend && look.blend.with && !known.styles.includes(look.blend.with)) fail(`unknown blend style "${look.blend.with}".${didYouMean(look.blend.with, known.styles)}`);
}
function checkStyle(key, known) {
  if (!known.styles.includes(key)) fail(`unknown style "${key}".${didYouMean(key, known.styles) || ' List them with: node dev/lg.js styles'}`);
}

/* ---- target: a registered key or a spec-v2 folder ---- */
function resolveTarget(arg) {
  const abs = path.resolve(arg);
  if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) {
    let spec;
    try { spec = JSON.parse(fs.readFileSync(path.join(abs, 'aesthetic.json'), 'utf8')); } catch (e) { fail(`${abs} is not a spec-v2 folder (aesthetic.json: ${e.message})`); }
    if (!spec || typeof spec.key !== 'string') fail(`${abs}/aesthetic.json has no key`);
    let listed = false;
    try { listed = path.dirname(abs) === CUSTOM_DIR && JSON.parse(fs.readFileSync(path.join(CUSTOM_DIR, 'index.json'), 'utf8')).aesthetics.includes(path.basename(abs)) && path.basename(abs) === spec.key; } catch (e) { /* not listed */ }
    const lab = path.dirname(abs) === SPECS_DIR;
    return { folder: abs, key: spec.key, listed: listed || lab, lab };
  }
  if (/[\\/]/.test(arg) || arg.startsWith('.') || arg.startsWith('~')) fail(`${arg} is not a folder`);
  const f = path.join(CUSTOM_DIR, arg);
  return { folder: fs.existsSync(path.join(f, 'aesthetic.json')) ? f : null, key: arg, listed: true, lab: false };
}

function nextRound(renders) {
  let n = 0;
  if (fs.existsSync(renders)) for (const d of fs.readdirSync(renders)) { const m = /^r(\d+)$/.exec(d); if (m) n = Math.max(n, +m[1]); }
  return n + 1;
}

module.exports = { ROOT, CUSTOM_DIR, Fail, fail, parseArgs, closeMatches, didYouMean, readLook, checkLook, checkStyle, resolveTarget, nextRound, PINNED };
