import { defaultHydration, validateHydration } from './hydration.js';

// A single IndexedDB read/write transaction is the cross-tab mutex. Neither
// notification delivery nor localStorage read-back is used as an atomic lock.
export function createHydrationStore(indexedDB, name = 'dsh.offwork-clock.hydration.v1') {
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
      const request = indexedDB.open(name, 1);
      request.onupgradeneeded = () => request.result.createObjectStore('state');
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
        const transaction = db.transaction('state', 'readwrite');
        const store = transaction.objectStore('state');
        const request = store.get('current');
        let output;
        let failure;
        request.onsuccess = () => {
          try {
            const current =
              reset || request.result === undefined
                ? defaultHydration()
                : validateHydration(request.result);
            const next = validateHydration(reducer(structuredClone(current)));
            const changed = JSON.stringify(next) !== JSON.stringify(current);
            const migrated =
              request.result !== undefined && request.result.schema !== current.schema;
            if (reset || changed || migrated) {
              const previousRevision =
                Number.isSafeInteger(request.result?.revision) && request.result.revision >= 0
                  ? request.result.revision
                  : current.revision;
              next.revision = previousRevision + 1;
              if (!Number.isSafeInteger(next.revision))
                throw new Error('Hydration revision exhausted');
              store.put(next, 'current');
            }
            output = next;
          } catch (error) {
            failure = error;
            transaction.abort();
          }
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
