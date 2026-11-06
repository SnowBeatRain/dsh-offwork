import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
import {
  defaultCountdown,
  validateCountdown,
  transitionCountdown,
  countdownView,
  SMOKING_TIMER_DB,
} from '../countdown.js';
import { createStateStore, createHydrationStore } from '../hydration-store.js';
import { petLayout } from '../pet-view.js';
import { petUIReducer, initialPetUI } from '../pet-interactions.js';

test('wall-clock countdown stays idle until started, expires without restarting and survives serialization', () => {
  const initial = defaultCountdown();
  assert.equal(countdownView(initial, 8000000).phase, 'idle');
  const running = transitionCountdown(initial, { type: 'start' }, 1000);
  const restored = validateCountdown(JSON.parse(JSON.stringify(running)));
  assert.equal(countdownView(restored, 31000).remaining, 3570000);
  assert.deepEqual(countdownView(restored, 4000000), { phase: 'due', remaining: 0 });
  assert.deepEqual(countdownView(restored, 5000000), { phase: 'due', remaining: 0 });
  assert.equal(transitionCountdown(restored, { type: 'pause' }, 5000000).status, 'running');
  assert.equal(transitionCountdown(restored, { type: 'start' }, 5000000).deadline, 8600000);
});

test('pause freezes the remainder; resume and explicit restart have different semantics', () => {
  const running = transitionCountdown(defaultCountdown(), { type: 'start' }, 1000);
  const paused = transitionCountdown(running, { type: 'pause' }, 31000);
  assert.equal(countdownView(paused, 9000000).remaining, 3570000);
  const changed = transitionCountdown(paused, { type: 'interval', minutes: 5 }, 9000000);
  assert.equal(changed.remaining, paused.remaining);
  const resumed = transitionCountdown(changed, { type: 'resume' }, 9000000);
  assert.equal(resumed.deadline, 12570000);
  assert.equal(transitionCountdown(resumed, { type: 'restart' }, 9000000).deadline, 9300000);
  assert.equal(transitionCountdown(resumed, { type: 'stop' }, 9000000).status, 'idle');
  assert.equal(transitionCountdown(resumed, { type: 'start' }, 9000000).deadline, resumed.deadline);
});

test('invalid or future timer data is rejected rather than resetting the countdown', () => {
  for (const change of [
    { schema: 2 },
    { revision: -1 },
    { minutes: 0 },
    { minutes: 1441 },
    { remaining: NaN },
    { status: 'unknown' },
    { status: 'paused', remaining: 0 },
    { status: 'idle', deadline: 1 },
    { status: 'running', deadline: 1, remaining: 2 },
  ])
    assert.throws(() => validateCountdown({ ...defaultCountdown(), ...change }));
  assert.throws(() =>
    transitionCountdown(defaultCountdown(), { type: 'interval', minutes: 2.5 }, 0),
  );
  assert.throws(() =>
    transitionCountdown(defaultCountdown(), { type: 'start' }, Number.MAX_SAFE_INTEGER),
  );
});

test('timer storage is atomic across tabs and separate from hydration records', async () => {
  const idb = new IDBFactory();
  const first = createStateStore(idb, SMOKING_TIMER_DB, defaultCountdown, validateCountdown);
  const second = createStateStore(idb, SMOKING_TIMER_DB, defaultCountdown, validateCountdown);
  const water = createHydrationStore(idb);
  const original = await water.update((state) => state);
  const results = await Promise.all(
    [first, second].map((store) =>
      store.update((state) =>
        state.revision === 0 ? transitionCountdown(state, { type: 'start' }, 1000) : state,
      ),
    ),
  );
  assert.equal(results[0].revision, 1);
  assert.equal(results[1].revision, 1);
  const stopped = await second.update((state) =>
    transitionCountdown(state, { type: 'stop' }, 2000),
  );
  assert.equal(stopped.revision, 2);
  assert.deepEqual(await first.update((state) => state), stopped);
  assert.deepEqual(await water.update((state) => state), original);
  first.close();
  second.close();
  water.close();
});

test('independent timer cards keep navigation draft protection and reserve space below the character', () => {
  for (const screen of ['water-countdown', 'smoking']) {
    assert.equal(
      petUIReducer(initialPetUI, { type: 'navigate', screen, root: true }).screen,
      screen,
    );
    const dirty = { screen: 'appearance', back: null, menu: null, pending: null };
    const guarded = petUIReducer(dirty, { type: 'navigate', screen, root: true, dirty: true });
    assert.equal(guarded.screen, 'appearance');
    assert.equal(guarded.pending.screen, screen);
  }
  for (const [width, height] of [
    [320, 568],
    [640, 360],
    [390, 844],
  ]) {
    const layout = petLayout(
      { x: 9999, y: 9999 },
      { width, height },
      220,
      420,
      'whale-ornate-actions',
      90,
    );
    assert.ok(layout.y + layout.petHeight <= height - 12);
    assert.ok(layout.x + layout.petWidth <= width - 12);
    assert.ok(layout.petHeight >= layout.artworkSize * 2.1 + 90);
  }
});
