// A user-started wall-clock countdown. No hydration or salary state is involved.
export const SMOKING_TIMER_DB = 'dsh.offwork-clock.smoking.v1';
export const COUNTDOWN_INTERVALS = [
  1, 5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 240, 480, 720, 1440,
];
export function defaultCountdown() {
  return { schema: 1, revision: 0, minutes: 60, status: 'idle', deadline: 0, remaining: 0 };
}
export function validateCountdown(value) {
  const integer = (n) => Number.isSafeInteger(n) && n >= 0;
  if (
    !value ||
    value.schema !== 1 ||
    !integer(value.revision) ||
    !Number.isInteger(value.minutes) ||
    value.minutes < 1 ||
    value.minutes > 1440 ||
    !['idle', 'running', 'paused'].includes(value.status) ||
    !integer(value.deadline) ||
    !integer(value.remaining) ||
    value.remaining > 86400000 ||
    (value.status === 'running'
      ? value.deadline === 0 || value.remaining !== 0
      : value.deadline !== 0) ||
    (value.status === 'idle' && value.remaining !== 0) ||
    (value.status === 'paused' && value.remaining === 0)
  )
    throw new Error('Invalid countdown state');
  return {
    schema: 1,
    revision: value.revision,
    minutes: value.minutes,
    status: value.status,
    deadline: value.deadline,
    remaining: value.remaining,
  };
}
export function countdownView(value, now) {
  const remaining =
    value.status === 'running' ? Math.max(0, value.deadline - now) : value.remaining;
  return { remaining, phase: value.status === 'running' && remaining === 0 ? 'due' : value.status };
}
export function transitionCountdown(value, action, now) {
  const state = validateCountdown(value);
  if (!Number.isSafeInteger(now) || now < 0) throw new Error('Invalid countdown time');
  const current = countdownView(state, now);
  switch (action.type) {
    case 'interval':
      state.minutes = action.minutes;
      break;
    case 'start':
      if (current.phase !== 'idle' && current.phase !== 'due') return state;
      state.status = 'running';
      state.deadline = now + state.minutes * 60000;
      state.remaining = 0;
      break;
    case 'restart':
      state.status = 'running';
      state.deadline = now + state.minutes * 60000;
      state.remaining = 0;
      break;
    case 'pause':
      if (current.phase !== 'running') return state;
      state.status = 'paused';
      state.remaining = Math.min(86400000, current.remaining);
      state.deadline = 0;
      break;
    case 'resume':
      if (current.phase !== 'paused') return state;
      state.status = 'running';
      state.deadline = now + state.remaining;
      state.remaining = 0;
      break;
    case 'stop':
      state.status = 'idle';
      state.deadline = 0;
      state.remaining = 0;
      break;
    default:
      throw new Error('Unknown countdown action');
  }
  return validateCountdown(state);
}
