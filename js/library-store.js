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

  /* ---- native (files) ---- */
  const nativeBackend = {
    kind: 'native',
    async list() {
      const rows = await native.postMessage({ op: 'list' });
      return (rows || []).map(s => { try { return JSON.parse(s); } catch (e) { return null; } }).filter(Boolean);
    },
    async get(id) {
      const s = await native.postMessage({ op: 'get', id });
      try { return s ? JSON.parse(s) : null; } catch (e) { return null; }
    },
    async put(record) {
      const ok = await native.postMessage({ op: 'put', id: record.id, json: JSON.stringify(record) });
      if (ok !== true) throw new Error('Could not write brand file');
    },
    async remove(id) { await native.postMessage({ op: 'delete', id }); },
  };

  /* ---- IndexedDB ---- */
  let dbPromise = null;
  function db() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open('brandingDesigner', 1);
        req.onupgradeneeded = () => req.result.createObjectStore('brands', { keyPath: 'id' });
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    return dbPromise;
  }
  function tx(mode, fn) {
    return db().then(d => new Promise((resolve, reject) => {
      const t = d.transaction('brands', mode);
      const store = t.objectStore('brands');
      const req = fn(store);
      t.oncomplete = () => resolve(req && req.result);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    }));
  }
  const idbBackend = {
    kind: 'indexeddb',
    list: () => tx('readonly', s => s.getAll()).then(r => r || []),
    get: id => tx('readonly', s => s.get(id)).then(r => r || null),
    put: record => tx('readwrite', s => s.put(record)).then(() => undefined),
    remove: id => tx('readwrite', s => s.delete(id)).then(() => undefined),
  };

  const backend = native ? nativeBackend : idbBackend;

  // Writes are queued so a slow save can never be overtaken by a later one.
  let chain = Promise.resolve();
  function queued(fn) {
    const run = chain.then(fn, fn);
    chain = run.catch(() => {});
    return run;
  }

  return {
    kind: backend.kind,
    list: () => backend.list(),
    get: id => backend.get(id),
    put: record => queued(() => backend.put(record)),
    remove: id => queued(() => backend.remove(id)),
    newId() {
      const b = new Uint8Array(8);
      crypto.getRandomValues(b);
      return Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
    },
  };
})();
