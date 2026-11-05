import test from 'node:test';
import assert from 'node:assert/strict';
import { petLayout, petModel, petArtwork } from '../pet-view.js';
import { normalizeView } from '../ui-utils.js';

test('existing preferences gain the long dress without losing privacy, position or motion choices', () => {
  const old = {
    masked: true,
    companion: false,
    companionMotion: false,
    petSize: 148,
    petPosition: { x: 300, y: 400 },
    opacity: 0.7,
  };
  const next = normalizeView(old);
  assert.equal(next.petModel, 'whale-dress');
  for (const k of Object.keys(old)) assert.deepEqual(next[k], old[k]);
  for (const id of ['whale-dress', 'whale-ornate', 'xiaoxie-original'])
    assert.equal(normalizeView({ ...next, petModel: id }).petModel, id);
  for (const id of ['unknown', '__proto__', 'toString']) {
    assert.equal(normalizeView({ petModel: id }).petModel, 'whale-dress');
    assert.equal(petModel(id).id, 'whale-dress');
  }
});
test('portrait layout fits the complete figure and badge in narrow, short and offset viewports', () => {
  for (const id of ['whale-dress', 'whale-ornate'])
    for (const size of [80, 132, 180])
      for (const viewport of [
        { width: 1440, height: 1000 },
        { width: 320, height: 568 },
        { width: 640, height: 320 },
        { width: 240, height: 180, left: 50, top: 200 },
      ]) {
        const p = petLayout({ x: 9999, y: 9999 }, viewport, size, 420, id),
          m = petModel(id);
        assert.ok(p.x >= (viewport.left ?? 0) && p.y >= (viewport.top ?? 0));
        assert.ok(p.x + p.petWidth <= (viewport.left ?? 0) + viewport.width);
        assert.ok(p.y + p.petHeight <= (viewport.top ?? 0) + viewport.height);
        assert.ok(p.artworkSize * m.widthScale <= p.petWidth);
        assert.ok(p.artworkSize * m.heightScale + 26 <= p.petHeight);
      }
});
test('portrait uses an inert image with proportional dimensions; missing resource retains the SVG fallback', () => {
  const h = (type, props, ...children) => ({ type, props, children }),
    presentation = { pose: 'drink', animate: true };
  const im = petArtwork(h, presentation, 132, 'event-1', 'whale-dress', {
    'whale-dress': 'data:image/webp;base64,test',
  });
  assert.equal(im.type, 'img');
  assert.equal(im.props.draggable, false);
  assert.equal(im.props['aria-hidden'], true);
  assert.equal(im.props.width / im.props.height, 640 / 1024);
  assert.equal(im.props['data-animate'], true);
  assert.equal(petArtwork(h, presentation, 132, '', 'whale-dress', {}).type, 'svg');
  assert.equal(petArtwork(h, presentation, 132, '', 'xiaoxie-original', {}).type, 'svg');
});
