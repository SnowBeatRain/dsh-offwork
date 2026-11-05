import test from 'node:test';
import assert from 'node:assert/strict';
import { createPetMotion } from '../pet-motion.js';
import { petArtwork } from '../pet-view.js';

function fixture(options) {
  const document = Object.assign(new EventTarget(), { hidden: false });
  const media = Object.assign(new EventTarget(), { matches: false });
  const runs = [];
  const element = {
    dataset: {},
    style: {},
    animate(frames, timing) {
      let finish, reject;
      const finished = new Promise((resolve, fail) => {
        finish = resolve;
        reject = fail;
      });
      const run = {
        frames,
        timing,
        finished,
        finish,
        cancelled: false,
        cancel() {
          this.cancelled = true;
          reject(new Error('cancelled'));
        },
      };
      runs.push(run);
      return run;
    },
  };
  const controller = createPetMotion(element, { document, matchMedia: () => media }, options);
  return { document, media, runs, element, controller };
}

test('explicit reactions interrupt safely and old completion cannot clear the next action', async () => {
  const { controller: c, element: e, runs } = fixture();
  assert.equal(e.dataset.motion, 'idle');
  assert.equal(c.play('look'), true);
  assert.equal(c.play('greet'), true);
  await Promise.resolve();
  assert.equal(runs[0].cancelled, true);
  assert.equal(e.dataset.action, 'greet');
  c.play('celebrate');
  assert.equal(c.play('look'), false);
  assert.equal(c.play('greet'), false);
  await Promise.resolve();
  assert.equal(e.dataset.action, 'celebrate');
  runs.at(-1).finish();
  await Promise.resolve();
  assert.equal(e.dataset.action, undefined);
  assert.equal(e.dataset.motion, 'idle');
  c.destroy();
});

test('motion preference, visibility and live reduced-motion changes stop actions without replay', async () => {
  const { controller: c, element: e, document: d, media, runs } = fixture();
  c.play('celebrate');
  d.hidden = true;
  d.dispatchEvent(new Event('visibilitychange'));
  assert.equal(e.dataset.motion, 'off');
  assert.equal(e.dataset.action, undefined);
  assert.equal(runs[0].cancelled, true);
  d.hidden = false;
  d.dispatchEvent(new Event('visibilitychange'));
  assert.equal(e.dataset.motion, 'idle');
  assert.equal(runs.length, 1);
  media.matches = true;
  media.dispatchEvent(new Event('change'));
  assert.equal(c.play('greet'), false);
  assert.equal(e.dataset.motion, 'off');
  media.matches = false;
  media.dispatchEvent(new Event('change'));
  c.configure({ enabled: false, resting: false });
  assert.equal(c.play('celebrate'), false);
  c.configure({ enabled: true, resting: false });
  c.play('celebrate');
  c.configure({ enabled: true, resting: true });
  assert.equal(e.dataset.action, undefined);
  assert.equal(e.dataset.motion, 'off');
  assert.equal(c.play('greet'), true);
  c.destroy();
  d.dispatchEvent(new Event('visibilitychange'));
  assert.equal(e.dataset.motion, 'off');
  assert.equal(c.play('greet'), false);
  await Promise.resolve();
});

test('drag cancels reactions, release settles once, cancellation stays still', async () => {
  const { controller: c, element: e, runs } = fixture();
  c.play('greet');
  c.drag(-20);
  assert.equal(runs[0].cancelled, true);
  assert.equal(e.dataset.action, 'drag');
  assert.match(e.style.transform, /rotate\(-2deg\)/);
  assert.equal(c.play('look'), false);
  c.release();
  assert.equal(e.style.transform, '');
  assert.equal(e.dataset.action, 'settle');
  c.drag(20);
  c.release(true);
  assert.equal(e.dataset.action, undefined);
  assert.equal(runs.length, 2);
  c.destroy();
  await Promise.resolve();
});

test('missing or failed animation API retains usable static artwork', () => {
  const { controller: c, element: e } = fixture();
  e.animate = undefined;
  assert.equal(c.play('greet'), false);
  e.animate = () => {
    throw new Error('unavailable');
  };
  assert.equal(c.play('greet'), false);
  assert.equal(e.dataset.action, undefined);
  assert.equal(c.play('__proto__'), false);
  c.destroy();
});

test('interactive artwork keeps its DOM identity across clock poses and drinking feedback', () => {
  const h = (type, props) => ({ type, props });
  for (const model of ['whale-dress', 'xiaoxie-original']) {
    const render = (pose, token) =>
      petArtwork(
        h,
        { pose, animate: true },
        132,
        token,
        model,
        { 'whale-dress': 'data:image/webp;base64,test' },
        true,
      );
    assert.equal(render('calm', '').props.key, render('happy', 'drink-1').props.key);
    assert.equal(render('calm', '').props['data-interactive'], true);
  }
});
