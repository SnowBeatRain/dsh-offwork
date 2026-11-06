import test from 'node:test';
import assert from 'node:assert/strict';
import { classicClockPresentation } from '../ui-utils.js';
import { calculate } from '../clock.js';
const settings = {
  payMode: 'monthly',
  monthlySalary: 10000,
  workdaysPerMonth: 21.75,
  dailySalary: 0,
  start: '09:00',
  end: '18:00',
  breakStart: '12:00',
  breakEnd: '13:00',
  weekdays: [1, 2, 3, 4, 5],
  timezone: 'Asia/Shanghai',
};
const present = (time, config = settings) => {
  const now = Date.parse(time);
  return classicClockPresentation({
    hasSession: true,
    loaded: true,
    configured: true,
    failed: false,
    state: calculate(config, now),
    now,
  });
};
test('classic overview distinguishes startup, missing configuration and failed reads without a zero countdown', () => {
  const base = {
    hasSession: true,
    loaded: true,
    configured: true,
    failed: false,
    state: null,
    now: 0,
  };
  for (const [patch, phase] of [
    [{ hasSession: false }, 'waiting'],
    [{ loaded: false }, 'loading'],
    [{ configured: false }, 'setup'],
    [{ failed: true }, 'error'],
  ]) {
    const view = classicClockPresentation({ ...base, ...patch });
    assert.equal(view.phase, phase);
    assert.equal(view.seconds, null);
  }
});
test('classic overview shows the correct countdown target for before, working and lunch', () => {
  assert.equal(present('2026-11-05T00:00:00Z').seconds, 3600);
  const working = present('2026-11-05T02:00:00Z');
  assert.equal(working.phase, 'working');
  assert.equal(working.seconds, 8 * 3600);
  const lunch = present('2026-11-05T04:30:00Z');
  assert.equal(lunch.phase, 'lunch');
  assert.equal(lunch.seconds, 1800);
});
test('completed shifts and rest days show a state instead of a meaningless zero', () => {
  for (const [date, phase] of [
    ['2026-11-05T11:00:00Z', 'done'],
    ['2026-11-07T02:00:00Z', 'rest'],
  ]) {
    const result = present(date);
    assert.equal(result.phase, phase);
    assert.equal(result.seconds, null);
  }
  const night = {
    ...settings,
    start: '22:00',
    end: '06:00',
    breakStart: '02:00',
    breakEnd: '02:00',
  };
  assert.equal(present('2026-11-05T15:00:00Z', night).seconds, 7 * 3600);
  const completed = present('2026-11-05T23:00:00Z', night);
  assert.equal(completed.phase, 'done');
  assert.equal(completed.seconds, null);
});
