/* Move lab loader. Pulled in by one guarded <script> in index.html, only when the URL has
   ?movelab=1. document.write keeps load order synchronous, so everything below runs before
   DOMContentLoaded (the app's init). The runtime (js/aesthetic-spec.js) and the move files are always
   loaded by index.html itself, so this file only loads the lab specs.
   - Move files (code tier): add one to index.html next to js/moves/darkroom.js, never here.
   - Lab spec 2 aesthetics: dev/move-lab/specs/index.json lists the folders; SPEC_LAB.loadSpecs reads each
     <folder>/aesthetic.json (synchronous XHR, lab only). A bad file logs one console.error and is skipped.
   - The three rebuilds (soft-form--moves, acid-graphics--moves, editorial-serif--moves) now live in
     custom-aesthetics/starters/ (the New style starters, listed under "starters" in custom-aesthetics/index.json,
     never registered by the normal app). The lab registers the `--moves` ones from there.
   - Custom aesthetics (the ones that ship, and the place a new agent-made style goes) live in
     custom-aesthetics/ and load in the normal app: see js/custom-aesthetics.js. */
(function () {
  var SPEC_INDEX = 'dev/move-lab/specs/index.json';
  // Registers the rebuilds kept under custom-aesthetics/starters/ (synchronous XHR, lab only).
  function loadStarterRebuilds() {
    function get(url) {
      var x = new XMLHttpRequest();
      try { x.open('GET', url, false); x.send(); } catch (err) { console.error('spec loader: cannot read ' + url + ' (' + err.message + ')'); return null; }
      if (x.status !== 200 && !(x.status === 0 && x.responseText)) { console.error('spec loader: cannot read ' + url + ' (HTTP ' + x.status + ')'); return null; }
      try { return JSON.parse(x.responseText); } catch (err) { console.error('spec loader: ' + url + ' is not valid JSON (' + err.message + ')'); return null; }
    }
    var idx = get('custom-aesthetics/index.json');
    ((idx && idx.starters) || []).forEach(function (id) {
      if (!/--moves$/.test(id)) return;
      var base = 'custom-aesthetics/starters/' + id + '/';
      var json = get(base + 'aesthetic.json');
      if (json) registerSpecAesthetic(json, { base: base, file: base + 'aesthetic.json', json: true });
    });
  }
  document.write('<script>SPEC_LAB.loadSpecs("' + SPEC_INDEX + '")<\/script>');
  document.write('<script>(' + loadStarterRebuilds.toString() + ')()<\/script>');
})();
