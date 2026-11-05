// Shared layout for our own pet cards and context menu.
export function petViewport(host) {
  const visual = host.visualViewport;
  return {
    width: Math.max(1, Math.min(host.innerWidth, visual?.width ?? host.innerWidth)),
    height: Math.max(1, Math.min(host.innerHeight, visual?.height ?? host.innerHeight)),
    left: Math.max(0, visual?.offsetLeft ?? 0),
    top: Math.max(0, visual?.offsetTop ?? 0),
  };
}
export function petSurfaceWidth(screen, viewport) {
  const ideal =
    {
      income: 320,
      earnings: 320,
      home: 336,
      water: 360,
      appearance: 360,
      schedule: 400,
      menu: 224,
      reminder: 304,
    }[screen] ?? 336;
  return Math.max(1, Math.min(ideal, viewport.width - 24));
}
export function placePetSurface(
  anchor,
  viewport,
  { width, height, kind = 'card', previous = null, point = null, obstacles = [] },
) {
  const edge = Math.min(
      12,
      Math.max(0, (viewport.width - 1) / 2),
      Math.max(0, (viewport.height - 1) / 2),
    ),
    gap = 12;
  const left = (viewport.left ?? 0) + edge,
    top = (viewport.top ?? 0) + edge;
  const right = (viewport.left ?? 0) + viewport.width - edge;
  const bottom = (viewport.top ?? 0) + viewport.height - edge;
  const w = Math.max(1, Math.min(width, right - left));
  const natural = Math.max(1, height),
    available = Math.max(1, bottom - top);
  const full = Math.min(natural, available);
  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));
  const candidates = [];
  const add = (x, y, h, side) => {
    h = Math.max(1, Math.min(h, available));
    x = clamp(x, left, right - w);
    y = clamp(y, top, bottom - h);
    const intersection = (rect) =>
      Math.max(0, Math.min(x + w, rect.x + rect.width) - Math.max(x, rect.x)) *
      Math.max(0, Math.min(y + h, rect.y + rect.height) - Math.max(y, rect.y));
    const overlap =
      intersection(anchor) +
      obstacles.reduce(
        (sum, rect) =>
          sum + intersection({ x: rect.left, y: rect.top, width: rect.width, height: rect.height }),
        0,
      );
    const distance = previous ? Math.abs(previous.left - x) + Math.abs(previous.top - y) : 0;
    candidates.push({
      left: x,
      top: y,
      width: w,
      height: h,
      maxHeight: h,
      side: overlap ? 'overlay' : side,
      overlap,
      clipped: natural - h,
      distance,
      order: candidates.length,
    });
  };
  if (previous && Math.abs(previous.width - w) < 1)
    add(previous.left, previous.top, full, previous.side);
  if (kind === 'menu' && point) {
    add(point.x + 8, point.y + 8, full, 'context-right');
    add(point.x - w - 8, point.y + 8, full, 'context-left');
    add(point.x + 8, point.y - full - 8, full, 'context-above-right');
    add(point.x - w - 8, point.y - full - 8, full, 'context-above-left');
  }
  const preferredY = kind === 'menu' && point ? point.y + 6 : anchor.y + anchor.height - full;
  add(anchor.x - w - gap, preferredY, full, 'left');
  add(anchor.x + anchor.width + gap, preferredY, full, 'right');
  const centered = anchor.x + anchor.width / 2 - w / 2;
  add(centered, anchor.y - gap - full, full, 'above');
  add(centered, anchor.y + anchor.height + gap, full, 'below');
  const above = anchor.y - gap - top,
    below = bottom - anchor.y - anchor.height - gap;
  const minimum = Math.min(full, kind === 'menu' ? 160 : 240);
  if (above >= minimum && above < full) add(centered, top, above, 'above');
  if (below >= minimum && below < full)
    add(centered, anchor.y + anchor.height + gap, below, 'below');
  candidates.sort(
    (a, b) =>
      Number(a.overlap > 0) - Number(b.overlap > 0) ||
      a.overlap - b.overlap ||
      a.clipped - b.clipped ||
      a.distance - b.distance ||
      a.order - b.order,
  );
  const { overlap, clipped, distance, order, ...result } = candidates[0];
  return result;
}
export const PET_SURFACE_MESSAGES = {
  zh: {
    petAppearancePreview: '角色预览',
    petWaterBadge: '该喝水啦',
    petClassicPreview: '应用后使用计时卡片',
    petSurfaceHint: '内容较长时可用滚轮或触控滚动',
  },
  en: {
    petAppearancePreview: 'Character preview',
    petWaterBadge: 'Time for water',
    petClassicPreview: 'Apply to use the clock card',
    petSurfaceHint: 'Scroll with the wheel or touch when content is longer',
  },
};
export const PET_SURFACE_STYLE = `
.owc-v2{--owc-accent:#2563eb;--owc-on-accent:#fff;--owc-surface:var(--dsw-alias-bg-overlay,#fff);--owc-text:var(--dsw-alias-label-primary,#172033);--owc-muted:var(--dsw-alias-label-secondary,#526074);--owc-border:color-mix(in srgb,var(--owc-text) 13%,transparent);--owc-subtle:color-mix(in srgb,var(--owc-text) 4%,var(--owc-surface));--owc-hover:color-mix(in srgb,var(--owc-accent) 8%,var(--owc-surface));--owc-radius:16px;--owc-control-radius:10px;--owc-shadow:0 10px 32px color-mix(in srgb,var(--owc-text) 13%,transparent);--owc-control-height:36px;color:var(--owc-text);line-height:1.5}
.owc-v2 .owc-content{max-height:var(--owc-viewport-height,calc(100dvh - 24px))}
.owc-v2:not(.owc-pet-shell) .owc-head{position:sticky;top:0;z-index:2;background:var(--owc-surface)}
.owc-v2:not(.owc-pet-shell) .owc-save{position:sticky;bottom:0;z-index:2;background:var(--owc-surface);padding:12px 0}
.owc-v2 .owc-pet-toast{overflow-wrap:anywhere;overflow:auto;scrollbar-width:none}
.owc-v2 button.owc-pet-water-alert{border-color:var(--owc-accent)!important;color:var(--owc-accent)}
.owc-v2 .owc-glass{background:var(--owc-surface);border:1px solid var(--owc-border);box-shadow:var(--owc-shadow);opacity:var(--owc-alpha,.94)}
.owc-v2 .owc-pet-workspace{border-radius:var(--owc-radius);container-type:inline-size}
.owc-v2 .owc-head{margin:0;padding:10px 16px;gap:8px;min-height:52px;border-bottom:1px solid var(--owc-border);box-sizing:border-box}
.owc-v2 [data-pet-page-title]{font-size:14px!important;line-height:1.4;min-width:0;overflow-wrap:anywhere;font-weight:600}
.owc-v2 [data-pet-page-title]:focus{outline:none}
.owc-v2 :is(.owc-pet-workspace,.owc-pet-context) button{min-height:var(--owc-control-height);padding:7px 10px;font-size:13px;line-height:1.4;border-radius:var(--owc-control-radius);box-sizing:border-box}
.owc-v2 :is(.owc-pet-workspace,.owc-pet-context) button:hover:not(:disabled){background:var(--owc-hover)}
.owc-v2 button.owc-primary{min-height:40px;background:var(--owc-accent);color:var(--owc-on-accent);border-radius:var(--owc-control-radius);font-size:13px}
.owc-v2 button.owc-primary:hover:not(:disabled){background:color-mix(in srgb,var(--owc-accent) 88%,#000)}
.owc-v2 :is(button,input,select,summary):focus-visible{outline:2px solid var(--owc-accent);outline-offset:2px}
.owc-v2 .owc-icon{flex:none;min-width:36px;padding:7px}
.owc-v2 .owc-main,.owc-v2 .owc-form,.owc-v2 .owc-water-form,.owc-v2 .owc-pet-home{padding:16px;min-width:0;box-sizing:border-box}
.owc-v2 .owc-main .owc-time{font-size:clamp(28px,10cqw,40px);font-weight:500;letter-spacing:-.5px;overflow-wrap:anywhere}
.owc-v2 .owc-money{font-size:clamp(24px,9cqw,34px);overflow-wrap:anywhere;line-height:1.35}
.owc-v2 :is(.owc-hint,.owc-muted,.owc-meta span,.owc-field>span,.owc-stats span,.owc-status,.owc-error,.owc-note){font-size:12px;line-height:1.55;color:var(--owc-muted)}
.owc-v2 .owc-error{color:var(--dsw-alias-state-error-primary,#dc2626)}
.owc-v2 .owc-meta span{white-space:normal;overflow:visible;text-overflow:clip;overflow-wrap:anywhere}
.owc-v2 .owc-row-actions{flex-wrap:wrap;gap:4px;margin:12px 0 0}
.owc-v2 .owc-stats{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;border-color:var(--owc-border)}
.owc-v2 .owc-stats>div{min-width:0;background:var(--owc-subtle);border:1px solid var(--owc-border);border-radius:12px;padding:12px}
.owc-v2 .owc-stats strong{font-size:14px;overflow-wrap:anywhere}
.owc-v2 .owc-setting-group{padding:14px 12px 4px;background:var(--owc-subtle);border-color:var(--owc-border);border-radius:12px}
.owc-v2 .owc-setting-group legend{font-size:13px}
.owc-v2 .owc-field{margin-bottom:12px;min-width:0}
.owc-v2 .owc-row2{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.owc-v2 :is(input[type=text],input[type=time],input[type=number],select){max-width:100%;min-width:0;min-height:var(--owc-control-height);font-size:13px;border-color:var(--owc-border);border-radius:var(--owc-control-radius);background:var(--owc-surface);color:var(--owc-text)}
.owc-v2 :is(input[type=checkbox],input[type=radio],input[type=range]){accent-color:var(--owc-accent)}
.owc-v2 .owc-check{min-height:30px;font-size:13px;gap:9px}
.owc-v2 .owc-private{flex-wrap:wrap;border-color:var(--owc-border);background:var(--owc-surface);border-radius:var(--owc-control-radius)}
.owc-v2 .owc-days{gap:4px}
.owc-v2 .owc-days button{min-width:0;padding:5px 2px;font-size:12px}
.owc-v2 .owc-seg button{min-width:0}
.owc-v2 .owc-water-presets{gap:8px}
.owc-v2 .owc-water-presets button{font-size:12px;padding:7px 4px;border-color:var(--owc-border);white-space:normal}
.owc-v2 .owc-water-form p{font-size:12px;line-height:1.55;overflow-wrap:anywhere}
.owc-v2 .owc-water-card,.owc-v2 .owc-pet-water-card{padding:14px;border-color:var(--owc-border);background:var(--owc-subtle);border-radius:12px}
.owc-v2 .owc-pet-water-card .owc-water-status{height:auto;min-height:40px;overflow:visible;font-size:13px;line-height:1.5;overflow-wrap:anywhere;margin-bottom:10px}
.owc-v2 .owc-pet-water-row{font-size:12px;flex-wrap:wrap}
.owc-v2 .owc-pet-water-row .owc-primary{min-width:120px}
.owc-v2 .owc-pet-quiet-row{gap:8px;margin-top:14px}
.owc-v2 .owc-pet-quiet-row button{min-width:0;font-size:12px;white-space:normal;border-color:var(--owc-border)}
.owc-v2 .owc-pet-quiet-status{min-height:38px;height:auto;flex-wrap:wrap;font-size:12px;line-height:1.5;color:var(--owc-muted)}
.owc-v2 .owc-pet-feedback{height:auto;min-height:36px;overflow:visible;font-size:12px;line-height:1.5;margin:8px 0;overflow-wrap:anywhere}
.owc-v2 .owc-pet-home-links{gap:8px}
.owc-v2 .owc-pet-home-links button{font-size:12px;background:var(--owc-subtle);border:1px solid var(--owc-border)}
.owc-v2 .owc-pet-scroll{scrollbar-width:none;scroll-padding-block:12px 64px}
.owc-v2 .owc-pet-natural{display:flow-root;min-width:0;width:100%}
.owc-v2 .owc-pet-natural>.owc-form:last-child,.owc-v2 .owc-pet-natural>.owc-water-form:last-child{padding-bottom:0}
.owc-v2 .owc-pet-scroll .owc-save{background:var(--owc-surface);padding:12px 0;border-top:1px solid var(--owc-border);gap:8px;flex-wrap:wrap}
.owc-v2 .owc-save button{min-width:72px}
.owc-v2 .owc-appearance-preview{height:260px;display:flex;align-items:center;justify-content:center;border-radius:12px;background:var(--owc-subtle);margin-bottom:16px;overflow:hidden}
.owc-v2 .owc-appearance-preview .owc-pet-art{flex:none;animation:none}
.owc-v2 .owc-appearance-preview .owc-pet-art *{animation:none!important}
.owc-v2 .owc-appearance-preview p{font-size:13px;color:var(--owc-muted);padding:16px;text-align:center}
.owc-v2 .owc-pet-context{padding:0;background:var(--owc-surface);border:1px solid var(--owc-border);border-radius:var(--owc-radius);box-shadow:var(--owc-shadow);scrollbar-width:none}
.owc-v2 .owc-pet-context::-webkit-scrollbar{display:none}
.owc-v2 .owc-menu-natural{padding:6px;display:flow-root;box-sizing:border-box;min-width:0}
.owc-v2 .owc-pet-context button{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;justify-content:flex-start;font-size:13px}
.owc-v2 .owc-pet-context hr{border-color:var(--owc-border);margin:6px 4px}
.owc-v2 .owc-pet-toast,.owc-v2 button.owc-pet-clock,.owc-v2 button.owc-pet-water-alert{background:var(--owc-surface)!important;color:var(--owc-text);border:1px solid var(--owc-border)!important;box-shadow:var(--owc-shadow)}
.owc-v2 .owc-pet-toast{border-radius:12px;font-size:12px}
.owc-v2 .owc-pet-unsaved{padding:20px 16px}
.owc-v2 .owc-pet-unsaved p{font-size:13px;overflow-wrap:anywhere}
@container (max-width:310px){.owc-v2 .owc-row2{grid-template-columns:1fr}.owc-v2 .owc-stats{gap:8px}.owc-v2 .owc-days{gap:2px}.owc-v2 .owc-days button{font-size:11px}}
@media (pointer:coarse){.owc-v2{--owc-control-height:44px}.owc-v2 .owc-icon{min-width:44px}.owc-v2 button.owc-primary{min-height:44px}.owc-v2 :is(input[type=text],input[type=time],input[type=number],select){font-size:16px}.owc-v2 input[type=range]{min-height:36px}.owc-v2 .owc-check{min-height:44px}}
@media (max-height:600px){.owc-v2 .owc-appearance-preview{height:120px}.owc-v2 .owc-appearance-preview svg{transform:scale(.55)}.owc-v2 .owc-appearance-preview img{transform:scale(.45)}}
@media (prefers-contrast:more){.owc-v2{--owc-border:var(--owc-text)}.owc-v2 .owc-glass{opacity:1!important}}
@media (prefers-reduced-transparency:reduce){.owc-v2 .owc-glass{opacity:1!important;backdrop-filter:none;-webkit-backdrop-filter:none}}
`;
