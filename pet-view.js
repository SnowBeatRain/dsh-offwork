// Independent Harness pet presentation. No third-party pet code or assets.
export const PET_MODEL = Object.freeze({ id: 'xiaoxie-original', renderer: 'svg', license: 'MIT' });

export const PET_MODELS = Object.freeze({
  'whale-ornate-actions': {
    id: 'whale-ornate-actions',
    renderer: 'video',
    widthScale: 1.3125,
    heightScale: 2.1,
    label: 'petWhaleOrnateActions',
  },
  'whale-actions': {
    id: 'whale-actions',
    renderer: 'video',
    widthScale: 1.3125,
    heightScale: 2.1,
    label: 'petWhaleActions',
  },
  'whale-dress': {
    id: 'whale-dress',
    renderer: 'image',
    widthScale: 1.3125,
    heightScale: 2.1,
    label: 'petWhaleDress',
  },
  'whale-ornate': {
    id: 'whale-ornate',
    renderer: 'image',
    widthScale: 1.3125,
    heightScale: 2.1,
    label: 'petWhaleOrnate',
  },
  'xiaoxie-original': { ...PET_MODEL, widthScale: 1, heightScale: 1.1, label: 'petDroplet' },
});
export function petModel(id) {
  return Object.hasOwn(PET_MODELS, id) ? PET_MODELS[id] : PET_MODELS['whale-dress'];
}

export function petLayout(
  position,
  viewport,
  size = 132,
  contentHeight = 420,
  modelId = 'xiaoxie-original',
  footerHeight = 30,
) {
  const model = petModel(modelId);
  const originX = viewport.left ?? 0,
    originY = viewport.top ?? 0;
  const edge = 12,
    gap = 12;
  const width = Math.max(1, viewport.width),
    height = Math.max(1, viewport.height);
  const artworkSize = Math.max(
    1,
    Math.min(
      size,
      Math.max(1, (width - edge * 2) / model.widthScale),
      Math.max(1, Math.floor((height - edge * 2 - footerHeight) / model.heightScale)),
    ),
  );
  const petWidth = Math.min(
    Math.max(1, width - edge * 2),
    Math.max(148, artworkSize * model.widthScale),
  );
  const petHeight = Math.ceil(artworkSize * model.heightScale) + footerHeight;
  const bound = (n, max) => Math.max(Math.min(edge, max), Math.min(n, max));
  const x = bound(
    Number.isFinite(position?.x) ? position.x - originX : width - petWidth - 32,
    Math.max(0, width - petWidth - edge),
  );
  const y = bound(
    Number.isFinite(position?.y) ? position.y - originY : height - petHeight - 36,
    Math.max(0, height - petHeight - edge),
  );
  const panelWidth = Math.min(296, Math.max(1, width - edge * 2));
  let side =
    x >= panelWidth + gap + edge
      ? 'left'
      : width - x - petWidth >= panelWidth + gap + edge
        ? 'right'
        : 'stack';
  let maxHeight = Math.max(60, height - edge * 2);
  let left = side === 'left' ? x - gap - panelWidth : x + petWidth + gap;
  let top;
  if (side === 'stack') {
    left = Math.max(edge, Math.min(x + petWidth - panelWidth, width - panelWidth - edge));
    const above = y - gap - edge;
    const below = height - y - petHeight - gap - edge;
    if (Math.max(above, below) < 48) {
      side = 'overlay';
      maxHeight = Math.max(1, height - edge * 2);
      top = Math.min(edge, height / 2);
    } else {
      side = above >= below ? 'above' : 'below';
      maxHeight = Math.max(48, side === 'above' ? above : below);
      top = side === 'above' ? y - gap - Math.min(contentHeight, maxHeight) : y + petHeight + gap;
    }
  } else {
    top = Math.max(
      edge,
      Math.min(y + petHeight - contentHeight, height - Math.min(contentHeight, maxHeight) - edge),
    );
  }
  return {
    x: x + originX,
    y: y + originY,
    petWidth,
    artworkSize,
    petHeight,
    panel: {
      left: left + originX,
      top: Math.max(0, top) + originY,
      width: panelWidth,
      maxHeight,
      side,
    },
  };
}

// Original full-body Xiaoxie: droplet body, small feet and a scarf.
export function petArtwork(
  h,
  presentation,
  size,
  reaction = '',
  modelId = 'xiaoxie-original',
  sprites = {},
  interactive = false,
) {
  const { pose, animate } = presentation;
  const model = petModel(modelId);
  if (['image', 'video'].includes(model.renderer) && sprites[model.id]) {
    if (model.renderer === 'video' && interactive)
      return h(
        'span',
        {
          key: model.id,
          className: 'owc-pet-art owc-pet-video-art',
          'aria-hidden': true,
          'data-interactive': true,
          'data-pose': pose,
          'data-animate': animate,
          style: { width: size * model.widthScale, height: size * model.heightScale },
        },
        h('img', {
          src: sprites[model.id],
          alt: '',
          draggable: false,
          className: 'owc-pet-video-poster',
        }),
        h('span', { className: 'owc-pet-video-layer' }),
      );
    return h('img', {
      key: interactive ? model.id : model.id + ':' + pose + ':' + reaction,
      'data-interactive': interactive || undefined,
      src: sprites[model.id],
      alt: '',
      'aria-hidden': true,
      draggable: false,
      width: size * model.widthScale,
      height: size * model.heightScale,
      className: 'owc-pet-art owc-pet-portrait',
      'data-pose': pose,
      'data-animate': animate,
    });
  }
  const asleep = ['quiet', 'rest'].includes(pose);
  const path = (d, props = {}) => h('path', { d, ...props });
  return h(
    'svg',
    {
      key: interactive ? model.id : pose + ':' + reaction,
      'data-interactive': interactive || undefined,
      viewBox: '0 0 160 176',
      width: size,
      height: size * 1.1,
      className: 'owc-pet-art',
      'data-pose': pose,
      'data-animate': animate,
      'aria-hidden': true,
      focusable: false,
    },
    h('ellipse', { cx: 80, cy: 160, rx: 42, ry: 6, fill: '#183b65', opacity: 0.13 }),
    h(
      'g',
      {
        className: 'owc-pet-body',
        stroke: '#315b82',
        strokeWidth: 2.2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      },
      h('ellipse', { cx: 58, cy: 148, rx: 12, ry: 8, fill: '#92cce2' }),
      h('ellipse', { cx: 102, cy: 148, rx: 12, ry: 8, fill: '#92cce2' }),
      path(
        pose === 'happy' ? 'M36 86Q14 91 15 65Q28 65 43 76Z' : 'M36 87Q15 87 19 109Q31 113 44 99Z',
        { fill: '#a4dcea' },
      ),
      path(
        pose === 'happy'
          ? 'M124 86Q146 91 145 65Q132 65 117 76Z'
          : 'M124 87Q145 87 141 109Q129 113 116 99Z',
        { fill: '#a4dcea' },
      ),
      path(
        'M80 12C67 34 38 47 34 81C29 117 46 149 80 149C114 149 131 117 126 81C122 47 93 34 80 12Z',
        { fill: '#c7eaf3' },
      ),
      path('M64 37Q48 53 44 69', { fill: 'none', stroke: '#fff', strokeWidth: 6, opacity: 0.8 }),
      path('M46 113Q80 126 114 113L109 128Q79 137 51 127Z', { fill: '#fff1bc', stroke: '#b49454' }),
      path('M102 123L113 145L100 147L92 127Z', { fill: '#ffe39b', stroke: '#b49454' }),
      h('ellipse', { cx: 80, cy: 111, rx: 8, ry: 5, fill: '#e5f6fa', stroke: 'none' }),
      asleep
        ? path('M51 79Q59 85 67 79M93 79Q101 85 109 79', {
            fill: 'none',
            stroke: '#24425d',
            strokeWidth: 3,
          })
        : h(
            'g',
            { fill: '#24425d', stroke: 'none' },
            h('ellipse', { cx: 59, cy: 78, rx: 3.5, ry: 5 }),
            h('ellipse', { cx: 101, cy: 78, rx: 3.5, ry: 5 }),
          ),
      path(
        pose === 'happy'
          ? 'M69 91Q80 108 91 91Z'
          : pose === 'offline'
            ? 'M74 95H86'
            : 'M72 93Q80 101 88 93',
        { fill: pose === 'happy' ? '#f19baf' : 'none', stroke: '#24425d', strokeWidth: 2.5 },
      ),
      h(
        'g',
        { fill: '#f0a2af', stroke: 'none', opacity: 0.65 },
        h('ellipse', { cx: 46, cy: 91, rx: 8, ry: 4 }),
        h('ellipse', { cx: 114, cy: 91, rx: 8, ry: 4 }),
      ),
      pose === 'drink' &&
        h(
          'g',
          { fill: '#fff', stroke: '#44728f' },
          path('M113 103H139L135 133H117Z'),
          path('M140 108H146Q154 121 138 122', { fill: 'none' }),
          path('M119 115H134', { stroke: '#6dc9e2', strokeWidth: 5 }),
        ),
      pose === 'quiet' &&
        path('M122 32H135L122 44H135', { fill: 'none', stroke: '#67899c', strokeWidth: 3 }),
    ),
  );
}

export const PET_MESSAGES = {
  zh: {
    petGreet: '与角色互动',
    petNeedsSession: '等待会话',
    petNeedsSetup: '请配置作息',
    petLoadFailed: '读取失败',
    petRetryHint: '右键菜单可重新读取设置',
    petCharacter: '角色形象',
    petWhaleActions: '鲸蓝少女 · 长裙动态',
    petWhaleOrnateActions: '鲸蓝少女 · 短裙动态',
    petWhaleDress: '鲸蓝少女 · 长裙',
    petWhaleOrnate: '鲸蓝少女 · 礼裙',
    petDroplet: '小歇 · 水滴',
    petClose: '收起宠物面板',
    petQuick: '日常陪伴',
    petDetails: '下班与收入',
    petSize: '宠物大小',
    petHint: '左键互动 · 右键菜单 · 拖动移动',
    petMode: '宠物模式',
    petClock: '下班倒计时',
    petPreviewActions: '动作试播',
    petPreviewIdle: '待机',
    petPreviewGreet: '挥手',
    petPreviewDrink: '喝茶',
    petPreviewStop: '停止',
    petTryIdle: '试播待机',
    petTryGreet: '试播挥手',
    petTryDrink: '试播喝茶',
    petStopPreview: '停止试播',
    petPreviewHint: '仅预览，不记喝水次数，也不更换页面角色。',
    petPreviewLoading: '正在准备动作…',
    petPreviewPlaying: '正在试播',
    petPreviewUnsupported: '当前浏览器不支持透明动作视频，已显示静态预览。',
    petPreviewUnavailable: '动作暂时无法播放，已恢复静态预览。可以重试。',
    petPreviewEnable: '勾选“角色动作反馈”后可试播；应用后才保存。',
    petPreviewReduced: '系统已开启减少动态效果，当前显示静态预览。',
  },
  en: {
    petGreet: 'Interact with character',
    petNeedsSession: 'Open a session',
    petNeedsSetup: 'Set your schedule',
    petLoadFailed: 'Settings unavailable',
    petRetryHint: 'Retry loading settings from the context menu',
    petCharacter: 'Character',
    petWhaleActions: 'Blue whale · Animated long dress',
    petWhaleOrnateActions: 'Blue whale · Animated short dress',
    petWhaleDress: 'Blue whale · Long dress',
    petWhaleOrnate: 'Blue whale · Ornate dress',
    petDroplet: 'Xiaoxie · Droplet',
    petClose: 'Close pet panel',
    petQuick: 'Daily companion',
    petDetails: 'Clock and earnings',
    petSize: 'Pet size',
    petHint: 'Click to interact · right-click for menu · drag to move',
    petMode: 'Pet mode',
    petClock: 'Shift countdown',
    petPreviewActions: 'Preview actions',
    petPreviewIdle: 'Idle',
    petPreviewGreet: 'Wave',
    petPreviewDrink: 'Drink',
    petPreviewStop: 'Stop',
    petTryIdle: 'Preview idle',
    petTryGreet: 'Preview wave',
    petTryDrink: 'Preview drinking',
    petStopPreview: 'Stop preview',
    petPreviewHint: 'Preview only: no drinking record or change to the page character.',
    petPreviewLoading: 'Preparing action…',
    petPreviewPlaying: 'Previewing',
    petPreviewUnsupported:
      'This browser cannot show transparent action videos. Showing a static preview.',
    petPreviewUnavailable: 'Action unavailable. Static preview restored; you can retry.',
    petPreviewEnable: 'Enable character reactions to preview. Apply to save the choice.',
    petPreviewReduced: 'Reduced motion is enabled. Showing a static preview.',
  },
};

export const PET_STYLE = `
.owc-v2.owc-pet-shell{border-radius:0;touch-action:none;cursor:default;overflow:visible}
.owc-pet-stage{display:flex;flex-direction:column;align-items:center;position:relative}
.owc-v2 button.owc-pet-handle{padding:0;background:none!important;border-radius:50%;min-height:0;display:block;cursor:grab;touch-action:none;line-height:0}
.owc-v2 button.owc-pet-handle:active{cursor:grabbing}
.owc-pet-art{overflow:visible;pointer-events:none;filter:drop-shadow(0 3px 5px #32557418)}
.owc-pet-video-art{display:block;position:relative;isolation:isolate}
.owc-pet-video-poster,.owc-pet-video-layer,.owc-pet-video-layer video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none}
.owc-pet-video-poster,.owc-pet-video-layer video{mix-blend-mode:plus-lighter}
.owc-pet-video-poster{opacity:1;transition:opacity .12s linear}
.owc-pet-video-layer video{opacity:0;transition:opacity .12s linear}
.owc-pet-video-art[data-video-playing=true] .owc-pet-video-poster{opacity:0}
.owc-pet-video-art[data-video-playing=true] .owc-pet-video-layer video{opacity:1}
.owc-pet-portrait{display:block;object-fit:contain;transform-origin:50% 90%}
.owc-pet-portrait[data-animate=true]:not([data-interactive=true]){animation:owc-portrait-thanks .65s ease-in-out 2}
.owc-pet-art[data-interactive=true]{transform-origin:50% 90%}
.owc-pet-art[data-interactive=true][data-motion=idle]:not([data-action]){animation:owc-pet-breathe 4.5s ease-in-out infinite}
@keyframes owc-pet-breathe{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-2px) scale(1.006)}}
@keyframes owc-portrait-thanks{0%,100%{transform:translateY(0)}45%{transform:translateY(-3px) rotate(-1deg)}75%{transform:rotate(1deg)}}
.owc-pet-art[data-pose=offline]{opacity:.65}
.owc-pet-art[data-animate=true]:not([data-interactive=true]) .owc-pet-body{transform-origin:80px 150px;animation:owc-pet-thanks .65s ease-in-out 2}
@keyframes owc-pet-thanks{0%,100%{transform:translateY(0)}45%{transform:translateY(-4px) rotate(-3deg)}75%{transform:rotate(2deg)}}
.owc-v2 .owc-pet-clock{display:flex;align-items:center;color:var(--owc-text);line-height:1.5;cursor:default;padding:4px 10px;min-height:26px;gap:5px;white-space:nowrap;border-radius:999px;font-size:11px;background:var(--dsw-alias-bg-overlay);border:1px solid color-mix(in srgb,var(--owc-accent) 25%,transparent);box-shadow:0 3px 12px #142e4812;font-variant-numeric:tabular-nums;max-width:100%;box-sizing:border-box;overflow:hidden}
.owc-pet-clock-label{min-width:0;overflow:hidden;text-overflow:ellipsis}
.owc-pet-clock strong{flex:none}
.owc-v2 .owc-pet-timer-row{display:flex;align-items:center;justify-content:space-between;gap:6px;box-sizing:border-box;width:100%;max-width:188px;height:26px;margin-top:4px;padding:3px 10px;border:1px solid var(--owc-border);border-radius:999px;background:var(--owc-surface);box-shadow:var(--owc-shadow);font-size:11px;white-space:nowrap;font-variant-numeric:tabular-nums}
.owc-pet-timer-row span{min-width:0;overflow:hidden;text-overflow:ellipsis}
.owc-pet-timer-row strong{flex-shrink:0}
.owc-v2 [data-countdown-due=true]{color:var(--owc-accent);border-color:var(--owc-accent)}
.owc-countdown-card{padding:16px;display:flex;flex-direction:column;gap:14px}
.owc-countdown-value{font-size:32px;line-height:1.3;font-weight:650;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
.owc-countdown-actions{display:flex;flex-wrap:wrap;gap:8px}
.owc-countdown-actions button{flex:1;min-width:110px;min-height:40px}
.owc-countdown-card label{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:12px}
.owc-v2 .owc-countdown-card select{flex:0 0 120px;width:120px;max-width:120px}
.owc-countdown-card p{margin:0;font-size:12px;line-height:1.6;overflow-wrap:anywhere}
.owc-pet-panel{position:fixed;border-radius:20px;cursor:default;touch-action:manipulation;max-width:calc(100vw - 24px)}
.owc-pet-panel>.owc-content{max-height:inherit}
.owc-pet-panel .owc-glass{opacity:max(var(--owc-alpha),.94)}
.owc-pet-tabs{display:flex;gap:5px;padding:8px 14px 0}
.owc-pet-tabs button{flex:1;font-size:11px}
.owc-pet-tabs button[aria-pressed=true]{color:var(--owc-accent);background:color-mix(in srgb,var(--owc-accent) 10%,transparent)}
.owc-pet-time{padding:12px 17px 0;display:flex;align-items:center;justify-content:space-between;gap:8px;color:var(--dsw-alias-label-secondary);font-size:11px}
.owc-pet-time strong{font-size:21px;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}
.owc-pet-speech{padding:12px 16px;font-size:12px;line-height:1.65}
.owc-pet-speech strong{display:block;font-size:11px;color:var(--dsw-alias-label-secondary);margin-bottom:4px}
@media(prefers-reduced-motion:reduce){.owc-pet-art,.owc-pet-art *{animation:none!important;transition:none!important}}
`;
