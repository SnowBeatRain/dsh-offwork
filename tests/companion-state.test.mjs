import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
import { defaultCountdown, transitionCountdown } from '../countdown.js';
import { defaultHydration, transitionHydration } from '../hydration.js';
import { createStateStore } from '../hydration-store.js';
import {
  defaultCompanionState,
  validateCompanionState,
  companionEvents,
  companionPending,
  companionTransition,
  reconcileCompanion,
  companionDaySummary,
  validateBrowserBackup,
  companionBackupStamp,
  companionStateStamp,
  createCompanionRecoveryStore,
} from '../companion-state.js';
const at = Date.parse('2026-11-12T09:00:00Z');
const event = { id: 'smoking:1', kind: 'smoking', label: 'Smoking', dueAt: at };
const fresh = () => reconcileCompanion(defaultCompanionState(), [event], at);

test('closing, snoozing and quiet mode have distinct persistent semantics', () => {
  let state = fresh();
  state = companionTransition(state, { type: 'dismiss', id: event.id }, at);
  assert.equal(companionPending(state, [event], at).length, 0);
  assert.equal(state.deliveries[event.id].dueAt, at);
  state = companionTransition(state, { type: 'snooze', id: event.id }, at);
  assert.equal(companionPending(state, [event], at + 599999).length, 0);
  assert.equal(companionPending(state, [event], at + 600000).length, 1);
  state = companionTransition(
    state,
    { type: 'preferences', patch: { quietUntil: at + 700000 } },
    at,
  );
  assert.equal(companionPending(state, [event], at + 600000).length, 0);
  assert.equal(companionPending(state, [event], at + 700000).length, 1);
});
test('only one tab owns a reminder; lease can recover after a crash', async () => {
  const idb = new IDBFactory();
  const stores = ['a', 'b'].map(() =>
    createStateStore(idb, 'race', defaultCompanionState, validateCompanionState),
  );
  await stores[0].update(() => fresh());
  const winners = [];
  await Promise.all(
    stores.map((s, i) =>
      s.update((value) => {
        const next = companionTransition(
          value,
          { type: 'claim', id: event.id, owner: String(i) },
          at,
        );
        if (next.deliveries[event.id].owner === String(i)) winners.push(i);
        return next;
      }),
    ),
  );
  assert.equal(winners.length, 1);
  const loser = String(1 - winners[0]);
  const next = await stores[1].update((s) =>
    companionTransition(s, { type: 'claim', id: event.id, owner: loser }, at + 8000),
  );
  assert.equal(next.deliveries[event.id].owner, loser);
  stores.forEach((s) => s.close());
});
test('notification claims are atomic across tabs and snooze permits one new notification', async () => {
  const idb = new IDBFactory();
  const a = createStateStore(idb, 'notification', defaultCompanionState, validateCompanionState),
    b = createStateStore(idb, 'notification', defaultCompanionState, validateCompanionState);
  await a.update(() => fresh());
  let sent = 0;
  await Promise.all(
    [a, b].map((store) =>
      store.update((s) => {
        if (!s.deliveries[event.id].notifiedAt) sent++;
        return companionTransition(s, { type: 'notify', id: event.id }, at);
      }),
    ),
  );
  assert.equal(sent, 1);
  let state = await a.update((s) => companionTransition(s, { type: 'snooze', id: event.id }, at));
  assert.equal(state.deliveries[event.id].notifiedAt, 0);
  state = companionTransition(state, { type: 'notify', id: event.id }, at + 1);
  assert.equal(state.deliveries[event.id].notifiedAt, 0);
  a.close();
  b.close();
});
test('legacy water/smoking clocks are observed without modifying them', () => {
  let smoking = transitionCountdown(defaultCountdown(), { type: 'start' }, at - 3600000);
  let water = transitionHydration(
    defaultHydration(),
    { type: 'preferences', enabled: true, interval: 5 },
    at - 300000,
    'test',
  );
  const before = JSON.stringify({ smoking, water });
  const events = companionEvents(
    defaultCompanionState(),
    { smoking, water, smokingReady: true, waterReady: true },
    at,
  );
  assert.deepEqual(events.map((e) => e.kind).sort(), ['smoking', 'water']);
  assert.equal(JSON.stringify({ smoking, water }), before);
  water.claim = { owner: 'older-client', until: at + 8000, sequence: water.sequence };
  assert.equal(
    companionEvents(
      defaultCompanionState(),
      { water, waterReady: true, waterOwner: 'new-client' },
      at,
    ).length,
    0,
  );
  assert.equal(
    companionEvents(
      defaultCompanionState(),
      { water, waterReady: true, waterOwner: 'new-client' },
      at + 8000,
    ).length,
    1,
  );
});
test('wrap-up completion suppresses this shift only and leaves water/custom clocks intact', () => {
  let state = defaultCompanionState();
  state.preferences.wrapEnabled = true;
  const shift = {
    isWorkday: true,
    shiftDate: '2026-11-12',
    shiftStart: at - 3600000,
    shiftEnd: at + 300000,
  };
  const inputs = { shift };
  assert.equal(companionEvents(state, inputs, at).length, 1);
  state = companionTransition(
    state,
    {
      type: 'journal',
      date: shift.shiftDate,
      done: 'One change',
      next: 'Review',
      base: 0,
      end: true,
    },
    at,
  );
  assert.equal(companionEvents(state, inputs, at).length, 0);
  assert.equal(state.preferences.wrapEnabled, true);
  assert.equal(
    companionEvents(state, { shift: { ...shift, shiftDate: '2026-11-13' } }, at).length,
    1,
  );
  assert.equal(companionEvents(state, { shift: { ...shift, isWorkday: false } }, at).length, 0);
});
test('notes reject a stale tab and repeating end does not duplicate history', () => {
  let s = companionTransition(
    defaultCompanionState(),
    { type: 'journal', date: '2026-11-12', done: 'A', next: 'B', base: 0, end: true },
    at,
  );
  assert.throws(
    () =>
      companionTransition(
        s,
        { type: 'journal', date: '2026-11-12', done: 'stale', next: '', base: 0, end: false },
        at + 1,
      ),
    /another tab/,
  );
  s = companionTransition(
    s,
    { type: 'journal', date: '2026-11-12', done: 'A2', next: 'B', base: at, end: true },
    at + 1,
  );
  assert.equal(s.history.length, 1);
});
test('custom timers are independent and actions reject stale per-timer revisions', () => {
  let s = defaultCompanionState();
  for (const id of ['tea', 'rest'])
    s = companionTransition(s, { type: 'add-timer', id, name: id, minutes: 5 }, at);
  s = companionTransition(
    s,
    { type: 'timer', id: 'tea', revision: 0, operation: { type: 'start' } },
    at,
  );
  assert.equal(s.timers[1].clock.status, 'idle');
  assert.throws(
    () =>
      companionTransition(
        s,
        { type: 'timer', id: 'tea', revision: 0, operation: { type: 'stop' } },
        at,
      ),
    /changed/,
  );
  assert.equal(companionEvents(s, {}, at + 300000)[0].timerId, 'tea');
});
test('restore validates data, requires current revision, and resets permissions and leases', () => {
  let s = fresh();
  s.revision = 8;
  const backup = fresh();
  backup.preferences.sound = true;
  backup.preferences.notifications = true;
  backup.deliveries[event.id].owner = 'old';
  backup.deliveries[event.id].leaseUntil = at + 1000;
  assert.throws(
    () => companionTransition(s, { type: 'restore', value: backup, base: 7 }, at),
    /changed/,
  );
  const restored = companionTransition(s, { type: 'restore', value: backup, base: 8 }, at);
  assert.equal(restored.preferences.sound, false);
  assert.equal(restored.preferences.notifications, false);
  assert.equal(restored.deliveries[event.id].owner, '');
  assert.throws(() => validateCompanionState({ ...s, schema: 999 }));
  assert.throws(() =>
    validateCompanionState({
      ...s,
      preferences: { ...s.preferences, image: 'https://evil.example/image.svg' },
    }),
  );
});
test('actual event history is bounded, idempotent and counted in chosen timezone', () => {
  let s = defaultCompanionState();
  const e = {
    id: 'drink:1',
    label: 'Water',
    type: 'water',
    at: Date.parse('2026-11-12T23:00:00Z'),
  };
  s = companionTransition(s, { type: 'record', event: e }, at);
  s = companionTransition(s, { type: 'record', event: e }, at);
  assert.equal(s.history.length, 1);
  assert.equal(companionDaySummary(s, '2026-11-13', 'Asia/Shanghai').water, 1);
  assert.equal(companionDaySummary(s, '2026-11-12', 'Asia/Shanghai').water, 0);
});

test('backup preview ignores leases but detects user changes; recovery survives reopening', async () => {
  const b = validateBrowserBackup({
    format: 'dsh-offwork-browser',
    version: 1,
    createdAt: at,
    companion: fresh(),
    water: defaultHydration(),
    smoking: defaultCountdown(),
    view: {},
  });
  const stamp = companionBackupStamp(b);
  b.water.claim = { owner: 'other-tab', until: at + 8000, sequence: 0 };
  b.companion.revision++;
  assert.equal(companionBackupStamp(b), stamp);
  const restored = companionTransition(
    b.companion,
    { type: 'restore', value: b.companion, base: 0, stamp: companionStateStamp(b.companion) },
    at,
  );
  assert.equal(restored.revision, b.companion.revision);
  b.water.count++;
  assert.notEqual(companionBackupStamp(b), stamp);
  const idb = new IDBFactory();
  let store = createCompanionRecoveryStore(idb, createStateStore);
  await store.update((s) => ({ ...s, bundle: b }));
  store.close();
  store = createCompanionRecoveryStore(idb, createStateStore);
  assert.equal((await store.update((s) => s)).bundle.water.count, 1);
  store.close();
  assert.throws(() => validateBrowserBackup({ ...b, water: { ...b.water, schema: 999 } }));
});
