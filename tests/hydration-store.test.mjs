import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
import { createHydrationStore } from '../hydration-store.js';
import { defaultHydration, hydrationView, transitionHydration } from '../hydration.js';
const name = 'dsh.offwork-clock.hydration.v1',
  begin = Date.parse('2026-11-06T20:00:00+08:00'),
  due = begin + 3600000;
const read = (store) => store.update((s) => s);
const raw = (idb, storeName, value, version) =>
  new Promise((resolve, reject) => {
    const r = version ? idb.open(name, version) : idb.open(name);
    r.onupgradeneeded = () => {
      if (!r.result.objectStoreNames.contains(storeName)) r.result.createObjectStore(storeName);
    };
    r.onerror = () => reject(r.error);
    r.onsuccess = () => {
      const db = r.result,
        tx = db.transaction(storeName, value === undefined ? 'readonly' : 'readwrite'),
        s = tx.objectStore(storeName);
      let result;
      if (value !== undefined) s.put(value, 'current');
      else {
        const q = s.get('current');
        q.onsuccess = () => (result = q.result);
      }
      tx.oncomplete = () => {
        db.close();
        resolve(result);
      };
      tx.onabort = () => {
        db.close();
        reject(tx.error);
      };
    };
  });
const legacy = (schema = 2) => ({
  schema,
  revision: 40,
  enabled: true,
  interval: 5,
  shift: {
    id: 'retained-shift',
    schedule: 'retained-schedule',
    config: 'retained-config',
    count: 9,
    paused: true,
    due: 300000,
    sequence: 4,
    claim: null,
    ...(schema === 2 ? { quietUntil: begin + 1800000, recentActions: ['old-cup'] } : {}),
  },
});
const fixture = (t) => {
  const idb = new IDBFactory(),
    first = createHydrationStore(idb, name, () => begin),
    second = createHydrationStore(idb, name, () => begin);
  t.after(() => {
    first.close();
    second.close();
  });
  return { idb, first, second };
};
const seed = (store) =>
  store.update((s) =>
    transitionHydration(s, { type: 'preferences', enabled: true, interval: 60 }, begin, 'a'),
  );
test('fresh reads do not write a default record and committed deadlines survive reopening', async (t) => {
  const { idb, first } = fixture(t);
  assert.deepEqual(await read(first), defaultHydration());
  assert.equal(await raw(idb, 'wall-clock'), undefined);
  const state = await seed(first);
  first.close();
  const reopened = createHydrationStore(idb);
  t.after(() => reopened.close());
  assert.deepEqual(await read(reopened), state);
});
test('competing leases and repeated reminder acknowledgments serialize across connections', async (t) => {
  const { first, second } = fixture(t);
  await seed(first);
  await Promise.all(
    [first, second].map((s, i) =>
      s.update((v) => transitionHydration(v, { type: 'claim' }, due, i ? 'b' : 'a')),
    ),
  );
  const claimed = await read(first),
    eventId = hydrationView(claimed, due).eventId;
  await Promise.all(
    [first, second].map((s) =>
      s.update((v) => transitionHydration(v, { type: 'drink', eventId }, due, claimed.claim.owner)),
    ),
  );
  assert.equal((await read(first)).count, 1);
  assert.deepEqual(await read(first), await read(second));
});
test('concurrent manual records deduplicate the same ID and retain independent IDs without Host settings', async (t) => {
  const { first, second } = fixture(t);
  const record = (store, id) =>
    store.update((s) => transitionHydration(s, { type: 'manual-drink', actionId: id }, begin, 'a'));
  await Promise.all([record(first, 'same'), record(second, 'same')]);
  assert.equal((await read(first)).count, 1);
  await Promise.all([record(first, 'one'), record(second, 'two')]);
  assert.equal((await read(first)).count, 3);
});
test('foreign release does not erase ownership, while the owner can release without a schedule', async (t) => {
  const { first, second } = fixture(t);
  await seed(first);
  const claimed = await first.update((s) => transitionHydration(s, { type: 'claim' }, due, 'a'));
  await second.update((s) => transitionHydration(s, { type: 'release' }, due, 'b'));
  assert.deepEqual(await read(first), claimed);
  await first.update((s) => transitionHydration(s, { type: 'release' }, due, 'a'));
  assert.equal((await read(first)).claim, null);
});
test('partial preference updates preserve another tab interval change', async (t) => {
  const { first, second } = fixture(t);
  await seed(first);
  await first.update((s) =>
    transitionHydration(s, { type: 'preferences', interval: 30 }, begin, 'a'),
  );
  await second.update((s) =>
    transitionHydration(s, { type: 'preferences', enabled: false }, begin, 'b'),
  );
  const state = await read(first);
  assert.equal(state.interval, 30);
  assert.equal(state.enabled, false);
});
for (const schema of [1, 2])
  test(`legacy schema ${schema} migrates once in a shared transaction and keeps the original snapshot`, async (t) => {
    const { idb, first, second } = fixture(t),
      old = legacy(schema);
    await raw(idb, 'state', old, 1);
    const [a, b] = await Promise.all([read(first), read(second)]);
    assert.equal(a.schema, 3);
    assert.equal(a.revision, 41);
    assert.deepEqual(a, b);
    assert.equal(a.count, 9);
    assert.equal(a.interval, 5);
    assert.equal(a.paused, true);
    assert.equal(a.claim, null);
    assert.deepEqual(a.recentActions, schema === 2 ? ['old-cup'] : []);
    assert.equal(a.quietUntil, schema === 2 ? begin + 1800000 : 0);
    assert.deepEqual(await raw(idb, 'state'), old);
    assert.deepEqual(await read(second), a);
    const oldClient = new Promise((resolve, reject) => {
      const r = idb.open(name, 1);
      r.onerror = () => reject(r.error);
      r.onsuccess = () => {
        r.result.close();
        resolve();
      };
    });
    await assert.rejects(oldClient, { name: 'VersionError' });
    await first.update(() => defaultHydration(), { reset: true });
    assert.equal((await read(second)).count, 0);
    assert.equal((await read(second)).enabled, false);
    assert.deepEqual(await raw(idb, 'state'), old);
  });
test('invalid legacy records abort migration without overwriting either record; explicit reset does not reimport', async (t) => {
  const { idb, first } = fixture(t),
    bad = { schema: 99, revision: 40 };
  await raw(idb, 'state', bad, 1);
  await assert.rejects(read(first), /Invalid legacy/);
  assert.equal(await raw(idb, 'wall-clock'), undefined);
  assert.deepEqual(await raw(idb, 'state'), bad);
  const reset = await first.update(() => defaultHydration(), { reset: true });
  assert.equal(reset.count, 0);
  assert.deepEqual(await read(first), reset);
});
test('invalid new records fail closed and explicit reset increments their stored revision', async (t) => {
  const { idb, first, second } = fixture(t);
  await seed(first);
  await raw(idb, 'wall-clock', { schema: 99, revision: 40 });
  await assert.rejects(read(second), /Invalid hydration data/);
  const reset = await first.update(() => defaultHydration(), { reset: true });
  assert.equal(reset.revision, 41);
  assert.equal(reset.count, 0);
  assert.deepEqual(await read(second), reset);
});
test('mutating and aborting reducers are atomic, including revision exhaustion', async (t) => {
  const { idb, first } = fixture(t);
  await seed(first);
  const state = await first.update((s) => {
    s.interval = 30;
    return s;
  });
  await assert.rejects(
    first.update((s) => {
      s.interval = 5;
      throw new Error('abort');
    }),
    /abort/,
  );
  assert.deepEqual(await read(first), state);
  const exhausted = { ...state, revision: Number.MAX_SAFE_INTEGER };
  await raw(idb, 'wall-clock', exhausted);
  await assert.rejects(
    first.update((s) => ({ ...s, interval: 5 })),
    /revision exhausted/,
  );
  assert.deepEqual(await read(first), exhausted);
});
test('transient opening errors recover while missing storage rejects explicitly', async () => {
  const idb = new IDBFactory();
  let calls = 0;
  const store = createHydrationStore({
    open(...args) {
      if (++calls === 1) throw new Error('temporary');
      return idb.open(...args);
    },
  });
  await assert.rejects(read(store), /temporary/);
  assert.deepEqual(await read(store), defaultHydration());
  assert.equal(calls, 2);
  store.close();
  const missing = createHydrationStore(null);
  await assert.rejects(read(missing), /unavailable/);
  missing.close();
});
test('a blocked upgrade reports failure and can retry after the old connection closes', async (t) => {
  const { idb, first } = fixture(t);
  await raw(idb, 'state', legacy(), 1);
  const old = await new Promise((resolve, reject) => {
    const r = idb.open(name, 1);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
  await assert.rejects(read(first), /blocked/);
  old.close();
  const migrated = await read(first);
  assert.equal(migrated.count, 9);
  assert.equal(migrated.schema, 3);
});
test('deleting a migrated current record never resurrects the retained legacy count', async (t) => {
  const { idb, first } = fixture(t);
  await raw(idb, 'state', legacy(), 1);
  await read(first);
  await new Promise((resolve, reject) => {
    const request = idb.open(name);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result,
        tx = db.transaction('wall-clock', 'readwrite');
      tx.objectStore('wall-clock').delete('current');
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onabort = () => {
        db.close();
        reject(tx.error);
      };
    };
  });
  const next = await read(first);
  assert.equal(next.count, 0);
  assert.equal(next.enabled, false);
  assert.equal((await raw(idb, 'state')).shift.count, 9);
});

test('quiet time and manual drinking preserve each other across connections', async (t) => {
  const { first, second } = fixture(t);
  await seed(first);
  await Promise.all([
    first.update((s) => transitionHydration(s, { type: 'quiet', minutes: 60 }, begin, 'a')),
    second.update((s) =>
      transitionHydration(s, { type: 'manual-drink', actionId: 'cup' }, begin, 'b'),
    ),
  ]);
  const state = await read(first);
  assert.equal(state.count, 1);
  assert.equal(state.quietUntil, begin + 3600000);
  assert.equal(state.dueAt, begin + 3600000);
});
