# 喝水提醒调度与多标签页研究报告

依据所给 `ROADMAP.md`、`clock.js`、`ui-utils.js`、`client.source.js` 与测试摘录完成静态研究；未访问工作区、未执行测试、未修改任何文件。当前版本号应继续保持 `1.0.1`，本报告不建议提前改成 `1.0.2` 或 `1.1.0`。

## 结论

建议新增一个纯函数调度器，以“本班累计有效工作毫秒数”作为提醒时钟，以真实时间戳记录用户操作。浏览器定时器只负责唤醒，任何展示判断都重新使用 `Date.now()` 和 `calculate(settings, now)` 计算。

这样可以自然满足：

- 无薪休息期间倒计时冻结，休息结束继续。
- 刷新、休眠、后台节流后不会依赖丢失的定时器 tick。
- 漏过多个周期时只合并为一次提醒。
- 夜班以现有 `shiftDate` 归属，不在零点错误重置。
- 关闭页面后不承诺提醒，重新打开时恢复当前班次状态。

## 调度模型

建议调度器输入：

```text
schedule(state, clockResult, now, preferences) -> {
  phase,
  remainingWorkMs,
  due,
  eventId,
  nextWakeAt
}
```

核心持久状态建议包含：

```text
schemaVersion
revision
enabled
intervalMs
shiftId
scheduleFingerprint
nextDueElapsedMs
snoozeUntilElapsedMs
pausedForShift
completedCount
lastCompletedAt
lastAction
```

规则：

1. `shiftId` 使用 `shiftDate + shiftStart + shiftEnd`，不要只用自然日期。
2. `scheduleFingerprint` 至少覆盖时区、上下班、休息区间和工作日；班中修改作息时明确创建新调度状态，不能静默套用旧坐标。
3. 正常提醒目标为 `nextDueElapsedMs = 当前 elapsedMs + intervalMs`。
4. “喝了”记录真实 `completedAt = Date.now()`，并从操作时的实际 `elapsedMs` 安排下一次。
5. “稍后提醒”也建议使用有效工作时长坐标；进入无薪休息后剩余时间冻结。
6. “本班暂停”绑定完整 `shiftId`，不能按零点或 `date` 失效。
7. 只有 `status === "working"` 才展示到期提醒；`before/lunch/done/rest` 均不展示。
8. 恢复时若 `elapsedMs >= nextDueElapsedMs`，只生成当前事件一次，不逐周期补发。
9. `eventId` 可由 `shiftId + dueElapsedMs + generation` 稳定生成，不能每次渲染随机生成。
10. UI 倒计时使用 `max(0, targetElapsedMs - elapsedMs)`；不得用递减变量作为事实来源。

`clock.js` 已提供 `shiftStart`、`shiftEnd`、`breakStart`、`breakEnd`、`elapsed`、`total` 和 `shiftDate`，足够构建此模型。内部建议统一使用整数毫秒，避免秒与毫秒混算。

## 本地持久化

提醒数据必须使用独立命名空间，例如：

```text
dsh.offwork-clock.hydration.v1
```

不要写入旧 `data.json`，也不要调用：

```text
ctx.remote.commands.execute(...)
```

提醒设置、喝水次数和操作结果都应直接留在浏览器存储中，否则会进入 Harness 会话记录。

读取时应执行严格规范化：

- JSON 必须是普通对象。
- 版本、布尔值、整数范围和字符串长度均需验证。
- 间隔设置上下限，例如 1 分钟至 12 小时。
- 计数设置安全上限。
- 未知字段丢弃。
- 非有限数、负时间、异常大的时间戳均视为损坏数据。
- 数据损坏时回退为“提醒关闭”的安全默认值，并显示本地警告。
- 不要把原始损坏内容复制到另一个长期存储键。

建议只保存当前班次和最多一个最近完成班次，或设置固定条目上限；整体序列化大小应设置硬上限，例如 32 KiB。喝水首版没有保留无限历史的必要。

每次写入都应是单个完整 JSON 快照，避免多个键之间出现半写状态。写入异常、配额不足或 SecurityError 必须被捕获。

## 多标签页架构

首选原生组合：

- `navigator.locks`：序列化状态变更及提醒认领。
- `BroadcastChannel`：快速通知其他标签页重新读取。
- `storage` 事件：BroadcastChannel 不可用时的通知后备。
- `localStorage`：持久事实来源。
- `visibilitychange`、`pageshow`、`focus`：恢复时重新评估。
- `setTimeout`：仅作为下一次检查提示，不作为计时依据。

所有用户操作应在同一个 Web Lock 名称下执行：

```text
申请独占锁
重新读取最新快照
验证并规范化
应用操作
revision + 1
写入完整快照
广播 revision
释放锁
```

“提醒认领”也必须在锁内完成。状态中记录：

```text
eventId
ownerId
claimUntil
shownAt
```

标签页只有成功认领后才显示提醒。`ownerId` 是标签页生命周期内的随机 ID，不需要长期保存。

展示标签页应短期续租；关闭或崩溃后租约过期，其他可见标签页可以接管。隐藏标签页不应主动争抢展示权。用户操作完成后清除认领并广播新状态。

## 缺少 Web Locks 时

没有 Web Locks 时，`localStorage` 不具备比较并交换或跨标签事务能力，因此无法严格保证并发写入不丢失，也无法数学上保证只显示一次。

安全降级建议：

1. 使用 `BroadcastChannel` 进行候选者通告和短暂仲裁。
2. 候选者按稳定顺序选择，例如可见标签优先，再比较随机 `ownerId`。
3. 将带短租约的 claim 写入 `localStorage`，立即回读确认自己仍是 owner 后再展示。
4. 写操作携带 `revision`，写后回读；发现 revision 被覆盖时重新读取并重放一次操作。
5. `storage` 事件作为没有 BroadcastChannel 时的同步信号。
6. UI 可提示“多标签页协调受限”，但喝水按钮仍应可用。
7. 不要通过高频自旋锁或不断写 localStorage 模拟强锁。

这只能提供“尽力去重”。极端同时写入、进程暂停或事件延迟仍可能产生重复展示或最后写入覆盖。

## 存储不可用时

若 localStorage 读取或写入被拒绝：

- 本标签页内可使用内存状态继续工作。
- 明确显示“本次页面有效，刷新后不会保留”。
- 禁止声称支持跨标签同步或刷新恢复。
- 默认只允许当前标签页展示提醒；无法可靠发现其他标签页。
- 可使用 BroadcastChannel 临时减少重复，但不能将其描述为持久保证。
- 不应退回 Harness 命令、会话消息或 Host 配置保存个人提醒状态。

若首次读取成功但后续写入失败，UI 不应假装操作已持久化；应保留当前内存结果并持续显示非持久状态。

## 后台、关闭与节流

`setTimeout` 在后台可能被延迟，浏览器也可能冻结或丢弃页面。因此：

- 每次回调都基于当前真实时间重新计算。
- `visibilitychange` 变为可见、`pageshow` 和 `focus` 时立即重算。
- `pageshow.persisted` 场景同样重新读取存储并计算。
- 系统休眠后只合并一次逾期事件。
- 页面关闭期间无法运行调度。
- 没有 Service Worker、Push 或系统级后台权限时，无法保证关闭页面后准点提醒。
- 即使使用 Service Worker，浏览器也不保证任意周期后台定时，因此首版不应承诺该能力。

## 并发动作语义

在 Web Locks 可用时，可以给出明确保证：

- “喝了”重复点击同一 `eventId` 至多计数一次。
- “暂停本班”与“稍后”按进入锁的顺序生效。
- 每个操作基于锁内重新读取的最新状态，不基于 React 闭包旧值。
- 所有标签页最终通过广播或 storage 事件收敛到同一 revision。

建议每个按钮操作带唯一 `operationId`，状态中保留最近少量已处理 ID，例如最多 16 个，用于防止双击、重试和事件重复处理。该列表必须有界。

没有 Web Locks 时，重复点击可以尽力去重，但无法严格保证两个进程同时提交都不丢失。不要通过虚假的“成功”提示掩盖冲突；回读发现冲突时应重新计算并显示最终状态。

## 可实现与不可实现的保证

可实现：

- 单标签页确定性调度。
- 刷新后恢复。
- 无薪休息冻结倒计时。
- 夜班跨零点保持同一班次。
- 后台恢复时最多合并一次。
- Web Locks 可用时序列化同源标签页操作。
- Web Locks 可用且租约有效时，同一时刻只有一个标签页展示。
- 存储损坏和拒绝时安全降级。
- 提醒数据不进入 Harness 会话日志。

不能无条件保证：

- 页面关闭后的准点提醒。
- 操作系统休眠期间执行提醒。
- 所有浏览器均支持 Web Locks。
- 无 Web Locks 时严格无冲突写入。
- 无原子协调能力时绝对只展示一次。
- 标签页刚展示后立即崩溃时既不重复又不漏提醒；两者不可同时保证。
- localStorage 被清除、无痕环境结束或浏览器回收站点数据后继续恢复。
- 跨浏览器、跨配置文件或跨设备同步。

租约接管应选择“允许崩溃后再次展示一次”，而不是永久漏掉提醒；产品文案应说明这是恢复行为。

## 建议测试

纯调度器单元测试：

- 工作中未到期、刚好到期、超过多个周期。
- 午休前剩余 N 分钟，午休中保持 N 分钟，午休后继续递减。
- 午休期间打开页面不展示，到复工后按剩余工作时间触发。
- “喝了”从实际操作时间重新安排。
- “稍后”跨午休保持剩余时长。
- 本班暂停跨自然日仍有效。
- 夜班结束后新班次生成新 `shiftId`。
- 非工作日、上班前和下班后不展示。
- DST 重叠与跳跃沿用 `calculate` 的既有语义。
- 长时间休眠后只产生一个事件。
- 修改间隔和修改作息的明确迁移规则。
- 非有限时间、倒退时间和越界状态安全处理。

持久化测试：

- 缺失、旧版本、未知字段和损坏 JSON。
- 超大数组、超长字符串及异常计数被截断或拒绝。
- localStorage 的 get/set/remove 分别抛错。
- 写入失败后不报告已持久化。
- 旧视图键与提醒键互不污染。
- 提醒代码不包含 `remote.commands.execute`，不写 Host 配置或会话。

多标签浏览器测试：

- 两个标签同时到期，仅一个获得 Web Lock claim。
- 两标签同时点击“喝了”，同一事件只计一次。
- 一标签稍后、另一标签暂停，结果符合锁顺序。
- 展示标签关闭后，租约过期并由可见标签接管。
- owner 被后台冻结时，租约接管不出现同时展示。
- BroadcastChannel 不可用时由 storage 事件收敛。
- Web Locks 不可用时验证尽力去重，并明确测试不宣称强保证。
- 存储被拒绝时仅维持本页内存状态。
- `visibilitychange`、`pageshow` 和休眠恢复后立即重算。
- 原有工资、倒计时、拖动、遮蔽金额和设置保存回归不受影响。
