import test from 'node:test';
import assert from 'node:assert/strict';
import {
  initialPetUI,
  petUIReducer,
  appearanceValues,
  petMenuLayout,
} from '../pet-interactions.js';
const go = (s, screen, extra = {}) => petUIReducer(s, { type: 'navigate', screen, ...extra });

test('one screen is active and editor navigation retains a predictable parent', () => {
  let s = go(initialPetUI, 'home');
  s = go(s, 'income');
  s = go(s, 'water');
  assert.equal(s.screen, 'water');
  assert.equal(s.back, 'income');
  s = go(s, 'appearance');
  assert.equal(s.back, 'income');
  s = go(s, s.back);
  assert.equal(s.screen, 'income');
  s = go(s, null);
  assert.equal(s.screen, null);
  assert.equal(go(initialPetUI, 'appearance').back, null);
});
test('dirty navigation preserves the editor until save or explicit discard', () => {
  const editing = go(go(initialPetUI, 'home'), 'water');
  const blocked = go(editing, 'appearance', { dirty: true });
  assert.equal(blocked.screen, 'water');
  assert.deepEqual(blocked.pending, { screen: 'appearance' });
  assert.equal(petUIReducer(blocked, { type: 'stay' }).screen, 'water');
  const discarded = go(blocked, blocked.pending.screen, { discard: true });
  assert.equal(discarded.screen, 'appearance');
  assert.equal(discarded.pending, null);
  const close = go(editing, null, { dirty: true });
  assert.deepEqual(close.pending, { screen: null });
  assert.equal(close.screen, 'water');
  assert.equal(go(close, null, { discard: true }).screen, null);
});
test('context menu does not navigate or destroy the pending editor state', () => {
  const original = go(go(initialPetUI, 'home'), 'schedule');
  const menu = petUIReducer(original, { type: 'menu', position: { x: 20, y: 30 } });
  assert.equal(menu.screen, 'schedule');
  assert.equal(menu.back, 'home');
  assert.deepEqual(petUIReducer(menu, { type: 'dismiss-menu' }), original);
  assert.equal(go(menu, 'appearance', { dirty: true }).menu, null);
  assert.deepEqual(original, go(go(initialPetUI, 'home'), 'schedule'));
});
test('reopening the current page preserves drafts and unsupported navigation is ignored', () => {
  const s = go(go(initialPetUI, 'home'), 'water');
  assert.deepEqual(go(s, 'water', { dirty: true }), s);
  assert.equal(go(s, 'unknown'), s);
});
test('menu cards are independent roots while reminder settings return only to water', () => {
  const water = go(initialPetUI, 'home', { root: true });
  const settings = go(water, 'water');
  assert.equal(settings.back, 'home');
  const clock = go(settings, 'income', { root: true, discard: true });
  assert.equal(clock.back, null);
  const appearance = go(clock, 'appearance', { root: true });
  assert.equal(appearance.back, null);
  assert.equal(go(appearance, appearance.back).screen, null);
  assert.equal(go(initialPetUI, 'earnings', { root: true }).screen, 'earnings');
});
test('dirty navigation retains the root destination for explicit save or discard', () => {
  const settings = go(go(initialPetUI, 'home'), 'water');
  const pending = go(settings, 'appearance', { root: true, dirty: true });
  assert.deepEqual(pending.pending, { screen: 'appearance', root: true });
  const next = go(pending, pending.pending.screen, { root: pending.pending.root, discard: true });
  assert.equal(next.back, null);
  assert.equal(next.screen, 'appearance');
});

test('appearance snapshots omit position and salary preferences', () => {
  assert.deepEqual(
    appearanceValues({
      companion: true,
      companionMotion: false,
      petSize: 132,
      opacity: 0.8,
      position: { x: 1, y: 2 },
      petPosition: { x: 3, y: 4 },
      masked: false,
    }),
    { companion: true, companionMotion: false, petSize: 132, opacity: 0.8 },
  );
});
test('context menu stays within viewport near every corner', () => {
  const pet = { x: 1100, y: 700, width: 150, height: 176 };
  const adjacent = petMenuLayout({ x: 1175, y: 788 }, { width: 1440, height: 1000 }, pet);
  assert.ok(adjacent.left + adjacent.width < pet.x);
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 320, height: 568 },
    { width: 160, height: 100 },
  ])
    for (const point of [
      { x: 0, y: 0 },
      { x: 9999, y: 9999 },
      { x: -200, y: -200 },
    ]) {
      const p = petMenuLayout(point, viewport);
      assert.ok(p.left >= 0 && p.top >= 0);
      assert.ok(p.left + p.width <= viewport.width && p.top + p.maxHeight <= viewport.height);
    }
});
