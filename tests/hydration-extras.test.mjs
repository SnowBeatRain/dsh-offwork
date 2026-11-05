import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate } from '../clock.js';
import {
  defaultHydration,
  validateHydration,
  hydrationContext,
  hydrationView,
  transitionHydration,
  HYDRATION_ACTION_LIMIT,
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
const time = (text) => Date.parse(text.includes('T') ? text : `2026-11-04T${text}:00+08:00`);
const context = (text, patch = {}) => {
  const config = { ...settings, ...patch };
  return hydrationContext(config, calculate(config, time(text)));
};
const act = (s, at, a, patch = {}, owner = 'a') =>
  transitionHydration(s, context(at, patch), a, time(at), owner);
const view = (s, at, patch = {}) => hydrationView(s, context(at, patch), time(at));
const enabled = (at = '09:00', interval = 60, patch = {}) =>
  act(defaultHydration(), at, { type: 'preferences', enabled: true, interval }, patch);
const manual = (at, id, patch = {}, extra = {}) => ({
  type: 'manual-drink',
  actionId: id,
  shiftId: context(at, patch).id,
  ...extra,
});

test('manual check-in restarts an enabled timer and retries are idempotent', () => {
  const initial = enabled();
  const action = manual('09:40', 'glass-1');
  const next = act(initial, '09:40', action);
  assert.equal(next.shift.count, 1);
  assert.equal(view(next, '09:40').remaining, 3600000);
  assert.deepEqual(act(next, '09:45', action), next);
  assert.equal(initial.shift.count, 0);
});

test('manual check-ins work with reminders off, preserve pause, and ignore off-hours', () => {
  let state = act(defaultHydration(), '10:00', manual('10:00', 'off'));
  assert.equal(state.enabled, false);
  assert.equal(state.shift.count, 1);
  state = act(state, '10:00', { type: 'preferences', enabled: true });
  state = act(state, '10:10', { type: 'pause' });
  const due = state.shift.due;
  state = act(state, '10:20', manual('10:20', 'paused'));
  assert.equal(state.shift.count, 2);
  assert.equal(state.shift.paused, true);
  assert.equal(state.shift.due, due);
  for (const at of ['08:00', '18:00', '2026-11-07T10:00:00+08:00']) {
    const result = act(defaultHydration(), at, manual(at, at));
    assert.equal(result.shift, null);
  }
});

test('lunch check-in starts a full working interval after lunch', () => {
  const state = act(enabled('11:00', 5), '12:30', manual('12:30', 'lunch'));
  assert.equal(state.shift.count, 1);
  assert.equal(view(state, '12:59').phase, 'break');
  assert.equal(view(state, '13:00').remaining, 300000);
  assert.equal(view(state, '13:05').phase, 'due');
});

test('manual and prompted confirmation of the same due event count once in either order', () => {
  const initial = act(enabled(), '10:00', { type: 'claim' });
  const eventId = view(initial, '10:00').eventId;
  const actions = [manual('10:00', 'due', {}, { eventId }), { type: 'drink', eventId }];
  for (const order of [actions, [...actions].reverse()]) {
    let state = initial;
    for (const action of order) state = act(state, '10:00', action);
    assert.equal(state.shift.count, 1);
    assert.equal(state.shift.claim, null);
  }
});

test('manual request IDs are bounded, distinct records count, and old-shift retries cannot count tomorrow', () => {
  let state = enabled();
  for (let i = 0; i < HYDRATION_ACTION_LIMIT + 3; i++)
    state = act(state, '09:10', manual('09:10', String(i)));
  assert.equal(state.shift.count, HYDRATION_ACTION_LIMIT + 3);
  assert.equal(state.shift.recentActions.length, HYDRATION_ACTION_LIMIT);
  assert.equal(validateHydration(state).shift.count, state.shift.count);
  const tomorrow = act(state, '2026-11-05T09:10:00+08:00', manual('09:10', 'old'));
  assert.equal(tomorrow.shift.count, 0);
});

test('quiet time suppresses a due prompt, keeps its work deadline, and resumes once at expiry', () => {
  let state = act(enabled('09:00', 5), '09:05', { type: 'claim' });
  const oldEvent = view(state, '09:05').eventId;
  const due = state.shift.due;
  state = act(state, '09:05', { type: 'quiet', minutes: 30 });
  assert.equal(state.shift.due, due);
  assert.equal(state.shift.claim, null);
  assert.equal(view(state, '09:34').phase, 'quiet');
  assert.equal(view(state, '09:34').quietRemaining, 60000);
  assert.equal(act(state, '09:10', { type: 'claim' }).shift.claim, null);
  assert.equal(act(state, '09:10', { type: 'drink', eventId: oldEvent }).shift.count, 0);
  assert.equal(view(state, '09:35').phase, 'due');
  const resumed = act(state, '09:35', { type: 'claim' });
  assert.equal(resumed.shift.quietUntil, 0);
  assert.equal(resumed.shift.claim.owner, 'a');
  assert.equal(view(resumed, '10:30').eventId, view(resumed, '09:35').eventId);
});

test('quiet time uses natural minutes across lunch and never prompts during lunch', () => {
  let state = act(enabled('11:00', 5), '11:50', { type: 'quiet', minutes: 30 });
  assert.equal(view(state, '12:10').quietRemaining, 600000);
  assert.equal(view(state, '12:20').phase, 'break');
  assert.equal(view(state, '13:00').phase, 'due');
  state = act(state, '12:30', manual('12:30', 'lunch-quiet'));
  assert.equal(view(state, '13:00').remaining, 300000);
});

test('manual and quiet actions commute and a check-in does not end quiet time', () => {
  const actions = [manual('09:10', 'concurrent'), { type: 'quiet', minutes: 30 }];
  for (const order of [actions, [...actions].reverse()]) {
    let state = enabled('09:00', 5);
    for (const a of order) state = act(state, '09:10', a);
    assert.equal(state.shift.count, 1);
    assert.equal(state.shift.quietUntil, time('09:40'));
    assert.equal(state.shift.due, context('09:15').elapsed);
    assert.equal(view(state, '09:14').phase, 'quiet');
  }
});

test('quiet duration replaces instead of adding, and can be ended early', () => {
  let state = act(enabled(), '09:05', { type: 'quiet', minutes: 30 });
  state = act(state, '09:10', { type: 'quiet', minutes: 60 });
  assert.equal(state.shift.quietUntil, time('10:10'));
  state = act(state, '09:20', { type: 'end-quiet' });
  assert.equal(view(state, '09:20').phase, 'countdown');
  assert.equal(state.shift.due, 3600000);
  for (const minutes of [0, 10, 31, 90])
    assert.throws(() => act(enabled(), '09:10', { type: 'quiet', minutes }));
});

test('pause and disable clear quiet time, expiry never cancels a full-shift pause', () => {
  const quiet = act(enabled(), '09:05', { type: 'quiet', minutes: 60 });
  const paused = act(quiet, '09:10', { type: 'pause' });
  assert.equal(paused.shift.quietUntil, 0);
  assert.equal(view(paused, '11:00').phase, 'paused');
  assert.equal(act(paused, '09:15', { type: 'quiet', minutes: 30 }).shift.quietUntil, 0);
  const off = act(quiet, '09:10', { type: 'preferences', enabled: false });
  assert.equal(off.shift.quietUntil, 0);
  const resumed = act(paused, '09:20', { type: 'resume' });
  assert.equal(view(resumed, '09:20').remaining, 3600000);
});

test('quiet mode ends at shift end and does not leak into another shift, including overnight', () => {
  let state = act(enabled('17:00', 5), '17:50', { type: 'quiet', minutes: 60 });
  assert.equal(state.shift.quietUntil, time('18:00'));
  assert.equal(view(state, '18:00').phase, 'waiting');
  state = act(state, '2026-11-05T09:00:00+08:00', { type: 'tick' });
  assert.equal(state.shift.quietUntil, 0);
  const night = { start: '22:00', end: '06:00', breakStart: '02:00', breakEnd: '03:00' };
  let overnight = enabled('2026-11-04T22:00:00+08:00', 5, night);
  overnight = act(overnight, '2026-11-04T23:50:00+08:00', { type: 'quiet', minutes: 30 }, night);
  assert.equal(view(overnight, '2026-11-05T00:10:00+08:00', night).quietRemaining, 600000);
  assert.equal(view(overnight, '2026-11-05T00:20:00+08:00', night).phase, 'due');
});

test('same-shift schedule edits preserve quiet intent, clamp to new end and reject stale manual changes', () => {
  const state = act(enabled('17:00', 5), '17:05', { type: 'quiet', minutes: 30 });
  const patch = { end: '17:20' };
  const updated = act(state, '17:10', { type: 'tick', baseSchedule: state.shift.schedule }, patch);
  assert.equal(updated.shift.quietUntil, time('17:20'));
  assert.deepEqual(act(updated, '17:11', manual('17:11', 'stale')), updated);
  assert.deepEqual(act(updated, '17:11', { type: 'quiet', minutes: 60 }), updated);
});

test('schema 1 migrates with preferences, count, pause and due intact while revoking the lease', () => {
  const legacy = act(enabled('09:00', 5), '09:05', { type: 'claim' });
  legacy.schema = 1;
  legacy.shift.count = 7;
  legacy.shift.paused = true;
  delete legacy.shift.quietUntil;
  delete legacy.shift.recentActions;
  const upgraded = validateHydration(legacy);
  assert.equal(upgraded.schema, 2);
  assert.equal(upgraded.interval, 5);
  assert.equal(upgraded.shift.count, 7);
  assert.equal(upgraded.shift.paused, true);
  assert.equal(upgraded.shift.due, legacy.shift.due);
  assert.equal(upgraded.shift.claim, null);
  assert.equal(upgraded.shift.sequence, legacy.shift.sequence + 1);
  assert.equal(upgraded.shift.quietUntil, 0);
  assert.deepEqual(upgraded.shift.recentActions, []);
  assert.deepEqual(validateHydration(upgraded), upgraded);
});

test('stale pause and resume actions do not postpone a timer or pause disabled reminders', () => {
  let state = act(enabled(), '09:10', { type: 'pause' });
  state = act(state, '09:20', { type: 'resume' });
  assert.deepEqual(act(state, '09:30', { type: 'resume' }), state);
  state = act(state, '09:30', { type: 'preferences', enabled: false });
  assert.deepEqual(act(state, '09:40', { type: 'pause' }), state);
});

test('malformed new fields and malformed legacy data are rejected', () => {
  for (const patch of [
    { quietUntil: -1 },
    { quietUntil: NaN },
    { recentActions: null },
    { recentActions: ['same', 'same'] },
    { recentActions: Array.from({ length: 65 }, (_, i) => String(i)) },
  ]) {
    const state = enabled();
    Object.assign(state.shift, patch);
    assert.throws(() => validateHydration(state));
  }
  const legacy = enabled();
  legacy.schema = 1;
  assert.throws(() => validateHydration(legacy));
});
