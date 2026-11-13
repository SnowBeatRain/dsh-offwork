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
      home: 320,
      'water-countdown': 320,
      smoking: 320,
      water: 360,
      appearance: 340,
      schedule: 360,
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
.owc-v2 .owc-pet-water-alert{border-color:var(--owc-accent)!important;color:var(--owc-accent)}
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
.owc-v2 .owc-appearance-preview{height:190px;display:flex;align-items:center;justify-content:center;border-radius:12px;background:var(--owc-subtle);margin-bottom:16px;overflow:hidden}
.owc-v2 .owc-appearance-preview .owc-pet-art{flex:none;animation:none}
.owc-v2 .owc-appearance-preview .owc-pet-art *{animation:none!important}
.owc-v2 .owc-preview-actions{display:flex;gap:6px;flex-wrap:wrap}
.owc-v2 .owc-preview-actions button{min-width:52px}
.owc-v2 .owc-preview-actions button[aria-pressed=true]{color:var(--owc-accent);background:color-mix(in srgb,var(--owc-accent) 10%,transparent)}
.owc-v2 .owc-preview-status{min-height:36px;margin:8px 0 12px}
.owc-v2 .owc-appearance-preview p{font-size:13px;color:var(--owc-muted);padding:16px;text-align:center}
.owc-v2 .owc-pet-context{padding:0;background:var(--owc-surface);border:1px solid var(--owc-border);border-radius:var(--owc-radius);box-shadow:var(--owc-shadow);scrollbar-width:none}
.owc-v2 .owc-pet-context::-webkit-scrollbar{display:none}
.owc-v2 .owc-menu-natural{padding:6px;display:flow-root;box-sizing:border-box;min-width:0}
.owc-v2 .owc-pet-context button{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;justify-content:flex-start;font-size:13px}
.owc-v2 .owc-pet-context hr{border-color:var(--owc-border);margin:6px 4px}
.owc-v2.owc-classic{border-radius:16px;touch-action:manipulation}
.owc-classic .owc-content{max-height:calc(var(--owc-viewport-height) - 2px);overflow:auto}
.owc-v2 .owc-classic-head{position:sticky;top:0;z-index:2;min-height:46px;padding:8px 12px;background:var(--owc-surface);border-bottom:1px solid var(--owc-border);gap:6px}
.owc-classic-head .owc-title{font-size:12px;min-width:0;overflow:hidden;text-overflow:ellipsis;touch-action:none}
.owc-v2.owc-classic.owc-compact{border-radius:14px;border-color:color-mix(in srgb,var(--owc-text) 10%,transparent);box-shadow:0 3px 12px #0a101a1a}
.owc-classic.owc-compact>.owc-glass{background:var(--owc-surface);background:oklch(from var(--owc-surface) clamp(0,calc(l + .02),1) calc(c * .55) h)}
.owc-classic-mini{padding:14px;font:400 12px/18px system-ui,sans-serif}
.owc-classic-mini-top{display:flex;align-items:center;gap:6px;height:32px}
.owc-classic-mini .owc-grip{flex:1;display:flex;flex-direction:row;align-items:center;gap:8px;min-width:0;touch-action:none;cursor:grab}
.owc-classic-mini-label{flex:0 0 30px;font:500 10px/14px system-ui,sans-serif;color:var(--owc-muted);text-wrap:balance}
.owc-classic-mini-time{flex:1;min-width:0;font:500 26px/32px system-ui,sans-serif;letter-spacing:-.3px;font-variant-numeric:tabular-nums;white-space:nowrap}
.owc-v2 .owc-classic-mini-state{flex:1;min-width:0;font:500 16px/20px system-ui,sans-serif;margin:0;padding:0;min-height:0;text-align:left;overflow-wrap:anywhere}
.owc-classic-mini[data-clock-phase=done] .owc-classic-mini-state{color:color-mix(in srgb,#43896d 65%,var(--owc-text))}
.owc-v2 .owc-classic-mini .owc-icon{padding:0;min-width:24px;width:24px;height:24px;min-height:24px;flex-shrink:0;border:0;border-radius:5px;background:transparent;color:var(--owc-muted)}
.owc-classic-mini-timers{display:flex;align-items:center;gap:10px;height:22px;margin-top:12px}
.owc-v2 .owc-classic-mini-timer{display:flex;align-items:center;justify-content:flex-start;gap:4px;flex-shrink:0;min-width:0;min-height:24px;padding:0;border:0;border-radius:5px;background:transparent;font:400 12px/18px system-ui,sans-serif;color:var(--owc-muted)}
.owc-classic-mini-timer svg{flex-shrink:0}
.owc-classic-mini-timer strong{font:inherit;font-variant-numeric:tabular-nums;color:var(--owc-text);white-space:nowrap}
.owc-v2 .owc-classic-mini-timer[data-countdown-due=true],.owc-classic-mini-timer[data-countdown-due=true] strong{color:color-mix(in srgb,var(--owc-accent) 55%,var(--owc-text));background:transparent}
.owc-classic-mini-income{display:flex;align-items:center;gap:3px;margin-left:auto;min-width:24px;flex-shrink:1}
.owc-v2 .owc-classic-mini-amount{display:block;min-width:0;max-width:45px;min-height:24px;padding:0;border:0;font:400 11px/24px system-ui,sans-serif;color:var(--owc-muted);font-variant-numeric:tabular-nums;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.owc-v2 .owc-classic-mini button:hover{background:color-mix(in srgb,var(--owc-text) 6%,transparent)}
.owc-classic-mini button:focus-visible{outline:2px solid var(--owc-accent);outline-offset:3px}
.owc-classic-overview{padding:16px;display:flex;flex-direction:column;gap:14px}
.owc-classic-kicker{display:flex;align-items:center;gap:6px;color:var(--owc-muted);font-size:11px;margin-bottom:7px}
.owc-classic-time{font-size:34px;font-weight:650;line-height:1.2;letter-spacing:.5px;font-variant-numeric:tabular-nums}
.owc-classic-state{font-size:22px;line-height:1.3;margin:0;color:var(--owc-text)}
.owc-v2 .owc-classic-hint{font-size:11px;color:var(--owc-muted);line-height:1.6;margin:7px 0 0}
.owc-classic-hero>button{margin-top:12px;min-height:38px}
.owc-classic-schedule{display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px;margin-top:10px;color:var(--owc-muted);font-size:10px;font-variant-numeric:tabular-nums}
.owc-classic-timers{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px}
.owc-v2 .owc-classic-tile{display:flex;flex-direction:column;align-items:flex-start;gap:7px;padding:11px;min-width:0;border:1px solid var(--owc-border);border-radius:12px;background:var(--owc-subtle);text-align:left}
.owc-classic-tile-title{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--owc-muted)}
.owc-classic-tile strong{max-width:100%;font-size:17px;line-height:1.2;font-weight:600;font-variant-numeric:tabular-nums;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.owc-classic-tile-hint{display:block;max-width:100%;font-size:10px;color:var(--owc-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.owc-classic-income{display:flex;align-items:center;gap:4px;padding-top:10px;border-top:1px solid var(--owc-border)}
.owc-v2 .owc-classic-income-link{display:flex;align-items:center;justify-content:space-between;flex:1;min-width:0;gap:8px;padding:4px 0;font-size:11px;color:var(--owc-muted);min-height:32px}
.owc-classic-income-link strong{font-size:12px;font-weight:500;color:var(--owc-text);font-variant-numeric:tabular-nums}
.owc-classic-income .owc-text{font-size:10px;gap:4px;flex-shrink:0}
.owc-classic-details{border-top:1px solid var(--owc-border);padding-top:12px;font-size:11px;color:var(--owc-muted)}
.owc-classic-detail-title{display:flex;justify-content:space-between;margin-bottom:8px}
.owc-classic-details p{font-size:11px;line-height:1.5;margin:8px 0}
.owc-classic-feedback{margin:0;font-size:11px;color:var(--owc-accent)}
.owc-classic>.owc-content>.owc-note,.owc-classic>.owc-content>.owc-error{margin:8px 16px}
.owc-v2 .owc-pet-toast,.owc-v2 .owc-pet-water-alert{background:var(--owc-surface)!important;color:var(--owc-text);border:1px solid var(--owc-border)!important;box-shadow:var(--owc-shadow)}
.owc-v2 .owc-pet-toast{border-radius:12px;font-size:12px}
.owc-v2 .owc-pet-unsaved{padding:20px 16px}
.owc-v2 .owc-pet-unsaved p{font-size:13px;overflow-wrap:anywhere}
.owc-detail-page{--owc-detail-surface:var(--owc-surface);--owc-control-height:38px;border-radius:14px}
@supports(color:oklch(from white l c h)){.owc-detail-page{--owc-detail-surface:oklch(from var(--owc-surface) clamp(0,calc(l + .02),1) calc(c * .55) h)}}
.owc-detail-page>.owc-glass{background:var(--owc-detail-surface);border-color:var(--owc-border)}
.owc-pet-workspace.owc-detail-page>.owc-head,.owc-classic.owc-detail-page .owc-classic-head{min-height:44px;padding:8px 16px;gap:8px;background:var(--owc-detail-surface);border-bottom:1px solid var(--owc-border)}
.owc-detail-page .owc-head .owc-icon{width:28px;height:28px;min-width:28px;min-height:28px;padding:4px}
.owc-detail-page [data-pet-page-title],.owc-classic.owc-detail-page .owc-classic-head .owc-title{font-size:14px;font-weight:550}
.owc-detail-page .owc-form,.owc-detail-page .owc-water-form,.owc-detail-page .owc-main,.owc-detail-page .owc-pet-home{padding:16px}
.owc-v2 .owc-pet-natural>.owc-form:last-child,.owc-v2 .owc-pet-natural>.owc-water-form:last-child{padding-bottom:16px}
.owc-detail-page fieldset.owc-setting-group{border:0;border-radius:0;background:transparent;padding:0;margin:0 0 18px;min-width:0}
.owc-detail-page fieldset.owc-setting-group legend{padding:0;margin-bottom:10px;font-size:12px;font-weight:550;color:var(--owc-text)}
.owc-detail-page .owc-appearance legend{display:none}
.owc-detail-page .owc-salary-legend{display:flex;align-items:center;justify-content:space-between;width:100%}
.owc-detail-page .owc-salary-legend .owc-icon{min-width:24px;min-height:24px;padding:3px}
.owc-detail-page .owc-field{position:relative;margin:0 0 12px}
.owc-detail-page .owc-field>span{font-size:12px;margin-bottom:6px}
.owc-detail-page .owc-row2{gap:12px}
.owc-detail-page :is(input[type=text],input[type=number],input[type=time],select){min-height:38px;border-radius:8px;background:color-mix(in srgb,var(--owc-text) 3%,var(--owc-detail-surface));border-color:var(--owc-border);font-size:13px}
.owc-detail-page .owc-private{box-sizing:border-box;min-height:38px;border:1px solid var(--owc-border);border-radius:8px;background:color-mix(in srgb,var(--owc-text) 3%,var(--owc-detail-surface));padding:8px 10px;font-size:14px}
.owc-detail-page .owc-seg{padding:2px;border-radius:8px;background:var(--owc-subtle)}
.owc-detail-page .owc-seg button{min-height:32px;font-size:12px;border-radius:6px}
.owc-detail-page button.owc-primary{min-height:38px;border-radius:8px;font-size:13px;font-weight:550;box-shadow:none}
.owc-v2 .owc-detail-page .owc-save,.owc-v2.owc-detail-page .owc-save{position:sticky;bottom:0;z-index:2;display:flex;justify-content:flex-end;gap:8px;padding:12px 0 0;margin:14px 0 0;border-top:1px solid var(--owc-border);background:var(--owc-detail-surface)}
.owc-detail-page .owc-save button{min-height:38px;font-size:13px;border-radius:8px;padding:8px 16px}
.owc-detail-page .owc-save button:not(.owc-primary){background:transparent;border-color:transparent;color:var(--owc-muted)}
.owc-detail-page .owc-detail-hero{margin:0 0 16px}
.owc-detail-page p.owc-detail-kicker{margin:0 0 6px;font-size:12px;color:var(--owc-muted)}
.owc-detail-value,.owc-detail-page .owc-countdown-value,.owc-detail-page .owc-time,.owc-detail-page .owc-money{font-size:28px;line-height:1.25;font-weight:500;letter-spacing:-.3px;font-variant-numeric:tabular-nums}
.owc-detail-page .owc-detail-state{font-size:20px;letter-spacing:0}
.owc-detail-meta{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:18px;margin-top:8px;font-size:11px;color:var(--owc-muted)}
.owc-detail-feedback{color:var(--owc-accent);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.owc-detail-page .owc-detail-primary-actions{display:flex;align-items:center;gap:8px}
.owc-detail-primary-actions>.owc-primary{flex:1}
.owc-detail-page .owc-detail-secondary{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:10px}
.owc-detail-page .owc-detail-secondary button{background:transparent;border:0;padding:6px 0;font-size:12px;color:var(--owc-muted);min-height:30px}
.owc-detail-page details.owc-detail-more,.owc-detail-page .owc-water-form>details,.owc-detail-page details.owc-advanced{margin:12px 0 0;padding:0;border:0;border-radius:0;background:transparent;font-size:12px}
.owc-detail-page details>summary{font-size:12px;color:var(--owc-muted);padding:4px 0;cursor:pointer}
.owc-detail-page details p{font-size:11px;line-height:1.6;color:var(--owc-muted)}
.owc-detail-options{display:flex;gap:8px;margin-top:10px}
.owc-detail-options button{flex:1;min-height:34px;border:1px solid var(--owc-border);border-radius:8px;font-size:12px}
.owc-detail-page .owc-pet-home.owc-water-due{background:transparent;border-radius:0}
.owc-detail-page .owc-countdown-card{gap:12px}
.owc-detail-page .owc-countdown-card .owc-detail-hero{margin-bottom:0}
.owc-detail-page .owc-countdown-actions{gap:8px}
.owc-detail-page .owc-countdown-actions>.owc-primary{flex:1 1 100%}
.owc-detail-page .owc-countdown-actions>button:not(.owc-primary){min-height:30px;background:transparent;border:0;font-size:12px;color:var(--owc-muted)}
.owc-detail-page .owc-water-toggle,.owc-detail-page .owc-appearance .owc-check{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:38px;margin:0 0 10px;padding:0;font-size:13px;font-weight:400}
.owc-detail-page .owc-appearance .owc-check input{order:2;margin-left:auto}
.owc-detail-page .owc-water-toggle input,.owc-detail-page .owc-appearance .owc-check input{appearance:none;flex:none;width:32px;height:18px;min-height:18px;padding:0;border:0;border-radius:20px;background:color-mix(in srgb,var(--owc-text) 22%,var(--owc-detail-surface));position:relative;cursor:pointer}
.owc-detail-page .owc-water-toggle input:before,.owc-detail-page .owc-appearance .owc-check input:before{content:'';position:absolute;width:14px;height:14px;top:2px;left:2px;border-radius:50%;background:#fff;box-shadow:0 1px 3px #0002}
.owc-detail-page .owc-water-toggle input:checked,.owc-detail-page .owc-appearance .owc-check input:checked{background:var(--owc-accent)}
.owc-detail-page .owc-water-toggle input:checked:before,.owc-detail-page .owc-appearance .owc-check input:checked:before{left:16px}
.owc-detail-page .owc-water-interval{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:12px;margin:6px 0 10px}
.owc-detail-page .owc-water-interval input{width:92px;max-width:92px;text-align:center}
.owc-detail-page .owc-water-presets{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:5px;margin:0 0 12px}
.owc-detail-page .owc-water-presets button{font-size:12px;font-weight:400;min-height:32px;padding:4px;border-radius:7px;background:transparent}
.owc-detail-page .owc-water-presets button[aria-pressed=true]{background:color-mix(in srgb,var(--owc-accent) 9%,var(--owc-detail-surface));border-color:color-mix(in srgb,var(--owc-accent) 35%,transparent);color:var(--owc-accent)}
.owc-detail-page .owc-water-form>p{font-size:11px;line-height:1.6;margin:8px 0;color:var(--owc-muted)}
.owc-detail-page p.owc-error{color:color-mix(in srgb,#dc4c64 70%,var(--owc-text))}
.owc-detail-page .owc-stats{border:0;background:transparent;padding:0;gap:20px;margin:16px 0}
.owc-detail-page .owc-stats>div{padding:0;border:0;border-radius:0;background:transparent;min-width:0}
.owc-detail-page .owc-stats strong{font-size:15px;font-weight:500}
.owc-detail-page .owc-meta{border:0;margin:8px 0 0;padding:0;font-size:11px}
.owc-detail-page .owc-row-actions{margin-top:14px;gap:12px}
.owc-detail-page .owc-row-actions button{font-size:11px;min-height:30px;padding:3px 0}
.owc-detail-page .owc-progress{height:3px;margin:14px 0 16px}
.owc-detail-page .owc-preview{background:transparent;border:0;padding:0;margin:10px 0;font-size:11px;color:var(--owc-muted)}
.owc-v2 .owc-appearance-preview{height:180px;border-radius:10px;background:color-mix(in srgb,var(--owc-text) 3%,var(--owc-detail-surface,var(--owc-surface)))}
.owc-v2 .owc-appearance-preview>.owc-pet-art{transform:scale(.7);transform-origin:50% 50%}
.owc-detail-page .owc-appearance input[type=range]{width:100%}
.owc-detail-page .owc-range-value{position:absolute;right:0;top:0;font-size:11px;color:var(--owc-muted)}
.owc-detail-page .owc-preview-tools{margin-bottom:14px}
.owc-detail-page .owc-preview-actions button{min-height:32px;font-size:12px;border-radius:7px}
.owc-detail-page .owc-preview-status{font-size:11px;line-height:1.5}
@media(pointer:coarse){.owc-detail-page{--owc-control-height:44px}.owc-detail-page .owc-head .owc-icon{width:44px;height:44px;min-width:44px;min-height:44px}.owc-detail-page button.owc-primary,.owc-detail-page .owc-save button{min-height:44px}.owc-detail-page :is(input[type=text],input[type=number],input[type=time],select){font-size:16px;min-height:44px}}
@container (max-width:310px){.owc-v2 .owc-row2{grid-template-columns:1fr}.owc-v2 .owc-stats{gap:8px}.owc-v2 .owc-days{gap:2px}.owc-v2 .owc-days button{font-size:11px}}
@media (pointer:coarse){.owc-v2{--owc-control-height:44px}.owc-v2 .owc-icon{min-width:44px}.owc-v2 button.owc-primary{min-height:44px}.owc-v2 :is(input[type=text],input[type=time],input[type=number],select){font-size:16px}.owc-v2 input[type=range]{min-height:36px}.owc-v2 .owc-check{min-height:44px}}
@media (max-height:600px){.owc-v2 .owc-appearance-preview{height:120px}.owc-v2 .owc-appearance-preview>.owc-pet-art{transform:scale(.45);transform-origin:50% 50%}.owc-v2 .owc-appearance-preview>svg.owc-pet-art{transform:scale(.55)}}
@media (prefers-contrast:more){.owc-v2{--owc-border:var(--owc-text)}.owc-v2 .owc-glass{opacity:1!important}}
@media (prefers-reduced-transparency:reduce){.owc-v2 .owc-glass{opacity:1!important;backdrop-filter:none;-webkit-backdrop-filter:none}}
`;
