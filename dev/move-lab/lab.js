/* Move lab loader. Pulled in by one guarded <script> in index.html, only when the URL has
   ?movelab=1. document.write keeps load order synchronous, so everything below runs before
   DOMContentLoaded (the app's init). List ONLY files that exist: a missing one is a 404, which
   the console reports as an error.
   - RUNTIME and MOVE_FILES: code tier. Add a move file here.
   - Spec 2 aesthetics: dev/move-lab/specs/index.json lists the folders; SPEC_LAB.loadSpecs reads each
     <folder>/aesthetic.json (synchronous XHR, lab only). A bad file logs one console.error and is skipped. */
(function () {
  var RUNTIME = ['js/aesthetic-spec.js'];
  var MOVE_FILES = ['js/moves/core.js', 'js/moves/soft.js', 'js/moves/acid.js', 'js/moves/editorial.js', 'js/moves/darkroom.js'];
  var SPEC_INDEX = 'dev/move-lab/specs/index.json';
  RUNTIME.concat(MOVE_FILES).forEach(function (src) {
    document.write('<script src="' + src + '"><\/script>');
  });
  document.write('<script>SPEC_LAB.loadSpecs("' + SPEC_INDEX + '")<\/script>');
})();
