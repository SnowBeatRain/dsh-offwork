// Independent, decorative motion only. Never writes preferences or drinking records.
const PET_ACTIONS = {
  look: { duration: 650, transforms: ['none', 'rotate(-1deg) translateY(-1px)', 'none'] },
  greet: {
    duration: 900,
    transforms: ['none', 'translateY(2px) rotate(-2deg)', 'translateY(-4px) rotate(1deg)', 'none'],
  },
  celebrate: {
    duration: 1200,
    transforms: [
      'none',
      'translateY(-7px) rotate(-1deg)',
      'translateY(1px)',
      'translateY(-3px) rotate(1deg)',
      'none',
    ],
  },
  settle: {
    duration: 550,
    transforms: ['none', 'translateY(2px) scaleY(.985)', 'translateY(-2px)', 'none'],
  },
};

export function createPetMotion(element, host, options = {}) {
  const document = host.document;
  const reduced = host.matchMedia?.('(prefers-reduced-motion: reduce)');
  const ambient = options.ambient !== false;
  let enabled = options.enabled ?? true;
  let resting = options.resting ?? false;
  let animation = null;
  let destroyed = false;
  const allowed = () => !destroyed && enabled && !document.hidden && !reduced?.matches;
  function stop() {
    const previous = animation;
    animation = null;
    previous?.cancel();
    delete element.dataset.action;
    element.style.transform = '';
  }
  function sync() {
    if (!allowed()) stop();
    element.dataset.motion = allowed() && !resting && ambient ? 'idle' : 'off';
  }
  function play(action) {
    if (!allowed() || !Object.hasOwn(PET_ACTIONS, action) || !element.animate) return false;
    if (element.dataset.action === 'drag') return false;
    if (action === 'look' && element.dataset.action) return false;
    if (action === 'greet' && element.dataset.action === 'celebrate') return false;
    stop();
    const spec = PET_ACTIONS[action];
    element.dataset.action = action;
    try {
      const running = element.animate(
        spec.transforms.map((transform) => ({ transform })),
        {
          duration: spec.duration,
          easing: 'ease-in-out',
        },
      );
      animation = running;
      running.finished.then(
        () => {
          if (animation === running) {
            animation = null;
            delete element.dataset.action;
          }
        },
        () => {
          if (animation === running) {
            animation = null;
            delete element.dataset.action;
          }
        },
      );
      return true;
    } catch {
      stop();
      return false;
    }
  }
  document.addEventListener('visibilitychange', sync);
  reduced?.addEventListener?.('change', sync);
  sync();
  return {
    play,
    configure(next) {
      if (next.resting && !resting) stop();
      enabled = next.enabled;
      resting = next.resting;
      sync();
    },
    drag(direction) {
      if (!allowed()) return;
      stop();
      element.dataset.action = 'drag';
      element.style.transform = `translateY(-2px) rotate(${direction < 0 ? -2 : 2}deg)`;
    },
    release(cancelled = false) {
      const dragged = element.dataset.action === 'drag';
      stop();
      if (dragged && !cancelled) play('settle');
    },
    destroy() {
      destroyed = true;
      stop();
      element.dataset.motion = 'off';
      document.removeEventListener('visibilitychange', sync);
      reduced?.removeEventListener?.('change', sync);
    },
  };
}
