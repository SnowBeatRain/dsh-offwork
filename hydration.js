import { calculate } from './clock.js';

// Hydration uses wall-clock deadlines, independently of salary and work schedules.
export const HYDRATION_SCHEMA = 3;
export const HYDRATION_ACTION_LIMIT = 64;
export const HYDRATION_LEASE_MS = 8000;
const hydrationInteger = (number, max = Number.MAX_SAFE_INTEGER) =>
  Number.isSafeInteger(number) && number >= 0 && number <= max;
const hydrationText = (value, max = 1024) =>
  typeof value === 'string' && value.length > 0 && value.length <= max;
const hydrationKeys = (value, keys) =>
  value &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  Object.keys(value).every((key) => keys.includes(key));
const hydrationClaim = (claim) =>
  claim === null ||
  (hydrationKeys(claim, ['owner', 'until', 'sequence']) &&
    hydrationText(claim.owner) &&
    hydrationInteger(claim.until) &&
    hydrationInteger(claim.sequence));
const hydrationActions = (actions) =>
  Array.isArray(actions) &&
  actions.length <= HYDRATION_ACTION_LIMIT &&
  actions.every((id) => hydrationText(id, 128)) &&
  new Set(actions).size === actions.length;

export function defaultHydration() {
  return {
    schema: HYDRATION_SCHEMA,
    revision: 0,
    enabled: false,
    interval: 60,
    count: 0,
    paused: false,
    dueAt: 0,
    sequence: 0,
    claim: null,
    quietUntil: 0,
    recentActions: [],
  };
}
export function validateHydration(value) {
  if (
    !hydrationKeys(value, [
      'schema',
      'revision',
      'enabled',
      'interval',
      'count',
      'paused',
      'dueAt',
      'sequence',
      'claim',
      'quietUntil',
      'recentActions',
    ]) ||
    value.schema !== HYDRATION_SCHEMA ||
    !hydrationInteger(value.revision) ||
    typeof value.enabled !== 'boolean' ||
    !hydrationInteger(value.interval, 240) ||
    value.interval < 5 ||
    !hydrationInteger(value.count, 1000000) ||
    typeof value.paused !== 'boolean' ||
    !hydrationInteger(value.dueAt) ||
    !hydrationInteger(value.sequence) ||
    !hydrationInteger(value.quietUntil) ||
    !hydrationClaim(value.claim) ||
    !hydrationActions(value.recentActions)
  )
    throw new Error('Invalid hydration data');
  return structuredClone(value);
}

function validateLegacyHydration(value) {
  if (
    !hydrationKeys(value, ['schema', 'revision', 'enabled', 'interval', 'shift']) ||
    ![1, 2].includes(value.schema) ||
    !hydrationInteger(value.revision) ||
    typeof value.enabled !== 'boolean' ||
    !hydrationInteger(value.interval, 240) ||
    value.interval < 5
  )
    throw new Error('Invalid legacy hydration data');
  const shift = value.shift;
  if (
    shift !== null &&
    (!hydrationKeys(shift, [
      'id',
      'schedule',
      'config',
      'count',
      'paused',
      'due',
      'sequence',
      'claim',
      ...(value.schema === 2 ? ['quietUntil', 'recentActions'] : []),
    ]) ||
      !hydrationText(shift.id) ||
      !hydrationText(shift.schedule) ||
      !hydrationText(shift.config) ||
      !hydrationInteger(shift.count, 1000000) ||
      typeof shift.paused !== 'boolean' ||
      !hydrationInteger(shift.due, 172800000) ||
      !hydrationInteger(shift.sequence) ||
      !hydrationClaim(shift.claim) ||
      (value.schema === 2 &&
        (!hydrationInteger(shift.quietUntil) || !hydrationActions(shift.recentActions))))
  )
    throw new Error('Invalid legacy hydration record');
  return structuredClone(value);
}

// Invoked only inside the one-time, two-store migration transaction. The original
// work-based record stays untouched in its old object store for preservation.
export function migrateHydration(value, now) {
  if (!hydrationInteger(now)) throw new Error('Invalid hydration migration time');
  if (value === undefined) return defaultHydration();
  const old = validateLegacyHydration(value),
    next = defaultHydration(),
    shift = old.shift;
  next.revision = old.revision;
  next.enabled = old.enabled;
  next.interval = old.interval;
  let remaining = next.interval * 60000;
  if (shift) {
    next.count = shift.count;
    next.paused = shift.paused;
    next.sequence = shift.sequence + 1;
    next.quietUntil = old.schema === 2 && shift.quietUntil > now ? shift.quietUntil : 0;
    next.recentActions = old.schema === 2 ? shift.recentActions : [];
    // A matching retained shift supplies the remaining paid minutes. Convert
    // that remainder once; never consult work settings again after migration.
    try {
      const [timezone, start, end, breakStart, breakEnd, weekdays] = JSON.parse(shift.config);
      const clock = calculate(
        { timezone, start, end, breakStart, breakEnd, weekdays, payMode: 'daily', dailySalary: 1 },
        now,
      );
      const id = JSON.stringify([timezone, clock.shiftDate]);
      const schedule = JSON.stringify([
        start,
        end,
        breakStart,
        breakEnd,
        [...weekdays].sort(),
        clock.shiftStart,
        clock.shiftEnd,
      ]);
      if (id === shift.id && schedule === shift.schedule && !shift.paused)
        remaining = Math.max(0, shift.due - Math.floor(clock.elapsed * 1000));
    } catch {
      /* Older/unknown schedule text: start one full configured interval. */
    }
  }
  next.dueAt = next.enabled ? now + remaining : 0;
  return validateHydration(next);
}

export function reconcileHydration(state, now) {
  const next = validateHydration(state);
  if (!hydrationInteger(now)) throw new Error('Invalid reminder time');
  if (next.enabled && next.dueAt === 0) next.dueAt = now + next.interval * 60000;
  if (next.quietUntil <= now) next.quietUntil = 0;
  if (!next.enabled || next.paused || next.quietUntil > now) next.claim = null;
  return validateHydration(next);
}
export function hydrationView(state, now) {
  const remaining = state.dueAt ? Math.max(0, state.dueAt - now) : state.interval * 60000;
  const quietRemaining = state.enabled && !state.paused ? Math.max(0, state.quietUntil - now) : 0;
  const phase = !state.enabled
    ? 'off'
    : state.paused
      ? 'paused'
      : quietRemaining > 0
        ? 'quiet'
        : remaining === 0
          ? 'due'
          : 'countdown';
  return {
    phase,
    count: state.count,
    remaining,
    quietRemaining,
    eventId:
      state.enabled && state.dueAt
        ? JSON.stringify(['wall-clock', state.sequence, state.dueAt])
        : null,
  };
}
export function transitionHydration(state, action, now, owner) {
  let next = reconcileHydration(state, now);
  const finish = () => validateHydration(next);
  const invalidate = () => {
    next.sequence++;
    next.claim = null;
  };
  const restart = () => {
    next.dueAt = now + next.interval * 60000;
    invalidate();
  };
  if (action.type === 'reset') return defaultHydration();
  if (action.type === 'preferences') {
    const enabled = Object.hasOwn(action, 'enabled') ? action.enabled : next.enabled;
    const interval = Object.hasOwn(action, 'interval') ? action.interval : next.interval;
    if (
      typeof enabled !== 'boolean' ||
      !Number.isInteger(interval) ||
      interval < 5 ||
      interval > 240
    )
      throw new Error('Invalid reminder preferences');
    const changed = enabled !== next.enabled || interval !== next.interval;
    next.enabled = enabled;
    next.interval = interval;
    if (!enabled) {
      next.claim = null;
      next.quietUntil = 0;
    }
    if (changed) {
      if (enabled) restart();
      else invalidate();
    }
    return finish();
  }
  const view = hydrationView(next, now);
  const validClaim =
    next.claim &&
    next.claim.owner === owner &&
    next.claim.sequence === next.sequence &&
    next.claim.until > now &&
    next.claim.until <= now + HYDRATION_LEASE_MS;
  if (action.type === 'release') {
    if (next.claim?.owner === owner) next.claim = null;
  } else if (action.type === 'manual-drink') {
    if (!hydrationText(action.actionId, 128)) throw new Error('Invalid hydration action id');
    if (
      next.recentActions.includes(action.actionId) ||
      (action.eventId !== undefined && action.eventId !== view.eventId)
    )
      return finish();
    next.recentActions = [
      ...next.recentActions.slice(-(HYDRATION_ACTION_LIMIT - 1)),
      action.actionId,
    ];
    next.count = Math.min(1000000, next.count + 1);
    if (next.enabled && !next.paused) restart();
    else invalidate();
  } else if (action.type === 'quiet' && next.enabled && !next.paused) {
    if (![30, 60].includes(action.minutes)) throw new Error('Invalid quiet duration');
    next.quietUntil = now + action.minutes * 60000;
    invalidate();
  } else if (action.type === 'end-quiet' && next.quietUntil) {
    next.quietUntil = 0;
    invalidate();
  } else if (action.type === 'claim' && view.phase === 'due') {
    if (!hydrationText(owner)) throw new Error('Invalid reminder owner');
    if (
      !next.claim ||
      next.claim.owner === owner ||
      next.claim.until <= now ||
      next.claim.until > now + HYDRATION_LEASE_MS
    )
      next.claim = { owner, until: now + HYDRATION_LEASE_MS, sequence: next.sequence };
  } else if (action.type === 'clear-count') next.count = 0;
  else if (action.type === 'pause' && next.enabled && !next.paused) {
    next.paused = true;
    next.quietUntil = 0;
    invalidate();
  } else if (action.type === 'resume' && next.enabled && next.paused) {
    next.paused = false;
    restart();
  } else if (
    ['drink', 'snooze'].includes(action.type) &&
    view.phase === 'due' &&
    validClaim &&
    action.eventId === view.eventId
  ) {
    if (action.type === 'drink') next.count = Math.min(1000000, next.count + 1);
    next.dueAt = now + (action.type === 'snooze' ? 10 : next.interval) * 60000;
    invalidate();
  }
  return finish();
}
