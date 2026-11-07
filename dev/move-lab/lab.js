/* Move lab loader. Pulled in by one guarded <script> in index.html, only when the URL has
   ?movelab=1. document.write keeps load order synchronous, so everything below runs before
   DOMContentLoaded (the app's init). The runtime (js/aesthetic-spec.js) and the move files are always
   loaded by index.html itself, so this file only loads the lab specs.
   - Move files (code tier): add one to index.html next to js/moves/darkroom.js, never here.
   - Lab spec 2 aesthetics: dev/move-lab/specs/index.json lists the folders; SPEC_LAB.loadSpecs reads each
     <folder>/aesthetic.json (synchronous XHR, lab only). A bad file logs one console.error and is skipped.
   - Custom aesthetics (the ones that ship, and the place a new agent-made style goes) live in
     custom-aesthetics/ and load in the normal app: see js/custom-aesthetics.js. */
(function () {
  var SPEC_INDEX = 'dev/move-lab/specs/index.json';
  document.write('<script>SPEC_LAB.loadSpecs("' + SPEC_INDEX + '")<\/script>');
})();
