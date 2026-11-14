/* One headless playwright-cli session for dev/lg.js: unique name, temp cwd (playwright-cli drops
   .playwright-cli/ there), in-memory profile, device scale factor 2, always closed.
   Async on purpose: the in-process static server must keep answering while playwright-cli runs. */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const cp = require('child_process');

function run(cmd, args, cwd, timeout) {
  return new Promise(resolve => {
    const c = cp.spawn(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '', err = '', done = false;
    const t = setTimeout(() => { if (!done) { err += '\n[timeout]'; c.kill('SIGKILL'); } }, timeout || 180000);
    c.stdout.on('data', d => { out += d; });
    c.stderr.on('data', d => { err += d; });
    const fin = status => { if (done) return; done = true; clearTimeout(t); resolve({ status, stdout: out, stderr: err }); };
    c.on('error', e => { err += String(e); fin(127); });
    c.on('close', code => fin(code));
  });
}

async function openSession(url) {
  const name = `lg-${process.pid}-${Date.now().toString(36)}`;
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'lg-cli-'));
  const cfg = path.join(work, 'cfg.json');
  fs.writeFileSync(cfg, JSON.stringify({ browser: { browserName: 'chromium', launchOptions: { headless: true }, contextOptions: { deviceScaleFactor: 2, viewport: { width: 1440, height: 1000 } } } }));
  const pw = (...args) => run('playwright-cli', ['-s=' + name, ...args], work, 180000);
  let closed = false;
  const s = {
    pw,
    async close() { if (closed) return; closed = true; try { await pw('close'); } catch (e) { /* already gone */ } try { fs.rmSync(work, { recursive: true, force: true }); } catch (e) { /* ignore */ } },
    /* Evaluates an expression (sync or promise) in the page; the page returns a JSON string, parsed here. */
    async eval(js) {
      const r = await pw('--raw', 'eval', js);
      const lines = (r.stdout || '').split('\n').filter(l => l.trim());
      const last = lines.length ? lines[lines.length - 1] : '';
      if (!last) throw new Error('page eval gave no answer: ' + ((r.stderr || r.stdout || '').trim().slice(0, 300) || 'empty'));
      let v;
      try { v = JSON.parse(last); if (typeof v === 'string') { try { v = JSON.parse(v); } catch (e) { /* plain string */ } } } catch (e) { throw new Error('page eval unparsable: ' + last.slice(0, 300)); }
      if (v && v.__lgError) throw new Error(v.__lgError);
      return v;
    },
    async screenshot(selector, file) {
      const r = await pw('screenshot', selector, '--hires', `--filename=${file}`);
      if (r.status !== 0 || !fs.existsSync(file)) throw new Error(`screenshot of ${selector} failed: ${((r.stderr || r.stdout) || '').trim().slice(0, 200)}`);
    },
  };
  try {
    const r = await pw('open', '--browser=chromium', `--config=${cfg}`, url);
    if (r.status !== 0 || /### Error/.test(r.stdout)) throw new Error('playwright-cli could not open ' + url + ': ' + ((r.stderr || r.stdout) || '').trim().slice(0, 200));
  } catch (e) { await s.close(); throw e; }
  return s;
}

module.exports = { openSession };
