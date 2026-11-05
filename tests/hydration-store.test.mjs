import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
import { createHydrationStore } from '../hydration-store.js';
import { calculate } from '../clock.js';
import {
  defaultHydration,
  hydrationContext,
  hydrationView,
  transitionHydration,
} from '../hydration.js';

const settings = {
  payMode: 'monthly',
  monthlySalary: 12000,
  workdaysPerMonth: 20,
  start: '09:00',
  end: '18:00',
  breakStart: '12:00',
  breakEnd: '13:00',
  weekdays: [1, 2, 3, 4, 5],
  timezone: 'Asia/Shanghai',
};
const begin = Date.parse('2026-11-04T09:00:00+08:00');
const due = begin + 3600000;
const context = (at, patch = {}) => {
  const config = { ...settings, ...patch };
  return hydrationContext(config, calculate(config, at));
};
const read = (store) => store.update((state) => state);
const fixture = (t) => {
  const indexedDB = new IDBFactory();
  const first = createHydrationStore(indexedDB);
  const second = createHydrationStore(indexedDB);
  t.after(() => {
    first.close();
    second.close();
  });
  return { indexedDB, first, second };
};
const seed = (store) =>
  store.update((state) =>
    transitionHydration(
      state,
      context(begin),
      { type: 'preferences', enabled: true, interval: 60 },
      begin,
      'a',
    ),
  );
const rawWrite = (indexedDB, state) =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open('dsh.offwork-clock.hydration.v1', 1);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction('state', 'readwrite');
      transaction.objectStore('state').put(state, 'current');
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onabort = () => {
        db.close();
        reject(transaction.error);
      };
    };
    request.onerror = () => reject(request.error);
  });

test('read-only first load does not create a default record; committed state survives reopening', async (t) => {
  const { indexedDB, first } = fixture(t);
  assert.deepEqual(await read(first), defaultHydration());
  const state = await seed(first);
  first.close();
  const reopened = createHydrationStore(indexedDB);
  t.after(() => reopened.close());
  assert.deepEqual(await read(reopened), state);
  assert.ok(state.revision > 0);
});

test('transactions serialize competing claims and duplicate processing across connections', async (t) => {
  const { first, second } = fixture(t);
  await seed(first);
  await Promise.all([
    first.update((s) => transitionHydration(s, context(due), { type: 'claim' }, due, 'a')),
    second.update((s) => transitionHydration(s, context(due), { type: 'claim' }, due, 'b')),
  ]);
  const claimed = await read(first);
  const owner = claimed.shift.claim.owner;
  const eventId = hydrationView(claimed, context(due)).eventId;
  await Promise.all(
    [first, second].map((store) =>
      store.update((s) =>
        transitionHydration(s, context(due), { type: 'drink', eventId }, due, owner),
      ),
    ),
  );
  assert.equal((await read(first)).shift.count, 1);
  assert.deepEqual(await read(first), await read(second));
});

test('stale tabs cannot revert a changed schedule with tick, release, pause, or clear actions', async (t) => {
  const { first, second } = fixture(t);
  await seed(first);
  const initial = await read(first);
  const current = await first.update((s) =>
    transitionHydration(
      s,
      context(due, { end: '19:00' }),
      { type: 'tick', baseSchedule: initial.shift.schedule },
      due,
      'a',
    ),
  );
  assert.notEqual(current.shift.schedule, initial.shift.schedule);
  for (const type of ['tick', 'claim', 'release', 'pause', 'resume', 'clear-count']) {
    await second.update((s) => transitionHydration(s, context(due), { type }, due, 'b'));
    assert.deepEqual(await read(first), current, type);
  }
  // Even a newly opened stale tab cannot revert a timezone change that changes the shift id.
  const timezone = await first.update((s) =>
    transitionHydration(
      s,
      context(due, { timezone: 'UTC', end: '19:00' }),
      { type: 'tick', baseSchedule: current.shift.schedule },
      due,
      'a',
    ),
  );
  await second.update((s) => transitionHydration(s, context(due), { type: 'tick' }, due, 'b'));
  assert.deepEqual(await read(first), timezone);
});

test('a tab without Host settings cannot erase another tab claim', async (t) => {
  const { first, second } = fixture(t);
  await seed(first);
  const claimed = await first.update((s) =>
    transitionHydration(s, context(due), { type: 'claim' }, due, 'a'),
  );
  await second.update((s) => transitionHydration(s, null, { type: 'release' }, due, 'b'));
  assert.deepEqual(await read(first), claimed);
  await first.update((s) => transitionHydration(s, null, { type: 'release' }, due, 'a'));
  assert.equal((await read(first)).shift.claim, null);
});

test('explicit reset is monotonic and unknown data is rejected without overwriting', async (t) => {
  const { indexedDB, first, second } = fixture(t);
  await seed(first);
  await rawWrite(indexedDB, { schema: 99, revision: 40 });
  await assert.rejects(read(second), /Invalid hydration data/);
  const reset = await first.update(() => defaultHydration(), { reset: true });
  assert.equal(reset.revision, 41);
  assert.equal(reset.enabled, false);
  assert.equal(reset.shift, null);
  assert.deepEqual(await read(second), reset);
});

test('mutating reducers and aborting reducers cannot silently lose or partially commit updates', async (t) => {
  const { first } = fixture(t);
  await seed(first);
  const state = await first.update((s) => {
    s.interval = 30;
    return s;
  });
  assert.equal((await read(first)).interval, 30);
  await assert.rejects(
    first.update((s) => {
      s.interval = 10;
      throw new Error('abort');
    }),
    /abort/,
  );
  assert.deepEqual(await read(first), state);
});

test('partial preference updates preserve changes made by another connection', async (t) => {
  const { first, second } = fixture(t);
  await seed(first);
  await first.update((s) =>
    transitionHydration(s, context(begin), { type: 'preferences', interval: 30 }, begin, 'a'),
  );
  await second.update((s) =>
    transitionHydration(s, context(begin), { type: 'preferences', enabled: false }, begin, 'b'),
  );
  const state = await read(first);
  assert.equal(state.interval, 30);
  assert.equal(state.enabled, false);
});

test('transient opening errors recover and unavailable storage rejects explicitly', async () => {
  let calls = 0;
  const indexedDB = new IDBFactory();
  const store = createHydrationStore({
    open(...args) {
      if (++calls === 1) throw new Error('temporary');
      return indexedDB.open(...args);
    },
  });
  await assert.rejects(read(store), /temporary/);
  assert.deepEqual(await read(store), defaultHydration());
  assert.equal(calls, 2);
  store.close();
  const unavailable = createHydrationStore(null);
  await assert.rejects(read(unavailable), /unavailable/);
  unavailable.close();
});

test('legacy records migrate atomically once without losing user data', async (t) => {
  const { indexedDB, first, second } = fixture(t);
  const legacy = await seed(first);
  legacy.schema = 1;
  legacy.revision = 40;
  legacy.interval = 5;
  legacy.shift.count = 9;
  legacy.shift.paused = true;
  delete legacy.shift.quietUntil;
  delete legacy.shift.recentActions;
  await rawWrite(indexedDB, legacy);
  const [a, b] = await Promise.all([read(first), read(second)]);
  assert.equal(a.schema, 2);
  assert.equal(a.revision, 41);
  assert.deepEqual(a, b);
  assert.equal(a.interval, 5);
  assert.equal(a.shift.count, 9);
  assert.equal(a.shift.paused, true);
  assert.equal(a.shift.due, legacy.shift.due);
  assert.deepEqual(await read(second), a);
});

test('concurrent check-ins deduplicate the same ID but retain independent IDs', async (t) => {
  const { first, second } = fixture(t);
  await seed(first);
  const record = (store, id) =>
    store.update((s) =>
      transitionHydration(
        s,
        context(begin),
        {
          type: 'manual-drink',
          actionId: id,
          shiftId: context(begin).id,
        },
        begin,
        'a',
      ),
    );
  await Promise.all([record(first, 'same'), record(second, 'same')]);
  assert.equal((await read(first)).shift.count, 1);
  await Promise.all([record(first, 'one'), record(second, 'two')]);
  assert.equal((await read(first)).shift.count, 3);
});

test('exhausted revisions abort an update instead of persisting invalid data', async (t) => {
  const { indexedDB, first } = fixture(t);
  const current = await seed(first);
  current.revision = Number.MAX_SAFE_INTEGER;
  await rawWrite(indexedDB, current);
  await assert.rejects(
    first.update((s) => ({ ...s, interval: 5 })),
    /revision exhausted/,
  );
  assert.deepEqual(await read(first), current);
});

test('quiet and manual actions preserve each other across connections', async (t) => {
  const { first, second } = fixture(t);
  await seed(first);
  await Promise.all([
    first.update((s) =>
      transitionHydration(s, context(begin), { type: 'quiet', minutes: 30 }, begin, 'a'),
    ),
    second.update((s) =>
      transitionHydration(
        s,
        context(begin),
        { type: 'manual-drink', actionId: 'cup', shiftId: context(begin).id },
        begin,
        'b',
      ),
    ),
  ]);
  const state = await read(first);
  assert.equal(state.shift.count, 1);
  assert.equal(state.shift.quietUntil, begin + 1800000);
  assert.equal(hydrationView(state, context(begin), begin).phase, 'quiet');
  assert.deepEqual(await read(second), state);
});
