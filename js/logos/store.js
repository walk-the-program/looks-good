/* LogoStore — where saved logo documents live (see docs/logos-phase1-contract.md §5).
   Browser: IndexedDB 'brandingDesigner' v2, store 'logos'. Mac app: logos/<id>.json via the
   `library` bridge with collection 'logos'. Both are reached through LibraryStore.collection. */
const LogoStore = (function () {
  const c = LibraryStore.collection('logos');
  const valid = d => d && typeof d === 'object' && /^[A-Za-z0-9_-]{1,64}$/.test(d.id || '');
  return {
    // Newest edit first. Records that are not logo documents are dropped.
    async list() {
      const rows = (await c.list()).filter(valid);
      return rows.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    },
    get: id => c.get(id),
    put(doc) {
      if (!valid(doc)) return Promise.reject(new Error('Logo has no valid id'));
      return c.put(doc);
    },
    remove: id => c.remove(id),
    skipped: () => c.skipped(),
  };
})();
