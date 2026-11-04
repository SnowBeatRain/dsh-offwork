// Pure hydration rules. Time is measured in paid-work milliseconds from calculate().
export const HYDRATION_SCHEMA = 1;
export const HYDRATION_LEASE_MS = 8000;

export function defaultHydration() {
  return { schema: HYDRATION_SCHEMA, revision: 0, enabled: false, interval: 60, shift: null };
}

export function validateHydration(value) {
  const integer = (number, max = Number.MAX_SAFE_INTEGER) =>
    Number.isSafeInteger(number) && number >= 0 && number <= max;
  const text = (string) => typeof string === 'string' && string.length > 0 && string.length <= 1024;
  const keys = (object, allowed) =>
    object &&
    typeof object === 'object' &&
    !Array.isArray(object) &&
    Object.keys(object).every((key) => allowed.includes(key));
  if (
    !keys(value, ['schema', 'revision', 'enabled', 'interval', 'shift']) ||
    value.schema !== HYDRATION_SCHEMA ||
    !integer(value.revision) ||
    typeof value.enabled !== 'boolean' ||
    !integer(value.interval, 240) ||
    value.interval < 5
  ) {
    throw new Error('Invalid hydration data');
  }
  const shift = value.shift;
  if (shift !== null) {
    if (
      !keys(shift, ['id', 'schedule', 'config', 'count', 'paused', 'due', 'sequence', 'claim']) ||
      !text(shift.id) ||
      !text(shift.schedule) ||
      !text(shift.config) ||
      !integer(shift.count, 1000000) ||
      typeof shift.paused !== 'boolean' ||
      !integer(shift.sequence) ||
      !integer(shift.due, 172800000)
    ) {
      throw new Error('Invalid hydration shift');
    }
    if (
      shift.claim !== null &&
      (!keys(shift.claim, ['owner', 'until', 'sequence']) ||
        !text(shift.claim.owner) ||
        !integer(shift.claim.until) ||
        !integer(shift.claim.sequence))
    ) {
      throw new Error('Invalid hydration claim');
    }
  }
  return structuredClone(value);
}

export function hydrationContext(settings, clock) {
  if (!settings || !clock || !Number.isFinite(clock.elapsed) || !Number.isFinite(clock.total))
    return null;
  return {
    id: JSON.stringify([settings.timezone, clock.shiftDate]),
    config: JSON.stringify([
      settings.timezone,
      settings.start,
      settings.end,
      settings.breakStart,
      settings.breakEnd,
      [...settings.weekdays].sort(),
    ]),
    schedule: JSON.stringify([
      settings.start,
      settings.end,
      settings.breakStart,
      settings.breakEnd,
      [...settings.weekdays].sort(),
      clock.shiftStart,
      clock.shiftEnd,
    ]),
    status: clock.status,
    elapsed: Math.max(0, Math.floor(clock.elapsed * 1000)),
    total: Math.max(0, Math.floor(clock.total * 1000)),
  };
}

export function reconcileHydration(state, context) {
  const next = structuredClone(state);
  if (!context) return next;
  if (!next.enabled) {
    if (next.shift) next.shift.claim = null;
    return next;
  }
  if (next.shift?.id !== context.id) {
    // Do not discard the last shift's count on a day off. New working shifts
    // are initialized once the user opens the page, never backfilled.
    if (!['before', 'working', 'lunch'].includes(context.status)) return next;
    next.shift = {
      id: context.id,
      schedule: context.schedule,
      config: context.config,
      count: 0,
      paused: false,
      due: context.elapsed + next.interval * 60000,
      sequence: 0,
      claim: null,
    };
  } else if (next.shift.schedule !== context.schedule) {
    next.shift.schedule = context.schedule;
    next.shift.config = context.config;
    next.shift.due = context.elapsed + next.interval * 60000;
    next.shift.sequence++;
    next.shift.claim = null;
  }
  if (next.shift && context.status !== 'working') next.shift.claim = null;
  return next;
}

export function hydrationView(state, context) {
  const same =
    context && state.shift?.id === context.id && state.shift.schedule === context.schedule;
  const shift = same ? state.shift : null;
  const count = shift?.count ?? 0;
  const remaining = shift ? Math.max(0, shift.due - context.elapsed) : state.interval * 60000;
  const eventId = shift
    ? JSON.stringify([shift.id, shift.schedule, shift.sequence, shift.due])
    : null;
  let phase = 'waiting';
  if (!state.enabled) phase = 'off';
  else if (shift?.paused) phase = 'paused';
  else if (context?.status === 'lunch') phase = 'break';
  else if (shift && context.status === 'working') {
    phase = remaining === 0 ? 'due' : shift.due >= context.total ? 'finished' : 'countdown';
  }
  return { phase, count, remaining, eventId };
}

export function transitionHydration(state, context, action, now, owner) {
  if (!Number.isSafeInteger(now) || now < 0) throw new Error('Invalid reminder time');
  // Reconfiguration requires an explicit compare-and-set grant obtained before
  // reading/saving Host settings. A stale tab may release its lease or disable
  // reminders, but cannot silently restore its previous schedule.
  if (
    context &&
    state.shift &&
    (state.shift.config !== context.config ||
      (state.shift.id === context.id && state.shift.schedule !== context.schedule)) &&
    action.baseSchedule !== state.shift.schedule
  )
    context = null;
  let next = reconcileHydration(state, context);
  const restart = () => {
    if (!next.shift || !context || next.shift.id !== context.id) return;
    next.shift.due = context.elapsed + next.interval * 60000;
    next.shift.sequence++;
    next.shift.claim = null;
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
    const changed = next.enabled !== enabled || next.interval !== interval;
    next.enabled = enabled;
    next.interval = interval;
    next = reconcileHydration(next, context);
    if (!next.enabled && next.shift) next.shift.claim = null;
    if (changed) restart();
    return next;
  }
  const shift = next.shift;
  if (action.type === 'release') {
    if (shift?.claim?.owner === owner) shift.claim = null;
    return next;
  }
  if (!shift || !context || shift.id !== context.id) return next;
  const view = hydrationView(next, context);
  const validClaim =
    shift.claim &&
    shift.claim.owner === owner &&
    shift.claim.sequence === shift.sequence &&
    shift.claim.until > now &&
    shift.claim.until <= now + HYDRATION_LEASE_MS;
  if (action.type === 'claim' && view.phase === 'due') {
    const claim = shift.claim;
    if (
      !claim ||
      claim.owner === owner ||
      claim.until <= now ||
      claim.until > now + HYDRATION_LEASE_MS
    ) {
      shift.claim = { owner, until: now + HYDRATION_LEASE_MS, sequence: shift.sequence };
    }
  } else if (action.type === 'clear-count') {
    shift.count = 0;
  } else if (action.type === 'pause') {
    shift.paused = true;
    shift.claim = null;
    shift.sequence++;
  } else if (action.type === 'resume') {
    shift.paused = false;
    restart();
  } else if (
    ['drink', 'snooze'].includes(action.type) &&
    view.phase === 'due' &&
    validClaim &&
    action.eventId === view.eventId
  ) {
    if (action.type === 'drink') shift.count = Math.min(1000000, shift.count + 1);
    shift.due = context.elapsed + (action.type === 'snooze' ? 10 : next.interval) * 60000;
    shift.sequence++;
    shift.claim = null;
  }
  return next;
}
