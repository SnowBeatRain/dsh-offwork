// Presentation only: no clocks, storage, salary data or reminder side effects.
export function companionPresentation({
  workStatus,
  phase,
  ownsPrompt = false,
  ready = true,
  failed = false,
  feedback = null,
  visible = true,
  motion = true,
  pageVisible = true,
}) {
  if (!visible)
    return { visible: false, pose: 'calm', message: null, announce: false, animate: false };
  let pose = 'calm';
  let message = 'companionWorking';
  const quiet = ['quiet', 'paused'].includes(phase);
  if (!ready) {
    pose = 'rest';
    message = 'companionLoading';
  } else if (failed) {
    pose = 'offline';
    message = 'companionUnavailable';
  } else if (quiet) {
    pose = 'quiet';
    message = phase === 'quiet' ? 'companionQuiet' : 'companionPaused';
  } else if (phase === 'due' && ownsPrompt) {
    pose = 'drink';
    message = null;
  } else if (workStatus === 'lunch') {
    pose = 'rest';
    message = 'companionBreak';
  } else if (workStatus === 'rest') {
    pose = 'rest';
    message = 'companionDayOff';
  } else if (workStatus === 'done') {
    pose = 'happy';
    message = 'companionDone';
  } else if (workStatus === 'before') {
    pose = 'rest';
    message = 'companionBefore';
  }
  let announce = false;
  let animate = false;
  if (ready && !failed && !(phase === 'due' && ownsPrompt) && feedback) {
    message = feedback.key;
    announce = true;
    if (feedback.kind === 'drink' && !quiet) {
      pose = 'happy';
      animate = motion && pageVisible;
    }
  }
  return { visible: true, pose, message, announce, animate };
}

// Original vector character. Its art is decorative; controls and status text
// provide the accessible names. Stable keys prevent the 1-second clock tick
// from replaying the reaction animation.
export function companionArtwork(h, presentation, size = 40, reaction = '') {
  const { pose, animate } = presentation;
  const asleep = ['rest', 'quiet'].includes(pose);
  const path = (d, props = {}) => h('path', { d, ...props });
  return h(
    'svg',
    {
      key: pose + ':' + reaction,
      className: 'owc-companion-art',
      viewBox: '0 0 64 64',
      width: size,
      height: size,
      'aria-hidden': 'true',
      focusable: 'false',
      'data-pose': pose,
      'data-animate': animate,
    },
    h('ellipse', { cx: 32, cy: 58, rx: 19, ry: 3, className: 'owc-companion-shadow' }),
    h(
      'g',
      { className: 'owc-companion-body' },
      path('M32 7C28 18 12 28 12 42C12 54 21 58 32 58S52 54 52 42C52 28 36 18 32 7Z', {
        className: 'owc-companion-skin',
      }),
      path('M25 21C21 25 18 29 17 34', { className: 'owc-companion-shine' }),
      h(
        'g',
        { className: 'owc-companion-face' },
        asleep
          ? path('M21 38Q24 41 27 38M37 38Q40 41 43 38')
          : h(
              'g',
              null,
              h('circle', { cx: 24, cy: 38, r: 1.7, fill: 'currentColor', stroke: 'none' }),
              h('circle', { cx: 40, cy: 38, r: 1.7, fill: 'currentColor', stroke: 'none' }),
            ),
        path(
          pose === 'happy'
            ? 'M27 44Q32 51 37 44Z'
            : pose === 'offline'
              ? 'M29 46H35'
              : 'M28 45Q32 49 36 45',
        ),
      ),
      h(
        'g',
        { className: 'owc-companion-cheeks' },
        h('ellipse', { cx: 20, cy: 44, rx: 3, ry: 1.6 }),
        h('ellipse', { cx: 44, cy: 44, rx: 3, ry: 1.6 }),
      ),
      pose === 'happy' && path('M12 44L7 38M52 44L57 38', { className: 'owc-companion-limbs' }),
      pose === 'drink' &&
        h(
          'g',
          { className: 'owc-companion-cup' },
          path('M43 41H55L53 54H45Z'),
          path('M55 43H58Q62 47 55 49', { fill: 'none' }),
        ),
      pose === 'quiet' && path('M45 16H51L45 22H51', { className: 'owc-companion-limbs' }),
    ),
  );
}

export const COMPANION_MESSAGES = {
  zh: {
    companionName: '小歇',
    companionLabel: '下班搭子',
    companionOpen: '打开小歇的快捷操作',
    companionShow: '显示陪伴角色',
    companionMotion: '角色动作反馈',
    companionPreferences: '立即生效，保存在本浏览器。隐藏角色后仍可使用计时和喝水操作。',
    companionWorking: '你忙你的，我陪你记着时间。',
    companionQuiet: '好，先安静陪着你。',
    companionPaused: '提醒先暂停，需要时再叫我。',
    companionBreak: '休息一下，回来再继续。',
    companionBefore: '还没开工，先慢慢准备。',
    companionDone: '这一班结束啦，辛苦了。',
    companionDayOff: '今天歇一歇，按自己的节奏来。',
    companionLoading: '稍等，我看看现在的状态。',
    companionUnavailable: '暂时读不到提醒状态，可以重试读取。',
  },
  en: {
    companionName: 'Xiaoxie',
    companionLabel: 'Your workday companion',
    companionOpen: 'Open companion quick actions',
    companionShow: 'Show companion',
    companionMotion: 'Character reactions',
    companionPreferences:
      'Applies immediately in this browser. Timers and water actions work with the character hidden.',
    companionWorking: 'Carry on. I’ll keep an eye on the time.',
    companionQuiet: 'I’ll keep you company quietly.',
    companionPaused: 'Reminders are paused. Resume whenever you like.',
    companionBreak: 'Take a break. We can carry on afterward.',
    companionBefore: 'No rush. Your shift hasn’t started yet.',
    companionDone: 'That’s your shift done. Take a breather.',
    companionDayOff: 'A day off. Enjoy your own pace.',
    companionLoading: 'One moment while I check the status.',
    companionUnavailable: 'I can’t read reminder status. You can retry loading.',
  },
};

export const COMPANION_STYLE = `
.owc-sr-only{position:absolute!important;width:1px;height:1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.owc-mini-feedback{margin:0;padding:0 14px 9px;max-width:260px;font-size:11px;line-height:1.6;overflow-wrap:anywhere}
.owc-companion{display:flex;align-items:center;gap:10px;padding:12px 17px 8px;cursor:default}
.owc-companion-copy{min-width:0;flex:1}
.owc-companion-name{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--dsw-alias-label-secondary);font-weight:600}
.owc-companion-name span{font-size:10px;font-weight:400}
.owc-companion p{margin:5px 0 0;font-size:12px;line-height:1.65;overflow-wrap:anywhere}
.owc-water .owc-companion{padding:4px 0 8px;border-bottom:1px solid color-mix(in srgb,var(--owc-accent) 10%,transparent);margin-bottom:8px}
.owc-v2 button.owc-companion-trigger{padding:0;flex:none;min-width:36px;min-height:36px;border-radius:12px}
.owc-companion-art{flex:none;overflow:visible;color:var(--owc-accent);pointer-events:none}
.owc-companion-shadow{fill:currentColor;opacity:.12}
.owc-companion-skin{fill:color-mix(in srgb,var(--owc-accent) 22%,var(--dsw-alias-bg-overlay));stroke:currentColor;stroke-width:1.6;stroke-linejoin:round}
.owc-companion-shine{fill:none;stroke:white;stroke-width:2.5;stroke-linecap:round;opacity:.75}
.owc-companion-face{color:var(--dsw-alias-label-primary);fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.owc-companion-cheeks{fill:#ef8d96;opacity:.5}
.owc-companion-limbs{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.owc-companion-cup{fill:var(--dsw-alias-bg-overlay);stroke:currentColor;stroke-width:1.6;stroke-linejoin:round}
.owc-companion-art[data-pose=offline]{opacity:.65}
.owc-companion-art[data-animate=true] .owc-companion-body{transform-origin:32px 52px;animation:owc-companion-thanks .65s ease-in-out 2}
@keyframes owc-companion-thanks{0%,100%{transform:translateY(0) rotate(0)}40%{transform:translateY(-2px) rotate(-3deg)}70%{transform:translateY(0) rotate(2deg)}}
@media(prefers-reduced-motion:reduce){.owc-companion-art *{animation:none!important;transition:none!important}}
`;
