import test from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultHydration,
  validateHydration,
  reconcileHydration,
  hydrationView,
  transitionHydration,
  HYDRATION_LEASE_MS,
} from '../hydration.js';
const time = (value) => Date.parse(value.includes('T') ? value : `2026-11-06T${value}:00+08:00`);
const act = (state, at, action, owner = 'a') =>
  transitionHydration(state, action, typeof at === 'number' ? at : time(at), owner);
const enable = (at = '09:00', interval = 60) =>
  act(defaultHydration(), at, { type: 'preferences', enabled: true, interval });
const view = (state, at) => hydrationView(state, typeof at === 'number' ? at : time(at));

test('reminders are opt-in and enabling at any hour starts one full wall-clock interval', () => {
  assert.equal(view(defaultHydration(), '23:00').phase, 'off');
  const state = enable('23:15');
  assert.equal(state.dueAt, time('2026-11-07T00:15:00+08:00'));
  assert.equal(view(state, '23:59').phase, 'countdown');
  assert.equal(view(state, '2026-11-07T00:15:00+08:00').phase, 'due');
});
for (const interval of [5, 15, 17, 30, 45, 60, 90, 120, 240])
  test(`saving ${interval} natural minutes preserves unchanged settings and applies changed intervals`, () => {
    const initial = enable();
    const saved = act(initial, '09:10', { type: 'preferences', enabled: true, interval });
    assert.equal(saved.dueAt, time(interval === 60 ? '09:00' : '09:10') + interval * 60000);
    const restored = validateHydration(JSON.parse(JSON.stringify(saved)));
    assert.equal(view(restored, saved.dueAt - 1).phase, 'countdown');
    assert.equal(view(restored, saved.dueAt).phase, 'due');
  });
for (const [start, end] of [
  ['11:50', '12:50'],
  ['17:50', '18:50'],
  ['2026-11-07T10:00:00+08:00', '2026-11-07T11:00:00+08:00'],
])
  test(`water continues from ${start} to ${end} without lunch or workday gating`, () => {
    const state = enable(start);
    assert.equal(view(state, time(start) + 1800000).remaining, 1800000);
    assert.equal(view(state, end).phase, 'due');
  });
test('snooze uses ten clock minutes across lunch and shift boundaries', () => {
  for (const at of ['11:58', '17:58']) {
    let state = enable(typeof at === 'string' ? time(at) - 3600000 : at);
    state = act(state, at, { type: 'claim' });
    const next = act(state, at, { type: 'snooze', eventId: view(state, at).eventId });
    assert.equal(next.dueAt, time(at) + 600000);
    assert.equal(next.count, 0);
    assert.equal(view(next, next.dueAt).phase, 'due');
  }
});
test('missed ticks and calendar rollover keep one overdue event rather than rescheduling', () => {
  const state = enable();
  const event = view(state, '10:00').eventId;
  for (const at of ['18:00', '2026-11-07T12:00:00+08:00', '2026-11-09T09:00:00+08:00']) {
    const next = reconcileHydration(state, time(at));
    assert.equal(view(next, at).phase, 'due');
    assert.equal(view(next, at).eventId, event);
    assert.equal(next.dueAt, state.dueAt);
  }
});
test('a confirmed reminder records once and schedules from the accepted action time', () => {
  let state = act(enable(), '18:05', { type: 'claim' });
  const eventId = view(state, '18:05').eventId;
  state = act(state, '18:05', { type: 'drink', eventId });
  const replay = act(state, '18:06', { type: 'drink', eventId });
  assert.equal(replay.count, 1);
  assert.equal(replay.dueAt, time('19:05'));
  assert.deepEqual(replay, state);
});
test('pause lasts until explicit resume and neither dates nor days off reset the count', () => {
  let state = act(enable(), '17:30', { type: 'manual-drink', actionId: 'first' });
  state = act(state, '17:40', { type: 'pause' });
  const later = reconcileHydration(state, time('2026-11-09T09:00:00+08:00'));
  assert.equal(view(later, '2026-11-09T09:00:00+08:00').phase, 'paused');
  assert.equal(later.count, 1);
  const resumed = act(later, '2026-11-09T09:00:00+08:00', { type: 'resume' });
  assert.equal(resumed.dueAt, time('2026-11-09T10:00:00+08:00'));
});
test('clear-count does not move the deadline, change quiet/pause, or erase deduplication IDs', () => {
  let state = act(enable(), '09:10', { type: 'manual-drink', actionId: 'keep' });
  state = act(state, '09:11', { type: 'quiet', minutes: 60 });
  const cleared = act(state, '09:12', { type: 'clear-count' });
  assert.deepEqual(cleared, { ...state, count: 0 });
  assert.equal(act(cleared, '09:13', { type: 'manual-drink', actionId: 'keep' }).count, 0);
});
test('one lease owner handles a due event, ownership expires, and foreign release cannot steal it', () => {
  const state = act(enable(), '10:00', { type: 'claim' });
  const eventId = view(state, '10:00').eventId;
  assert.deepEqual(act(state, '10:00', { type: 'release' }, 'b'), state);
  assert.equal(act(state, '10:00', { type: 'drink', eventId }, 'b').count, 0);
  const now = time('10:00') + HYDRATION_LEASE_MS;
  const next = act(state, now, { type: 'claim' }, 'b');
  assert.equal(next.claim.owner, 'b');
  assert.equal(act(next, now, { type: 'drink', eventId }, 'a').count, 0);
  assert.equal(act(next, now, { type: 'drink', eventId }, 'b').count, 1);
});
test('expired, future and released claims are recoverable without changing the event', () => {
  let state = act(enable(), '10:00', { type: 'claim' });
  const eventId = view(state, '10:00').eventId;
  state.claim.until = time('10:00') + HYDRATION_LEASE_MS + 1;
  const replaced = act(state, '10:00', { type: 'claim' }, 'b');
  assert.equal(replaced.claim.owner, 'b');
  assert.equal(view(replaced, '10:00').eventId, eventId);
  assert.equal(act(replaced, '10:00', { type: 'release' }, 'b').claim, null);
});
test('preference changes invalidate stale confirmations; partial updates preserve the other preference', () => {
  let state = act(enable(), '10:00', { type: 'claim' });
  const eventId = view(state, '10:00').eventId;
  state = act(state, '10:00', { type: 'preferences', interval: 30 });
  assert.equal(act(state, '10:00', { type: 'drink', eventId }).count, 0);
  state = act(state, '10:01', { type: 'preferences', enabled: false });
  assert.equal(state.interval, 30);
  assert.equal(state.claim, null);
});
test('invalid stored fields, preferences and overflowing timestamps fail closed', () => {
  for (const patch of [
    { schema: 99 },
    { interval: 4 },
    { count: -1 },
    { paused: 0 },
    { dueAt: NaN },
    { quietUntil: -1 },
    { recentActions: ['x', 'x'] },
    { claim: { owner: '', until: 1, sequence: 0 } },
    { unknown: true },
  ])
    assert.throws(() => validateHydration({ ...defaultHydration(), ...patch }));
  for (const interval of [0, 4, 241, NaN, 5.5])
    assert.throws(() => act(defaultHydration(), '09:00', { type: 'preferences', interval }));
  assert.throws(() =>
    transitionHydration(
      defaultHydration(),
      { type: 'preferences', enabled: true },
      Number.MAX_SAFE_INTEGER,
      'a',
    ),
  );
});
