import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate } from '../clock.js';

const base = {
  monthlySalary: 10000, workdaysPerMonth: 20,
  start: '09:00', end: '18:00', breakStart: '12:00', breakEnd: '13:00',
  weekdays: [1, 2, 3, 4, 5], timezone: 'Asia/Shanghai',
};
const at = (time, patch = {}) => calculate({ ...base, ...patch }, Date.parse(time));
const night = { start: '22:00', end: '06:00', breakStart: '02:00', breakEnd: '03:00' };
const utc = { timezone: 'UTC' };

for (const [time, status, progress] of [
  ['08:00', 'before', 0], ['09:00', 'working', 0], ['11:00', 'working', 0.25],
  ['12:00', 'lunch', 0.375], ['12:59', 'lunch', 0.375],
  ['13:00', 'working', 0.375], ['17:00', 'working', 0.875], ['18:00', 'done', 1], ['23:59', 'done', 1],
]) test(`same-day boundary ${time}: ${status}`, () => {
  const result = at(`2026-11-02T${time}:00+08:00`);
  assert.equal(result.status, status);
  assert.equal(result.progress, progress);
});

test('before has both actual end countdown and start countdown', () => {
  const result = at('2026-11-02T08:00:00+08:00');
  assert.equal(result.remaining, 36000);
  assert.equal(result.startRemaining, 3600);
});
test('lunch freezes pay but not the real end countdown', () => {
  const first = at('2026-11-02T12:00:00+08:00');
  const second = at('2026-11-02T12:30:00+08:00');
  assert.equal(first.earned, second.earned);
  assert.equal(first.remaining - second.remaining, 1800);
  assert.equal(second.startRemaining, 0);
});
test('equal break endpoints mean no break even outside the shift', () => {
  const result = at('2026-11-02T13:30:00+08:00', { breakStart: '00:00', breakEnd: '00:00' });
  assert.equal(result.progress, 0.5);
  assert.equal(result.total, 9 * 3600);
  assert.equal(result.breakStart, null);
});
test('omitted break is optional', () => {
  const result = at('2026-11-02T13:30:00+08:00', { breakStart: undefined, breakEnd: undefined });
  assert.equal(result.progress, 0.5);
});
test('weekend is rest, not a completed salaried shift', () => {
  const result = at('2026-11-07T20:00:00+08:00');
  assert.equal(result.status, 'rest');
  assert.equal(result.earned, 0);
  assert.equal(result.progress, 0);
  assert.equal(result.remaining, 0);
});
test('night early hours belong to previous start date', () => {
  const result = at('2026-11-03T01:00:00+08:00', night);
  assert.equal(result.shiftDate, '2026-11-02');
  assert.equal(result.date, '2026-11-03');
  assert.equal(result.status, 'working');
  assert.equal(result.elapsed, 3 * 3600);
  assert.equal(result.remaining, 5 * 3600);
});
test('night break after midnight is normalized into the shift', () => {
  const result = at('2026-11-03T02:30:00+08:00', night);
  assert.equal(result.status, 'lunch');
  assert.equal(result.elapsed, 4 * 3600);
  assert.equal(result.total, 7 * 3600);
});
test('break spanning midnight is normalized', () => {
  const result = at('2026-11-03T00:15:00+08:00', { ...night, breakStart: '23:30', breakEnd: '00:30' });
  assert.equal(result.status, 'lunch');
  assert.equal(result.elapsed, 1.5 * 3600);
});
test('Saturday early night shift uses working Friday', () => {
  const result = at('2026-11-07T04:00:00+08:00', night);
  assert.equal(result.status, 'working');
  assert.equal(result.shiftDate, '2026-11-06');
});
test('night completed status retained through the following daytime', () => {
  for (const time of ['06:00', '12:00', '21:59']) {
    const result = at(`2026-11-03T${time}:00+08:00`, night);
    assert.equal(result.status, 'done');
    assert.equal(result.shiftDate, '2026-11-02');
    assert.equal(result.earned, result.daily);
  }
});
test('new night shift starts exactly at 22:00', () => {
  const result = at('2026-11-03T22:00:00+08:00', night);
  assert.equal(result.status, 'working');
  assert.equal(result.shiftDate, '2026-11-03');
  assert.equal(result.progress, 0);
});
test('Monday early hours still belong to nonworking Sunday', () => {
  assert.equal(at('2026-11-02T04:00:00+08:00', night).status, 'rest');
});
test('Monday daytime is before when Sunday did not work', () => {
  for (const time of ['06:00', '12:00', '21:59']) {
    const result = at(`2026-11-02T${time}:00+08:00`, night);
    assert.equal(result.status, 'before');
    assert.equal(result.shiftDate, '2026-11-02');
    assert.ok(result.startRemaining > 0);
  }
});
test('Saturday daytime retains Friday done; Saturday night is rest', () => {
  assert.equal(at('2026-11-07T12:00:00+08:00', night).status, 'done');
  assert.equal(at('2026-11-07T22:00:00+08:00', night).status, 'rest');
});
test('configured Sunday workday overrides weekday assumptions', () => {
  const result = at('2026-11-08T10:00:00+08:00', { weekdays: [0] });
  assert.equal(result.status, 'working');
});
test('daily salary ignores monthly fields and truncates cents', () => {
  const result = at('2026-11-02T18:00:00+08:00', {
    payMode: 'daily', dailySalary: 123.459, monthlySalary: undefined, workdaysPerMonth: undefined,
  });
  assert.equal(result.payMode, 'daily');
  assert.equal(result.daily, 123.45);
  assert.equal(result.earned, 123.45);
});
test('decimal division does not lose a cent at completion', () => {
  const result = at('2026-11-02T18:00:00+08:00', { monthlySalary: 0.29, workdaysPerMonth: 1 });
  assert.equal(result.dailyCents, 29);
  assert.equal(result.earnedCents, 29);
});
test('hourly and partial salary truncate rather than round', () => {
  const result = at('2026-11-02T10:00:00+08:00', { payMode: 'daily', dailySalary: 100.01 });
  assert.equal(result.earned, 12.5);
  assert.equal(result.hourly, 12.5);
});
test('zero salary remains finite', () => {
  const result = at('2026-11-02T10:00:00+08:00', { monthlySalary: 0 });
  assert.equal(result.earned, 0);
  assert.equal(result.hourly, 0);
});
test('scientific notation salaries use exact decimal arithmetic', () => {
  assert.equal(at('2026-11-02T18:00:00+08:00', { payMode: 'daily', dailySalary: 1e-7 }).daily, 0);
  assert.equal(at('2026-11-02T18:00:00+08:00', { payMode: 'daily', dailySalary: 1e7 }).daily, 1e7);
});
test('absolute timestamp and configured timezone determine local date and status', () => {
  const timestamp = '2026-11-02T01:00:00Z';
  assert.equal(at(timestamp).status, 'working');
  assert.equal(at(timestamp, utc).status, 'before');
  const la = at(timestamp, { timezone: 'America/Los_Angeles' });
  assert.equal(la.status, 'rest');
  assert.equal(la.date, '2026-11-01');
});
test('fractional-zone offset is handled independently of system timezone', () => {
  const result = at('2026-11-02T03:15:00Z', { timezone: 'Asia/Kathmandu' });
  assert.equal(result.status, 'working');
  assert.equal(result.progress, 0);
});
test('DST spring night countdown measures real elapsed seconds', () => {
  const patch = { ...night, timezone: 'America/New_York', weekdays: [6], breakStart: '00:00', breakEnd: '00:00' };
  const result = at('2026-03-08T06:00:00Z', patch);
  assert.equal(result.shiftDate, '2026-03-07');
  assert.equal(result.total, 7 * 3600);
  assert.equal(result.elapsed, 3 * 3600);
  assert.equal(result.remaining, 4 * 3600);
});
test('DST fall night countdown includes the repeated hour', () => {
  const patch = { ...night, timezone: 'America/New_York', weekdays: [6], breakStart: '00:00', breakEnd: '00:00' };
  const result = at('2026-11-01T06:30:00Z', patch);
  assert.equal(result.total, 9 * 3600);
  assert.equal(result.elapsed, 4.5 * 3600);
  assert.equal(result.remaining, 4.5 * 3600);
});
test('subsecond countdown rounds upwards and salary remains truncated', () => {
  const result = at('2026-11-02T17:59:59.999+08:00');
  assert.equal(result.remaining, 1);
  assert.equal(result.earned, 499.99);
});
for (const [label, patch, begin] of [
  ['monthly lunch', {}, '2026-11-02T00:00:00+08:00'],
  ['daily no lunch', { payMode: 'daily', dailySalary: 109.99, breakStart: '00:00', breakEnd: '00:00' }, '2026-11-02T00:00:00+08:00'],
  ['night cross-midnight lunch', { ...night, breakStart: '23:30', breakEnd: '00:30' }, '2026-11-02T22:00:00+08:00'],
  ['decimal cents', { monthlySalary: 0.29, workdaysPerMonth: 1 }, '2026-11-02T00:00:00+08:00'],
]) test(`whole-day minute grid: monotone and bounded (${label})`, () => {
  let previous = 0;
  const start = Date.parse(begin);
  // Stop before the next civil day / shift resets its earnings.
  const last = 1439;
  for (let minute = 0; minute <= last; minute++) {
    const result = calculate({ ...base, ...patch }, start + minute * 60000);
    assert.ok(result.earnedCents >= previous, `${label} minute ${minute} regressed`);
    assert.ok(result.earnedCents <= result.dailyCents);
    assert.ok(result.progress >= 0 && result.progress <= 1);
    assert.equal(Number.isInteger(result.earnedCents), true);
    previous = result.earnedCents;
  }
  assert.equal(previous, calculate({ ...base, ...patch }, start).dailyCents);
});
test('invalid empty shift or external break fails explicitly', () => {
  assert.throws(() => at('2026-11-02T10:00:00Z', { start: '09:00', end: '09:00' }), RangeError);
  assert.throws(() => at('2026-11-02T10:00:00Z', { breakStart: '18:00', breakEnd: '19:00' }), RangeError);
});
