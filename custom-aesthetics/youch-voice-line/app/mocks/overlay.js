// Shared by overlay-pill.html and overlay-ring.html: draws the listening circle of periwinkle static
// (clear gaps, blotchy clumps, a fixed seed so shots are stable) and, when data-ring is set, the ring.
(function () {
  const c = document.getElementById("v");
  const ring = Number(document.documentElement.dataset.ring || 0);
  const dpr = 2, S = 44, px = 2;               // 44pt circle, 2pt pixels
  c.width = S * dpr; c.height = S * dpr;
  const g = c.getContext("2d");
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const n = S / px, field = [];
  for (let i = 0; i < n * n; i++) field.push(rnd());
  const at = (x, y) => field[((y + n) % n) * n + ((x + n) % n)];
  g.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--voice").trim();
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const dx = x + 0.5 - n / 2, dy = y + 0.5 - n / 2;
    if (dx * dx + dy * dy > (n / 2) * (n / 2)) continue;
    // clumps: a pixel draws when its neighbourhood is dense enough
    const cx = Math.floor(x / 4), cy = Math.floor(y / 4);
    const coarse = (at(cx * 7, cy * 5) + at(cx * 7 + 1, cy * 5) + at(cx * 7, cy * 5 + 1)) / 3;
    const v = 0.62 * coarse + 0.38 * at(x, y);
    if (v > 0.5) g.fillRect(x * px * dpr, y * px * dpr, px * dpr, px * dpr);
  }
  if (ring) {
    const r = document.getElementById("r");
    const C = 2 * Math.PI * 25;
    r.style.strokeDasharray = `${C * ring} ${C}`;
  }
})();
