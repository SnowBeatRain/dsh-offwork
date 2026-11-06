// Independent media presentation; never writes settings or hydration records.
const PET_VIDEO_SUPPORT = new WeakMap();

export function petClipUrls(models, baseURI) {
  try {
    const base = new URL(baseURI);
    if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password) return {};
    const prefix = new URL('offwork-clock/media/', base);
    return Object.fromEntries(
      Object.entries(models).map(([model, actions]) => [
        model,
        Object.fromEntries(
          Object.entries(actions).flatMap(([action, path]) => {
            if (typeof path !== 'string' || !path.startsWith('offwork-clock/media/')) return [];
            const url = new URL(path, base);
            return url.origin === base.origin &&
              url.pathname.startsWith(prefix.pathname) &&
              !url.search &&
              !url.hash
              ? [[action, url.href]]
              : [];
          }),
        ),
      ]),
    );
  } catch {
    return {};
  }
}

export function petVideoAlphaSupported(host, source) {
  if (PET_VIDEO_SUPPORT.has(host)) return PET_VIDEO_SUPPORT.get(host);
  const result = new Promise((resolve) => {
    const video = host.document.createElement('video');
    let timer;
    const finish = (supported) => {
      host.clearTimeout(timer);
      video.onloadeddata = video.onerror = null;
      video.pause();
      video.removeAttribute('src');
      video.load();
      resolve(supported);
    };
    if (!source || !video.canPlayType('video/webm; codecs="vp9"')) return finish(false);
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.onloadeddata = () => {
      try {
        const canvas = host.document.createElement('canvas');
        canvas.width = canvas.height = 16;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        context.drawImage(video, 0, 0, 16, 16);
        finish(
          context.getImageData(1, 1, 1, 1).data[3] > 240 &&
            context.getImageData(14, 14, 1, 1).data[3] < 8,
        );
      } catch {
        finish(false);
      }
    };
    video.onerror = () => finish(false);
    timer = host.setTimeout(() => finish(false), 3000);
    video.src = source;
    video.load();
  });
  PET_VIDEO_SUPPORT.set(host, result);
  return result;
}

export function createPetVideoMotion(element, host, base, clips, probeSource, options = {}) {
  const layer = element.querySelector('.owc-pet-video-layer');
  const poster = element.querySelector('.owc-pet-video-poster');
  if (!layer || !clips) return base;
  const document = host.document;
  const reduced = host.matchMedia?.('(prefers-reduced-motion: reduce)');
  const autoIdle = options.autoIdle !== false;
  const useFallback = options.fallback !== false;
  const failed = new Set(),
    retired = new Map();
  let enabled = false,
    resting = false,
    dragging = false,
    unsupported = false;
  let destroyed = false,
    idleTimer = null,
    current = null,
    displayed = null,
    lastState = '';
  const allowed = () => enabled && !destroyed && !document.hidden && !reduced?.matches;
  const canIdle = () =>
    autoIdle &&
    allowed() &&
    !resting &&
    !dragging &&
    !unsupported &&
    Object.hasOwn(clips, 'idle') &&
    !failed.has('idle');
  function notify(phase, action = null) {
    if (destroyed || lastState === phase + ':' + action) return;
    lastState = phase + ':' + action;
    options.onStateChange?.({ phase, action });
  }
  function clearIdleTimer() {
    host.clearTimeout(idleTimer);
    idleTimer = null;
  }
  function startIdle() {
    if (canIdle() && !current) play('idle');
  }
  function scheduleIdle(delay = 0) {
    clearIdleTimer();
    if (!canIdle()) return;
    idleTimer = host.setTimeout(() => {
      idleTimer = null;
      startIdle();
    }, delay);
  }
  function dispose(run) {
    if (!run || run.disposed) return;
    run.disposed = true;
    host.clearTimeout(run.timer);
    const video = run.video;
    if (!video) return;
    video.onplaying = video.onended = video.onerror = video.onwaiting = video.onstalled = null;
    video.pause();
    video.removeAttribute('src');
    video.load();
    video.remove();
  }
  function flushRetired() {
    for (const [run, timer] of retired) {
      host.clearTimeout(timer);
      dispose(run);
    }
    retired.clear();
  }
  function retire(run, fade) {
    if (!run?.video || !fade || !allowed()) return dispose(run);
    host.clearTimeout(run.timer);
    run.video.onplaying =
      run.video.onended =
      run.video.onerror =
      run.video.onwaiting =
      run.video.onstalled =
        null;
    run.video.pause();
    run.video.style.opacity = '0';
    const timer = host.setTimeout(() => {
      retired.delete(run);
      dispose(run);
    }, 150);
    retired.set(run, timer);
  }
  function settleVisibleFrame() {
    if (!displayed?.video) return;
    displayed.video.style.transition = 'none';
    displayed.video.style.opacity = '1';
    if (poster?.style) {
      poster.style.transition = 'none';
      poster.style.opacity = '0';
    }
    displayed.video.getBoundingClientRect?.();
    displayed.video.style.transition = '';
    if (poster?.style) {
      poster.style.opacity = '';
      poster.style.transition = '';
    }
  }
  function stopMedia(fade = false) {
    if (!fade && poster?.style) poster.style.transition = 'none';
    clearIdleTimer();
    flushRetired();
    const pending = current,
      visible = displayed;
    current = displayed = null;
    delete element.dataset.videoPlaying;
    delete element.dataset.videoLoading;
    delete element.dataset.action;
    if (pending && pending !== visible) dispose(pending);
    retire(visible, fade);
    if (!fade && poster?.style) {
      poster.getBoundingClientRect?.();
      poster.style.transition = '';
    }
  }
  function fallback(run, broken = false) {
    if (current !== run) return;
    if (broken) failed.add(run.action);
    stopMedia();
    notify('unavailable', run.action);
    if (allowed() && run.action !== 'idle' && useFallback) {
      base.play(run.action);
      scheduleIdle(1400);
    }
  }
  function play(action) {
    if (!allowed() || dragging || element.dataset.action === 'drag') return false;
    if (action === 'idle' && (resting || (current && !options.interruptible) || unsupported))
      return false;
    if (
      current &&
      (action === 'look' ||
        current.action === action ||
        (!options.interruptible && current.action === 'celebrate' && action === 'greet'))
    )
      return false;
    if (!Object.hasOwn(clips, action) || failed.has(action) || unsupported) {
      if (action === 'idle') return false;
      if (current?.action === 'idle') stopMedia();
      const played = useFallback && base.play(action);
      if (played) scheduleIdle(1400);
      if (!played) notify('unavailable', action);
      return !!played;
    }
    clearIdleTimer();
    settleVisibleFrame();
    flushRetired();
    if (current && current !== displayed) dispose(current);
    base.release(true);
    const run = { action, video: null, timer: null, disposed: false };
    current = run;
    element.dataset.action = displayed?.action || action;
    element.dataset.videoLoading = action;
    notify('loading', action);
    run.timer = host.setTimeout(() => fallback(run, true), 9000);
    petVideoAlphaSupported(host, probeSource).then((supported) => {
      if (current !== run || !allowed()) return;
      if (!supported) {
        unsupported = true;
        return fallback(run);
      }
      const video = document.createElement('video');
      run.video = video;
      video.muted = video.defaultMuted = true;
      video.playsInline = true;
      video.loop = action === 'idle';
      video.disablePictureInPicture = true;
      video.preload = 'auto';
      video.style.opacity = '0';
      video.setAttribute('aria-hidden', 'true');
      video.setAttribute('playsinline', '');
      video.setAttribute('tabindex', '-1');
      video.onplaying = () => {
        if (current !== run || !allowed()) return;
        if (!Number.isFinite(video.duration) || video.duration <= 0 || video.duration > 15)
          return fallback(run, true);
        host.clearTimeout(run.timer);
        run.timer =
          action === 'idle'
            ? null
            : host.setTimeout(() => fallback(run, true), video.duration * 1000 + 2000);
        const previous = displayed;
        displayed = run;
        video.style.opacity = '1';
        element.dataset.action = action;
        element.dataset.videoPlaying = 'true';
        delete element.dataset.videoLoading;
        if (previous !== run) retire(previous, true);
        notify('playing', action);
      };
      video.onwaiting = video.onstalled = () => {
        if (current !== run) return;
        host.clearTimeout(run.timer);
        run.timer = host.setTimeout(() => fallback(run, true), 4000);
      };
      video.onended = () => {
        if (current !== run) return;
        host.clearTimeout(run.timer);
        if (canIdle()) {
          current = null;
          if (displayed !== run) dispose(run);
          scheduleIdle();
        } else {
          stopMedia(true);
          notify('idle');
        }
      };
      video.onerror = () => fallback(run, true);
      video.src = clips[action];
      layer.appendChild(video);
      try {
        Promise.resolve(video.play()).catch(() => fallback(run, true));
      } catch {
        fallback(run, true);
      }
    });
    return true;
  }
  function stop() {
    stopMedia();
    base.release(true);
    notify('idle');
  }
  const visibility = () => {
    if (!allowed()) stop();
    else scheduleIdle();
  };
  document.addEventListener('visibilitychange', visibility);
  reduced?.addEventListener?.('change', visibility);
  return {
    play,
    stop,
    retry(action) {
      failed.delete(action);
      return play(action);
    },
    configure(next) {
      if (!next.enabled || (next.resting && !resting)) stopMedia();
      enabled = next.enabled;
      resting = next.resting;
      base.configure(next);
      if (!enabled) notify('idle');
      startIdle();
    },
    drag(direction) {
      dragging = true;
      stopMedia();
      base.drag(direction);
    },
    release(cancelled) {
      dragging = false;
      base.release(cancelled);
      scheduleIdle(cancelled ? 0 : 650);
    },
    destroy() {
      destroyed = true;
      stopMedia();
      document.removeEventListener('visibilitychange', visibility);
      reduced?.removeEventListener?.('change', visibility);
      base.destroy();
    },
  };
}
