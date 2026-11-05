import test from 'node:test';
import assert from 'node:assert/strict';
import { createPetVideoMotion, petVideoAlphaSupported } from '../pet-video.js';

const flush = async () => {
  for (let i = 0; i < 5; i++) await Promise.resolve();
};
function fixture({ alpha = true, rejectPlay = false } = {}) {
  const media = Object.assign(new EventTarget(), { matches: false });
  const document = Object.assign(new EventTarget(), { hidden: false });
  const videos = [],
    timers = new Map(),
    calls = [];
  let nextTimer = 0;
  document.createElement = (tag) => {
    if (tag === 'canvas')
      return {
        getContext: () => ({
          drawImage() {},
          getImageData: (x) => ({ data: [0, 0, 0, x === 1 || !alpha ? 255 : 0] }),
        }),
      };
    const video = {
      style: {},
      paused: false,
      removed: false,
      canPlayType: () => 'probably',
      setAttribute() {},
      removeAttribute(name) {
        delete this[name];
      },
      pause() {
        this.paused = true;
      },
      load() {
        if (this.src === 'probe') queueMicrotask(() => this.onloadeddata?.());
      },
      play() {
        return rejectPlay ? Promise.reject(new Error('blocked')) : Promise.resolve();
      },
      remove() {
        this.removed = true;
      },
    };
    videos.push(video);
    return video;
  };
  const host = {
    document,
    matchMedia: () => media,
    setTimeout(fn, ms) {
      const id = ++nextTimer;
      timers.set(id, { fn, ms });
      return id;
    },
    clearTimeout(id) {
      timers.delete(id);
    },
  };
  const element = { dataset: {}, querySelector: () => ({ appendChild() {} }) };
  const base = {
    play(action) {
      calls.push(action);
      return true;
    },
    configure() {},
    release() {
      delete element.dataset.action;
    },
    drag() {
      element.dataset.action = 'drag';
    },
    destroy() {
      calls.push('destroy');
    },
  };
  const motion = createPetVideoMotion(
    element,
    host,
    base,
    { greet: 'greet-data', celebrate: 'drink-data' },
    'probe',
  );
  motion.configure({ enabled: true, resting: false });
  return { host, document, media, element, base, motion, videos, timers, calls };
}

test('alpha support checks decoded pixels rather than trusting WebM codec support', async () => {
  for (const alpha of [true, false]) {
    const f = fixture({ alpha });
    assert.equal(await petVideoAlphaSupported(f.host, 'probe'), alpha);
    assert.equal(f.videos.length, 1);
    assert.equal(f.videos[0].src, undefined);
    assert.equal(f.timers.size, 0);
    f.motion.destroy();
  }
});

test('clips reveal only after playing; accepted drinking interrupts greeting and stale events cannot stop it', async () => {
  const f = fixture();
  f.motion.play('greet');
  await flush();
  const greet = f.videos.at(-1),
    staleEnd = greet.onended;
  assert.equal(f.element.dataset.videoPlaying, undefined);
  greet.onplaying();
  assert.equal(f.element.dataset.videoPlaying, 'true');
  assert.equal(greet.muted, true);
  assert.equal(greet.playsInline, true);
  assert.equal(f.motion.play('greet'), false);
  f.motion.play('celebrate');
  await flush();
  const drink = f.videos.at(-1);
  drink.onplaying();
  assert.equal(greet.removed, true);
  staleEnd();
  assert.equal(f.element.dataset.action, 'celebrate');
  assert.equal(f.motion.play('greet'), false);
  assert.equal(f.motion.play('look'), false);
  drink.onended();
  assert.equal(f.element.dataset.videoPlaying, undefined);
  assert.equal(f.element.dataset.action, undefined);
  for (const timer of [...f.timers.values()]) if (timer.ms === 150) timer.fn();
  assert.equal(drink.removed, true);
  f.motion.destroy();
});

test('motion changes and disposal cancel pending probes without late playback', async () => {
  const f = fixture();
  f.motion.play('greet');
  f.motion.configure({ enabled: false, resting: false });
  await flush();
  assert.equal(f.videos.length, 1);
  assert.equal(f.element.dataset.action, undefined);
  f.motion.configure({ enabled: true, resting: false });
  f.motion.play('greet');
  await flush();
  const oldPlaying = f.videos.at(-1).onplaying;
  f.motion.destroy();
  oldPlaying();
  assert.equal(f.element.dataset.videoPlaying, undefined);
  assert.equal(f.timers.size, 0);
  assert.equal(f.motion.play('greet'), false);
});

test('background, reduced motion, quiet time and dragging stop media without replay', async () => {
  const f = fixture();
  await flush();
  for (const kind of ['hidden', 'reduce', 'quiet', 'drag']) {
    f.motion.configure({ enabled: true, resting: false });
    f.motion.play('celebrate');
    await flush();
    const video = f.videos.at(-1);
    video.onplaying();
    if (kind === 'hidden') {
      f.document.hidden = true;
      f.document.dispatchEvent(new Event('visibilitychange'));
    }
    if (kind === 'reduce') {
      f.media.matches = true;
      f.media.dispatchEvent(new Event('change'));
    }
    if (kind === 'quiet') f.motion.configure({ enabled: true, resting: true });
    if (kind === 'drag') f.motion.drag(10);
    assert.equal(video.removed, true);
    assert.equal(f.element.dataset.videoPlaying, undefined);
    const count = f.videos.length;
    f.document.hidden = false;
    f.media.matches = false;
    f.document.dispatchEvent(new Event('visibilitychange'));
    f.media.dispatchEvent(new Event('change'));
    f.motion.release(true);
    await flush();
    assert.equal(f.videos.length, count);
  }
  f.motion.destroy();
});

test('unsupported alpha, rejected playback and a stalled clip fall back without repeatedly loading bad media', async () => {
  for (const options of [{ alpha: false }, { rejectPlay: true }, {}]) {
    const f = fixture(options);
    f.motion.play('greet');
    await flush();
    if (!options.alpha && options.alpha !== false && !options.rejectPlay) {
      const watchdog = [...f.timers.values()].find((t) => t.ms === 9000);
      watchdog.fn();
      await flush();
    }
    assert.deepEqual(f.calls, ['greet']);
    assert.equal(f.element.dataset.videoPlaying, undefined);
    const count = f.videos.length;
    f.motion.play('greet');
    await flush();
    assert.equal(f.videos.length, count);
    assert.deepEqual(f.calls, ['greet', 'greet']);
    f.motion.destroy();
    assert.equal(f.timers.size, 0);
  }
});
