import test from 'node:test';
import assert from 'node:assert/strict';
import { companionPresentation, COMPANION_MESSAGES } from '../companion.js';
import { normalizeView } from '../ui-utils.js';
const show = (patch = {}) =>
  companionPresentation({ workStatus: 'working', phase: 'countdown', ...patch });
const drink = { kind: 'drink', key: 'waterRecorded', token: 12 };

test('only a leased due reminder changes the character to a drinking pose; it adds no second message', () => {
  const elsewhere = show({ phase: 'due', ownsPrompt: false });
  assert.equal(elsewhere.pose, 'calm');
  assert.equal(elsewhere.announce, false);
  const here = show({ phase: 'due', ownsPrompt: true });
  assert.equal(here.pose, 'drink');
  assert.equal(here.message, null);
  assert.equal(here.announce, false);
});

test('explicit drinking works outside work hours while manual quiet/pause still suppress animation', () => {
  const happy = show({ feedback: drink });
  assert.equal(happy.pose, 'happy');
  assert.equal(happy.animate, true);
  assert.equal(happy.announce, true);
  for (const patch of [{ phase: 'quiet' }, { phase: 'paused' }]) {
    const result = show({ ...patch, feedback: drink });
    assert.equal(result.animate, false);
    assert.equal(result.message, 'waterRecorded');
  }
  for (const workStatus of ['lunch', 'rest', 'done', 'before', undefined]) {
    const result = show({ workStatus, feedback: drink });
    assert.equal(result.pose, 'happy');
    assert.equal(result.animate, true);
    const due = show({ workStatus, phase: 'due', ownsPrompt: true });
    assert.equal(due.pose, 'drink');
    assert.equal(due.message, null);
  }
  assert.equal(show({ phase: 'quiet', feedback: drink }).pose, 'quiet');
  assert.equal(show({ feedback: { ...drink, kind: 'notice' } }).animate, false);
});

test('hidden character, hidden page, reduced animation preference and unavailable state suppress reactions', () => {
  const hidden = show({ visible: false, feedback: drink });
  assert.equal(hidden.visible, false);
  assert.equal(hidden.message, null);
  assert.equal(hidden.announce, false);
  assert.equal(show({ pageVisible: false, feedback: drink }).animate, false);
  assert.equal(show({ motion: false, feedback: drink }).animate, false);
  const failed = show({ failed: true, feedback: drink });
  assert.equal(failed.message, 'companionUnavailable');
  assert.equal(failed.announce, false);
  assert.equal(failed.animate, false);
  assert.equal(show({ ready: false, feedback: drink }).message, 'companionLoading');
});

test('quiet, paused and work states have stable localized messages with no automatic announcements', () => {
  const cases = [
    { phase: 'quiet' },
    { phase: 'paused' },
    { workStatus: 'lunch' },
    { workStatus: 'rest' },
    { workStatus: 'done' },
    { workStatus: 'before' },
    { phase: 'off' },
    {},
  ];
  for (const input of cases) {
    const result = show(input);
    assert.equal(result.announce, false);
    assert.equal(result.animate, false);
    for (const lang of ['zh', 'en']) assert.ok(COMPANION_MESSAGES[lang][result.message]);
    assert.deepEqual(show(input), result);
  }
  assert.notEqual(show({ phase: 'quiet' }).message, show({}).message);
  assert.equal(show({ phase: 'paused', workStatus: 'done' }).message, 'companionPaused');
  assert.equal(show({ phase: 'paused', workStatus: 'rest' }).message, 'companionPaused');
});

test('existing view data keeps its position, privacy and opacity while explicit companion opt-out survives reload', () => {
  const old = { mini: false, masked: true, opacity: 0.6, position: { x: 34, y: 56 } };
  const migrated = normalizeView(old);
  for (const key of Object.keys(old)) assert.deepEqual(migrated[key], old[key]);
  assert.equal(migrated.companion, true);
  const off = { ...migrated, companion: false, companionMotion: false };
  assert.deepEqual(normalizeView(JSON.parse(JSON.stringify(off))), off);
  assert.equal(normalizeView({ ...off, companion: true }).companionMotion, false);
});
