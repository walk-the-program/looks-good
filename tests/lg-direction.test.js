// Run with: node tests/lg-direction.test.js   (no dependencies, no browser)
// Gate logic of dev/lg-direction.js: direction.md checks and critic-review round checks.
const fs = require('fs');
const os = require('os');
const path = require('path');
const D = require('../dev/lg-direction.js');

const root = path.join(__dirname, '..');
const FIX = path.join(__dirname, 'fixtures', 'lg-direction');
const TEMPLATE = path.join(root, '.claude', 'skills', 'ui-direction', 'templates', 'direction.md');
let failed = 0;
function check(name, ok, detail) {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : ' - ' + detail}`);
  if (!ok) failed++;
}
const fails = r => r.filter(x => x.status === 'FAIL');
const has = (r, id, re) => fails(r).some(x => x.id === id && (!re || re.test(x.message)));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lg-direction-test-'));
const mk = (...p) => { const d = path.join(tmp, ...p); fs.mkdirSync(d, { recursive: true }); return d; };

/* ---- direction.md */
const good = path.join(FIX, 'direction.md');
check('good direction passes brief', !fails(D.checkDirection(good, 'brief')).length, JSON.stringify(fails(D.checkDirection(good, 'brief'))));
check('good direction passes pack', !fails(D.checkDirection(good, 'pack')).length, JSON.stringify(fails(D.checkDirection(good, 'pack'))));
check('comments are ignored (placeholder inside a comment)', !has(D.checkDirection(good, 'brief'), 's1'), '');
const missing = D.checkDirection(path.join(tmp, 'nope.md'), 'brief');
check('missing file -> direction-missing with hint', has(missing, 'direction-missing', /direction <folder> --init/), JSON.stringify(missing));
const tpl = D.checkDirection(TEMPLATE, 'brief');
check('fresh template fails brief on every section 1-5', [1, 2, 3, 4, 5].every(n => has(tpl, 's' + n, /placeholder/)), JSON.stringify(tpl));
check('fresh template fails pack', fails(D.checkDirection(TEMPLATE, 'pack')).length >= 8, '');

const goodText = fs.readFileSync(good, 'utf8');
function variant(name, edit) { const f = path.join(tmp, name + '.md'); fs.writeFileSync(f, edit(goodText)); return f; }
check('brief ignores a placeholder in section 6, pack does not',
  !fails(D.checkDirection(variant('ph6', t => t.replace('Press sinks', '{{x}} Press sinks')), 'brief')).length &&
  has(D.checkDirection(variant('ph6', t => t), 'pack'), 's6') === false &&
  has(D.checkDirection(variant('ph6b', t => t.replace('Press sinks', '{{x}} Press sinks')), 'pack'), 's6', /placeholder/), '');
check('short Should feel fails s1', has(D.checkDirection(variant('s1', t => t.replace('calm, tactile, a little ceremonial', 'calm')), 'brief'), 's1', /Should feel/), '');
check('2-row content table fails s2', has(D.checkDirection(variant('s2', t => t.replace(/\| Wear \|.*\n/, '')), 'brief'), 's2', /at least 3/), '');
check('s3 without precedent bullet fails', has(D.checkDirection(variant('s3', t => t.replace(/- Letterboxd.*\n/, '')), 'brief'), 's3', /precedent/), '');
check('short principle fails s4', has(D.checkDirection(variant('s4', t => t.replace('3. One saturated thing per screen, never two', '3. Short')), 'brief'), 's4', /principle 3/), '');
check('missing direction C fails s5', has(D.checkDirection(variant('s5', t => t.replace('### C.', '### X.')), 'brief'), 's5', /"### C\."/), '');
check('pack needs Chosen', has(D.checkDirection(variant('ch', t => t.replace(/Chosen:.*\n/, '')), 'pack'), 's5-chosen', /Chosen/) && !has(D.checkDirection(variant('ch', t => t), 'brief'), 's5'), '');
check('thin s6 subsection fails pack', has(D.checkDirection(variant('s6', t => t.replace(/### Words\n.*\n/, '### Words\nshort\n')), 'pack'), 's6', /Words/), '');
check('15-row ledger fails pack', has(D.checkDirection(variant('s7', t => t.replace(/\| No X yet empty.*\n/, '')), 'pack'), 's7', /at least 16/), '');
check('ledger decision must be keep/change; names the reflex', has(D.checkDirection(variant('s7b', t => t.replace('| Stat tiles | keep', '| Stat tiles | maybe')), 'pack'), 's7', /Stat tiles/), '');
check('s8 table with a missing mock fails', has(D.checkDirection(variant('s8', t => t.replace(D.NONE_LINE, '| Idea | Why | Mock |\n| --- | --- | --- |\n| Chart | it matters here | `mocks/chart.html` |')), 'pack'), 's8', /mock not found/), '');
fs.mkdirSync(path.join(tmp, 'mocks'), { recursive: true }); fs.writeFileSync(path.join(tmp, 'mocks', 'chart.html'), '<p>x</p>');
check('s8 table with an existing mock passes', !has(D.checkDirection(variant('s8ok', t => t.replace(D.NONE_LINE, '| Idea | Why | Mock |\n| --- | --- | --- |\n| Chart | it matters here | `mocks/chart.html` |')), 'pack'), 's8'), '');

/* ---- rounds */
const CR = D.CRITERIA;
function review(n, o) {
  o = o || {};
  const scores = {};
  CR.forEach(c => { scores[c] = { score: 4, evidence: `home-light.png: the ${c} reads clearly on the shelf rows.` }; });
  return Object.assign({ round: n, reviewer: 'critic', date: '2026-11-16', renders: `app/renders/r${n}/`, scores, generic: ['a', 'b', 'c'], fixes: [{ id: 'f1', priority: 'P3', target: 'x', text: 'y' }], landed: [], verdict: 'pass' }, o);
}
function r1Review() {
  const sc = {}; CR.forEach(c => { sc[c] = 3; });
  return { round: 1, reviewer: 'critic', date: '2026-11-15', renders: 'app/renders/r1/', directions: { a: { scores: sc }, b: { scores: sc }, c: { scores: sc } }, chosen: 'b', why: 'strongest', generic: [], fixes: [], landed: [], verdict: 'refine' };
}
let seq = 0;
function app(opts) {
  opts = opts || {};
  const a = mk('app' + ++seq, 'app');
  const rounds = opts.rounds || 3;
  for (let n = 1; n <= rounds; n++) {
    const d = n === 1 ? path.join(a, 'renders', 'r1', 'a') : path.join(a, 'renders', 'r' + n);
    fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, 'home-light.png'), 'png');
  }
  fs.mkdirSync(path.join(a, 'reviews'), { recursive: true });
  const put = (n, o) => fs.writeFileSync(path.join(a, 'reviews', `r${n}.json`), JSON.stringify(o));
  for (let n = 1; n <= rounds; n++) put(n, n === 1 ? (opts.r1 || r1Review()) : (n === rounds && opts.last ? opts.last : review(n)));
  const now = Date.now() / 1000;
  const touch = (f, t) => fs.utimesSync(f, t, t);
  for (let n = 1; n <= rounds; n++) {
    const png = n === 1 ? path.join(a, 'renders', 'r1', 'a', 'home-light.png') : path.join(a, 'renders', 'r' + n, 'home-light.png');
    touch(png, now - 100);
    touch(path.join(a, 'reviews', `r${n}.json`), opts.stale && n === rounds ? now - 500 : now - 50);
  }
  return a;
}
const okRounds = D.checkRounds(app());
check('3 reviewed rounds pass', !fails(okRounds).length, JSON.stringify(fails(okRounds)));
const low = review(3); low.scores.craft.score = 3;
const rLow = D.checkRounds(app({ last: low }));
check('a score of 3 fails and names the criterion and score', has(rLow, 'latest-scores', /craft 3/), JSON.stringify(rLow));
const ghost = review(3); ghost.scores.type.evidence = 'ghost-screen.png: the type is set in a serif face.';
check('evidence naming a missing png fails, names the criterion', has(D.checkRounds(app({ last: ghost })), 'latest-evidence', /type/), '');
const short = review(3); short.scores.thesis.evidence = 'home-light.png ok';
check('short evidence fails', has(D.checkRounds(app({ last: short })), 'latest-evidence', /thesis/), '');
const p2 = review(3); p2.fixes = [{ id: 'f9', priority: 'P2', target: 'x', text: 'y' }];
check('an open P2 fix fails and lists the id', has(D.checkRounds(app({ last: p2 })), 'latest-fixes', /f9/), '');
check('verdict refine fails', has(D.checkRounds(app({ last: review(3, { verdict: 'refine' }) })), 'latest-verdict'), '');
check('stale review mtime fails with the exact message', has(D.checkRounds(app({ stale: true })), 'latest-fresh', /^review r3 is older than its renders: run the critic again on the current PNGs$/), '');
check('reviewer not critic fails', has(D.checkRounds(app({ last: review(3, { reviewer: 'author' }) })), 'review-r3', /critic/), '');
check('wrong round number fails', has(D.checkRounds(app({ last: review(3, { round: 2 }) })), 'review-r3'), '');
const noDir = r1Review(); delete noDir.directions;
check('r1 without directions fails', has(D.checkRounds(app({ r1: noDir })), 'review-r1-directions', /directions/), '');
const badR1 = r1Review(); badR1.directions.c.scores.thesis = 9;
check('r1 direction with a bad score fails', has(D.checkRounds(app({ r1: badR1 })), 'review-r1-directions', /thesis/), '');
check('only 2 rounds fails rounds-count', has(D.checkRounds(app({ rounds: 2 })), 'rounds-count'), '');
const gap = app(); fs.renameSync(path.join(gap, 'renders', 'r2'), path.join(gap, 'renders', 'r5'));
check('non-contiguous rounds fail', has(D.checkRounds(gap), 'rounds-count'), '');
check('no renders at all fails rounds-count', has(D.checkRounds(mk('empty', 'app')), 'rounds-count'), '');
const noReview = app(); fs.rmSync(path.join(noReview, 'reviews', 'r2.json'));
check('missing r2 review fails', has(D.checkRounds(noReview), 'review-r2', /missing/), '');

/* ---- screens gate */
const g = app({ rounds: 1 }); // r1 exists, one review
check('screens gate: round 1 needs no earlier review', !fails(D.checkScreensGate(good, path.join(g, 'renders', 'r1'))).length, '');
const g2 = D.checkScreensGate(good, path.join(g, 'renders', 'r2'));
check('screens gate: round 2 with r1 critic review passes', !fails(g2).length, JSON.stringify(g2));
fs.rmSync(path.join(g, 'reviews', 'r1.json'));
check('screens gate: round 2 without r1 review fails with the message',
  has(D.checkScreensGate(good, path.join(g, 'renders', 'r2')), 'previous-review', /^round 1 has no critic review: run the critic \(ui-direction SKILL\.md, "Running the critic"\) before rendering round 2$/), '');
fs.writeFileSync(path.join(g, 'reviews', 'r1.json'), JSON.stringify(review(1, { reviewer: 'author' })));
check('screens gate: non-critic review fails', has(D.checkScreensGate(good, path.join(g, 'renders', 'r2')), 'previous-review'), '');
check('screens gate: unfilled direction fails', has(D.checkScreensGate(TEMPLATE, path.join(g, 'renders', 'r1')), 's1'), '');
check('screens gate: --out outside app/renders skips the round rule', !fails(D.checkScreensGate(good, path.join(tmp, 'elsewhere'))).length, '');

/* ---- pack insertion */
const md = D.insertDirection('# Pack title\n\nbody line\n\n## Tokens\nx\n', good, path.join(g, '..', 'nonexistent-app'));
check('pack: direction after the first # line, headings demoted, comments and title dropped',
  /^# Pack title\n\n## Direction \(read before building\)\n\n## 1\./m.test(md) === false &&
  /^# Pack title\n\n## Direction \(read before building\)\n\n### 1\. Product truth/.test(md) && /#### A\. Name A/.test(md) && !/Direction: Fixture App/.test(md) && !/placeholder/.test(md) && /\n## Tokens\n/.test(md), md.slice(0, 300));
check('pack: no # line puts direction at the top', D.insertDirection('plain\n', good, tmp).startsWith('## Direction (read before building)'), '');
check('pack: no direction says none is written', /No direction is written yet/.test(D.insertDirection('# T\n', null, '')), '');
const withRev = D.insertDirection('# T\n', good, app());
check('pack: latest critic review line', /Latest critic review: app\/reviews\/r3\.json \(verdict pass\)/.test(withRev), '');

/* ---- Chosen line */
const noChosen = variant('nc', t => t.replace(/Chosen:.*\n/, ''));
const phChosen = variant('pc', t => t.replace(/Chosen:.*\n/, 'Chosen: {{A, B, C or a named merge, and why}}\n'));
check('brief ignores a missing Chosen line', !fails(D.checkDirection(noChosen, 'brief')).length, '');
check('brief ignores a placeholder Chosen line', !fails(D.checkDirection(phChosen, 'brief')).length, JSON.stringify(fails(D.checkDirection(phChosen, 'brief'))));
check('pack: missing Chosen -> s5-chosen', has(D.checkDirection(noChosen, 'pack'), 's5-chosen', /missing/), '');
check('pack: placeholder Chosen -> s5-chosen (once)', fails(D.checkDirection(phChosen, 'pack')).filter(x => x.id.startsWith('s5')).length === 1 && has(D.checkDirection(phChosen, 'pack'), 's5-chosen', /placeholder/), '');
check('pack: short Chosen -> s5-chosen', has(D.checkDirection(variant('sc', t => t.replace(/Chosen:.*\n/, 'Chosen: B\n')), 'pack'), 's5-chosen', /30/), '');
check('fresh template still fails brief on s5 for other placeholders', has(D.checkDirection(TEMPLATE, 'brief'), 's5', /### A/), '');

/* ---- owner sign-off */
function signoff(a, n, o) { fs.writeFileSync(path.join(a, 'reviews', `owner-r${n}.json`), JSON.stringify(Object.assign({ round: n, reviewer: 'owner', date: '2026-11-16', quote: 'Ship it, this is the one I want.', verdict: 'pass' }, o || {}))); }
const failing = () => { const r = review(3, { verdict: 'refine' }); r.scores.craft.score = 3; r.fixes = [{ id: 'f7', priority: 'P2', target: 'detail', text: 'Move the chord up.' }]; return r; };
const a6 = app({ last: failing() });
check('without sign-off the failing latest round fails', D.hasFail(D.checkRounds(a6)), '');
signoff(a6, 3);
const r6 = D.checkRounds(a6);
check('valid owner sign-off passes the gate with a WARN', !fails(r6).length && r6.some(x => x.status === 'WARN' && x.id === 'owner-signoff' && /round 3 accepted by the owner over the critic: "Ship it, this is the one I want\."/.test(x.message)), JSON.stringify(r6));
check('sign-off replaces the latest score checks', !r6.some(x => x.id.startsWith('latest-')), '');
const a6b = app({ last: failing() }); signoff(a6b, 3, { quote: 'ok' });
check('short owner quote fails (critic checks apply)', D.hasFail(D.checkRounds(a6b)), '');
const a6c = app({ last: failing() }); signoff(a6c, 2);
check('owner sign-off for an older round is ignored', D.hasFail(D.checkRounds(a6c)), '');
const a6d = app({ last: failing() }); signoff(a6d, 3, { verdict: 'refine' });
check('owner verdict not pass fails', D.hasFail(D.checkRounds(a6d)), '');
const a6e = app({ last: failing() }); signoff(a6e, 3); fs.rmSync(path.join(a6e, 'reviews', 'r3.json'));
check('sign-off without a critic review fails', has(D.checkRounds(a6e), 'review-r3', /missing/), '');
const a6f = app({ last: failing() }); signoff(a6f, 3); fs.rmSync(path.join(a6f, 'renders', 'r2'), { recursive: true });
check('sign-off does not waive rounds-count', has(D.checkRounds(a6f), 'rounds-count'), '');
const so = D.insertDirection('# T\n', good, a6);
check('pack lists the owner sign-off and accepted P1/P2 fixes', /Latest critic review: app\/reviews\/r3\.json \(verdict refine\)\n\nOwner sign-off: round 3, "Ship it, this is the one I want\."\n\nOpen critic fixes the owner accepted:\n- f7 \(P2, detail\): Move the chord up\./.test(so), so.slice(-400));
check('pack without sign-off has no owner section', !/Owner sign-off/.test(D.insertDirection('# T\n', good, app())), '');

/* ---- screens round numbering */
const nr = app({ rounds: 2 }); // r1, r2 reviewed
check('next round: latest reviewed -> r3', JSON.stringify(D.nextScreensRound(nr)) === '{"n":3,"redo":false}', JSON.stringify(D.nextScreensRound(nr)));
fs.rmSync(path.join(nr, 'reviews', 'r2.json'));
check('next round: latest unreviewed -> redo r2', JSON.stringify(D.nextScreensRound(nr)) === '{"n":2,"redo":true}', JSON.stringify(D.nextScreensRound(nr)));
fs.writeFileSync(path.join(nr, 'reviews', 'r2.json'), JSON.stringify(review(2, { reviewer: 'author' })));
check('next round: non-critic review counts as unreviewed', D.nextScreensRound(nr).redo === true, '');
check('next round: no renders -> r1', JSON.stringify(D.nextScreensRound(mk('none', 'app'))) === '{"n":1,"redo":false}', '');

fs.rmSync(tmp, { recursive: true, force: true });
console.log(failed ? `\n${failed} check(s) FAILED` : '\nall checks passed');
process.exit(failed ? 1 : 0);
