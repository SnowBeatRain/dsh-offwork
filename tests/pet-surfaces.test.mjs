import test from 'node:test';
import assert from 'node:assert/strict';
import { petViewport, petSurfaceWidth, placePetSurface } from '../pet-surfaces.js';
import { petLayout } from '../pet-view.js';
import { clampPosition } from '../ui-utils.js';
const overlap = (a, b) =>
  Math.max(0, Math.min(a.left + a.width, b.x + b.width) - Math.max(a.left, b.x)) *
  Math.max(0, Math.min(a.top + a.height, b.y + b.height) - Math.max(a.top, b.y));

test('visual viewport bounds include keyboard and zoom offsets, with a desktop fallback', () => {
  assert.deepEqual(petViewport({ innerWidth: 1440, innerHeight: 900 }), {
    width: 1440,
    height: 900,
    left: 0,
    top: 0,
  });
  assert.deepEqual(
    petViewport({
      innerWidth: 800,
      innerHeight: 900,
      visualViewport: { width: 390, height: 310, offsetLeft: 20, offsetTop: 240 },
    }),
    { width: 390, height: 310, left: 20, top: 240 },
  );
});
test('card widths match content needs and shrink to the available viewport', () => {
  const wide = { width: 1440, height: 900 };
  assert.ok(petSurfaceWidth('schedule', wide) > petSurfaceWidth('income', wide));
  assert.ok(petSurfaceWidth('menu', wide) < petSurfaceWidth('home', wide));
  for (const name of ['home', 'income', 'earnings', 'water', 'appearance', 'schedule'])
    assert.equal(petSurfaceWidth(name, { width: 320, height: 568 }), 296);
});
test('measured surfaces stay inside every viewport and preserve natural height when there is room', () => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 768, height: 1024 },
    { width: 320, height: 568 },
    { width: 640, height: 320 },
    { width: 240, height: 140 },
    { width: 390, height: 280, left: 80, top: 220 },
  ])
    for (const position of [null, { x: 0, y: 0 }, { x: 9999, y: 9999 }])
      for (const size of [80, 180])
        for (const height of [42, 230, 480, 1500])
          for (const kind of ['card', 'menu']) {
            const p = petLayout(position, viewport, size);
            const anchor = { x: p.x, y: p.y, width: p.petWidth, height: p.petHeight };
            const r = placePetSurface(anchor, viewport, {
              width: petSurfaceWidth(kind === 'menu' ? 'menu' : 'schedule', viewport),
              height,
              kind,
              point: { x: p.x, y: p.y },
            });
            assert.ok(r.left >= (viewport.left ?? 0) && r.top >= (viewport.top ?? 0));
            assert.ok(r.left + r.width <= (viewport.left ?? 0) + viewport.width + 0.01);
            assert.ok(r.top + r.height <= (viewport.top ?? 0) + viewport.height + 0.01);
            assert.ok(r.height <= height);
          }
  const r = placePetSurface(
    { x: 1100, y: 500, width: 160, height: 176 },
    { width: 1440, height: 900 },
    { width: 320, height: 230 },
  );
  assert.equal(r.height, 230);
});
test('cards and menus avoid the character whenever a clear side is available', () => {
  const viewport = { width: 1440, height: 900 };
  for (const anchor of [
    { x: 1100, y: 650, width: 160, height: 176 },
    { x: 12, y: 12, width: 160, height: 176 },
  ])
    for (const kind of ['card', 'menu']) {
      const r = placePetSurface(anchor, viewport, {
        width: 360,
        height: 500,
        kind,
        point: { x: anchor.x + 80, y: anchor.y + 80 },
      });
      assert.equal(overlap(r, anchor), 0);
    }
});
test('content changes keep the header in place until bounds require movement', () => {
  const anchor = { x: 1100, y: 600, width: 160, height: 176 },
    viewport = { width: 1440, height: 1000 };
  const first = placePetSurface(anchor, viewport, { width: 336, height: 200 });
  const larger = placePetSurface(anchor, viewport, { width: 336, height: 240, previous: first });
  assert.equal(larger.top, first.top);
  assert.equal(larger.left, first.left);
  assert.equal(larger.height, 240);
  const tall = placePetSurface(anchor, viewport, { width: 336, height: 1400, previous: larger });
  assert.ok(tall.top + tall.height <= 988);
});
test('menus open near a clicked card rather than jumping back to the pet', () => {
  const r = placePetSurface(
    { x: 1100, y: 700, width: 148, height: 176 },
    { width: 1440, height: 1000 },
    { width: 224, height: 240, kind: 'menu', point: { x: 300, y: 100 } },
  );
  assert.equal(r.left, 308);
  assert.equal(r.top, 108);
});

test('water notices avoid the open card as well as the pet', () => {
  const viewport = { width: 320, height: 568 };
  const anchor = { x: 140, y: 414, width: 148, height: 118 };
  const card = { left: 12, top: 12, width: 296, height: 390 };
  const notice = placePetSurface(anchor, viewport, {
    width: 116,
    height: 34,
    kind: 'menu',
    obstacles: [card],
  });
  assert.equal(overlap(notice, anchor), 0);
  assert.equal(
    overlap(notice, { x: card.left, y: card.top, width: card.width, height: card.height }),
    0,
  );
});

test('pet drag clamping and surface placement use the same offset coordinate space', () => {
  const viewport = { width: 390, height: 310, left: 80, top: 240 };
  const position = clampPosition({ x: -50, y: 9999 }, viewport, { width: 148, height: 176 });
  assert.equal(position.x, 92);
  assert.equal(position.y, 362);
  const pet = petLayout(position, viewport, 132);
  assert.equal(pet.x, 92);
  assert.equal(pet.y, 362);
});
