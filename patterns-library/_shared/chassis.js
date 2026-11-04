/*
 * Ptrn chassis (js:tool half). Classic synchronous script, loaded in <body>
 * right before the tool's own inline script. Defines one global, `Ptrn`:
 *
 *   Ptrn.util   helpers a generator may use ($, clamp, rng, hashi, hex2rgb, relLum, ...)
 *   Ptrn.tool   the API handle P (live getters; usable by the tool at any time)
 *   Ptrn.boot   Ptrn.boot(config): wires the page and does the first draw
 *
 * Reference: _refactor/API.md. Sections:
 *   0 templates (shared markup)   1 util            2 constants       3 state + draw loop    4 export
 *   5 rail builders   6 grain overlay   7 dither overlay       8 units (overridable)
 *   9 API handle P   10 boot
 * The chassis implements the MAJORITY variant of every unit; a tool differs by
 * a config option or by an override function (see API.md).
 */
(function () {
"use strict";

/* ============================================================== 0 templates */
/* Markup that is identical on every page lives here once. A placeholder
   <div data-tpl="name"></div> in the page is replaced as this script loads, so
   the DOM is complete before the tool script, js:embed and runtime.js run. */
const TPL = {
  dither: `<div class="tog-grp"><button class="pillbtn" id="ditherTog" aria-pressed="false">Dither<span class="sw" aria-hidden="true"></span></button><div class="group" id="ditherBody" hidden>
  <div class="misc stack"><span class="mhead"><span class="k">Pattern</span></span><span class="mval"><div class="chips" id="dthKinds"></div></span></div>
  <div class="pr"><div class="top"><span class="k">Pixel size</span><span class="v" id="dthSizeVal">2</span></div><div class="track"><input type="range" id="dthSize" min="1" max="10" step="1" value="2"></div></div>
  <div class="pr"><div class="top"><span class="k">Tones</span><span class="v" id="dthLevelsVal">3 tones</span></div><div class="track"><input type="range" id="dthLevels" min="2" max="8" step="1" value="3"></div></div>
  <div class="pr"><div class="top"><span class="k">Amount</span><span class="v" id="dthAmountVal">100%</span></div><div class="track"><input type="range" id="dthAmount" min="0" max="1" step="0.05" value="1"></div></div>
</div></div>`,
  grain: `<div class="tog-grp"><button class="pillbtn" id="grainTog" aria-pressed="false">Grain<span class="sw" aria-hidden="true"></span></button><div class="group" id="grainBody" hidden>
  <div class="misc stack"><span class="mhead"><span class="k">Blend</span></span><span class="mval"><div class="chips" id="grnBlends"></div></span></div>
  <div class="pr"><div class="top"><span class="k">Amount</span><span class="v" id="grnAmountVal">55%</span></div><div class="track"><input type="range" id="grnAmount" min="0" max="1" step="0.05" value="0.55"></div></div>
  <div class="pr"><div class="top"><span class="k">Grain size</span><span class="v" id="grnSizeVal">1.0</span></div><div class="track"><input type="range" id="grnSize" min="0.5" max="4" step="0.1" value="1"></div></div>
  <div class="pr"><div class="top"><span class="k">Specks</span><span class="v" id="grnSpecksVal">50%</span></div><div class="track"><input type="range" id="grnSpecks" min="0" max="1" step="0.05" value="0.5"></div></div>
  <div class="pr"><div class="top"><span class="k">Vignette</span><span class="v" id="grnVignetteVal">50%</span></div><div class="track"><input type="range" id="grnVignette" min="0" max="1" step="0.05" value="0.5"></div></div>
</div></div>`,
  myc: `<div class="myc" id="myc" hidden>
        <div class="myc-row" id="mycHome">
          <button class="lnk" id="mycSave">Save</button>
          <button class="lnk" id="mycEdit" aria-pressed="false" hidden>Edit</button>
        </div>
        <div class="myc-edit" id="mycPanel" hidden>
          <textarea class="myc-ta" id="mycText" rows="4" spellcheck="false"
            placeholder="One hex code per line, or a list: #1A1A1A, #FF5C39, #F5F1E8" aria-label="My colors as hex codes"></textarea>
          <div class="myc-row">
            <button class="lnk" id="mycApply">Save</button>
            <button class="lnk" id="mycCopy">Copy</button>
            <button class="lnk" id="mycRemove">Forget</button>
          </div>
          <p class="myc-hint" id="mycHint"></p>
        </div>
      </div>`,
  tport: `<div class="tport">
      <button class="play" id="play" aria-label="Play or pause"><svg width="8" height="9" viewBox="0 0 10 11" id="playIcon"><path d="M0 0l10 5.5L0 11z"/></svg></button>
      <span class="scrubwrap"><input type="range" id="scrub" min="0" max="15" step="1" value="0" aria-label="Timeline" disabled></span>
      <span class="k frameno" id="frameno">01 / 01</span>
    </div>`,
};
document.querySelectorAll("div[data-tpl]").forEach(el => {
  const html = TPL[el.getAttribute("data-tpl")];
  if (html === undefined) return;
  el.insertAdjacentHTML("beforebegin", html);
  el.remove();
});

/* ===================================================================== 1 util */
const $ = s => document.querySelector(s);
const TAU = Math.PI * 2;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
function rng(s) { let a = (s >>> 0) || 1; return () => { a ^= a << 13; a >>>= 0; a ^= a >> 17; a ^= a << 5; a >>>= 0; return a / 4294967296; }; }
function hashi(x, y, z, s) {
  let n = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(z | 0, 1440662683) ^ Math.imul(s | 0, 1013904223);
  n = Math.imul(n ^ (n >>> 15), 2246822519); n = Math.imul(n ^ (n >>> 13), 3266489917); n ^= n >>> 16;
  return (n >>> 0) / 4294967296;
}
function hex2rgb(h) {
  h = h.replace("#", ""); if (h.length === 3) h = h.split("").map(c => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function relLum(h) {
  const [r, g, b] = hex2rgb(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
  return .2126 * r + .7152 * g + .0722 * b;
}
let toastTimer, toastMs = 2400;
function toast(msg, busy) {
  const el = $("#toast"); el.textContent = msg; el.classList.toggle("busy", !!busy); el.classList.add("show");
  clearTimeout(toastTimer); if (!busy) toastTimer = setTimeout(() => el.classList.remove("show"), toastMs);
}
function save(blob, name) {
  const url = URL.createObjectURL(blob), a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1500);
}
function pickVideoType() {
  const t = ["video/mp4;codecs=avc1.42E01E", "video/mp4", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
  for (const x of t) if (window.MediaRecorder && MediaRecorder.isTypeSupported(x)) return x;
  return null;
}
const util = Object.freeze({ $, TAU, clamp, reduceMotion, rng, hashi, hex2rgb, relLum, toast, save, pickVideoType });

/* ================================================================ 2 constants */
/* The 32:9 monitor frame: one definition replaces the per-tool patched literals. */
const MONITOR = Object.freeze({ id: "32:9", png: [5120, 1440], video: [1920, 540] });
const DEFAULT_RATIOS = [{ id: "9:16", w: 9, h: 16 }, { id: "3:4", w: 3, h: 4 }, { id: "4:5", w: 4, h: 5 }, { id: "1:1", w: 1, h: 1 },
  { id: "5:4", w: 5, h: 4 }, { id: "4:3", w: 4, h: 3 }, { id: "3:2", w: 3, h: 2 }, { id: "16:9", w: 16, h: 9 }];

/* ======================================================= 3 state + draw loop */
let C = null, S = null, PK = "pal", SK = "size";   // config, tool state, palette key, size key
let RATIOS = [], art = null, ctx = null, paint = null;   // paint = the WRAPPED painter; the raw one is never stored
let curFrame = 0, queued = false, playing = false, t0 = 0, raf = 0;
let P = null;                                       // the API handle, assigned in section 9
const U = {};                                       // overridable units (section 8)

const ratioOf = id => RATIOS.find(x => x.id === id);

function fitCanvas() {
  const r = ratioOf(S.ratio);
  const box = $(".stage-inner");
  let dpr = Math.min(2, window.devicePixelRatio || 1);
  let availW = 700, availH = 700;
  if (box && box.clientWidth) {
    const bs = getComputedStyle(box);
    availW = box.clientWidth - parseFloat(bs.paddingLeft) - parseFloat(bs.paddingRight);
    availH = box.clientHeight - parseFloat(bs.paddingTop) - parseFloat(bs.paddingBottom);
  }
  availW = Math.max(80, availW); availH = Math.max(80, availH);
  const s = Math.min(availW / r.w, availH / r.h);
  const dispW = Math.max(40, Math.floor(r.w * s)), dispH = Math.max(40, Math.floor(r.h * s));
  const w = Math.round(dispW * dpr), h = Math.round(dispH * dpr);
  if (art.width !== w || art.height !== h) { art.width = w; art.height = h; }
  if (art.style.width !== dispW + "px" || art.style.height !== dispH + "px") {
    art.style.width = dispW + "px"; art.style.height = dispH + "px";
  }
  return { w, h };
}
function drawDefault() {
  const { w, h } = U.fitCanvas();
  const tm = C.dims === false ? 0 : performance.now();
  paint(ctx, w, h, curFrame);
  if (C.dims !== false) {
    const ms = Math.round(performance.now() - tm);
    $("#dims").textContent = w + "×" + h + " · " + ms + "ms";
  }
  const F = S.motion.on ? S.motion.frames : 1;
  if (!C.static) $("#frameno").textContent = String(curFrame + 1).padStart(2, "0") + " / " + String(F).padStart(2, "0");
}
function draw() { U.draw(); }
function setPlaying(v) { return U.setPlaying(v); }
function requestDraw() { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; draw(); }); }
const reframe = requestDraw;
function invalidate() { if (C.invalidate) C.invalidate(P); else reframe(); }
function tickDefault(now) {
  if (!playing) return;
  const M = S.motion, dur = (M.frames / M.fps) * 1000;
  const f = Math.floor(((now - t0) % dur) / dur * M.frames) % M.frames;
  if (f !== curFrame) { curFrame = f; $("#scrub").value = f; draw(); }
  raf = requestAnimationFrame(U.tick);
}
function setPlayingDefault(v) {
  playing = v && S.motion.on;
  $("#playIcon").innerHTML = playing
    ? '<rect x="0" y="0" width="3.5" height="11"/><rect x="6.5" y="0" width="3.5" height="11"/>'
    : '<path d="M0 0l10 5.5L0 11z"/>';
  cancelAnimationFrame(raf);
  if (playing) { t0 = performance.now() - (curFrame / S.motion.frames) * (S.motion.frames / S.motion.fps * 1000); raf = requestAnimationFrame(U.tick); }
  else if (C.transportRedraw) requestDraw();
}

/* ============================================================== 4 export */
const stamp = () => `${C.slug}-${S.seed}-${S.ratio.replace(":", "x")}`;
const extra = k => (C.paintExtra && C.paintExtra[k] !== undefined) ? [C.paintExtra[k]] : [];

function exportPNG() {
  $("#expPng").addEventListener("click", () => {
    toast("Rendering…", true);
    setTimeout(() => {
      const r = ratioOf(S.ratio);
      const W = S.ratio === MONITOR.id ? MONITOR.png[0] : S[SK], H = Math.round(W * r.h / r.w);
      const c = document.createElement("canvas"); c.width = W; c.height = H;
      paint(c.getContext("2d"), W, H, curFrame, ...extra("png"));
      c.toBlob(b => { save(b, stamp() + ".png"); toast(C.pngToast ? C.pngToast(W, H) : `PNG saved · ${W}×${H}`); });
    }, 30);
  });
}
function exportSVG() {
  if (C.buildSVG) $("#expSvg").addEventListener("click", () => {
    save(new Blob([C.buildSVG(P)], { type: "image/svg+xml" }), stamp() + ".svg");
    toast("SVG saved");
  });
  if (C.buildLoopSVG) $("#expSvgLoop").addEventListener("click", () => {
    if (!S.motion.on) return toast("Turn on motion first");
    toast("Building loop…", true);
    setTimeout(() => {
      save(new Blob([C.buildLoopSVG(P)], { type: "image/svg+xml" }), stamp() + "-loop.svg");
      toast("Animated SVG saved");
    }, 30);
  });
}
function exportVideo() {
  $("#expVid").addEventListener("click", () => {
    if (!S.motion.on) return toast("Turn on motion first");
    const type = pickVideoType();
    if (!type) return toast("This browser can't record video");
    const ext = type.startsWith("video/mp4") ? "mp4" : "webm";
    const r = ratioOf(S.ratio);
    let W = S.ratio === MONITOR.id ? MONITOR.video[0] : Math.min(C.videoCap || 1280, S[SK]); W -= W % 2;
    let H = Math.round(W * r.h / r.w); H -= H % 2;
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const cc = c.getContext("2d");
    const F = S.motion.frames, loops = C.videoLoops || 1;
    const rec = new MediaRecorder(c.captureStream(60), { mimeType: type, videoBitsPerSecond: 16000000 });
    const chunks = [];
    rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    rec.onstop = () => { save(new Blob(chunks, { type }), stamp() + "-loop." + ext); toast(ext.toUpperCase() + " saved"); };
    const was = playing; setPlaying(false);
    toast("Recording…", true);
    let n = 0;
    rec.start();
    (function step() {
      paint(cc, W, H, n % F, ...extra("video"));
      n++;
      if (n < F * loops) setTimeout(() => requestAnimationFrame(step), Math.max(0, 1000 / S.motion.fps - 4));
      else setTimeout(() => { rec.stop(); if (was) setPlaying(true); }, 200);
    })();
  });
}
function updateExportNote() {
  const N = C.exportNote;
  const a = $("#expVid"), sc = $("#scrub"), l = $(N ? N.loop : "#expSvgLoop");
  if (a) a.disabled = !S.motion.on;
  if (l) l.disabled = !S.motion.on;
  if (sc) sc.disabled = !S.motion.on;
  if (N) { const n = $(N.note); if (n) n.textContent = S.motion.on ? N.on : N.off; }
}

/* ======================================================== 5 rail builders */
function segmented(host, items, get, set) {
  if (!host) return;
  host.innerHTML = "";
  const head = host.closest(".misc"), k = head && head.querySelector(".k");
  const name = (k && k.textContent.trim()) || host.id;
  const wrap = document.createElement("div"); wrap.className = "pick";
  const btn = document.createElement("button"); btn.type = "button"; btn.className = "pick-btn";
  btn.setAttribute("aria-haspopup", "listbox"); btn.setAttribute("aria-expanded", "false");
  btn.setAttribute("aria-label", name);
  const val = document.createElement("span"); val.className = "val";
  const chev = document.createElement("span"); chev.className = "chev"; chev.setAttribute("aria-hidden", "true");
  btn.appendChild(val); btn.appendChild(chev);
  const menu = document.createElement("ul"); menu.className = "pick-menu"; menu.setAttribute("role", "listbox"); menu.hidden = true;
  menu.setAttribute("aria-label", name);
  /* a picker that is rebuilt replaces its old panel */
  if (host.__pickMenu) host.__pickMenu.remove(); host.__pickMenu = menu;
  const label = () => { const it = items.find(([id]) => id === get()); val.textContent = it ? it[1] : ""; };
  const opts = items.map(([id, text]) => {
    const li = document.createElement("li"); li.setAttribute("role", "option"); li.textContent = text;
    li.setAttribute("aria-selected", String(get() === id));
    li.addEventListener("click", e => { e.stopPropagation(); set(id); label();
      opts.forEach(o => o.setAttribute("aria-selected", String(o === li))); close(); });
    menu.appendChild(li); return li;
  });
  label();
  /* the panel floats over the page, under the field or above it when the
     foot of the window is near, so the rail's own scroll never clips it */
  function place() {
    const r = btn.getBoundingClientRect();
    menu.style.left = Math.round(r.left) + "px"; menu.style.width = Math.round(r.width) + "px";
    menu.style.top = "0px";
    const h = menu.offsetHeight;
    let y = r.bottom + 4;
    if (y + h > innerHeight - 12) y = Math.max(12, r.top - h - 4);
    menu.style.top = Math.round(y) + "px";
  }
  function close() { if (menu.hidden) return; menu.hidden = true; btn.setAttribute("aria-expanded", "false");
    document.removeEventListener("mousedown", away, true); document.removeEventListener("scroll", onScroll, true);
    window.removeEventListener("resize", close); document.removeEventListener("keydown", keys, true); }
  function open() { if (window.__closePick && window.__closePick !== close) window.__closePick();
    window.__closePick = close; menu.hidden = false; btn.setAttribute("aria-expanded", "true"); place();
    const cur = opts.find(o => o.getAttribute("aria-selected") === "true"); if (cur) cur.scrollIntoView({ block: "nearest" });
    document.addEventListener("mousedown", away, true); document.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", close); document.addEventListener("keydown", keys, true); }
  function away(e) { if (!menu.contains(e.target) && e.target !== btn && !btn.contains(e.target)) close(); }
  function onScroll(e) { if (e.target !== menu) close(); }
  function keys(e) {
    const i = opts.findIndex(o => o.getAttribute("aria-selected") === "true");
    if (e.key === "Escape") { e.preventDefault(); close(); btn.focus(); }
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault();
      const j = Math.max(0, Math.min(opts.length - 1, i + (e.key === "ArrowDown" ? 1 : -1))); opts[j].click(); open(); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); close(); btn.focus(); }
  }
  btn.addEventListener("click", () => { menu.hidden ? open() : close(); });
  btn.addEventListener("keydown", e => { if (menu.hidden && (e.key === "ArrowDown" || e.key === "ArrowUp")) { e.preventDefault(); open(); } });
  /* the panel lives at page level: the rail fades its own foot with a mask,
     and that mask would fade the panel too if it hung inside the rail */
  wrap.appendChild(btn); host.appendChild(wrap); document.body.appendChild(menu);
}
function buildRatios() {
  const host = $("#ratios"); if (!host) return;
  host.innerHTML = "";
  RATIOS.forEach(r => {
    const b = document.createElement("button");
    b.className = "ratio"; b.type = "button";
    b.setAttribute("aria-pressed", String(S.ratio === r.id));
    const sc = Math.min(20 / r.w, 20 / r.h);
    b.innerHTML = `<span class="box" style="width:${(r.w * sc).toFixed(1)}px;height:${(r.h * sc).toFixed(1)}px"></span><span class="t">${r.id}</span>`;
    b.onclick = () => { S.ratio = r.id; $("#ratioVal").textContent = r.id;
      [...host.children].forEach(c => c.setAttribute("aria-pressed", String(c === b))); invalidate(); };
    host.appendChild(b);
  });
}
function paintStrip(cols) { $("#strip").innerHTML = cols.map(c => `<span style="background:${c}"></span>`).join(""); }
function paintGlyph(on) {
  const g = $("#glyph");
  if (g.children.length !== 9) g.innerHTML = Array.from({ length: 9 }, () => "<i></i>").join("");
  [...g.children].forEach((el, i) => el.classList.toggle("on", on.includes(i)));
}
function accent() {
  const A = C.accent || {}, pal = S[PK], lo = A.lo !== undefined ? A.lo : 0.12, hi = A.hi;
  let best = pal[pal.length - 1], bl = -1;
  for (const c of pal) { const l = relLum(c); if (l > bl && l > lo && (hi === undefined || l < hi)) { bl = l; best = c; } }
  if (A.css !== false) document.documentElement.style.setProperty("--accent", bl > 0 ? best : (A.fallback || "#F5C21B"));
  paintStrip(pal);
  paintGlyph(A.glyph || [0, 2, 4, 6, 8]);
}
function buildSwatches() {
  const host = $("#swatches");
  if (!host) return;
  host.innerHTML = "";
  const pal = S[PK], roles = C.roles, word = C.swatchWord === undefined ? "color" : C.swatchWord;
  const lock = !roles && pal.length <= 2;
  pal.forEach((c, i) => {
    const b = document.createElement("button");
    b.className = "sw" + (lock ? " locked" : ""); b.type = "button";
    b.setAttribute("aria-label", C.swatchLabel ? C.swatchLabel(i) : (roles ? roles[i] : "Ink " + (i + 1)) + (word ? " " + word : ""));
    b.innerHTML = `<span class="fill" style="background:${c}"></span>` +
      `<input type="color" value="${c}">` + (roles ? "" : `<span class="x" aria-hidden="true">×</span>`);
    b.querySelector("input").addEventListener("input", e => {
      pal[i] = e.target.value;
      b.querySelector(".fill").style.background = e.target.value;
      U.accent(); reframe();
    });
    if (!roles) b.addEventListener("click", e => {
      if (e.target.classList.contains("x") && pal.length > 2) {
        e.preventDefault(); e.stopPropagation();
        pal.splice(i, 1); U.buildSwatches(); U.accent(); reframe();
      }
    }, true);
    host.appendChild(b);
  });
  if (roles) return;
  const add = document.createElement("button");
  add.className = "sw-add"; add.type = "button"; add.textContent = "+";
  add.setAttribute("aria-label", C.addLabel || "Add color");
  add.addEventListener("click", () => {
    const commit = hex => { pal.push(hex); U.buildSwatches(); U.accent(); reframe(); };
    if (window.__pickColour) window.__pickColour(add, commit);
    else commit(C.addColor ? C.addColor(P) : C.palettes[0][(Math.random() * C.palettes[0].length) | 0]);
  });
  host.appendChild(add);
  const n = $("#swCountVal"); if (n) n.textContent = pal.length;
}
function setPalette(p) { S[PK] = p.slice(); U.buildSwatches(); U.accent(); reframe(); }
function shuffleColors() { setPalette(window.__freshPalette(C.palettes[(Math.random() * C.palettes.length) | 0])); }
function rotateColors() { setPalette(S[PK].slice(1).concat(S[PK][0])); }
function rails() { U.buildRatios(); U.buildSwatches(); U.accent(); }
function bindRange(id, fmt, set, after) {
  const el = $("#" + id), label = $("#" + id + "Val");
  if (!el) return;
  el.addEventListener("input", () => {
    const v = parseFloat(el.value); set(v);
    if (label) label.textContent = fmt(v);
    (after || reframe)();
  });
}
function newSeed(v) {
  S.seed = (v !== undefined) ? v : (Math.random() * 99999 | 0) + 1; $("#seed").value = S.seed;
  if (C.dealSeed) C.dealSeed(P);
  invalidate();
}

/* ========================================================= 6 grain overlay */
/* Grain: a post-pass over the finished frame (dust, clumps, specks, edge
   shade), fixed to a grid sized to the picture so exports match the preview.
   It runs before the dither. */
let GRN = null;
function __grnHash(x, y, s) {
  let n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1274126177);
  n = Math.imul(n ^ (n >>> 13), 1274126177); n ^= n >>> 16;
  return (n >>> 0) / 4294967296;
}
function __grnNoise(x, y, s) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = __grnHash(xi, yi, s), b = __grnHash(xi + 1, yi, s), c = __grnHash(xi, yi + 1, s), d = __grnHash(xi + 1, yi + 1, s);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}
function __grain(c) {
  if (!GRN.on || GRN.amount <= 0) return;
  if (!c || typeof c.getImageData !== "function" || typeof c.putImageData !== "function") return;
  const cv = c.canvas;
  if (!cv || !cv.width || !cv.height) return;
  const W = cv.width, H = cv.height;
  let img;
  try { img = c.getImageData(0, 0, W, H); } catch (e) { return; }
  const d = img.data;
  const U_ = Math.sqrt(W * H);
  /* the grain grid: one grain per screen pixel at size 1, in units of the
     picture rather than device pixels */
  const gsc = Math.max(1, U_ / 640 * GRN.size);
  const amt = GRN.amount, blend = GRN.blend;
  const speck = GRN.specks * 0.035, vig = GRN.vignette * 0.35;
  /* the clumps are a slow noise, worked out once per grain row and column */
  const cs = 11 * gsc;
  const GW = Math.ceil(W / gsc) + 1, GH = Math.ceil(H / gsc) + 1;
  const clumpRow = new Float32Array(GW);
  let lastGy = -1;
  for (let y = 0, i = 0; y < H; y++) {
    const gy = (y / gsc) | 0;
    if (gy !== lastGy) { for (let gx = 0; gx < GW; gx++) clumpRow[gx] = __grnNoise(gx * gsc / cs, y / cs, 41); lastGy = gy; }
    const ey = Math.abs(y / H - 0.5) * 2;
    for (let x = 0; x < W; x++, i += 4) {
      const gx = (x / gsc) | 0;
      const h = __grnHash(gx, gy, 3);
      /* the grain itself: signed, stronger inside a clump */
      const k = (h - 0.5) * 120 * (0.5 + clumpRow[gx]);
      let r = d[i], g = d[i + 1], b = d[i + 2];
      let nr, ng, nb;
      if (blend === "add") { nr = r + k; ng = g + k; nb = b + k; }
      else {
        /* the grain as a mid-grey layer, neutral where it is 128 */
        const n = (128 + k) / 255;
        if (blend === "multiply") { nr = r * n; ng = g * n; nb = b * n; }
        else if (blend === "screen") { const m = 1 - n; nr = 255 - (255 - r) * m; ng = 255 - (255 - g) * m; nb = 255 - (255 - b) * m; }
        else if (blend === "overlay") {
          nr = r < 128 ? 2 * r * n : 255 - 2 * (255 - r) * (1 - n);
          ng = g < 128 ? 2 * g * n : 255 - 2 * (255 - g) * (1 - n);
          nb = b < 128 ? 2 * b * n : 255 - 2 * (255 - b) * (1 - n);
        } else { /* soft light */
          const a = 1 - 2 * n, bb = 2 * n;
          nr = (a * r * r / 255 + bb * r); ng = (a * g * g / 255 + bb * g); nb = (a * b * b / 255 + bb * b);
        }
      }
      r += (nr - r) * amt; g += (ng - g) * amt; b += (nb - b) * amt;
      /* a few bright specks, like dust caught in the print */
      if (speck > 0 && h > 1 - speck) { const w = 95 * amt; r += w; g += w; b += w; }
      /* a shade darker at the edges of the sheet */
      if (vig > 0) { const ex = Math.abs(x / W - 0.5) * 2; const e = ex > ey ? ex : ey; const v = 1 - vig * amt * e * e * e; r *= v; g *= v; b *= v; }
      d[i] = r < 0 ? 0 : (r > 255 ? 255 : r);
      d[i + 1] = g < 0 ? 0 : (g > 255 ? 255 : g);
      d[i + 2] = b < 0 ? 0 : (b > 255 ? 255 : b);
    }
  }
  c.putImageData(img, 0, 0);
}
function wireGrain() {
  const tog = $("#grainTog");
  if (!tog) return;
  segmented($("#grnBlends"), [["add", "Add"], ["overlay", "Overlay"], ["soft", "Soft light"], ["multiply", "Multiply"], ["screen", "Screen"]],
    () => GRN.blend, v => { GRN.blend = v; requestDraw(); });
  bindRange("grnAmount", v => Math.round(v * 100) + "%", v => GRN.amount = v, requestDraw);
  bindRange("grnSize", v => v.toFixed(1), v => GRN.size = v, requestDraw);
  bindRange("grnSpecks", v => Math.round(v * 100) + "%", v => GRN.specks = v, requestDraw);
  bindRange("grnVignette", v => Math.round(v * 100) + "%", v => GRN.vignette = v, requestDraw);
  /* the dials show the tool's own opening settings */
  const show = (id, v, fmt) => { const e = $("#" + id), l = $("#" + id + "Val"); if (e) e.value = v; if (l) l.textContent = fmt(v); };
  show("grnAmount", GRN.amount, v => Math.round(v * 100) + "%"); show("grnSize", GRN.size, v => (+v).toFixed(1));
  show("grnSpecks", GRN.specks, v => Math.round(v * 100) + "%"); show("grnVignette", GRN.vignette, v => Math.round(v * 100) + "%");
  if (GRN.on) { tog.setAttribute("aria-pressed", "true"); tog.classList.add("on"); const body = $("#grainBody"); if (body) body.hidden = false; }
  tog.addEventListener("click", () => {
    GRN.on = !GRN.on;
    tog.setAttribute("aria-pressed", String(GRN.on));
    tog.classList.toggle("on", GRN.on);
    const body = $("#grainBody");
    if (body) body.hidden = !GRN.on;
    requestDraw();
  });
}

/* ======================================================== 7 dither overlay */
/* Dither: cuts the finished frame to a few tones per channel and lets an
   ordered threshold matrix decide how each block rounds. The SVG surface has
   no pixels to read, so it passes straight through. */
const DTH = { on: false, kind: "b8", size: 2, levels: 3, amount: 1 };
function __dthBayer(n) {
  let m = [[0, 2], [3, 1]];
  while (m.length < n) {
    const s = m.length, q = [];
    for (let y = 0; y < s * 2; y++) q.push(new Array(s * 2));
    for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
      const v = m[y][x] * 4;
      q[y][x] = v; q[y][x + s] = v + 2; q[y + s][x] = v + 3; q[y + s][x + s] = v + 1;
    }
    m = q;
  }
  return m;
}
const __DTH4 = __dthBayer(4), __DTH8 = __dthBayer(8);
function __dthNoise(x, y) {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967296;
}
function __dither(c) {
  if (!DTH.on || DTH.amount <= 0) return;
  if (!c || typeof c.getImageData !== "function" || typeof c.putImageData !== "function") return;
  const cv = c.canvas;
  if (!cv || !cv.width || !cv.height) return;
  const W = cv.width, H = cv.height;
  let img;
  try { img = c.getImageData(0, 0, W, H); } catch (e) { return; }
  const d = img.data;
  /* the slider is in units of the on-screen picture, not device pixels, so a
     6000px export carries the same size of dot as the 700px preview */
  const P_ = Math.max(1, Math.round(DTH.size * Math.min(W, H) / 700));
  const noise = DTH.kind === "noise";
  const M = (DTH.kind === "b4") ? __DTH4 : __DTH8, n = M.length, nn = n * n;
  const L = Math.max(1, Math.round(DTH.levels) - 1), amt = DTH.amount;
  /* one threshold per matrix cell and 256 possible inputs is only a few
     thousand answers, so work them out once rather than per pixel */
  const LUT = new Uint8Array(nn * 256);
  for (let i = 0; i < nn; i++) {
    const t = (i + 0.5) / nn;
    for (let v = 0; v < 256; v++) {
      const q = v / 255 * L, fl = Math.floor(q);
      LUT[i * 256 + v] = Math.round(Math.min(L, fl + ((q - fl) > t ? 1 : 0)) / L * 255);
    }
  }
  const full = amt >= 1;
  for (let by = 0; by < H; by += P_) {
    const y1 = Math.min(H, by + P_), gy = (by / P_) | 0, row = M[gy % n];
    for (let bx = 0; bx < W; bx += P_) {
      const x1 = Math.min(W, bx + P_), gx = (bx / P_) | 0;
      let r = 0, g = 0, b = 0, cnt = 0;
      for (let y = by; y < y1; y++) {
        let p = (y * W + bx) * 4;
        for (let x = bx; x < x1; x++) { r += d[p]; g += d[p + 1]; b += d[p + 2]; p += 4; cnt++; }
      }
      const o = (noise ? Math.min(nn - 1, (__dthNoise(gx, gy) * nn) | 0) : row[gx % n]) * 256;
      const nr = LUT[o + ((r / cnt) | 0)], ng = LUT[o + ((g / cnt) | 0)], nb = LUT[o + ((b / cnt) | 0)];
      for (let y = by; y < y1; y++) {
        let p = (y * W + bx) * 4;
        if (full) for (let x = bx; x < x1; x++) { d[p] = nr; d[p + 1] = ng; d[p + 2] = nb; p += 4; }
        else for (let x = bx; x < x1; x++) {
          d[p] += (nr - d[p]) * amt;
          d[p + 1] += (ng - d[p + 1]) * amt;
          d[p + 2] += (nb - d[p + 2]) * amt;
          p += 4;
        }
      }
    }
  }
  c.putImageData(img, 0, 0);
}
function wireDither() {
  const tog = $("#ditherTog");
  if (!tog) return;
  segmented($("#dthKinds"), [["b8", "Bayer 8"], ["b4", "Bayer 4"], ["noise", "Noise"]],
    () => DTH.kind, v => { DTH.kind = v; requestDraw(); });
  bindRange("dthSize", v => String(v), v => DTH.size = v, requestDraw);
  bindRange("dthLevels", v => v + " tones", v => DTH.levels = v, requestDraw);
  bindRange("dthAmount", v => Math.round(v * 100) + "%", v => DTH.amount = v, requestDraw);
  tog.addEventListener("click", () => {
    DTH.on = !DTH.on;
    tog.setAttribute("aria-pressed", String(DTH.on));
    tog.classList.toggle("on", DTH.on);
    const body = $("#ditherBody");
    if (body) body.hidden = !DTH.on;
    requestDraw();
  });
}
/* the one place paint is wrapped. `plain` lives only in this closure. Every
   painter takes its drawing surface as one of its arguments, but not always in
   the same position, so the wrapper finds it rather than assuming. */
function wrapPaint(plain) {
  return function () {
    const out = plain.apply(this, arguments);
    if (DTH.on || GRN.on) for (let i = 0; i < arguments.length; i++) {
      const a = arguments[i];
      if (a && typeof a.getImageData === "function" && a.canvas) { __grain(a); __dither(a); break; }
    }
    return out;
  };
}

/* ========================================= 8 units (the overridable defaults) */
Object.assign(U, {
  draw: drawDefault, tick: tickDefault, setPlaying: setPlayingDefault, buildRatios, fitCanvas, rails, accent, buildSwatches, shuffleColors, rotateColors, newSeed, updateExportNote,
  exportPNG, exportSVG, exportVideo
});

/* ================================================================ 9 API handle */
P = {
  /* live state: always read through the handle, never copy into a local */
  get S() { return S; },
  get playing() { return playing; },
  set playing(v) { playing = v; },
  get curFrame() { return curFrame; },
  set curFrame(v) { curFrame = v; },
  get t0() { return t0; },
  set t0(v) { t0 = v; },
  get raf() { return raf; },
  set raf(v) { raf = v; },
  get ratios() { return RATIOS; },
  get art() { return art; },
  get ctx() { return ctx; },
  get GRN() { return GRN; },
  get DTH() { return DTH; },
  MONITOR,
  /* the WRAPPED painter (grain / dither applied); the raw one is not reachable here */
  paint(...a) { return paint(...a); },
  frame: () => ratioOf(S.ratio),                     // {id,w,h} of the pressed frame tile
  draw: () => draw(), requestDraw, reframe, invalidate, fitCanvas: () => U.fitCanvas(),
  setPlaying, stamp, toast, save,
  segmented, bindRange, buildRatios: () => U.buildRatios(),
  buildSwatches: () => U.buildSwatches(), accent: () => U.accent(), setPalette,
  paintStrip, paintGlyph,
  newSeed: v => U.newSeed(v),
  updateExportNote: () => U.updateExportNote()
};

/* ==================================================================== 10 boot */
const OVERRIDABLE = ["draw", "tick", "setPlaying", "buildRatios", "fitCanvas", "rails", "accent", "buildSwatches", "shuffleColors", "rotateColors",
  "newSeed", "updateExportNote", "exportPNG", "exportSVG", "exportVideo"];
let booted = false;
function boot(cfg) {
  if (booted) throw new Error("Ptrn.boot called twice");
  booted = true;
  C = Object.assign({}, cfg);
  const plain = C.paint; delete C.paint;                 // the raw painter is handed on once and dropped
  S = C.S; PK = C.palKey || "pal"; SK = C.sizeKey || "size";
  if (C.toastMs) toastMs = C.toastMs;
  window.__toast = toast;                                // runtime.js shows the copy-seed toast through it
  RATIOS = (C.ratios || DEFAULT_RATIOS).concat([{ id: MONITOR.id, w: 32, h: 9 }]);
  for (const k of Object.keys(C.override || {})) {
    if (!OVERRIDABLE.includes(k)) throw new Error("Ptrn: unknown override " + k);
    const fn = C.override[k]; U[k] = (...a) => fn(P, ...a);
  }
  art = $("#art"); ctx = art.getContext("2d", { alpha: false });
  GRN = Object.assign({ on: false, blend: "add", amount: 0.55, size: 1, specks: 0.5, vignette: 0.5 }, C.grain || {});
  paint = wrapPaint(plain);

  if (window.ResizeObserver) {
    const box = $(".stage-inner");
    if (box) { let p = false; new ResizeObserver(() => { if (p) return; p = true; requestAnimationFrame(() => { p = false; draw(); }); }).observe(box); }
  }
  U.exportPNG(); U.exportSVG(); if (!C.static) U.exportVideo();
  U.rails();
  if (C.modes) segmented($("#modes"), C.modes, () => S.motion.mode, v => { S.motion.mode = v; reframe(); });
  if (!C.noShuffle) $("#shufColors").addEventListener("click", () => U.shuffleColors());
  const rot = $("#rotColors"); if (rot) rot.addEventListener("click", () => U.rotateColors());
  if (C.controls) C.controls(P);                        // the tool's own sliders and pickers
  if (!C.static) {                                       // static tools have no Animate group
  bindRange("amt", v => v.toFixed(2), v => S.motion.amount = v);
  $("#fps").addEventListener("input", e => { S.motion.fps = parseInt(e.target.value, 10);
    $("#fpsVal").textContent = C.fpsLabel ? C.fpsLabel(S.motion.fps) : S.motion.fps + " fps"; if (playing) setPlaying(true); });
  $("#frames").addEventListener("input", e => { S.motion.frames = parseInt(e.target.value, 10);
    $("#framesVal").textContent = S.motion.frames + " frames"; $("#scrub").max = S.motion.frames - 1;
    curFrame = Math.min(curFrame, S.motion.frames - 1); reframe(); if (playing) setPlaying(true); });
  }
  const sizeId = SK === "size" ? "size" : "sizePx";
  $("#" + sizeId).addEventListener("input", e => { S[SK] = parseInt(e.target.value, 10); $("#" + sizeId + "Val").textContent = S[SK] + " px"; });
  if (!C.static) {
  $("#motionTog").addEventListener("click", e => {
    S.motion.on = !S.motion.on;
    e.currentTarget.setAttribute("aria-pressed", String(S.motion.on));
    $("#motionBody").hidden = !S.motion.on;
    curFrame = 0; if (C.syncPos) C.syncPos(P); $("#scrub").value = 0;
    reframe(); U.updateExportNote();
    setPlaying(S.motion.on && !reduceMotion);
  });
  $("#play").addEventListener("click", () => { if (!S.motion.on) { $("#motionTog").click(); return; } setPlaying(!playing); });
  $("#scrub").addEventListener("input", e => { setPlaying(false); curFrame = parseInt(e.target.value, 10) % Math.max(1, S.motion.frames); if (C.syncPos) C.syncPos(P); draw(); });
  }
  $("#shuf").addEventListener("click", () => U.newSeed());
  $("#seed").addEventListener("change", e => { const v = parseInt(e.target.value, 10); U.newSeed(Number.isFinite(v) ? Math.abs(v) : 1); });
  art.addEventListener("click", () => U.newSeed());
  document.addEventListener("keydown", e => {
    if (e.target.matches("input,textarea")) return;
    if (e.code === "Space") { e.preventDefault(); U.newSeed(); }
    if (e.key === "p" || e.key === "P") { if (S.motion.on) setPlaying(!playing); }
  });
  U.newSeed(C.startSeed !== undefined ? C.startSeed : 7);
  if (C.scrubMax !== false && !C.static) $("#scrub").max = S.motion.frames - 1;
  U.updateExportNote();
  wireGrain();
  wireDither();
  draw();
  return P;
}

window.Ptrn = Object.freeze({ util, tool: P, boot });
})();
