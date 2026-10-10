/* 21 Blob Tracking - STUB (P4 scaffold): header metadata and a placeholder art only.
   The builder replaces art, adds roles, tokens, materials, rules and fills css/aesthetics/blob-tracking.css.
   Reference: the TouchDesigner / After Effects blob-track look, OpenCV-style detection overlays on footage: 1px bounding boxes with ID and confidence label tabs, crosshair centroids and connector lines over dithered monochrome footage.
   Spec: docs/aesthetics-round4.md. */

registerAesthetic({
  key: 'blob-tracking', order: 21,
  name: 'Blob Tracking',
  descriptor: 'Tracked · Clinical · Live',
  influences: 'Computer vision / TouchDesigner visuals / Surveillance UI',
  summary: 'Thin white detection boxes, ID labels and crosshairs over dithered footage, tracking every element.',
  motto: 'Everything in frame is accounted for.',
  kicker: 'Frame 0412 · Tracking 7',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Detection', states: ['Searching', 'Locked', 'Lost'], statesKind: 'button' },
  type: { ui: 'mono', label: 'mono' },

  art(ctx) {
    const t = ctx.t;
    return `<svg viewBox="0 0 200 150" width="100%" height="100%" focusable="false">
      <rect width="200" height="150" fill="${t.mix(t.canvas, t.primary, 0.18)}"/>
      <rect x="28" y="30" width="62" height="74" fill="none" stroke="${t.ink}" stroke-width="1"/>
      <rect x="28" y="22" width="40" height="8" fill="${t.ink}"/>
      <rect x="112" y="56" width="52" height="46" fill="none" stroke="${t.primary}" stroke-width="1"/>
      <path d="M59 67h8M63 63v8M138 79h8M142 75v8M90 67L112 79" stroke="${t.ink}" stroke-width="1" fill="none"/>
    </svg>`;
  },

  materials: [],

  rules: { do: [], dont: [] },
});
