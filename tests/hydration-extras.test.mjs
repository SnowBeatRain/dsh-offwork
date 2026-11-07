import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate } from '../clock.js';
import {
  defaultHydration,
  validateHydration,
  migrateHydration,
  hydrationView,
  transitionHydration,
  HYDRATION_ACTION_LIMIT,
} from '../hydration.js';
const time = (value) => Date.parse(value.includes('T') ? value : `2026-11-06T${value}:00+08:00`);
const act = (state, at, action) => transitionHydration(state, action, time(at), 'a');
const view = (state, at) => hydrationView(state, time(at));
const enable = (at = '09:00', interval = 60) =>
  act(defaultHydration(), at, { type: 'preferences', enabled: true, interval });
const legacy = (at = '09:00', schema = 2) => {
  const settings = {
    timezone: 'Asia/Shanghai',
    start: '09:00',
    end: '18:00',
    breakStart: '12:00',
    breakEnd: '13:00',
    weekdays: [1, 2, 3, 4, 5],
    payMode: 'daily',
    dailySalary: 1,
  };
  const clock = calculate(settings, time(at));
  return {
    schema,
    revision: 12,
    enabled: true,
    interval: 60,
    shift: {
      id: JSON.stringify([settings.timezone, clock.shiftDate]),
      config: JSON.stringify([
        settings.timezone,
        settings.start,
        settings.end,
        settings.breakStart,
        settings.breakEnd,
        settings.weekdays,
      ]),
      schedule: JSON.stringify([
        settings.start,
        settings.end,
        settings.breakStart,
        settings.breakEnd,
        settings.weekdays,
        clock.shiftStart,
        clock.shiftEnd,
      ]),
      count: 7,
      paused: false,
      due: clock.elapsed * 1000 + 3600000,
      sequence: 3,
      claim: { owner: 'old', until: time(at) + 8000, sequence: 3 },
      ...(schema === 2 ? { quietUntil: 0, recentActions: ['old-drink'] } : {}),
    },
  };
};
test('manual drinking is available before work, at lunch, after work and on days off without a schedule', () => {
  for (const at of ['08:00', '12:30', '20:00', '2026-11-07T10:00:00+08:00']) {
    const result = act(defaultHydration(), at, { type: 'manual-drink', actionId: at });
    assert.equal(result.count, 1);
    assert.equal(result.enabled, false);
    assert.equal(result.dueAt, 0);
  }
});
test('manual retries deduplicate and successful records reset only an enabled, unpaused timer', () => {
  const action = { type: 'manual-drink', actionId: 'cup' };
  const first = act(enable(), '09:15', action);
  assert.equal(first.dueAt, time('10:15'));
  assert.deepEqual(act(first, '09:20', action), first);
  const paused = act(first, '09:21', { type: 'pause' });
  const second = act(paused, '20:00', { type: 'manual-drink', actionId: 'next' });
  assert.equal(second.count, 2);
  assert.equal(second.paused, true);
  assert.equal(second.dueAt, paused.dueAt);
});
test('manual and prompted acknowledgments of the same overdue event count once in either order', () => {
  const initial = act(enable(), '10:00', { type: 'claim' });
  const eventId = view(initial, '10:00').eventId;
  const actions = [
    { type: 'manual-drink', actionId: 'same', eventId },
    { type: 'drink', eventId },
  ];
  for (const order of [actions, [...actions].reverse()]) {
    const result = order.reduce((s, a) => act(s, '10:00', a), initial);
    assert.equal(result.count, 1);
    assert.equal(result.claim, null);
  }
});
test('recent action IDs are bounded and persist across calendar dates', () => {
  let state = defaultHydration();
  for (let i = 0; i < HYDRATION_ACTION_LIMIT + 3; i++)
    state = act(state, '21:00', { type: 'manual-drink', actionId: 'cup-' + i });
  assert.equal(state.count, HYDRATION_ACTION_LIMIT + 3);
  assert.equal(state.recentActions.length, HYDRATION_ACTION_LIMIT);
  const tomorrow = act(state, '2026-11-07T10:00:00+08:00', { type: 'tick' });
  assert.deepEqual(tomorrow, state);
});
test('quiet time does not end at the end of a work shift or at midnight', () => {
  for (const [at, end] of [
    ['17:50', '18:50'],
    ['23:50', '2026-11-07T00:50:00+08:00'],
  ]) {
    const state = act(enable(at, 5), at, { type: 'quiet', minutes: 60 });
    assert.equal(state.quietUntil, time(end));
    assert.equal(view(state, new Date(time(end) - 60000).toISOString()).phase, 'quiet');
    assert.equal(view(state, end).phase, 'due');
  }
});
test('quiet operations invalidate old reminders; a successful drink keeps the chosen quiet deadline', () => {
  let state = act(enable(), '10:00', { type: 'claim' });
  const eventId = view(state, '10:00').eventId;
  state = act(state, '10:00', { type: 'quiet', minutes: 30 });
  assert.equal(state.claim, null);
  assert.equal(act(state, '10:01', { type: 'drink', eventId }).count, 0);
  state = act(state, '10:10', { type: 'manual-drink', actionId: 'quiet-cup' });
  assert.equal(state.count, 1);
  assert.equal(state.quietUntil, time('10:30'));
  assert.equal(state.dueAt, time('11:10'));
  const ended = act(state, '10:11', { type: 'end-quiet' });
  assert.equal(ended.quietUntil, 0);
  assert.equal(ended.dueAt, state.dueAt);
});
test('pause and disable end quiet time, while resume starts a full interval', () => {
  const state = act(enable(), '09:10', { type: 'quiet', minutes: 60 });
  const paused = act(state, '09:20', { type: 'pause' });
  assert.equal(paused.quietUntil, 0);
  assert.equal(act(paused, '09:21', { type: 'quiet', minutes: 30 }).quietUntil, 0);
  assert.equal(act(state, '09:20', { type: 'preferences', enabled: false }).quietUntil, 0);
  assert.equal(act(paused, '22:00', { type: 'resume' }).dueAt, time('23:00'));
  assert.throws(() => act(enable(), '09:00', { type: 'quiet', minutes: 20 }));
});
for (const schema of [1, 2])
  test(`schema ${schema} migration retains preferences/count and converts a matching shift remainder once`, () => {
    const old = legacy('09:00', schema),
      snapshot = structuredClone(old);
    const now = time('09:20');
    const next = migrateHydration(old, now);
    assert.equal(next.schema, 3);
    assert.equal(next.count, 7);
    assert.equal(next.enabled, true);
    assert.equal(next.interval, 60);
    assert.equal(next.dueAt, time('10:00'));
    assert.equal(next.claim, null);
    assert.ok(next.sequence > old.shift.sequence);
    assert.deepEqual(next.recentActions, schema === 2 ? ['old-drink'] : []);
    assert.deepEqual(old, snapshot);
    assert.deepEqual(validateHydration(JSON.parse(JSON.stringify(next))), next);
  });
test('migration turns remaining paid minutes during lunch into natural minutes without losing quiet settings', () => {
  const old = legacy('11:50');
  old.shift.quietUntil = time('13:30');
  const next = migrateHydration(old, time('12:20'));
  assert.equal(next.dueAt, time('13:10'));
  assert.equal(next.quietUntil, time('13:30'));
  assert.equal(next.count, 7);
});
test('migration preserves an already-overdue event; old-day records and pause retain counts without guessing past drinks', () => {
  assert.equal(migrateHydration(legacy(), time('10:30')).dueAt, time('10:30'));
  const old = legacy();
  old.shift.paused = true;
  const paused = migrateHydration(old, time('2026-11-07T10:00:00+08:00'));
  assert.equal(paused.paused, true);
  assert.equal(paused.count, 7);
  assert.equal(view(paused, '2026-11-07T10:00:00+08:00').phase, 'paused');
  old.shift.paused = false;
  const next = migrateHydration(old, time('2026-11-07T10:00:00+08:00'));
  assert.equal(next.count, 7);
  assert.equal(next.dueAt, time('2026-11-07T11:00:00+08:00'));
});
test('legacy malformed/future data is rejected; incomplete historical schedule text retains records with a full new interval', () => {
  for (const patch of [
    { schema: 99 },
    { revision: -1 },
    { interval: 1 },
    { enabled: 0 },
    { shift: {} },
    { other: true },
  ])
    assert.throws(() => migrateHydration({ ...legacy(), ...patch }, time('09:00')));
  const old = legacy();
  old.shift.config = 'unavailable old schedule';
  const next = migrateHydration(old, time('09:20'));
  assert.equal(next.count, 7);
  assert.equal(next.dueAt, time('10:20'));
});
