# 开发接续摘要

更新于 2026-11-05。此文件用于缩短后续上下文检索，不表示系统对话已经执行压缩。

## 用户目标与授权

- 项目 `dsh-offwork`，GitHub `SnowBeatRain/dsh-offwork`，正式 npm 版本为 `1.0.1`。
- 用户计划下次版本 `1.0.2`，但明确要求暂不修改版本号；先验收，再决定发布。
- 不开发独立桌面程序或桌宠，专注 DeepSeek Harness 插件。
- 用户指定 `https://dsh.toolscc.cn` 的 `xxy` 环境加载本地开发目录进行验收。其他环境使用插件市场正式版。
- 本地验收环境的更新和单用户服务重启已获授权；不要把这等同于授权合并主分支、推送、打标签或发布 npm。

## 当前代码位置

- 正式源码：`/opt/dsh/users/xxy/workspace/dsh/plugins/offwork-clock`，`main` 停在 `7df1465`。
- 正在验收的开发目录：`/opt/dsh/users/xxy/workspace/dsh/offwork-hydration-dev`。
- 开发分支：`feature/hydration-reminders`。本轮基线为 `5ba7602`，完成后快进到手动打卡与免打扰的实现提交。
- 隔离修改目录：`/opt/dsh/users/xxy/workspace/dsh/offwork-hydration-ux`，当前追加的快捷入口分支 `fix/hydration-quick-actions`，从手动打卡与免打扰提交 `2f7325c` 开始。
- 本地候选压缩包及验证输出：`/opt/dsh/users/xxy/workspace/dsh/offwork-hydration-artifacts`。
- 用户 Web profile：`/opt/dsh/users/xxy/home/profiles/web`，其中 `dsh-offwork` 链接到开发目录。
- 仅当隔离验证通过后快进开发分支，再重启 `dsh-user@xxy.service`。实例监听 `127.0.0.1:3080`，由网站 SSO 路由到该用户。
- 不读取或打印用户的 `data.json`、会话、令牌。切换开发目录时已保留原有工资配置；本次不要复制或重置它。

## 已完成且应保留的行为

- 工资、班次、无薪休息、夜班和时区计算沿用 `clock.js`；Host 工资配置与命令在 `index.js`。
- `hydration.js` 是纯提醒状态机；`hydration-store.js` 使用 IndexedDB 单记录事务序列化跨标签页操作。
- 默认关闭，间隔 5–240 工作分钟，默认 60。午休冻结，夜班按班次开始日归属。
- 到期“喝了”幂等计数；“工作 10 分钟后”；本班暂停和恢复；次数清零和全部重置均需确认。
- 展开面板“喝了一杯”可在工作/午休主动记录，关闭提醒或本班暂停时不自动恢复提醒。正常打卡重排完整间隔；午休后保留完整间隔。
- 临时免打扰 30/60 自然分钟，可调整和提前结束，到期逾期只提示一次。午休/下班不弹，下一班不继承；本班暂停和关闭提醒会清除免打扰。
- 记录 schema 2 在原库内事务迁移 schema 1，保留已有偏好和次数/暂停/到期进度。手动操作携带班次身份，最近 64 个操作 ID 去重；到期确认同时校验事件身份。旧页面不识别新 schema 时须刷新。
- 提醒数据仅在浏览器，不进入 Host 工资文件和会话。仅保留当前/最近一个班次。
- 多标签页提示使用短租约；可见页面领取，隐藏/关闭释放，过期可接管；广播+轮询同步。存储不可用时停止自动提醒，可重试。
- 作息变更以比较旧作息的条件授权处理，授权使用后消费。旧标签页不能通过 tick/release 等动作回写旧计划。
- 喝水有独立设置页面。15/30/45/60/90/120 分钟预设+自定义，统一“保存提醒设置”，取消和返回不保存。不得恢复原先“薪资保存+应用间隔”混用交互。
- 小条两行：下班倒计时；工资与喝水剩余时间。喝水倒计时必须逐秒显示 `05:00 → 04:59`，不能取整成“5 分钟”造成停滞观感。
- 最新用户要求：把手动打卡放到点击小条喝水倒计时的位置。已改成原位快捷区，内含打卡、免打扰和设置；设置返回快捷区。支持再次点击、外部点击、关闭按钮和 Escape 收起，原完整展开卡片仍可用。隔离浏览器已验证操作、焦点、到期计数及 320px 窄屏。
- 到期提示只出现一处，不抢输入焦点；本班暂停在展开面板中。
- 模块经 `tools/build.mjs` 内联为 `client.js`，不要手改生成物。
- package.json、package-lock.json、客户端 data-version 均保持 `1.0.1`。

## 测试与资料

- 最近 `npm run check` 通过，110 项测试；格式、生成物一致性、语法和打包检查均通过。
- 隔离 Harness `0.2.1-rc.5` + Headless Chromium 验证了间隔选择、实际触发、刷新、并发、存储错误、作息变更和秒级倒计时。
- 测试工具缓存与脚本：`/tmp/offwork-hydration-ux`，独立 Harness 已停止，可由 `start.py` 重启。私有启动地址在 `state.json`，不要打印或分享。
- 使用前核对旧测试脚本的 UI 选择器是否仍匹配。不要用用户浏览器的 IndexedDB 作为测试夹具。
- 开发前已调用三个子 agent 调研业务、协调和接入，报告在 `docs/hydration-research/`；有两轮实现复审及对应修复。
- 功能规则：`docs/HYDRATION.md`；验收：`docs/HYDRATION-ACCEPTANCE.md`；截图：`docs/hydration-preview/`。

## 当前最新任务

用户先要求压缩上下文，因无系统调用工具而保存此摘要；随后要求先分析反馈。分析完成后，最新明确授权：“可以，你去处理吧”，并补充产品应偏向拟人化操作，后续可能加入卡通人物。

本轮已实现手动打卡、临时免打扰，完成 105 项测试及隔离浏览器专项。业务、架构两份研究和实现复审位于 `/tmp/offwork-hydration-extras-research`；结论与实际规则记录在 `docs/HYDRATION.md` 与验收说明中。浏览器脚本 `extras-test.cjs`、`extras-edge-test.cjs` 位于 `/tmp/offwork-hydration-ux`。

本轮交付：

1. 手动喝水打卡：没到期也能记录喝水，并重排提醒；要明确关闭提醒、午休、班外和并发点击的语义。
2. 临时免打扰：建议 30/60 分钟，支持主动结束，按自然时间到期自动恢复；要明确与午休、本班暂停、跨班次、已到期事件和手动打卡的关系。
3. 补充真实浏览器及状态机/事务回归，更新本地开发环境供用户验收。

下一阶段：远眺提醒、打工心情、更多外观设置。用户随后将“先做拟人化”提升为当前任务，见下节。

## 最新：拟人化表现层

- 当前工作分支 `feature/companion-presentation`（隔离目录仍为 `offwork-hydration-ux`），从 `0d729be` 开始。开发目录验收时快进到该分支。
- 新增 `companion.js`，包括纯表现映射、原创 SVG 角色“小歇”、中英文文案与 CSS。计薪、喝水计时、数据库和租约模块未改动。
- 小条角色可打开喝水快捷区；展开视图给出一句状态反馈。通过现有外观设置隐藏角色或关闭动作，偏好保存在原有 localStorage view 记录。
- `waterRuntime.update` 返回 `{ state, recorded, quietChanged }`；Host get/set 的作息授权消费者与 `waterAction` 均已适配，勿还原为直接返回状态的旧约定。
- `waterNotice` 已改成语义对象 `{ key, kind, token? }` 或 false，不再直接存翻译字符串。
- 确认成功才展示喝水反应，免打扰/午休/暂停不动；只由提示租约 owner 展示喝水姿态。固定的单一反馈播报区不随视图切换重建。
- 默认位置也会在内容增高时限制在视口内；外部点击只在整个组件之外关闭快捷区，避免内部按钮在 pointerdown 时移位。
- 110 项检查通过；隔离浏览器脚本 `companion-test.cjs`、`companion-edges.cjs` 和截图位于 `/tmp/offwork-hydration-ux`。两份研究与复审位于 `/tmp/offwork-companion-research`。
- 详细规则、截图和验收见 `docs/COMPANION.md`。仍保持包版本及客户端标记 `1.0.1`，不推送或发布。
