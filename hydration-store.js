import { defaultHydration, validateHydration, migrateHydration } from './hydration.js';

// A single IndexedDB read/write transaction is the cross-tab mutex. Neither
// notification delivery nor localStorage read-back is used as an atomic lock.
export function createHydrationStore(
  indexedDB,
  name = 'dsh.offwork-clock.hydration.v1',
  now = () => Date.now(),
) {
  return createStateStore(indexedDB, name, defaultHydration, validateHydration, {
    version: 2,
    storeName: 'wall-clock',
    legacyStore: 'state',
    migrate: (value) => migrateHydration(value, now()),
  });
}

export function createStateStore(indexedDB, name, initial, validate, options = {}) {
  const storeName = options.storeName || 'state';
  let database = null;
  let opening = null;
  let closed = false;
  const open = () => {
    if (closed) return Promise.reject(new Error('Hydration store closed'));
    if (database) return Promise.resolve(database);
    if (opening) return opening;
    opening = new Promise((resolve, reject) => {
      let abandoned = false;
      const fail = (error) => {
        abandoned = true;
        reject(error);
      };
      if (!indexedDB) {
        reject(new Error('Hydration storage unavailable'));
        return;
      }
      const request = indexedDB.open(name, options.version || 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(storeName))
          request.result.createObjectStore(storeName);
      };
      request.onerror = () => fail(request.error ?? new Error('Hydration storage unavailable'));
      request.onblocked = () => fail(new Error('Hydration storage blocked'));
      request.onsuccess = () => {
        if (closed || abandoned) {
          request.result.close();
          reject(new Error('Hydration store closed'));
          return;
        }
        database = request.result;
        database.onversionchange = () => {
          database.close();
          database = null;
          opening = null;
        };
        database.onclose = () => {
          database = null;
          opening = null;
        };
        resolve(database);
      };
    }).catch((error) => {
      opening = null;
      throw error;
    });
    return opening;
  };
  return {
    async update(reducer, { reset = false } = {}) {
      const db = await open();
      if (closed) throw new Error('Hydration store closed');
      return new Promise((resolve, reject) => {
        const hasLegacy =
          !!options.legacyStore && db.objectStoreNames.contains(options.legacyStore);
        const transaction = db.transaction(
          hasLegacy ? [storeName, options.legacyStore] : storeName,
          'readwrite',
        );
        const store = transaction.objectStore(storeName);
        const request = store.get('current');
        let output;
        let failure;
        const apply = (stored, legacy, imported = false) => {
          try {
            const current = reset
              ? initial()
              : stored !== undefined
                ? validate(stored)
                : imported
                  ? validate(options.migrate(legacy))
                  : initial();
            const next = validate(reducer(structuredClone(current)));
            const changed = JSON.stringify(next) !== JSON.stringify(current);
            const migrated = imported || (stored !== undefined && stored.schema !== current.schema);
            if (reset || changed || migrated) {
              const previousRevision =
                Number.isSafeInteger(stored?.revision) && stored.revision >= 0
                  ? stored.revision
                  : current.revision;
              next.revision = previousRevision + 1;
              if (!Number.isSafeInteger(next.revision))
                throw new Error('Hydration revision exhausted');
              store.put(next, 'current');
            }
            if (imported || (reset && hasLegacy)) store.put(true, 'legacy-imported');
            output = next;
          } catch (error) {
            failure = error;
            transaction.abort();
          }
        };
        request.onsuccess = () => {
          if (hasLegacy) {
            const marker = store.get('legacy-imported');
            marker.onsuccess = () => {
              if (!reset && request.result === undefined && marker.result !== true) {
                const legacy = transaction.objectStore(options.legacyStore).get('current');
                legacy.onsuccess = () => apply(undefined, legacy.result, true);
              } else {
                if (marker.result !== true) store.put(true, 'legacy-imported');
                apply(request.result);
              }
            };
          } else apply(request.result);
        };
        transaction.oncomplete = () => resolve(output);
        transaction.onabort = () =>
          reject(failure ?? transaction.error ?? new Error('Hydration transaction aborted'));
        transaction.onerror = () => {
          /* onabort reports the failure once. */
        };
      });
    },
    close() {
      closed = true;
      database?.close();
      database = null;
    },
  };
}
