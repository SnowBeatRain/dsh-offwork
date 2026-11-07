当前截图的问题：

1. 外框套两块灰按钮，像调试面板，缺少整体设计。
2. 倒计时过粗，把小组件压得很重。
3. 分割线切碎空间，收入单独占一行，主次失衡。
4. 水滴、香烟看起来像两个按钮，计时信息反而不突出。

**推荐：横向“时间签”。** 将标题与主倒计时合成一行，下面只留两个无底色的计时状态。重新组织信息层级，取消内部卡片和分割线。

默认 **224×96px**，内边距14px，圆角14px。第一行高32px：左侧“距下班”占30px，10px/500/14px；中间倒计时26px/500/32px，使用等宽数字；右侧20px展开入口。标题可拖动，操作按钮不触发拖动。

下方间隔12px，状态行高22px。水滴和香烟始终同时显示，图标13px、描边1.5px，文字12px/400/18px，图文间距4px，两组间距10px。右端放眼睛，默认只显示图标；点击后紧邻显示11px收入，过长省略，悬停显示完整金额。

下班后标题改“本班状态”，主读数替换为 **“本班已完成”**，17px/500/32px、低饱和绿色，不显示00。展开时保持宽度，向下容纳已有操作，正常排布，不另开大面板。

**备选：竖向“读数签”。** 220×104px，内边距上下11px、左右12px；标题与箭头一行16px，倒计时独占一行30px，底部状态22px，行距6px。数字25px/500/30px，其余颜色、图标和交互沿用推荐方案。更适合希望远距离快速读数的用户。

推荐方案CSS如下，使用系统字体、纯色背景；浅深主题均无渐变：

```css
.widget {
  --bg: #f8f9fb;
  --fg: #252932;
  --muted: #747b87;
  --line: rgb(25 32 45 / 10%);
  --done: #32705a;
  --shadow: rgb(20 28 44 / 9%);
  box-sizing: border-box;
  width: 224px;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--bg);
  color: var(--fg);
  box-shadow: 0 3px 12px var(--shadow);
  font:
    400 12px/18px system-ui,
    sans-serif;
}
.widget[data-theme='dark'] {
  --bg: #24272d;
  --fg: #f1f3f7;
  --muted: #a2a8b3;
  --line: rgb(255 255 255 / 10%);
  --done: #8bc9af;
  --shadow: rgb(0 0 0 / 22%);
}
.widget [hidden] {
  display: none !important;
}
.top,
.bottom,
.stat,
.income {
  display: flex;
  align-items: center;
}
.top {
  height: 32px;
  gap: 8px;
}
.title {
  flex: 0 0 30px;
  font: 500 10px/14px system-ui;
  color: var(--muted);
  cursor: grab;
  user-select: none;
}
.clock {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  font: 500 26px/32px system-ui;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.3px;
}
.clock.done {
  font-size: 17px;
  letter-spacing: 0;
  color: var(--done);
}
.bottom {
  height: 22px;
  margin-top: 12px;
  gap: 10px;
}
.stat {
  gap: 4px;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.widget svg {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
}
.stat svg {
  color: var(--muted);
}
.widget button {
  border: 0;
  padding: 0;
  min-width: 20px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  background: transparent;
  color: var(--muted);
  font: inherit;
  cursor: pointer;
}
.toggle {
  flex: 0 0 20px;
}
.income {
  margin-left: auto;
  gap: 3px;
  min-width: 0;
}
.amount {
  max-width: 45px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
  line-height: 16px;
}
.widget button:hover {
  background: rgb(128 128 128 / 12%);
}
.widget button:focus-visible {
  outline: 2px solid var(--muted);
  outline-offset: 2px;
}
.details {
  margin-top: 12px;
}
```

DOM草图；SVG复用现有图标，不增加图片或依赖：

```html
<section class="widget" data-theme="light" aria-label="下班计时">
  <header class="top">
    <span class="title" data-drag-handle>距下班</span>
    <output class="clock">08:59:57</output>
    <button
      class="toggle"
      aria-label="展开操作"
      aria-expanded="false"
      aria-controls="shift-details"
    >
      <svg aria-hidden="true">…下箭头…</svg>
    </button>
  </header>

  <div class="bottom">
    <span class="stat" aria-label="喝水计时">
      <svg aria-hidden="true">…水滴…</svg>
      <span>50:37</span>
    </span>
    <span class="stat" aria-label="吸烟计时">
      <svg aria-hidden="true">…香烟…</svg>
      <span>未开始</span>
    </span>
    <button class="income" aria-label="显示本班收入" aria-pressed="false">
      <svg aria-hidden="true">…眼睛…</svg>
      <span class="amount" hidden>¥128.50</span>
    </button>
  </div>

  <div class="details" id="shift-details" hidden>
    <!-- 原有详细操作 -->
  </div>
</section>
```

展开按钮同步`hidden`和`aria-expanded`；眼睛同步金额显隐及无障碍标签；完成状态仅替换标题、读数文字和样式，继续使用现有计时逻辑。
