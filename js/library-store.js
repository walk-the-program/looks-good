/* ---------------------------------------------------------------------
   library-store.js — the one place that knows where saved brands live.

   A brand record is:
     { id, name, createdAt, updatedAt, savedState, draftState|null }
   where the states are serializeState() output (logo data URL included).

   Backends (chosen once, at load):
     - Mac app:  a native bridge (window.webkit.messageHandlers.library,
                 a WKScriptMessageHandlerWithReply) that keeps one JSON file
                 per brand in ~/Library/Application Support/Branding Designer/
     - Browser:  IndexedDB (localStorage is too small for logo data URLs)

   Everything is async and the rest of the app only sees LibraryStore.
------------------------------------------------------------------------ */

const LibraryStore = (function () {
  const native = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.library;

  const ID_OK = /^[A-Za-z0-9_-]{1,64}$/;

  /* ---- native (files) ---- */
  // `coll` is null for brands (the original folder) or 'logos' (the logos/ subfolder).
  function nativeBackend(coll) {
    const msg = o => (coll ? Object.assign({ collection: coll }, o) : o);
    const self = {
      kind: 'native',
      // Each row is [file name, file text]. The file name is the record's id, so a
      // Finder copy ("abc copy.json") can't masquerade as the original. Files that
      // aren't readable records are counted in `skipped` instead of vanishing silently.
      async list() {
        const rows = await native.postMessage(msg({ op: 'list' }));
        const out = [];
        self.skipped = 0;
        (rows || []).forEach(row => {
          const [name, text] = Array.isArray(row) ? row : [null, row];
          let rec = null;
          try { rec = JSON.parse(text); } catch (e) { /* counted below */ }
          if (rec && typeof rec === 'object' && name !== null) rec.id = name;
          if (rec && typeof rec === 'object' && ID_OK.test(rec.id || '')) out.push(rec);
          else self.skipped++;
        });
        return out;
      },
      async get(id) {
        const s = await native.postMessage(msg({ op: 'get', id }));
        try { return s ? JSON.parse(s) : null; } catch (e) { return null; }
      },
      async put(record) {
        const ok = await native.postMessage(msg({ op: 'put', id: record.id, json: JSON.stringify(record) }));
        if (ok !== true) throw new Error('Could not write ' + (coll ? 'logo' : 'brand') + ' file');
      },
      async remove(id) { await native.postMessage(msg({ op: 'delete', id })); },
      skipped: 0,
    };
    return self;
  }

  /* ---- IndexedDB ---- */
  // Version 2 adds the 'logos' store. The upgrade only creates what is missing, so an
  // existing v1 database keeps every record in 'brands'.
  const DB_VERSION = 2;
  let dbPromise = null;
  function db() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open('brandingDesigner', DB_VERSION);
        req.onupgradeneeded = () => {
          const d = req.result;
          if (!d.objectStoreNames.contains('brands')) d.createObjectStore('brands', { keyPath: 'id' });
          if (!d.objectStoreNames.contains('logos')) d.createObjectStore('logos', { keyPath: 'id' });
        };
        req.onsuccess = () => {
          const d = req.result;
          d.onversionchange = () => { d.close(); dbPromise = null; };   // let another tab upgrade
          resolve(d);
        };
        req.onerror = () => reject(req.error);
      });
    }
    return dbPromise;
  }
  function tx(table, mode, fn) {
    return db().then(d => new Promise((resolve, reject) => {
      const t = d.transaction(table, mode);
      const store = t.objectStore(table);
      const req = fn(store);
      t.oncomplete = () => resolve(req && req.result);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    }));
  }
  function idbBackend(table) {
    return {
      kind: 'indexeddb',
      list: () => tx(table, 'readonly', s => s.getAll()).then(r => r || []),
      get: id => tx(table, 'readonly', s => s.get(id)).then(r => r || null),
      put: record => tx(table, 'readwrite', s => s.put(record)).then(() => undefined),
      remove: id => tx(table, 'readwrite', s => s.delete(id)).then(() => undefined),
    };
  }

  const backendFor = coll => (native ? nativeBackend(coll) : idbBackend(coll || 'brands'));
  const backend = backendFor(null);

  // Writes are queued so a slow save can never be overtaken by a later one.
  let chain = Promise.resolve();
  function queued(fn) {
    const run = chain.then(fn, fn);
    chain = run.catch(() => {});
    return run;
  }

  const store = {
    get skipped() { return backend.skipped || 0; },   // brand files the last list() could not read (native only)
    list: () => backend.list(),
    get: id => backend.get(id),
    put: record => queued(() => backend.put(record)),
    remove: id => queued(() => backend.remove(id)),
    // A second record collection with the same list/get/put/remove shape ('logos'), sharing the write queue.
    collection(name) {
      const b = backendFor(name);
      return {
        list: () => b.list(),
        get: id => b.get(id),
        put: record => queued(() => b.put(record)),
        remove: id => queued(() => b.remove(id)),
        skipped: () => b.skipped || 0,
      };
    },
    newId() {
      const b = new Uint8Array(8);
      crypto.getRandomValues(b);
      return Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
    },
  };
  return store;
})();
