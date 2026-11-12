import {
  defaultCountdown,
  validateCountdown,
  countdownView,
  transitionCountdown,
} from './countdown.js';
import { hydrationView, validateHydration } from './hydration.js';
import { normalizeView } from './ui-utils.js';

// Shared companion state. All updates run inside createStateStore transactions.
export const COMPANION_DB = 'dsh.offwork-clock.companion.v1';
export const COMPANION_THEMES = {
  host: '',
  lavender: '#7779bc',
  ocean: '#397fbd',
  rose: '#b96c89',
  slate: '#65748b',
};
export function defaultCompanionState() {
  return {
    schema: 1,
    revision: 0,
    preferences: {
      sound: false,
      notifications: false,
      quietUntil: 0,
      wrapEnabled: false,
      leadMinutes: 10,
      deferTyping: true,
      linkedSession: '',
      theme: 'host',
      cardScale: 1,
      customEnabled: false,
      image: null,
    },
    timers: [],
    deliveries: {},
    journal: {},
    history: [],
  };
}
function companionAssert(condition) {
  if (!condition) throw new Error('Invalid companion data / 搭子数据格式无效');
}
const companionTime = (n) => Number.isSafeInteger(n) && n >= 0;
const companionText = (s, max) => typeof s === 'string' && s.length <= max;
export function validateCompanionState(value) {
  companionAssert(value?.schema === 1 && companionTime(value.revision));
  const p = value.preferences;
  companionAssert(
    p && Object.keys(p).every((k) => Object.hasOwn(defaultCompanionState().preferences, k)),
  );
  companionAssert(
    p &&
      ['sound', 'notifications', 'wrapEnabled', 'deferTyping', 'customEnabled'].every(
        (k) => typeof p[k] === 'boolean',
      ),
  );
  companionAssert(
    companionTime(p.quietUntil) &&
      Number.isInteger(p.leadMinutes) &&
      p.leadMinutes >= 0 &&
      p.leadMinutes <= 60,
  );
  companionAssert(companionText(p.linkedSession, 200) && Object.hasOwn(COMPANION_THEMES, p.theme));
  companionAssert([0.9, 1, 1.1, 1.2].includes(p.cardScale));
  companionAssert(
    p.image === null ||
      (typeof p.image === 'string' &&
        p.image.length <= 1500000 &&
        /^data:image\/png;base64,[A-Za-z0-9+/]+=*$/.test(p.image)),
  );
  companionAssert(Array.isArray(value.timers) && value.timers.length <= 8);
  const ids = new Set();
  for (const t of value.timers) {
    companionAssert(
      companionText(t.id, 80) &&
        /^[a-zA-Z0-9_-]+$/.test(t.id) &&
        !ids.has(t.id) &&
        companionText(t.name, 40) &&
        t.name.trim().length > 0,
    );
    ids.add(t.id);
    validateCountdown(t.clock);
  }
  companionAssert(
    value.deliveries &&
      typeof value.deliveries === 'object' &&
      !Array.isArray(value.deliveries) &&
      Object.keys(value.deliveries).length <= 128,
  );
  for (const [id, d] of Object.entries(value.deliveries)) {
    companionAssert(
      companionText(id, 250) && !['__proto__', 'constructor', 'prototype'].includes(id),
    );
    companionAssert(
      d &&
        ['dueAt', 'createdAt', 'snoozeUntil', 'leaseUntil', 'notifiedAt'].every((k) =>
          companionTime(d[k]),
        ) &&
        typeof d.dismissed === 'boolean' &&
        companionText(d.owner, 100),
    );
  }
  companionAssert(
    value.journal &&
      typeof value.journal === 'object' &&
      !Array.isArray(value.journal) &&
      Object.keys(value.journal).length <= 120,
  );
  for (const [date, j] of Object.entries(value.journal)) {
    companionAssert(
      /^\d{4}-\d{2}-\d{2}$/.test(date) &&
        companionText(j.done, 500) &&
        companionText(j.next, 500) &&
        companionTime(j.endedAt) &&
        companionTime(j.updatedAt),
    );
  }
  companionAssert(Array.isArray(value.history) && value.history.length <= 1500);
  for (const e of value.history)
    companionAssert(
      companionText(e.id, 250) &&
        companionText(e.label, 80) &&
        ['water', 'timer', 'wrap'].includes(e.type) &&
        companionTime(e.at),
    );
  return structuredClone({
    schema: 1,
    revision: value.revision,
    preferences: p,
    timers: value.timers,
    deliveries: value.deliveries,
    journal: value.journal,
    history: value.history,
  });
}
export function companionEvents(state, input, now) {
  const events = [];
  if (input.smokingReady && countdownView(input.smoking, now).phase === 'due')
    events.push({
      id: 'smoking:' + input.smoking.deadline,
      kind: 'smoking',
      dueAt: input.smoking.deadline,
      label: input.smokingLabel,
    });
  const waterClaim = input.water?.claim;
  const waterOwnedElsewhere =
    input.waterOwner &&
    waterClaim?.owner !== input.waterOwner &&
    waterClaim?.sequence === input.water?.sequence &&
    waterClaim?.until > now &&
    waterClaim.until <= now + 8000;
  if (input.waterReady && !waterOwnedElsewhere && hydrationView(input.water, now).phase === 'due') {
    const view = hydrationView(input.water, now);
    events.push({
      id: 'water:' + view.eventId,
      kind: 'water',
      eventId: view.eventId,
      dueAt: input.water.dueAt,
      label: input.waterLabel,
    });
  }
  for (const timer of state.timers)
    if (countdownView(timer.clock, now).phase === 'due')
      events.push({
        id: 'timer:' + timer.id + ':' + timer.clock.deadline,
        kind: 'timer',
        timerId: timer.id,
        dueAt: timer.clock.deadline,
        label: timer.name,
      });
  const shift = input.shift;
  if (
    state.preferences.wrapEnabled &&
    shift?.isWorkday &&
    now >= shift.shiftStart &&
    !state.journal[shift.shiftDate]?.endedAt
  ) {
    const dueAt = shift.shiftEnd - state.preferences.leadMinutes * 60000;
    if (now >= dueAt)
      events.push({
        id: 'wrap:' + shift.shiftDate + ':' + shift.shiftEnd,
        kind: 'wrap',
        date: shift.shiftDate,
        dueAt,
        label: input.wrapLabel,
      });
  }
  return events.sort((a, b) => a.dueAt - b.dueAt);
}
export function companionPending(state, events, now) {
  if (state.preferences.quietUntil > now) return [];
  return events.filter((e) => {
    const d = state.deliveries[e.id];
    return d && !d.dismissed && d.snoozeUntil <= now;
  });
}
export function reconcileCompanion(state, events, now) {
  const next = validateCompanionState(state);
  const active = new Set(events.map((e) => e.id));
  for (const event of events)
    if (!Object.hasOwn(next.deliveries, event.id))
      next.deliveries[event.id] = {
        dueAt: event.dueAt,
        createdAt: now,
        snoozeUntil: 0,
        dismissed: false,
        owner: '',
        leaseUntil: 0,
        notifiedAt: 0,
      };
  const records = Object.entries(next.deliveries).sort((a, b) => b[1].createdAt - a[1].createdAt);
  next.deliveries = Object.fromEntries(
    records
      .filter(([id, d], i) => active.has(id) || (i < 100 && now - d.createdAt < 90 * 86400000))
      .slice(0, 128),
  );
  next.history = next.history.filter((e) => now - e.at < 90 * 86400000).slice(-1500);
  return next;
}
export function companionTransition(value, action, now) {
  const state = validateCompanionState(value);
  companionAssert(companionTime(now));
  const record = () => {
    const d = state.deliveries[action.id];
    if (!d) throw new Error('Reminder changed / 提醒已变化');
    return d;
  };
  switch (action.type) {
    case 'preferences':
      companionAssert(
        action.patch && Object.keys(action.patch).every((k) => Object.hasOwn(state.preferences, k)),
      );
      Object.assign(state.preferences, action.patch);
      break;
    case 'dismiss': {
      const d = record();
      d.dismissed = true;
      d.owner = '';
      d.leaseUntil = 0;
      break;
    }
    case 'snooze': {
      const d = record();
      d.snoozeUntil = now + 10 * 60000;
      d.dismissed = false;
      d.owner = '';
      d.leaseUntil = 0;
      d.notifiedAt = 0;
      break;
    }
    case 'claim': {
      const d = record();
      if (
        !d.dismissed &&
        d.snoozeUntil <= now &&
        state.preferences.quietUntil <= now &&
        (d.owner === action.owner || d.leaseUntil <= now)
      ) {
        d.owner = action.owner;
        d.leaseUntil = now + 8000;
      }
      break;
    }
    case 'notify': {
      const d = record();
      if (
        !d.notifiedAt &&
        !d.dismissed &&
        d.snoozeUntil <= now &&
        state.preferences.quietUntil <= now
      )
        d.notifiedAt = now;
      break;
    }
    case 'release':
      for (const d of Object.values(state.deliveries))
        if (d.owner === action.owner) {
          d.owner = '';
          d.leaseUntil = 0;
        }
      break;
    case 'add-timer': {
      if (state.timers.length >= 8) throw new Error('最多保存8个计时 / Up to 8 timers');
      if (state.timers.some((t) => t.id === action.id)) break;
      state.timers.push({
        id: action.id,
        name: action.name.trim(),
        clock: { ...defaultCountdown(), minutes: action.minutes },
      });
      break;
    }
    case 'timer': {
      const timer = state.timers.find((t) => t.id === action.id);
      if (!timer || timer.clock.revision !== action.revision)
        throw new Error('Timer changed / 计时已在其他页面改变，请重试');
      if (action.operation.type === 'delete') {
        state.timers = state.timers.filter((t) => t !== timer);
        break;
      }
      timer.clock = transitionCountdown(timer.clock, action.operation, now);
      timer.clock.revision++;
      break;
    }
    case 'journal': {
      const previous = state.journal[action.date];
      if ((previous?.updatedAt || 0) !== action.base)
        throw new Error('Notes changed in another tab / 另一页面已修改收尾记录，请重新打开');
      state.journal[action.date] = {
        done: action.done,
        next: action.next,
        endedAt: action.end ? now : previous?.endedAt || 0,
        updatedAt: Math.max(now, (previous?.updatedAt || 0) + 1),
      };
      state.journal = Object.fromEntries(
        Object.entries(state.journal)
          .sort(([a], [b]) => b.localeCompare(a))
          .slice(0, 120),
      );
      if (action.end && !state.history.some((e) => e.id === 'wrap:' + action.date))
        state.history.push({ id: 'wrap:' + action.date, type: 'wrap', at: now, label: 'Wrap-up' });
      break;
    }
    case 'record':
      if (!state.history.some((e) => e.id === action.event.id)) state.history.push(action.event);
      state.history = state.history.slice(-1500);
      break;
    case 'restore': {
      const restored = validateCompanionState(action.value);
      if (
        state.revision !== action.base &&
        (!action.stamp || companionStateStamp(state) !== action.stamp)
      )
        throw new Error('Data changed; preview the backup again / 数据已变化，请重新预览备份');
      restored.revision = state.revision;
      restored.preferences.sound = false;
      restored.preferences.notifications = false;
      for (const d of Object.values(restored.deliveries)) {
        d.owner = '';
        d.leaseUntil = 0;
      }
      return restored;
    }
    default:
      throw new Error('Unknown companion action');
  }
  return validateCompanionState(state);
}
export function companionDaySummary(state, date, timezone) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const localDate = (at) => {
    const p = Object.fromEntries(formatter.formatToParts(at).map((p) => [p.type, p.value]));
    return `${p.year}-${p.month}-${p.day}`;
  };
  const events = state.history.filter((e) => localDate(e.at) === date);
  return {
    water: events.filter((e) => e.type === 'water').length,
    timers: events.filter((e) => e.type === 'timer').length,
  };
}

export function validateBrowserBackup(value) {
  companionAssert(
    value?.format === 'dsh-offwork-browser' &&
      value.version === 1 &&
      companionTime(value.createdAt),
  );
  return {
    format: value.format,
    version: 1,
    createdAt: value.createdAt,
    companion: validateCompanionState(value.companion),
    water: validateHydration(value.water),
    smoking: validateCountdown(value.smoking),
    view: normalizeView(value.view),
  };
}
// Ignore transient leases and revisions; user-visible changes invalidate a restore preview.
export function companionStateStamp(c) {
  return JSON.stringify({
    preferences: c.preferences,
    timers: c.timers,
    journal: c.journal,
    history: c.history,
    choices: Object.entries(c.deliveries)
      .filter(([, d]) => d.dismissed || d.snoozeUntil)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, d]) => [id, d.dismissed, d.snoozeUntil]),
  });
}
export function companionWaterStamp(w) {
  const { claim, revision, ...value } = w;
  return JSON.stringify(value);
}
export function companionBackupStamp(value) {
  const { revision: smokeRevision, ...smoking } = value.smoking;
  return JSON.stringify({
    companion: companionStateStamp(value.companion),
    water: companionWaterStamp(value.water),
    smoking,
    view: value.view,
  });
}
export function createCompanionRecoveryStore(indexedDB, createStore) {
  return createStore(
    indexedDB,
    'dsh.offwork-clock.restore.v1',
    () => ({ schema: 1, revision: 0, bundle: null }),
    (value) => {
      companionAssert(value?.schema === 1 && companionTime(value.revision));
      return {
        schema: 1,
        revision: value.revision,
        bundle: value.bundle === null ? null : validateBrowserBackup(value.bundle),
      };
    },
  );
}
