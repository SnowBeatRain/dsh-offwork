// Independent transparent-video playback. Presentation only; never records an action.
const PET_VIDEO_SUPPORT = new WeakMap();

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

export function createPetVideoMotion(element, host, base, clips, probeSource) {
  const layer = element.querySelector('.owc-pet-video-layer');
  if (!layer || !clips) return base;
  const document = host.document;
  const reduced = host.matchMedia?.('(prefers-reduced-motion: reduce)');
  const capability = petVideoAlphaSupported(host, probeSource);
  const failed = new Set();
  const retired = new Map();
  let enabled = false,
    resting = false,
    dragging = false,
    unsupported = false,
    idleTimer = null,
    destroyed = false,
    current = null;
  const allowed = () => enabled && !destroyed && !document.hidden && !reduced?.matches;
  function clearIdleTimer() {
    host.clearTimeout(idleTimer);
    idleTimer = null;
  }
  function startIdle() {
    if (
      allowed() &&
      !resting &&
      !dragging &&
      !current &&
      !unsupported &&
      Object.hasOwn(clips, 'idle') &&
      !failed.has('idle')
    )
      play('idle');
  }
  function scheduleIdle(delay = 0) {
    clearIdleTimer();
    if (!Object.hasOwn(clips, 'idle') || failed.has('idle') || unsupported || destroyed) return;
    idleTimer = host.setTimeout(() => {
      idleTimer = null;
      startIdle();
    }, delay);
  }
  function dispose(video) {
    video.onplaying = video.onended = video.onerror = video.onwaiting = video.onstalled = null;
    video.pause();
    video.removeAttribute('src');
    video.load();
    video.remove();
  }
  function stop(fade = false) {
    clearIdleTimer();
    const run = current;
    if (!run) return;
    current = null;
    host.clearTimeout(run.timer);
    delete element.dataset.videoPlaying;
    if (element.dataset.action === run.action) delete element.dataset.action;
    if (!run.video) return;
    const video = run.video;
    video.onplaying = video.onended = video.onerror = video.onwaiting = video.onstalled = null;
    video.pause();
    video.style.opacity = '0';
    if (fade && allowed()) {
      const timer = host.setTimeout(() => {
        retired.delete(video);
        dispose(video);
      }, 150);
      retired.set(video, timer);
    } else dispose(video);
  }
  function fallback(run, broken = false) {
    if (current !== run) return;
    if (broken) failed.add(run.action);
    stop();
    if (allowed() && run.action !== 'idle') {
      base.play(run.action);
      scheduleIdle(1400);
    }
  }
  function play(action) {
    if (!allowed() || dragging || element.dataset.action === 'drag') return false;
    if (action === 'idle' && (resting || current || unsupported)) return false;
    if (
      current &&
      (action === 'look' ||
        current.action === action ||
        (current.action === 'celebrate' && action === 'greet'))
    )
      return false;
    if (!Object.hasOwn(clips, action) || failed.has(action) || unsupported) {
      if (action === 'idle') return false;
      if (current?.action === 'idle') stop();
      const played = base.play(action);
      if (played) scheduleIdle(1400);
      return played;
    }
    stop();
    base.release(true);
    const run = { action, video: null, timer: null };
    current = run;
    element.dataset.action = action;
    run.timer = host.setTimeout(() => fallback(run, true), 9000);
    capability.then((supported) => {
      if (current !== run || !allowed()) return;
      if (!supported) {
        unsupported = true;
        return fallback(run);
      }
      const video = document.createElement('video');
      run.video = video;
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.loop = action === 'idle';
      video.disablePictureInPicture = true;
      video.preload = 'auto';
      video.setAttribute('aria-hidden', 'true');
      video.setAttribute('playsinline', '');
      video.onplaying = () => {
        if (current !== run || !allowed()) return;
        if (!Number.isFinite(video.duration) || video.duration <= 0 || video.duration > 15)
          return fallback(run, true);
        host.clearTimeout(run.timer);
        run.timer =
          action === 'idle'
            ? null
            : host.setTimeout(() => fallback(run, true), video.duration * 1000 + 2000);
        element.dataset.videoPlaying = 'true';
      };
      video.onwaiting = video.onstalled = () => {
        if (current !== run) return;
        host.clearTimeout(run.timer);
        run.timer = host.setTimeout(() => fallback(run, true), 4000);
      };
      video.onended = () => {
        if (current === run) {
          stop(true);
          scheduleIdle();
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
  const visibility = () => {
    if (!allowed()) stop();
    else scheduleIdle();
  };
  document.addEventListener('visibilitychange', visibility);
  reduced?.addEventListener?.('change', visibility);
  return {
    play,
    configure(next) {
      if (!next.enabled || (next.resting && !resting)) stop();
      enabled = next.enabled;
      resting = next.resting;
      base.configure(next);
      startIdle();
    },
    drag(direction) {
      dragging = true;
      stop();
      base.drag(direction);
    },
    release(cancelled) {
      dragging = false;
      base.release(cancelled);
      scheduleIdle(cancelled ? 0 : 650);
    },
    destroy() {
      destroyed = true;
      stop();
      for (const [video, timer] of retired) {
        host.clearTimeout(timer);
        dispose(video);
      }
      retired.clear();
      document.removeEventListener('visibilitychange', visibility);
      reduced?.removeEventListener?.('change', visibility);
      base.destroy();
    },
  };
}
