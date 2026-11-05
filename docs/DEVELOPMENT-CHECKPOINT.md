# 开发接续摘要

更新于 2026-11-05。此文件用于缩短后续上下文检索，不表示系统对话已经执行压缩。

## 当前发布指示：1.1.0

用户明确要求将当前成果发布为1.1.0，已授权本轮更新版本、合并主分支、推送、创建标签和发布npm/GitHub Release。此指示覆盖下文历史阶段的“不改版本、不发布”限制。当前发布分支release/1.1.0，功能基线c7857d6。两张用户提供立绘按本次发布指示随包分发，素材说明已同步更新。

发布与验证见 docs/RELEASE-1.1.0.md；使用现有GitHub Actions发布流程，完成后核对npm latest、压缩包与源码一致性。以下内容保留为开发历史。

## 最新：鲸系少女外观（feature/whale-character）

- 用户提供两张1024×1536 RGBA原图，授权用于替换水滴形象。均有透明通道，浅/深底合成正常；没有重新生成或重绘人物。
- 已加入 whale-dress 默认长裙、whale-ornate 可选礼裙，保留 xiaoxie-original 水滴。外观增加角色下拉选择，应用前只更新卡片内预览。
- assets/characters 中为640×1024透明WebP，约139KB/124KB；构建内嵌客户端，不依赖用户文件分享链接。来源范围见同目录NOTICE.md。
- 人物大小采用纵向比例，布局同时约束宽高，手脚和尾巴完整显示；只有轻微整体反馈，不包含独立眨眼/摆尾或Live2D。
- 外观记录升级为 dsh.offwork-clock.view.v5，从v4一次性迁移，保留大小/位置/透明度/隐私/动作。避免旧标签页的normalize写回删除新字段导致循环；喝水库和Host薪资完全不变。
- 131项检查通过；/tmp/offwork-hydration-ux/whale-test.cjs 和 whale-migration.cjs 验证模型切换、预览取消/应用刷新、拖动、打卡、320px和横屏全卡片边界、减少动态、v4迁移以及新旧标签页隔离/新版同步。
- 原图与处理临时文件 /tmp/offwork-character-intake；原图及结果归档在 offwork-hydration-artifacts/whale-character。获取用户指定的文件使用本机文件服务的只读附件接口，没有读取其他文件或暴露凭据。
- 保持1.0.1，更新指定开发环境，尚未合并main或发布。

## 用户目标与授权

- 项目 `dsh-offwork`，GitHub `SnowBeatRain/dsh-offwork`，正式 npm 版本为 `1.0.1`。
- 用户计划下次版本 `1.0.2`，但明确要求暂不修改版本号；先验收，再决定发布。
- 最新明确范围：做我们自己的独立 DeepSeek Harness 页面宠物插件。自主实现角色展示、模型加载、动画和交互；不以 dsh-pet 或 dsh-pet-offwork 为开发基底或运行依赖。第三方仅作体验/公开资源格式参考，具体素材另行核对授权。不做系统桌宠或 Electron，不需要询问操作系统。
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

- 最近 `npm run check` 通过，131 项测试；格式、生成物一致性、语法和打包检查均通过。
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

## 最新：菜单与卡片自适应、统一 UI

用户要求重新检查右键菜单与卡片的高度、宽度、内容、配色和交互。分支 refactor/adaptive-pet-ui。

- 新增 pet-surfaces.js：按卡片种类选择宽度，测量自然内容高度，统一菜单/卡片/提示定位与视觉令牌，替换固定360/440高度和旧菜单估算。
- useLayoutEffect + ResizeObserver 测量未限高的正文 wrapper 与页头；内容不足不留多余空白，超出视口才滚动，仍隐藏滚动条。计时更新不反复触发布局。
- visualViewport 宽高与偏移用于宠物、弹层和原卡片；临时缩放/软键盘适配不写回保存位置。
- 外观在卡片内预览，实际宠物尺寸应用后才变，避免拖动滑块时目标移位。
- 共用表面、字体、圆角、边框、主色、控件尺寸与焦点样式；长文字自然换行，大字体不截断，触控目标加大。
- 菜单靠近触发点并避开宠物；从卡片打开的菜单关闭后焦点回到该卡片。喝水提示同时避开宠物、打开的卡片与菜单。
- 未保存确认区支持Tab循环，处理中聚焦确认区；pending期间不允许再次菜单跳页覆盖目标。
- 128项检查通过；/tmp/offwork-hydration-ux/adaptive-test.cjs、adaptive-edge-test.cjs 和 cards-test.cjs 通过，含五种视口、暗色变量、大字体、触控模拟、可视视口偏移、草稿及多标签单提醒。
- 研究/复审 /tmp/offwork-adaptive-review。复审部分样式缺失判断因未提供 pet-interactions.js 上下文，已用真实浏览器验证固定定位/滚动/层级；有效的视口、焦点、通知避让问题已处理。
- 仍保持1.0.1，仅更新本地开发环境，不发布、不修改第三方插件。

## 最新：按菜单拆分独立功能卡片

用户认可一行一项的右键菜单，要求倒计时、喝水等分别独立展示。当前分支 refactor/separate-pet-cards。

- 菜单为倒计时、喝水、收入、外观、作息与薪资及复位位置。每项打开独立顶层卡片，不再经混合主页。
- 路由 home=喝水，income=倒计时，earnings=收入；water 仍为喝水设置子页。左键宠物开喝水，脚下倒计时开倒计时。
- 菜单导航 root 标记将 back 清空；子设置保留其所属卡片。待确认导航也保存 root，保存或放弃后不跳回无关卡片。
- 倒计时卡片不含收入/喝水，收入不含倒计时/喝水；喝水卡片仅含记录、免打扰、暂停/恢复和提醒设置。
- 其他卡片打开时的喝水到期提示放在宠物旁，点击才进入喝水卡片，不嵌入其他卡片。
- 用户要求卡片不要滚动条：style/hide-card-scrollbars 分支将宠物卡片及原计时卡片的可见滚动条隐藏，保留 overflow:auto。浏览器已验证滚轮、键盘聚焦保存按钮及320px窄屏无横向溢出，不是裁掉后续内容。
- 121 项检查和 /tmp/offwork-hydration-ux/cards-test.cjs 浏览器验证通过，含双标签单提示和320px各卡片边界。最新截图和说明见 docs/PET-PREVIEW.md。

## 最新：交互重构（覆盖此前右键直达外观等旧规则）

用户反馈整体体验差，授权重新处理交互。当前分支 refactor/pet-interactions，仍只更新本地开发环境，保持 1.0.1、不推送或发布。

- 新增 pet-interactions.js，使用纯 reducer 管理唯一 screen（null/home/income/water/appearance/schedule）、back、menu、pending。旧 editing/waterEditing/appearanceOnly/petOpen 等由 screen 派生，不再独立设置。
- 左键总是回主页；右键显示真正的小菜单（外观、提醒、作息、本班暂停/恢复、复位），菜单避开宠物并支持键盘。返回、关闭、Escape 分层处理。
- 固定面板边界与标题栏，内容滚动；主页打卡/免打扰按钮位置不随反馈变化。外观尺寸预览期间固定面板，应用后重新定位。
- 内部导航保护提醒、薪资、外观草稿，提供保存并继续/放弃/继续编辑。失败留在原编辑页保留值；实际失败存储恢复后可重试。
- appearanceDraft 与 savedView 分开，预览不写 localStorage，Apply 只提交变化字段，Cancel 还原。模式切换应用后生效；卡片模式提供内嵌角色预览。
- 关闭到期气泡会执行现有 10 个工作分钟稍后动作，避免关闭后立即重现。拖动中只更新临时位置，松开才持久化。
- 119 项检查通过。/tmp/offwork-hydration-ux/ux-test.cjs 与 ux-multitab.cjs 覆盖连续导航、稳定布局、失败重试、跨标签草稿/偏好与单提醒。研究及复审在 /tmp/offwork-pet-ux-review。
- 最新说明与截图以 docs/PET-PREVIEW.md 为准。早期的“右键直接打开外观”“外观设置即时保存”等描述仅是历史记录。

## 最新任务：独立宠物预览

用户已授权“做一版出来看看”。当前开发分支 `feature/independent-pet-preview`，仍在隔离目录 `offwork-hydration-ux` 中修改，验证后快进开发环境分支。

- 新增 pet-view.js：原创全身 SVG 水滴“小歇”、独立宠物舞台、浮层布局、中英文文案与样式。未使用第三方宠物代码、素材或服务。
- 默认宠物模式：角色独立悬浮，脚下显示倒计时；点击打开“日常陪伴”和“下班与收入”两页，沿用原有喝水/免打扰/工资操作。
- 支持拖动、刷新记忆、方向键移动、Home 复位、Escape 关闭，设置中可调大小或关闭宠物模式返回计时卡片。
- View 偏好新增 petPosition 和 petSize，旧 position 保留给原卡片；角色尺寸同时受视口宽高限制，极短视口的面板可覆盖显示并滚动。
- 113 项检查通过；隔离浏览器脚本 `/tmp/offwork-hydration-ux/pet-test.cjs` 验证拖动不误触、操作与真实到期、多标签页、模式切换、刷新、320px 窄屏。复审记录 `/tmp/offwork-independent-pet-review/review.md`。
- 本版仅有原创 SVG 模型，未开放外部模型包导入或 Live2D/视频/序列帧渲染。不要将当前原型描述为已支持所有 dshpet 模型。
- 最新反馈：用户找不到外观。已增加明确“外观”文字按钮（宠物/计时面板顶部及喝水快捷区），进入独立页面，首项为宠物模式，提供“完成”返回。原薪资表单复用同一组外观控件，外观页不读写薪资或提醒配置。当前修复分支 fix/appearance-entry，从 9e78101 开始；浏览器脚本 appearance-test.cjs 已通过模式、焦点、刷新和数据保留验证。
- 用户进一步要求右键触发：已在宠物、脚下倒计时和原计时卡片的计时区域加入右键直达外观，支持 Shift+F10/菜单键；左键保持日常操作，编辑中的草稿不被右键替换。分支 fix/pet-context-appearance，隔离浏览器 context-test.cjs 已验证原生右键、焦点、键盘、卡片兼容和草稿保留。
- 用户反馈右键仍弹浏览器菜单：已复现“外观打开后第二次右键被放行”。修复分支 fix/pet-context-suppression，组件根部改用 onContextMenuCapture，在编辑/忙碌判断之前阻止原生菜单，覆盖角色空白区及整个自有组件；文本编辑输入仍保留原生菜单。context-regression.cjs 覆盖重复右键、草稿和真实挂起的 IndexedDB 保存，旧 context-test.cjs 也通过。
- 详细截图与验收记录：docs/PET-PREVIEW.md。保持 1.0.1、不推送或发布，不动第三方宠物安装。

## 最新澄清：接入 dshpet 模型与桌宠形态

用户已明确只做 Harness 页面宠物，随后进一步强调“重新做、作为新的独立插件，不在别人插件基础上开发”。因此此前建议对接现有 dsh-pet-offwork 的路线已取消。我们自己实现资源加载、角色渲染、拖动、动画、气泡和交互面板，复用自己已经完成的业务模块；第三方插件仅供体验和公开资源格式参考。

环境中已有 `dsh-pet: 0.4.1` 和 `@local/dsh-pet-offwork` 的事实保留用于避免误操作；它们不是开发基础，不修改、替换或卸载。此前澄清后，用户已进一步授权制作原型；最新实现见上方“独立宠物预览”。用户没有明确要求换 npm 名称或重置版本，继续保持自己的开发包 1.0.1、不推送、不发布。详见 `docs/PET-INTEGRATION-RESEARCH.md`。
