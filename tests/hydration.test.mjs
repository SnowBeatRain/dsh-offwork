import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate } from '../clock.js';
import {
  defaultHydration,
  validateHydration,
  hydrationContext,
  reconcileHydration,
  hydrationView,
  transitionHydration,
  HYDRATION_LEASE_MS,
} from '../hydration.js';

const settings = {
  payMode: 'monthly',
  monthlySalary: 12000,
  dailySalary: 600,
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
const act = (state, at, action, patch = {}, owner = 'tab-a') =>
  transitionHydration(state, context(at, patch), action, time(at), owner);
const enable = (at = '09:00', interval = 60, patch = {}) =>
  act(defaultHydration(), at, { type: 'preferences', enabled: true, interval }, patch);
const view = (state, at, patch = {}) =>
  hydrationView(reconcileHydration(state, context(at, patch)), context(at, patch));
const claim = (state, at, patch = {}, owner = 'tab-a') =>
  act(state, at, { type: 'claim' }, patch, owner);

test('off by default; enabling mid-shift starts a full interval, not catch-up', () => {
  assert.equal(view(defaultHydration(), '11:45').phase, 'off');
  const state = enable('10:15');
  assert.equal(view(state, '10:15').remaining, 3600000);
  assert.equal(view(state, '11:14').phase, 'countdown');
  assert.equal(view(state, '11:15').phase, 'due');
});

for (const interval of [5, 15, 17, 30, 45, 60, 90, 120, 240]) {
  test(`saving ${interval} minutes applies that interval instead of the 60-minute default`, () => {
    const initial = enable('09:00');
    const saved = act(initial, '09:10', { type: 'preferences', enabled: true, interval });
    assert.equal(saved.interval, interval);
    const elapsed = context('09:10').elapsed;
    // Saving an unchanged 60-minute interval keeps the existing cycle.
    const anchor = interval === 60 ? 0 : elapsed;
    assert.equal(saved.shift.due, anchor + interval * 60000);
    const reopened = validateHydration(JSON.parse(JSON.stringify(saved)));
    assert.equal(reopened.interval, interval);
    const deadline =
      time('09:00') + saved.shift.due + (saved.shift.due >= 3 * 3600000 ? 3600000 : 0);
    const before = hydrationContext(settings, calculate(settings, deadline - 1));
    const atDue = hydrationContext(settings, calculate(settings, deadline));
    assert.equal(hydrationView(reopened, before).phase, 'countdown');
    assert.equal(hydrationView(reopened, atDue).phase, 'due');
  });
}

test('break freezes working-time countdown; snooze crosses break', () => {
  const state = enable('11:10');
  assert.equal(view(state, '12:00').phase, 'break');
  assert.equal(view(state, '12:50').remaining, 600000);
  assert.equal(view(state, '13:10').phase, 'due');
  let snoozed = claim(enable('10:58'), '11:58');
  snoozed = act(snoozed, '11:58', { type: 'snooze', eventId: view(snoozed, '11:58').eventId });
  assert.equal(view(snoozed, '12:30').remaining, 480000);
  assert.equal(view(snoozed, '13:07').phase, 'countdown');
  assert.equal(view(snoozed, '13:08').phase, 'due');
  assert.equal(snoozed.shift.count, 0);
});

test('completion is idempotent and schedules from actual click, not old due time', () => {
  let state = claim(enable(), '10:03');
  const eventId = view(state, '10:03').eventId;
  state = act(state, '10:03', { type: 'drink', eventId });
  state = act(state, '10:03', { type: 'drink', eventId });
  assert.equal(state.shift.count, 1);
  assert.equal(view(state, '11:02').phase, 'countdown');
  assert.equal(view(state, '11:03').phase, 'due');
});

test('hours of missed ticks yield a single stable event; shift end discards it', () => {
  const state = enable();
  assert.equal(view(state, '10:00').eventId, view(state, '17:30').eventId);
  assert.equal(view(state, '17:30').phase, 'due');
  assert.equal(view(state, '18:00').phase, 'waiting');
  assert.equal(view(state, '2026-11-07T11:00:00+08:00').phase, 'waiting');
});

test('pause persists through overnight midnight and resets at a new shift', () => {
  const night = { start: '22:00', end: '06:00', breakStart: '02:00', breakEnd: '03:00' };
  let state = enable('2026-11-06T22:00:00+08:00', 60, night);
  state = act(state, '2026-11-06T23:00:00+08:00', { type: 'pause' }, night);
  assert.equal(view(state, '2026-11-07T01:00:00+08:00', night).phase, 'paused');
  assert.equal(view(state, '2026-11-07T22:00:00+08:00', night).phase, 'waiting');
  const next = reconcileHydration(state, context('2026-11-09T22:00:00+08:00', night));
  assert.equal(hydrationView(next, context('2026-11-09T22:00:00+08:00', night)).phase, 'countdown');
  assert.equal(next.shift.paused, false);
});

test('resume and interval changes restart; count reset does not alter timer', () => {
  let state = claim(enable(), '10:00');
  state = act(state, '10:00', { type: 'drink', eventId: view(state, '10:00').eventId });
  const due = state.shift.due;
  state = act(state, '10:10', { type: 'clear-count' });
  assert.equal(state.shift.count, 0);
  assert.equal(state.shift.due, due);
  state = act(state, '10:10', { type: 'pause' });
  state = act(state, '10:40', { type: 'resume' });
  assert.equal(view(state, '10:40').remaining, 3600000);
  state = act(state, '10:50', { type: 'preferences', enabled: true, interval: 5 });
  assert.equal(view(state, '10:50').remaining, 300000);
  assert.equal(view(state, '10:55').phase, 'due');
});

test('schedule changes retain same-shift count and pause; pay changes do not reschedule', () => {
  let state = claim(enable(), '10:00');
  state = act(state, '10:00', { type: 'drink', eventId: view(state, '10:00').eventId });
  const oldDue = state.shift.due;
  assert.equal(
    reconcileHydration(state, context('10:30', { monthlySalary: 15000 })).shift.due,
    oldDue,
  );
  state = act(state, '10:30', { type: 'pause' });
  const shifted = reconcileHydration(state, context('10:45', { end: '19:00' }));
  assert.equal(shifted.shift.count, 1);
  assert.equal(shifted.shift.paused, true);
  assert.equal(shifted.shift.due - context('10:45', { end: '19:00' }).elapsed, 3600000);
});

test('only the current lease owner can process a live event; expired lease is transferred', () => {
  let state = claim(enable(), '10:00');
  const eventId = view(state, '10:00').eventId;
  state = claim(state, '10:00', {}, 'tab-b');
  assert.equal(state.shift.claim.owner, 'tab-a');
  assert.equal(act(state, '10:00', { type: 'drink', eventId }, {}, 'tab-b').shift.count, 0);
  const at = time('10:00') + HYDRATION_LEASE_MS + 1;
  const ctx = hydrationContext(settings, calculate(settings, at));
  state = transitionHydration(state, ctx, { type: 'claim' }, at, 'tab-b');
  assert.equal(state.shift.claim.owner, 'tab-b');
  assert.equal(
    transitionHydration(state, ctx, { type: 'drink', eventId }, at, 'tab-a').shift.count,
    0,
  );
  assert.equal(
    transitionHydration(state, ctx, { type: 'drink', eventId }, at, 'tab-b').shift.count,
    1,
  );
});

test('release, disabled settings and break boundaries remove a displayed lease', () => {
  let state = claim(enable(), '10:00');
  assert.equal(act(state, '10:00', { type: 'release' }).shift.claim, null);
  assert.equal(
    act(state, '10:00', { type: 'preferences', enabled: false, interval: 60 }).shift.claim,
    null,
  );
  state = claim(enable('11:00'), '11:59');
  assert.equal(reconcileHydration(state, context('12:00')).shift.claim, null);
  assert.deepEqual(act(state, '12:00', { type: 'reset' }), defaultHydration());
});

test('at exact shift end there is no reminder; first opening tomorrow starts fresh', () => {
  const state = enable('17:00');
  assert.equal(view(state, '17:00').phase, 'finished');
  assert.notEqual(view(state, '18:00').phase, 'due');
  assert.equal(view(state, '2026-11-05T10:25:00+08:00').remaining, 3600000);
});

test('DST forward and backward transitions count actual paid elapsed time', () => {
  const patch = {
    timezone: 'America/New_York',
    start: '22:00',
    end: '06:00',
    breakStart: '00:00',
    breakEnd: '00:00',
    weekdays: [6],
  };
  const spring = enable('2026-03-08T06:30:00Z', 60, patch);
  assert.equal(view(spring, '2026-03-08T07:00:00Z', patch).remaining, 1800000);
  assert.equal(view(spring, '2026-03-08T07:30:00Z', patch).phase, 'due');
  const fall = enable('2026-11-01T05:30:00Z', 60, patch);
  assert.equal(view(fall, '2026-11-01T06:30:00Z', patch).phase, 'due');
});

test('malformed data, unknown schemas and invalid preferences fail closed', () => {
  for (const data of [
    null,
    {},
    [],
    { ...defaultHydration(), schema: 2 },
    { ...defaultHydration(), interval: 0 },
    { ...defaultHydration(), shift: {} },
  ]) {
    assert.throws(() => validateHydration(data));
  }
  for (const interval of [0, 4, 241, 5.5, NaN]) assert.throws(() => enable('09:00', interval));
  const state = enable();
  assert.deepEqual(validateHydration(state), state);
  assert.equal(hydrationView(state, null).phase, 'waiting');
});
