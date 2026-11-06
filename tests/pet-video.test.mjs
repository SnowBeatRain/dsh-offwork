import test from 'node:test';
import assert from 'node:assert/strict';
import { createPetVideoMotion, petVideoAlphaSupported } from '../pet-video.js';

const flush = async () => {
  for (let i = 0; i < 5; i++) await Promise.resolve();
};
function fixture({ alpha = true, rejectPlay = false, idle = false, options = {} } = {}) {
  const media = Object.assign(new EventTarget(), { matches: false });
  const document = Object.assign(new EventTarget(), { hidden: false });
  const videos = [],
    timers = new Map(),
    calls = [],
    states = [];
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
      duration: 5,
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
    { greet: 'greet-data', celebrate: 'drink-data', ...(idle ? { idle: 'idle-data' } : {}) },
    'probe',
    { ...options, onStateChange: (state) => states.push(state) },
  );
  motion.configure({ enabled: true, resting: false });
  return { host, document, media, element, base, motion, videos, timers, calls, states };
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
  assert.equal(greet.removed, false);
  assert.equal(greet.paused, false);
  assert.equal(f.element.dataset.action, 'greet');
  assert.equal(f.element.dataset.videoLoading, 'celebrate');
  assert.equal(drink.style.opacity, '0');
  drink.onplaying();
  assert.equal(greet.paused, true);
  assert.equal(greet.style.opacity, '0');
  await fireTimer(f, 150);
  assert.equal(greet.removed, true);
  staleEnd();
  assert.equal(f.element.dataset.action, 'celebrate');
  assert.equal(f.motion.play('greet'), false);
  assert.equal(f.motion.play('look'), false);
  drink.onended();
  assert.equal(f.element.dataset.videoPlaying, undefined);
  assert.equal(f.element.dataset.action, undefined);
  await fireTimer(f, 150);
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

async function fireTimer(f, milliseconds) {
  const found = [...f.timers].find(([, timer]) => timer.ms === milliseconds);
  assert.ok(found, `Expected ${milliseconds}ms timer`);
  f.timers.delete(found[0]);
  found[1].fn();
  await flush();
}

test('idle loops are interrupted by actions and resume once after action completion', async () => {
  const f = fixture({ idle: true });
  await flush();
  const idle = f.videos.at(-1);
  idle.onplaying();
  assert.equal(idle.loop, true);
  assert.equal(f.timers.size, 0);
  assert.equal(f.motion.play('look'), false);
  f.motion.play('greet');
  await flush();
  const greet = f.videos.at(-1);
  greet.onplaying();
  assert.equal(idle.paused, true);
  await fireTimer(f, 150);
  assert.equal(idle.removed, true);
  assert.equal(greet.loop, false);
  const oldEnd = greet.onended;
  f.motion.play('celebrate');
  await flush();
  const drink = f.videos.at(-1);
  drink.duration = 7.5;
  drink.onplaying();
  assert.ok([...f.timers.values()].some((t) => t.ms === 9500));
  oldEnd();
  assert.equal(f.element.dataset.action, 'celebrate');
  drink.onended();
  await fireTimer(f, 0);
  assert.equal(f.videos.at(-1).src, 'idle-data');
  assert.equal(f.videos.at(-1).loop, true);
  f.motion.destroy();
  assert.equal(f.timers.size, 0);
});

test('returning from hidden or reduced-motion state starts idle rather than replaying an action', async () => {
  const f = fixture({ idle: true });
  await flush();
  f.motion.play('greet');
  await flush();
  f.document.hidden = true;
  f.document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(f.element.dataset.action, undefined);
  f.document.hidden = false;
  f.document.dispatchEvent(new Event('visibilitychange'));
  await fireTimer(f, 0);
  assert.equal(f.videos.at(-1).src, 'idle-data');
  f.media.matches = true;
  f.media.dispatchEvent(new Event('change'));
  const count = f.videos.length;
  f.motion.configure({ enabled: true, resting: false });
  await flush();
  assert.equal(f.videos.length, count);
  f.media.matches = false;
  f.media.dispatchEvent(new Event('change'));
  await fireTimer(f, 0);
  assert.equal(f.videos.at(-1).src, 'idle-data');
  f.motion.destroy();
  assert.equal(f.timers.size, 0);
});

test('quiet state and a held drag suppress idle until they finish', async () => {
  const f = fixture({ idle: true });
  await flush();
  f.motion.configure({ enabled: true, resting: true });
  const count = f.videos.length;
  await flush();
  assert.equal(f.videos.length, count);
  f.motion.play('greet');
  await flush();
  f.videos.at(-1).onended();
  await flush();
  assert.equal(f.element.dataset.action, undefined);
  f.motion.configure({ enabled: true, resting: false });
  await flush();
  f.motion.drag(1);
  const before = f.videos.length;
  f.motion.configure({ enabled: true, resting: false });
  await flush();
  assert.equal(f.videos.length, before);
  assert.equal(f.element.dataset.action, 'drag');
  f.motion.release(false);
  await fireTimer(f, 650);
  assert.equal(f.videos.at(-1).src, 'idle-data');
  f.motion.destroy();
  assert.equal(f.timers.size, 0);
});

test('a stalled idle clip fails closed without disabling usable action clips', async () => {
  const f = fixture({ idle: true });
  await flush();
  const idle = f.videos.at(-1);
  idle.onplaying();
  idle.onwaiting();
  await fireTimer(f, 4000);
  assert.equal(idle.removed, true);
  const count = f.videos.length;
  f.motion.configure({ enabled: true, resting: false });
  await flush();
  assert.equal(f.videos.length, count);
  f.motion.play('greet');
  await flush();
  const greet = f.videos.at(-1);
  greet.onplaying();
  greet.onended();
  await flush();
  assert.equal(f.element.dataset.action, undefined);
  f.motion.destroy();
  assert.equal(f.timers.size, 0);
});

test('failed action fallback suspends idle during CSS feedback and then returns to idle', async () => {
  const f = fixture({ idle: true });
  await flush();
  f.motion.play('greet');
  await flush();
  f.videos.at(-1).onerror();
  assert.deepEqual(f.calls, ['greet']);
  await fireTimer(f, 1400);
  const idle = f.videos.at(-1);
  idle.onplaying();
  const count = f.videos.length;
  f.motion.play('greet');
  await flush();
  assert.equal(idle.removed, true);
  assert.equal(f.videos.length, count);
  assert.deepEqual(f.calls, ['greet', 'greet']);
  await fireTimer(f, 1400);
  assert.equal(f.videos.at(-1).src, 'idle-data');
  f.motion.destroy();
  assert.equal(f.timers.size, 0);
});

test('preview waits for explicit play, switches actions freely and never resumes idle automatically', async () => {
  const f = fixture({
    idle: true,
    options: { autoIdle: false, fallback: false, interruptible: true },
  });
  await flush();
  assert.equal(f.videos.length, 0);
  f.motion.play('greet');
  await flush();
  const greet = f.videos.at(-1);
  greet.onplaying();
  const announcements = f.states.length;
  greet.onplaying();
  assert.equal(f.states.length, announcements);
  greet.onended();
  await flush();
  assert.equal(f.states.at(-1).phase, 'idle');
  assert.equal(f.videos.length, 2);
  await fireTimer(f, 150);
  f.motion.play('idle');
  await flush();
  f.videos.at(-1).onplaying();
  f.motion.play('celebrate');
  await flush();
  f.videos.at(-1).onplaying();
  assert.equal(f.motion.play('greet'), true);
  await flush();
  f.videos.at(-1).onplaying();
  assert.equal(f.motion.play('idle'), true);
  await flush();
  f.videos.at(-1).onplaying();
  assert.ok(f.videos.filter((v) => v.src && !v.removed).length <= 2);
  f.motion.stop();
  assert.equal(f.element.dataset.videoPlaying, undefined);
  assert.equal(f.states.at(-1).phase, 'idle');
  assert.deepEqual(f.calls, []);
  f.motion.destroy();
  assert.equal(f.timers.size, 0);
});

test('preview cancellation ignores late probe and video callbacks', async () => {
  const f = fixture({ options: { autoIdle: false, fallback: false, interruptible: true } });
  f.motion.play('greet');
  f.motion.stop();
  await flush();
  assert.equal(f.videos.length, 1);
  assert.deepEqual(
    f.states.map((s) => s.phase),
    ['loading', 'idle'],
  );
  f.motion.play('greet');
  await flush();
  const late = f.videos.at(-1).onplaying;
  f.motion.stop();
  late();
  assert.equal(f.states.at(-1).phase, 'idle');
  const count = f.states.length;
  f.motion.destroy();
  late();
  assert.equal(f.states.length, count);
  assert.equal(f.timers.size, 0);
});

test('preview reports media failure without pretending to play and supports explicit retry', async () => {
  const f = fixture({
    rejectPlay: true,
    options: { autoIdle: false, fallback: false, interruptible: true },
  });
  f.motion.play('greet');
  await flush();
  assert.equal(f.states.at(-1).phase, 'unavailable');
  assert.deepEqual(f.calls, []);
  const create = f.document.createElement;
  f.document.createElement = (tag) => {
    const node = create(tag);
    if (tag === 'video') node.play = () => Promise.resolve();
    return node;
  };
  assert.equal(f.motion.retry('greet'), true);
  await flush();
  f.videos.at(-1).onplaying();
  assert.equal(f.states.at(-1).phase, 'playing');
  f.motion.destroy();
  assert.equal(f.timers.size, 0);
});

test('preview distinguishes unsupported transparency from retryable resource failures', async () => {
  const f = fixture({
    alpha: false,
    options: { autoIdle: false, fallback: false, interruptible: true },
  });
  f.motion.play('greet');
  await flush();
  assert.equal(f.states.at(-1).phase, 'unsupported');
  assert.deepEqual(f.calls, []);
  const count = f.videos.length;
  f.motion.retry('greet');
  await flush();
  assert.equal(f.videos.length, count);
  assert.equal(f.states.at(-1).phase, 'unsupported');
  f.motion.destroy();
  assert.equal(f.timers.size, 0);
});
