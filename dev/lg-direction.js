/* Direction and refinement gates for dev/lg.js (pure Node, no browser). Parses an app's direction.md
   (template: .claude/skills/ui-direction/templates/direction.md) and the critic's review files
   (app/reviews/r<n>.json, format: .claude/skills/ui-direction/references/rubric.md section 6).
   Every check returns an array of { status: 'PASS'|'WARN'|'FAIL', id, message }. */
'use strict';
const fs = require('fs');
const path = require('path');

const CRITERIA = ['thesis', 'signature', 'content', 'hierarchy', 'type', 'colour', 'restraint', 'craft', 'distinct', 'owner-fit'];
const NONE_LINE = 'None: the renderer draws every idea.';

const stripComments = t => String(t).replace(/<!--[\s\S]*?-->/g, '');

/* { n: { title, lines } } split on "## <n>. " headings (headings inside code fences are not special: the template has none) */
function parseSections(text) {
  const sections = {};
  let cur = null;
  for (const line of stripComments(text).split(/\r?\n/)) {
    const m = /^## (\d+)\. (.*)$/.exec(line);
    if (m) { cur = sections[+m[1]] = { title: m[2].trim(), lines: [] }; continue; }
    if (cur) cur.lines.push(line);
  }
  return sections;
}

const splitRow = line => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
const isSep = cells => cells.every(c => /^:?-{1,}:?$/.test(c));
/* data rows of the section's markdown table (header and separator dropped) */
function tableRows(lines) {
  const rows = lines.filter(l => /^\s*\|/.test(l)).map(splitRow).filter(c => !isSep(c));
  return rows.slice(1);
}
const tableLineSet = l => /^\s*\|/.test(l);

function bullet(lines, label) {
  const re = new RegExp('^\\s*[-*]\\s+(?:\\*\\*)?' + label + '(?:\\*\\*)?\\s*:\\s*(.*)$', 'i');
  for (const l of lines) { const m = re.exec(l); if (m) return m[1].trim(); }
  return null;
}
function labelled(lines, label) {
  const re = new RegExp('^\\s*(?:[-*]\\s+)?(?:\\*\\*)?' + label + '(?:\\*\\*)?\\s*:\\s*(.*)$', 'i');
  for (const l of lines) { const m = re.exec(l); if (m) return m[1].trim(); }
  return null;
}
/* "### Name" subsections: { 'A.': lines } keyed by the full heading text after ### */
function subsections(lines) {
  const out = [];
  let cur = null;
  for (const l of lines) {
    const m = /^### (.*)$/.exec(l);
    if (m) { cur = { heading: m[1].trim(), lines: [] }; out.push(cur); continue; }
    if (cur) cur.lines.push(l);
  }
  return out;
}
const textLen = lines => lines.join(' ').replace(/\s+/g, ' ').trim().length;

function checkDirection(file, level) {
  const res = [];
  const R = (status, id, message) => res.push({ status, id, message });
  if (!file || !fs.existsSync(file)) {
    R('FAIL', 'direction-missing', `no direction at ${file || '(none)'}: write one first. Start with: node dev/lg.js direction <folder> --init`);
    return res;
  }
  const pack = level === 'pack';
  const text = fs.readFileSync(file, 'utf8');
  const sections = parseSections(text);
  const last = pack ? 8 : 5;
  const dir = path.dirname(file);
  const fails = {};
  const F = (n, msg) => { (fails[n] = fails[n] || []).push(msg); R('FAIL', 's' + n, `section ${n}: ${msg}`); };

  for (let n = 1; n <= last; n++) {
    if (!sections[n]) { F(n, `missing "## ${n}. ..." heading`); continue; }
    const lines = sections[n].lines;
    const ph = lines.find(l => l.includes('{{') && !(n === 5 && /^\s*(?:\*\*)?Chosen(?:\*\*)?\s*:/i.test(l)));
    if (ph) F(n, `placeholder left: "${ph.trim().slice(0, 90)}"`);
    if (n === 1) {
      for (const label of ['Who and when', 'The moment that matters', 'Should feel', 'Must never feel', 'Owner notes so far']) {
        const v = bullet(lines, label);
        if (v == null) F(n, `missing bullet "${label}:"`);
        else if (v.length < 10) F(n, `"${label}" needs at least 10 characters (has ${v.length})`);
      }
    } else if (n === 2) {
      const rows = tableRows(lines);
      if (rows.length < 3) F(n, `table needs at least 3 data rows (has ${rows.length})`);
      rows.forEach((c, i) => {
        if (c.length !== 4) F(n, `row ${i + 1} has ${c.length} cells, needs 4`);
        else if (c.some(x => x.length < 2)) F(n, `row ${i + 1} has a cell under 2 characters`);
      });
    } else if (n === 3) {
      const rows = tableRows(lines);
      if (rows.length < 3) F(n, `table needs at least 3 data rows (has ${rows.length})`);
      rows.forEach((c, i) => { if (c.length !== 3 || c.some(x => !x)) F(n, `row ${i + 1} needs 3 non-empty cells`); });
      if (!lines.some(l => /^\s*[-*]\s+\S/.test(l) && !tableLineSet(l))) F(n, 'needs at least 1 software precedent bullet outside the table');
    } else if (n === 4) {
      for (const [label, min] of [['Thesis', 40], ['Tension', 20], ['Signature', 40]]) {
        const v = labelled(lines, label);
        if (v == null) F(n, `missing "${label}:" line`);
        else if (v.length < min) F(n, `"${label}" needs at least ${min} characters (has ${v.length})`);
      }
      const i = lines.findIndex(l => /^\s*(?:\*\*)?Principles(?:\*\*)?\s*:/i.test(l));
      if (i < 0) F(n, 'missing "Principles:" line');
      else {
        const items = [];
        for (let j = i + 1; j < lines.length; j++) {
          if (!lines[j].trim()) { if (items.length) break; else continue; }
          const m = /^\s*(?:\d+[.)]|[-*])\s+(.*)$/.exec(lines[j]);
          if (!m) break;
          items.push(m[1].trim());
        }
        if (items.length < 3) F(n, `Principles needs at least 3 items (has ${items.length})`);
        items.forEach((t, k) => { if (t.length < 15) F(n, `principle ${k + 1} needs at least 15 characters (has ${t.length})`); });
      }
    } else if (n === 5) {
      const subs = subsections(lines);
      for (const letter of ['A', 'B', 'C']) {
        const s = subs.find(x => x.heading.startsWith(letter + '.'));
        if (!s) { F(n, `missing "### ${letter}." direction`); continue; }
        for (const label of ['Thesis', 'Structure', 'Type', 'Colour', 'Material', 'Signature']) {
          const v = bullet(s.lines, label);
          if (v == null) F(n, `direction ${letter}: missing bullet "${label}:"`);
          else if (v.length < 10) F(n, `direction ${letter}: "${label}" needs at least 10 characters (has ${v.length})`);
        }
      }
      if (pack) {
        const v = labelled(lines, 'Chosen');
        const bad = v == null ? 'missing "Chosen:" line (write it after the round 1 review: which direction won and why)'
          : v.includes('{{') ? '"Chosen:" still has a placeholder (fill it in after the round 1 review)'
          : v.length < 30 ? `"Chosen" needs at least 30 characters (has ${v.length})` : null;
        if (bad) { R('FAIL', 's5-chosen', `section 5: ${bad}`); fails[n] = fails[n] || []; fails[n].push(bad); }
      }
    } else if (n === 6) {
      const subs = subsections(lines);
      for (const name of ['Layout', 'Type', 'Colour', 'Material and shape', 'Motion', 'Words', 'Craft']) {
        const s = subs.find(x => x.heading.toLowerCase() === name.toLowerCase());
        if (!s) F(n, `missing "### ${name}"`);
        else if (textLen(s.lines) < 80) F(n, `"### ${name}" needs at least 80 characters (has ${textLen(s.lines)})`);
      }
    } else if (n === 7) {
      const rows = tableRows(lines);
      if (rows.length < 16) F(n, `ledger needs at least 16 rows (has ${rows.length})`);
      rows.forEach(c => {
        const name = (c[0] || '?').slice(0, 60);
        if (!/^(keep|change)\b/i.test(c[1] || '')) F(n, `row "${name}": Decision must start with keep or change`);
        if ((c[2] || '').length < 15) F(n, `row "${name}": Why needs at least 15 characters`);
      });
    } else if (n === 8) {
      if (!lines.some(l => l.trim() === NONE_LINE)) {
        const rows = tableRows(lines);
        if (!rows.length) F(n, `needs a table with at least 1 mock, or the exact line "${NONE_LINE}"`);
        rows.forEach(c => {
          const mock = (c[2] || '').replace(/`/g, '').trim();
          if (!mock) F(n, `idea "${(c[0] || '?').slice(0, 60)}" has no Mock path`);
          else if (!fs.existsSync(path.resolve(dir, mock))) F(n, `mock not found: ${mock} (relative to ${dir})`);
        });
      }
    }
    if (!fails[n]) R('PASS', 's' + n, `section ${n} (${sections[n].title})`);
  }
  return res;
}

const readJson = f => { try { return { v: JSON.parse(fs.readFileSync(f, 'utf8')) }; } catch (e) { return { err: e.message }; } };
const isScore = v => Number.isInteger(v && typeof v === 'object' ? v.score : v) && (typeof v === 'object' ? v.score : v) >= 1 && (typeof v === 'object' ? v.score : v) <= 5;
const scoreOf = v => (v && typeof v === 'object' ? v.score : v);
function listPngs(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...listPngs(f));
    else if (/\.png$/i.test(e.name)) out.push(f);
  }
  return out;
}

/* app/reviews/owner-r<n>.json: the owner's own acceptance of round n; null unless valid */
function ownerSignoff(appDir, n) {
  const f = path.join(appDir, 'reviews', `owner-r${n}.json`);
  if (!fs.existsSync(f)) return null;
  const j = readJson(f).v;
  if (j && j.round === n && j.reviewer === 'owner' && typeof j.quote === 'string' && j.quote.trim().length >= 10 && j.verdict === 'pass') return { quote: j.quote.trim(), review: j };
  return null;
}

function checkRounds(appDir) {
  const res = [];
  const R = (status, id, message) => res.push({ status, id, message });
  const renders = path.join(appDir, 'renders');
  const nums = fs.existsSync(renders)
    ? fs.readdirSync(renders, { withFileTypes: true }).filter(d => d.isDirectory() && /^r\d+$/.test(d.name)).map(d => +d.name.slice(1)).sort((a, b) => a - b)
    : [];
  const contiguous = nums.length > 0 && nums.every((n, i) => n === i + 1);
  if (nums.length < 3 || !contiguous) {
    R('FAIL', 'rounds-count', `needs at least 3 rendered rounds, contiguous from r1 (renders/ has: ${nums.length ? nums.map(n => 'r' + n).join(', ') : 'none'})`);
  } else R('PASS', 'rounds-count', `${nums.length} rounds rendered (r1 to r${nums.length})`);
  if (!nums.length) return res;

  const reviews = {};
  for (const n of nums) {
    const f = path.join(appDir, 'reviews', `r${n}.json`);
    const id = `review-r${n}`;
    if (!fs.existsSync(f)) { R('FAIL', id, `app/reviews/r${n}.json is missing: run the critic on round ${n}`); continue; }
    const j = readJson(f);
    if (j.err) { R('FAIL', id, `app/reviews/r${n}.json does not parse: ${j.err}`); continue; }
    const rv = j.v || {};
    if (rv.round !== n) { R('FAIL', id, `app/reviews/r${n}.json has round ${JSON.stringify(rv.round)}, expected ${n}`); continue; }
    if (rv.reviewer !== 'critic') { R('FAIL', id, `app/reviews/r${n}.json reviewer is ${JSON.stringify(rv.reviewer)}, expected "critic"`); continue; }
    reviews[n] = rv;
    R('PASS', id, `app/reviews/r${n}.json is a critic review of round ${n}`);
  }

  if (reviews[1]) {
    const rv = reviews[1];
    const probs = [];
    const keys = rv.directions && typeof rv.directions === 'object' ? Object.keys(rv.directions) : [];
    if (keys.length < 3) probs.push(`"directions" needs at least 3 entries (has ${keys.length})`);
    for (const k of keys) {
      const sc = (rv.directions[k] || {}).scores || {};
      const bad = CRITERIA.filter(c => !isScore(sc[c]));
      if (bad.length) probs.push(`direction ${k}: scores missing or not integers 1-5: ${bad.join(', ')}`);
    }
    if (typeof rv.chosen !== 'string' || !rv.chosen.trim()) probs.push('"chosen" is empty');
    if (probs.length) probs.forEach(p => R('FAIL', 'review-r1-directions', `r1 review: ${p}`));
    else R('PASS', 'review-r1-directions', `r1 review scores ${keys.length} directions and chose ${rv.chosen}`);
  }

  const latest = Math.max.apply(null, nums);
  const rv = reviews[latest];
  const own = latest >= 2 ? ownerSignoff(appDir, latest) : null;
  if (rv && latest >= 2 && own) {
    R('WARN', 'owner-signoff', `round ${latest} accepted by the owner over the critic: "${own.quote}"`);
  } else if (rv && latest >= 2) {
    const L = `r${latest}`;
    const sc = rv.scores || {};
    const missing = CRITERIA.filter(c => !isScore(sc[c]));
    if (missing.length) R('FAIL', 'latest-scores', `${L} review: scores missing or not integers 1-5: ${missing.join(', ')}`);
    else {
      const low = CRITERIA.filter(c => scoreOf(sc[c]) < 4);
      if (low.length) R('FAIL', 'latest-scores', `${L} review: every score must be 4 or more; below 4: ${low.map(c => `${c} ${scoreOf(sc[c])}`).join(', ')}`);
      else R('PASS', 'latest-scores', `${L} review: all 10 scores are 4 or more`);
    }
    const pngs = listPngs(path.join(renders, L));
    const names = new Set(pngs.map(f => path.basename(f)));
    const evBad = [];
    for (const c of CRITERIA) {
      const ev = sc[c] && typeof sc[c] === 'object' ? sc[c].evidence : null;
      if (typeof ev !== 'string' || ev.trim().length < 25) { evBad.push(`${c} (evidence under 25 characters)`); continue; }
      const found = ev.match(/[A-Za-z0-9_.\-]+\.png/gi) || [];
      if (!found.length) evBad.push(`${c} (names no .png)`);
      else if (!found.some(f => names.has(path.basename(f)))) evBad.push(`${c} (${found.join(', ')} not found under renders/${L}/)`);
    }
    if (evBad.length) R('FAIL', 'latest-evidence', `${L} review evidence: ${evBad.join('; ')}`);
    else R('PASS', 'latest-evidence', `${L} review: evidence for every criterion names a real PNG`);
    const blockers = (Array.isArray(rv.fixes) ? rv.fixes : []).filter(f => f && /^P[12]$/.test(f.priority));
    if (blockers.length) R('FAIL', 'latest-fixes', `${L} review has open P1/P2 fixes: ${blockers.map(f => `${f.id} (${f.priority})`).join(', ')}`);
    else R('PASS', 'latest-fixes', `${L} review: no P1 or P2 fixes open`);
    if (rv.verdict !== 'pass') R('FAIL', 'latest-verdict', `${L} review verdict is ${JSON.stringify(rv.verdict)}, needs "pass"`);
    else R('PASS', 'latest-verdict', `${L} review verdict is pass`);
    const rf = path.join(appDir, 'reviews', `r${latest}.json`);
    const newest = pngs.reduce((m, f) => Math.max(m, fs.statSync(f).mtimeMs), 0);
    if (fs.statSync(rf).mtimeMs < newest) R('FAIL', 'latest-fresh', `review r${latest} is older than its renders: run the critic again on the current PNGs`);
    else R('PASS', 'latest-fresh', `review ${L} is newer than its renders`);
  }
  return res;
}

function checkScreensGate(directionFile, outDir) {
  const res = checkDirection(directionFile, 'brief');
  const norm = String(outDir || '').split(path.sep).join('/');
  const m = /\/app\/renders\/r(\d+)(\/|$)/.exec(norm);
  if (m && +m[1] >= 2) {
    const n = +m[1];
    const appDir = norm.slice(0, m.index + 4);
    const f = path.join(appDir, 'reviews', `r${n - 1}.json`);
    const j = fs.existsSync(f) ? readJson(f) : null;
    if (!j || j.err || !j.v || j.v.reviewer !== 'critic') {
      res.push({ status: 'FAIL', id: 'previous-review', message: `round ${n - 1} has no critic review: run the critic (ui-direction SKILL.md, "Running the critic") before rendering round ${n}` });
    } else res.push({ status: 'PASS', id: 'previous-review', message: `round ${n - 1} has a critic review` });
  }
  return res;
}

const hasFail = res => res.some(r => r.status === 'FAIL');
const fmt = r => `${r.status}  ${r.id}  ${r.message}`;

/* ---- build pack insertion */
function directionBlock(file) {
  const body = stripComments(fs.readFileSync(file, 'utf8')).split(/\r?\n/);
  let titleDropped = false;
  const lines = [];
  for (const l of body) {
    if (!titleDropped && /^# /.test(l)) { titleDropped = true; continue; }
    lines.push(/^#{2,} /.test(l) ? '#' + l : l);
  }
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
function latestReviewLine(appDir) {
  const dir = path.join(appDir, 'reviews');
  if (!fs.existsSync(dir)) return null;
  const ns = fs.readdirSync(dir).map(f => /^r(\d+)\.json$/.exec(f)).filter(Boolean).map(m => +m[1]).sort((a, b) => b - a);
  for (const n of ns) {
    const j = readJson(path.join(dir, `r${n}.json`));
    if (j.v) {
      let t = `Latest critic review: app/reviews/r${n}.json (verdict ${j.v.verdict})`;
      const own = ownerSignoff(appDir, n);
      if (own && j.v.reviewer === 'critic') {
        t += `\n\nOwner sign-off: round ${n}, "${own.quote}"`;
        const open = (Array.isArray(j.v.fixes) ? j.v.fixes : []).filter(f => f && /^P[12]$/.test(f.priority));
        if (open.length) t += '\n\nOpen critic fixes the owner accepted:\n' + open.map(f => `- ${f.id} (${f.priority}, ${f.target}): ${f.text}`).join('\n');
      }
      return t;
    }
  }
  return null;
}
/* insert the Direction section after the pack's first "# " line (or at the very top) */
function insertDirection(md, directionFile, appDir) {
  let body;
  if (directionFile && fs.existsSync(directionFile)) {
    body = directionBlock(directionFile);
    const rl = latestReviewLine(appDir);
    if (rl) body += '\n\n' + rl;
  } else body = 'No direction is written yet.';
  const sec = `## Direction (read before building)\n\n${body}\n`;
  const lines = md.split('\n');
  const i = lines.findIndex(l => /^# /.test(l));
  if (i < 0) return sec + '\n' + md;
  return lines.slice(0, i + 1).join('\n') + '\n\n' + sec + '\n' + lines.slice(i + 1).join('\n').replace(/^\n+/, '');
}

/* round to render next with no --round/--out: the latest folder again while it has no critic review, else the next number */
function nextScreensRound(appDir) {
  const renders = path.join(appDir, 'renders');
  let n = 0;
  if (fs.existsSync(renders)) for (const d of fs.readdirSync(renders)) { const m = /^r(\d+)$/.exec(d); if (m) n = Math.max(n, +m[1]); }
  if (!n) return { n: 1, redo: false };
  const j = fs.existsSync(path.join(appDir, 'reviews', `r${n}.json`)) ? readJson(path.join(appDir, 'reviews', `r${n}.json`)).v : null;
  return j && j.reviewer === 'critic' ? { n: n + 1, redo: false } : { n, redo: true };
}

module.exports = { nextScreensRound, ownerSignoff, CRITERIA, NONE_LINE, stripComments, parseSections, checkDirection, checkRounds, checkScreensGate, hasFail, fmt, insertDirection, directionBlock };
