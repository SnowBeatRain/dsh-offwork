import test from 'node:test';
import assert from 'node:assert/strict';
import { initialPetReminder, nextPetReminder, dismissPetReminder } from '../pet-reminder.js';
const input = (patch = {}) => ({
  ready: true,
  eventId: 'shift:1',
  phase: 'countdown',
  visible: true,
  available: true,
  ownsPrompt: false,
  ...patch,
});

test('loading or refreshing an already-due reminder never opens a card', () => {
  let state = nextPetReminder(initialPetReminder, input({ ready: false, eventId: null }));
  state = nextPetReminder(state, input({ phase: 'due', ownsPrompt: true }));
  assert.equal(state.open, false);
  assert.equal(state.armed, false);
  assert.equal(nextPetReminder(state, input({ phase: 'due', ownsPrompt: true })), state);
  const explicitlyOpened = { ...state, open: true };
  assert.equal(
    nextPetReminder(explicitlyOpened, input({ phase: 'due', ownsPrompt: true })).open,
    true,
  );
});

test('a live countdown opens only for its lease owner and stays dismissed for the same due phase', () => {
  let state = nextPetReminder(initialPetReminder, input());
  assert.equal(state.armed, true);
  state = nextPetReminder(state, input({ phase: 'due' }));
  assert.equal(state.open, false);
  assert.equal(state.armed, true);
  state = nextPetReminder(state, input({ phase: 'due', ownsPrompt: true }));
  assert.equal(state.open, true);
  assert.equal(nextPetReminder(state, input({ phase: 'due', ownsPrompt: true })), state);
  state = dismissPetReminder(state);
  assert.equal(nextPetReminder(state, input({ phase: 'due', ownsPrompt: true })).open, false);
  state = nextPetReminder(state, input({ eventId: 'shift:2' }));
  assert.equal(
    nextPetReminder(state, input({ eventId: 'shift:2', phase: 'due', ownsPrompt: true })).open,
    true,
  );
});

test('open cards, background state and lease loss stop popups without delayed replay', () => {
  for (const patch of [{ available: false }, { visible: false }, { ready: false }]) {
    let state = nextPetReminder(initialPetReminder, input());
    state = nextPetReminder(state, input({ phase: 'due', ownsPrompt: true, ...patch }));
    assert.equal(state.open, false);
    assert.equal(nextPetReminder(state, input({ phase: 'due', ownsPrompt: true })).open, false);
  }
  let state = nextPetReminder(initialPetReminder, input());
  state = nextPetReminder(state, input({ phase: 'due', ownsPrompt: true }));
  state = nextPetReminder(state, input({ phase: 'due', ownsPrompt: false }));
  assert.equal(state.open, false);
  assert.equal(nextPetReminder(state, input({ phase: 'due', ownsPrompt: true })).open, false);
});

test('quiet or unpaid-break phases can arm a reminder for work resumption without changing business state', () => {
  for (const phase of ['quiet', 'break']) {
    const previous = Object.freeze({ eventId: 'shift:1', armed: false, open: false });
    const state = nextPetReminder(previous, input({ phase }));
    assert.equal(state.armed, true);
    assert.equal(nextPetReminder(state, input({ phase: 'due', ownsPrompt: true })).open, true);
    assert.deepEqual(previous, { eventId: 'shift:1', armed: false, open: false });
  }
  for (const phase of ['off', 'waiting', 'paused', 'finished']) {
    const state = nextPetReminder(nextPetReminder(initialPetReminder, input()), input({ phase }));
    assert.equal(nextPetReminder(state, input({ phase: 'due', ownsPrompt: true })).open, false);
  }
});
