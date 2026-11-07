/* Move lab loader. Pulled in by one guarded <script> in index.html, only when the URL has
   ?movelab=1. document.write keeps load order synchronous, so everything below runs before
   DOMContentLoaded (the app's init). List ONLY files that exist: a missing one is a 404, which
   the console reports as an error. Workers append their files when they create them:
   moves: js/moves/soft.js, acid.js, editorial.js; specs: soft-form.js, acid-graphics.js,
   editorial-serif.js. */
(function () {
  var RUNTIME = ['js/aesthetic-spec.js'];
  var MOVE_FILES = ['js/moves/core.js', 'js/moves/soft.js', 'js/moves/acid.js', 'js/moves/editorial.js'];
  var SPEC_FILES = ['dev/move-lab/specs/smoke.js', 'dev/move-lab/specs/soft-form.js', 'dev/move-lab/specs/acid-graphics.js', 'dev/move-lab/specs/editorial-serif.js'];
  RUNTIME.concat(MOVE_FILES, SPEC_FILES).forEach(function (src) {
    document.write('<script src="' + src + '"><\/script>');
  });
})();
