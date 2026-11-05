import test from 'node:test';
import assert from 'node:assert/strict';
import { petLayout } from '../pet-view.js';
import { normalizeView } from '../ui-utils.js';

test('pet and popover stay on screen at edges, across sizes and narrow viewports', () => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
    { width: 320, height: 568 },
    { width: 280, height: 360 },
    { width: 320, height: 160 },
    { width: 800, height: 120 },
  ]) {
    for (const size of [80, 132, 180])
      for (const position of [null, { x: -500, y: -500 }, { x: 9999, y: 9999 }, { x: 120, y: 80 }])
        for (const height of [120, 420, 900]) {
          const r = petLayout(position, viewport, size, height);
          assert.ok(r.x >= 0 && r.x + r.petWidth <= viewport.width);
          assert.ok(r.y >= 0 && r.y + r.petHeight <= viewport.height);
          assert.ok(r.panel.left >= 0 && r.panel.left + r.panel.width <= viewport.width);
          assert.ok(
            r.panel.top >= 0 &&
              r.panel.top + Math.min(height, r.panel.maxHeight) <= viewport.height,
          );
        }
  }
});

test('popover flips to the available side and stacks on a phone', () => {
  assert.equal(petLayout(null, { width: 1440, height: 900 }).panel.side, 'left');
  assert.equal(petLayout({ x: 12, y: 200 }, { width: 1440, height: 900 }).panel.side, 'right');
  assert.equal(petLayout(null, { width: 320, height: 568 }).panel.side, 'above');
  assert.equal(petLayout({ x: 12, y: 12 }, { width: 320, height: 568 }).panel.side, 'below');
});

test('pet preferences retain the original clock position and bound invalid size input', () => {
  const old = { position: { x: 40, y: 50 }, masked: true, companion: true, opacity: 0.6 };
  const next = normalizeView(old);
  assert.deepEqual(next.position, old.position);
  assert.equal(next.petPosition, null);
  assert.equal(next.petSize, 132);
  const saved = normalizeView({ ...next, petPosition: { x: 200, y: 300 }, petSize: 148 });
  assert.deepEqual(normalizeView(JSON.parse(JSON.stringify(saved))), saved);
  assert.equal(normalizeView({ petSize: 9000 }).petSize, 180);
  assert.equal(normalizeView({ petSize: NaN }).petSize, 132);
  assert.equal(normalizeView({ petPosition: { x: 'bad', y: 4 } }).petPosition, null);
});
