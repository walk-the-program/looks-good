/*
 * One-time localStorage migration: copies values saved under the old key
 * prefix to the new "ptrn." prefix, only where the new key is still empty.
 * Old keys are left in place. This is the only file that mentions the old name.
 */
(function () {
  try {
    var OLD = "playgrnd.", NEW = "ptrn.", keys = [], i;
    for (i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
    keys.forEach(function (k) {
      if (k && k.indexOf(OLD) === 0) {
        var nk = NEW + k.slice(OLD.length);
        if (localStorage.getItem(nk) === null) localStorage.setItem(nk, localStorage.getItem(k));
      }
    });
  } catch (e) { /* storage unavailable: nothing to migrate */ }
})();

/*
 * Slider fill sync (local fix; the bug also exists on the live site).
 *
 * Each tool draws a slider's filled hairline from a CSS variable, --p (0-100),
 * set on the slider's .pr row. The tools only update --p when the user drags
 * (the "input" event), so when code sets el.value (New variation, randomize,
 * presets, undo...) the thumb moves but the fill stays where it was.
 *
 * This file keeps --p correct by:
 *   1. wrapping the value / valueAsNumber setters (and stepUp / stepDown) on
 *      HTMLInputElement so any code that moves a range input repaints it;
 *   2. re-syncing every .pr range input on load and shortly after common
 *      interactions, which also catches min/max or setAttribute("value")
 *      changes that no setter sees.
 * It never dispatches input or change events, so nothing is regenerated.
 */
(function () {
  "use strict";

  // Same formula the tools use: clamp((value - min) / (max - min) * 100, 0, 100).
  function pct(el) {
    var min = parseFloat(el.min); if (!isFinite(min)) min = 0;
    var max = parseFloat(el.max); if (!isFinite(max)) max = 100;
    var v = parseFloat(el.value);
    if (!isFinite(v) || max <= min) return 0;
    return Math.max(0, Math.min(100, (v - min) / (max - min) * 100));
  }

  function paint(el) {
    try {
      if (!el || el.type !== "range" || !el.closest) return;
      var pr = el.closest(".pr");
      if (pr) pr.style.setProperty("--p", pct(el).toFixed(3));
    } catch (e) { /* never break the page over a fill line */ }
  }

  function syncAll() {
    var list = document.querySelectorAll(".pr input[type=range]");
    for (var i = 0; i < list.length; i++) paint(list[i]);
  }

  // Keep the native getter/setter; add a repaint after the native set.
  function wrapSetter(name) {
    var proto = window.HTMLInputElement && HTMLInputElement.prototype;
    var d = proto && Object.getOwnPropertyDescriptor(proto, name);
    if (!d || !d.set || !d.get) return;
    var nativeSet = d.set;
    Object.defineProperty(proto, name, {
      configurable: d.configurable,
      enumerable: d.enumerable,
      get: d.get,
      set: function (v) {
        nativeSet.call(this, v);
        paint(this);
      }
    });
  }

  function wrapMethod(name) {
    var proto = window.HTMLInputElement && HTMLInputElement.prototype;
    var fn = proto && proto[name];
    if (typeof fn !== "function") return;
    proto[name] = function () {
      var r = fn.apply(this, arguments);
      paint(this);
      return r;
    };
  }

  wrapSetter("value");
  wrapSetter("valueAsNumber");
  wrapMethod("stepUp");
  wrapMethod("stepDown");

  // Re-sync after the page and after interactions (thumb and fill settle a tick later).
  function later() {
    setTimeout(syncAll, 0);
    if (window.requestAnimationFrame) window.requestAnimationFrame(syncAll);
  }

  // Dragging a thumb fires "input" before the value setters see anything: repaint at once.
  document.addEventListener("input", function (e) { paint(e.target); }, true);

  document.addEventListener("DOMContentLoaded", syncAll);
  window.addEventListener("load", syncAll);
  ["click", "keydown", "input", "change", "pointerup", "reset"].forEach(function (t) {
    document.addEventListener(t, later, true);
  });
})();
