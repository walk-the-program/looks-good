harfbuzzjs (HarfBuzz shaping compiled to WebAssembly)

Version : 1.6.2 (published 2026-09-21; the newest release at least 2 weeks old on 2026-10-20.
          1.6.3 followed on 2026-10-06)
Source  : https://registry.npmjs.org/harfbuzzjs/-/harfbuzzjs-1.6.2.tgz
Project : https://github.com/harfbuzz/harfbuzzjs
License : MIT (see LICENSE). HarfBuzz itself is MIT as well.

Files, copied unmodified from the package's dist/ folder:
  index.js      = dist/index.mjs (renamed so servers send a JS content type; ES module)
  harfbuzz.js   = dist/harfbuzz.js (Emscripten loader; finds harfbuzz.wasm next to itself)
  harfbuzz.wasm = dist/harfbuzz.wasm
The subset build (harfbuzz-subset.wasm) is not used.

Loaded at runtime by js/logo-engine.js with a dynamic import() of index.js. No CDN.
