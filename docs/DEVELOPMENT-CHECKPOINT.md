# 开发接续摘要

更新于 2026-11-05。此文件用于缩短后续上下文检索，不表示系统对话已经执行压缩。

## 当前发布：1.1.2 已完成

用户重新要求“小版本更新”，恢复发布授权并覆盖下方历史暂停限制。发布代码e895fd8、标签v1.1.2已推送main，Actions 42367163740的test/publish成功，GitHub Release已公开。2026-11-07 11:14 UTC验证npm latest=1.1.2、下载SHA512及全部56个文件与验收包相同；GitHub附件也独立下载核验一致。xxy实例已更新1.1.2，活动文件逐一匹配npm包，服务active/running且NRestarts=0。没有读取或重置真实薪资文件。

171项测试、36个JS文件、56个打包文件检查通过；实际1.1.2包验证真正发布过的1.1.1旧客户端同源迁移，以及全天计时、无配置/无会话/慢读/失败、简洁页面、窄屏与完整7.5秒喝茶。源码版本、锁文件、客户端、README、changelog、locale和截图索引均已同步。

编辑目录offwork-experience的release/1.1.2，主仓库plugins/offwork-clock的main，开发目录offwork-hydration-dev均同步到发布及后续核验文档提交。安装链接仍指向开发目录，私人data.json保留。发布材料/tmp/offwork-release-1.1.2，永久证据offwork-hydration-artifacts/release-1.1.2；详情docs/RELEASE-1.1.2.md。自己的隔离测试服务已停止。

## 已完成：统一简化展开详情页

用户认为喝水卡片、提醒设置及其他功能页丑而繁琐，要求尽可能简洁好用。本轮design/simple-feature-pages从1ef6598继续；默认224×94小卡片不改。先用隔离截图调用独立AI UI评审，再实际重排七个详情页与提醒设置，并将六张最终截图交第二轮复审，反馈可交付。

喝水页以waterHero展示剩余时间和计数，唯一主按钮喝了一杯；提醒设置移到两种模式的标题栏，免打扰收进details。设置保留开关、自定义分钟和一行数字预设，草稿不同才显示当前生效间隔；记录管理折叠，保存移到末尾。间隔无效时定位输入框，清零不提交间隔草稿。抽烟说明、收入班次详情与时区/会话等高级配置收起；工资隐私眼睛移到组标题；外观预览缩到180px、滑杆全宽、最大视频/海报对齐。明细页统一轻背景、分组、标题、字段与底部保存栏；切换页面重置滚动位置。独立下班页午休仍显示距下班，完成/休息显示状态。

验证脚本在/tmp/offwork-experience-preview：page-design-actions.cjs覆盖水操作/设置/数据管理/烟计时/收入隐私/薪资作息保存；page-design-edges.cjs覆盖所有页面在320/390/640视口的边界与保存可达、最大角色视频试播及草稿取消。评审和截图在/tmp/offwork-page-design，归档offwork-hydration-artifacts/detail-pages；文档docs/DETAIL-PAGES.md。保持1.1.1开发预览，发版继续暂停。

## 已完成：全天自然时间喝水提醒

用户要求喝水不要关联上班、午休或休息日。本轮feature/wall-clock-water从187517c继续，将提醒改为自然时间deadline，取消Host作息/薪资/会话依赖。间隔仍5–240分钟、默认关闭，稍后为自然10分钟；手动暂停直到恢复，恢复重计完整间隔；免打扰可跨下班/午夜。饮水计数保留并继续记录，不再随班次自动清零。

hydration.js为schema3平面状态（count/paused/dueAt/sequence/claim/quietUntil/recentActions），不再接收工作context。工资读取/保存移除对喝水计划的同步和作息授权；UI区分Host读取与保存忙态，本地喝水页在无会话、未配置、读取失败/慢读时可用。宿主错误不覆盖喝水错误。角色已确认打卡在休息时间也可完整播放，减少动态/手动暂停/免打扰仍生效。

IndexedDB数据库名dsh.offwork-clock.hydration.v1不变，版本升至2，新仓库wall-clock/current。旧state/current保留；在跨仓库事务中迁移schema1/2并写legacy-imported标记，防止重置/删除新记录后旧数复活。保留开关、间隔、次数、暂停、有效免打扰和近期ID；匹配旧班次时按剩余工作分钟一次性换成自然分钟，其他旧记录从本次迁移开始完整间隔。旧版open(version1)失败，不能覆盖新数据；升级后需刷新全部旧标签页。无效旧记录不覆写，可显式重置当前状态。

测试：更新旧工作时间用例为自然时间断言，补充原子迁移/旧写入隔离/异常恢复；浏览器water-wall-migration.cjs用同源旧/新客户端验证迁移（从design-review旧tgz提取client.js，只在响应中替换该精确子串，不能覆盖整份多模块响应），water-wall-time.cjs验证午休、自然稍后、作息修改不重排、跨下班免打扰和双标签；water-wall-independent.cjs验证Host慢读/失败/无会话/无薪资与存储恢复；water-wall-motion.cjs验证休息日只记录一次并播完7.5秒喝茶。均在自己的/tmp/offwork-experience-preview运行。

当前规则docs/HYDRATION.md；旧验收/调研标记为历史。发版仍暂停，保留1.1.1开发预览，不推送main或发布npm。

## 已完成设计：独立AI评审与横向小卡片

用户再次否定外观并明确要求调用UI工具或设计评审。本轮design/compact-time-ticket从7ac950e继续，实际调用本机Codex CLI进行独立AI视觉评审（仅读提供的旧界面截图），用Playwright渲染两份HTML/CSS视觉稿，选横向方案接入真实Harness，再将真实浅深截图送第二轮复审。复审反馈可交付、无必须修正项。没有真人设计师或Figma连接，不要混称。

实测224×94px；状态与主计时同行，数字26px/500，取消灰色内框和分割线。下方水滴/香烟计时同排，收入隐藏时只留眼睛，显示后金额可点击详情；长金额省略但悬停/无障碍描述保留完整值。下班保留明确文字和低饱和状态色，背景跟随主题。

171项检查通过。design-card.cjs与design-card-edges.cjs检查常态/完成、展开/收起、金额显隐、记录入口、拖动、长计时、提醒结束、浅深主题及窄屏。原始设计建议/视觉稿在/tmp/offwork-design-review，仅归档review.md、final-review.md、图片和HTML，不复制CLI日志/认证或浏览器状态。文档docs/UI-DESIGN-REVIEW.md；证据归档offwork-hydration-artifacts/design-review。发布仍暂停，保持1.1.1开发预览。

## 上一版纠正：非宠物模式保留小卡片

用户明确反馈上一版概览太大，要求恢复原来小卡片的体量。本轮fix/classic-small-card从4ef1075继续，默认mini模式为约220×110像素：状态/主计时在上，一行水滴和香烟图标计时，小号收入在底部；不显示大标题、说明段落或大功能块。右上角才展开完整概览，卡片返回后恢复原先mini偏好。保留完成/休息状态提示及工资隐藏偏好，不再用零倒计时作为无意义主内容。

classic-mini.cjs实测220×110.05px，验证展开/收起、计时入口、外观返回、拖动和窄屏。发布仍暂停，没有修改版本或发布标签。

## 已完成：非宠物模式概览，发布暂缓

用户先要求小版本发布部署，随后要求先重设计非宠物模式的默认卡片。1.1.2停留在准备阶段：仅查看远端和发布资料，未修改版本、创建标签、推送或发布npm。当前分支redesign/classic-overview，从841423d继续；本轮只更新xxy开发预览，仍为1.1.1。

新增classicClockPresentation和classicHeader/classicOverview默认入口，取代旧小条作为非宠物模式默认展示。按状态显示开工/下班/午休计时，完成/休息/加载/错误/未配置/无会话不用零倒计时。喝水与抽烟分成可直接打开的卡片入口，收入为次要信息并保留隐私偏好，作息详情沿用mini偏好展开。首次未配置只显示配置入口，不强制打开表单。

修正经典模式尺寸观察器初次挂载遗漏ready依赖的问题，长外观设置的保存入口能在窄屏到达；新卡片支持返回、Escape、导航后的焦点恢复与草稿保护。业务计时、Host薪资数据和现有浏览器记录不变。

171项项目检查通过。classic-test.cjs验证工作/午休/完成/休息、卡片入口、模式切换、隐私与窄屏；classic-startup.cjs在隔离客户端注入慢读/失败/未配置/无会话验证状态和恢复。timer-layout.cjs和timed-popup-test.cjs回归宠物计时布局及喝水提醒。文档docs/CLASSIC-OVERVIEW.md，归档offwork-hydration-artifacts/classic-overview。

## 已完成：计时概览布局

用户反馈三条独立计时横条的默认布局不好。本轮分支style/countdown-overview基于cc9335c，在同一offwork-experience目录调整展示：统一196px小面板，上方整行突出下班倒计时，下方左右并排显示水滴和香烟计时。短于一小时显示分:秒；暂停/免打扰保留小标记与无障碍状态，到期仅强调对应单元，兼容深色主题。布局高度预留从90降至72px，角色与拖动边界一起计算。计时事务、提醒、菜单导航与用户保存的外观设置不变。

验证使用自己的/tmp/offwork-experience-preview：timer-layout.cjs检查主次排列、320/390/640视口、24小时暂停值不截断、深色到期效果和原菜单交互，countdown-test.cjs回归计时操作与刷新同步。仍保持1.1.1开发预览，不另发版本。

## 独立喝水与抽烟倒计时

用户要求单独显示喝水倒计时并增加抽烟倒计时。工作目录仍为offwork-experience，新分支feature/separate-countdowns，从ae2149e开始。保留体验优化及94eaa58定时提醒修复；版本仍1.1.1，本轮仅更新开发预览，不发布npm或推送main。

新增右键路由water-countdown、smoking与各自卡片，角色脚下新增两行常驻计时。喝水直接使用hydrationView；抽烟为手动开始的自然时间倒计时，支持间隔预设、暂停/恢复、重新计时和停止，到期不自动重启或弹卡。

countdown.js保存纯状态逻辑。hydration-store.js提取createStateStore，原喝水接口和数据库不变；抽烟使用独立IndexedDB dsh.offwork-clock.smoking.v1，事务版本校验防止旧标签覆盖新一轮，BroadcastChannel/轮询同步显示。失败不静默重置；重试恢复现有截止时间；读取结果按请求序号接收，既防止迟到回调覆盖，又能识别用户主动清空数据库。

168项检查通过；独立浏览器countdown-test.cjs、countdown-storage.cjs、countdown-independent.cjs验证计时、刷新、同步、记录隔离、存储恢复与独立于作息错误。timed-popup-test.cjs和experience-test.cjs回归原提醒与视频体验。测试仍在自己的/tmp/offwork-experience-preview中，证据归档offwork-hydration-artifacts/countdown-preview。说明见docs/COUNTDOWN-PREVIEW.md。

## 已完成体验优化（feature/companion-experience）

用户认可先完善动作试播、资源加载与动作衔接。为避开另一份未提交的提醒修复，本轮建立独立工作目录offwork-experience，从7b045a0开始，随后合并已完成的94eaa58提醒修复；原offwork-hydration-ux目录未被改写。新工作目录由xxy持有，root执行Git时使用仅针对该目录的`-c safe.directory=...`，未修改全局Git配置。

外观卡片新增已有动作的试播/停止与失败重试，独立播放器不调用喝水事务、不保存偏好；Apply才更换页面角色。预览不自动播放；草稿确认替换DOM时销毁并重建播放器，避免离屏残留。取消/换模型/后台/减少动态都会清理。

视频不再内嵌客户端：tools/build.mjs同时生成client.js与media-manifest.js，静态图/小探测片保留内嵌。media-server.js通过可选webServer作用域注册同源静态资源路由，内容SHA256白名单、大小/完整性校验、GET/HEAD/Range/ETag与不可变缓存。客户端约10.7MB→0.84MB，候选包约15MiB→8MiB。不新增运行时依赖，不暴露配置/会话目录。

播放器保留当前画面直到下一片段可播，透明淡入淡出使用隔离混合，快速请求取消过时片段。现有已发布素材不重编码。版本保持1.1.1，本轮不推送main、不发布npm。

163项检查通过。透明视频探测会等待可读取首帧；空帧或超时不永久缓存为不支持，允许重试。独立测试目录/tmp/offwork-experience-preview（自己的DSH_HOME、端口、示例工资配置和浏览器状态），没有复用或停止提醒修复的测试服务。experience-test.cjs验证按需请求/缓存/记录隔离/衔接/重试；experience-edges.cjs验证加载中换模型、草稿确认后恢复、后台与窄屏；experience-record.cjs验证试播不计数而真实打卡只计一次；timed-popup-test.cjs回归94eaa58提醒流程。最终归档offwork-hydration-artifacts/experience-preview，详情docs/EXPERIENCE-PREVIEW.md。

## 已合入：到点自动弹卡、提示直接展开

用户进一步要求该喝水时直接弹卡。fix/timed-water-popup基于7b045a0，新增pet-reminder.js页面内呈现状态：观察到正常倒计时、休息或免打扰阶段后，进入到期且本页持有显示权、没有其他卡片/菜单时弹一次提醒。刷新初次读到已逾期或后台错过到期时保留提示，避免重新出现刷新即弹的问题。

提示左键/Enter/Space现在直接展开提醒，不再绕菜单；已有其他只读卡片时明确点击进入喝水卡片。角色左键仍只互动。自动弹卡不抢焦点，编辑不被覆盖。“收起提醒”/Escape只影响本页显示，不打卡、不延期；“喝了”和“工作10分钟后”复用原事件身份校验的事务。关闭后同一持续到期阶段不重弹，下一轮重新计时可再弹。

150项检查通过，timed-popup-test.cjs验证自动弹出/焦点、手动提示展开、喝水/稍后、收起不重弹、刷新已逾期不闪弹、草稿、双标签单提示与320px边界；timed-popup-resume-test.cjs补查免打扰结束和后台到期返回。仅更新xxy开发环境，版本仍1.1.1开发候选，不发布npm或合并main。归档offwork-hydration-artifacts/timed-water-popup，临时结果/tmp/offwork-timed-popup。

## 近期开发修复：到期提示可操作

用户反馈“该喝水啦”出现后点击没有反应。前轮提示为纯信息div，没有左键处理。fix/actionable-water-badge基于4d20b45，改为44px高的菜单按钮，保留小提示和菜单箭头；点击、Enter/Space展开现有菜单并聚焦喝水入口，选择后才打开卡片。角色左键仍只互动，不会自动弹卡片或直接打卡。键盘打开按按钮位置锚定，Escape恢复触发按钮焦点。

146项检查通过。actionable-badge-test.cjs验证三组视口中的按钮/菜单边界、角色命中和回应、鼠标与键盘菜单、稍后不计数、明确打卡一次，以及模拟触屏；refresh-due-test.cjs回归刷新不弹卡片、不重置/延后、双标签单提示。并确认到期提示未遮挡角色的正常点击。归档offwork-hydration-artifacts/actionable-water-badge；仅更新xxy开发环境，仍为1.1.1开发候选，不发布npm或合并main。

## 近期开发修复：刷新默认显示宠物

用户反馈网页刷新出现喝水卡片而非宠物。fix/pet-refresh-default基于2a5a4e8；已用延迟Host读取复现旧版petMode依赖configured/safeState导致退回经典卡片，并确认到期状态会自动展开reminder面板。

修复：外观偏好恢复后宠物独立显示，Host加载/失败/无会话/未配置时使用小状态标识，失败从右键重试；宠物模式未配置时不自动展开作息表单，经典模式仍保留初次设置。到期仅显示一份旁侧徽标，卡片只由菜单打开；空闲Escape不再自动稍后提醒。重试后恢复菜单触发点焦点。业务计算、IndexedDB与薪资配置不变。

146项检查通过。refresh-host-test.cjs以浏览器响应拦截模拟慢读取、错误、无会话和未配置，并确认没有旧卡片闪现、已选角色保留、可重试、显式经典模式保留；refresh-due-test.cjs验证到期刷新、焦点、次数/到期不变和双标签去重；refresh-interactions-test.cjs验证五角色菜单交互与草稿。只更新xxy开发环境，仍标记1.1.1，不覆盖已发布npm版本、不合并main。归档offwork-hydration-artifacts/refresh-default，临时结果/tmp/offwork-refresh-fix。

## 历史发布：1.1.1与菜单入口调整

用户要求“点角色不弹出喝水，都是通过右键菜单弹出”，随后明确授权“处理完检查，确保没问题发版1.1.1”。release/1.1.1基于906a9fc，授权本轮合并main、推送、打标签、npm/GitHub发布，覆盖下文旧开发阶段限制。

角色左键/Enter/Space仅回应，去掉aria-expanded；计时徽标改为非按钮timer，到期徽标改为非按钮note。主动打开卡片统一使用右键菜单；原自动提醒仍按设置显示。拖动后点击抑制与键盘重新激活、草稿保护保留。package/lock/client均更新1.1.1，纳入本轮全部独立交互与两套透明视频形象。

146项检查通过，实际安装包隔离浏览器release-1.1.1-interactions.cjs验证五形象点击/键盘/拖动、菜单五卡片、草稿、到期提示及窄屏；release-1.1.1-ornate.cjs和release-1.1.1-long.cjs验证视频完整流程；release-1.1.1-cards.cjs验证独立卡片和双标签提醒。

已完成正式发布：提交1b0fa0e、标签v1.1.1、GitHub Release，Actions 42132251469成功。2026-11-05 23:52 UTC确认npm latest=1.1.1，下载包SHA-512及逐文件内容与验证包一致，GitHub附件也一致。xxy实例已更新为1.1.1，私人薪资文件保留，隔离验证服务已停止。归档offwork-hydration-artifacts/release-1.1.1，发布记录docs/RELEASE-1.1.1.md。

## 历史：短裙四份素材与循环待机

本轮输入52b82668…为1280×1920白底持杯WebP；42d37cf6…喝茶文件名写5s但实际10秒；c77cae16…待机6秒；7482c445…挥手5秒。原件归档offwork-hydration-artifacts/ornate-intake。完整分析见docs/ORNATE-ASSET-ANALYSIS.md。

feature/ornate-video-set基于cf522a8。新增whale-ornate-actions（短裙动态），原whale-actions标签改为长裙动态，保留所有旧形象与用户已保存选择。短裙输出400×640/24fps：待机取前41帧无闪光片段做平缓往返4秒循环；挥手取前55帧补回程形成5秒；喝茶保留前7.5秒。持杯图导出完整尺寸透明PNG。原片边缘缺失不补画。

pet-video.js增加循环待机、动作结束恢复待机、根据实际时长设置超时、等待超时回退，以及后台/拖动/安静状态暂停。旧动作不重播；坏待机不阻断其他可用动作，坏动作回退后可以恢复待机。外观存储升级v7，兼容v6/v5/v4/v3并隔离旧客户端写入。

146项检查通过。ornate-test.cjs验证两个循环不重建节点、挥手/7.5秒喝茶完成后返回待机、反馈到期不截断视频、只记一次、各种暂停恢复、窄屏与刷新。ornate-migration.cjs验证旧偏好与标签隔离，ornate-fallback.cjs验证自动循环不会反复重试失败媒体。长裙播放及失败回退回归通过。

处理脚本/tmp/offwork-character-motion/process-ornate-set.py，结果/tmp/offwork-ornate-matting；最终归档ornate-video-actions，下载素材包ornate-video-preview。保持1.1.0，仅更新指定开发预览；不推送新功能、不发布npm。文件站交付沿用账号内私有文档方式，已上传并逐文件校验导出内容，链接记录见offwork-hydration-artifacts/ornate-delivery-links.json。

## 历史：用户视频抠像与播放

用户授权直接处理并使用本轮提供的挥手/喝茶视频。feature/whale-video-actions基于b0b98b8，新增可选“鲸蓝少女 · 动态互动”，不自动替换用户已保存形象。原片ID分别f76a34ba-6a70-423a-8386-933275bde57f、f3235c90-7f69-4f64-bbca-f4aeb67c83b2，归档在offwork-hydration-artifacts/whale-animation-sources。

抠像工具在/tmp/offwork-character-motion：matte_white.py、process-video-actions.py、encode-video-actions.py；模型u2netp仅在本机处理时使用，不随插件运行。逐帧前景参考与白底连通区域结合，保护白裙/杯子，固定缩放留白，最终两段480×768、24fps、5秒、无声VP9透明视频共约3.2MB。缺失鞋尖/尾尖未重绘。当前没有真正的循环待机视频，待机沿用立绘呼吸。

pet-video.js独立实现实际alpha解码探测、一次性播放、抢占、结束回图、失败/超时回退，以及隐藏/减少动态/免打扰/拖动/销毁清理。仅已有喝水事务成功反馈触发喝茶，播放完成不操作业务。外观存储升级v6并兼容v5/v4/v3，隔离旧客户端对新model值的覆盖。版本保持1.1.0，仅更新指定开发环境，不推送或发布新功能。

141项检查通过，隔离浏览器video-test.cjs、video-edges.cjs、video-migration.cjs验证真实透明播放、动作切换、反馈去重、静态回退及迁移。后续归档与候选包在offwork-hydration-artifacts/video-actions；视频下载预览在whale-video-preview。单独的喝茶关键帧4086ea12-dc21-4dc8-aea3-b615ee4c32d4为白底WebP，已归档tea-reference，当前播放使用用户视频。

## 历史：立绘交互动作

用户询问角色能否像dsh-pet一样交互动画。基于263e237创建feature/character-interactions，独立实现pet-motion.js，提供待机呼吸、鼠标靠近、点击回应、拖动倾斜/放下回弹及已确认喝水后的庆祝反馈。图片仍是静态立绘，整体动作不等于人物局部眨眼/摆尾；没有第三方运行时或动画素材，没有声称已完成视频模型。

控制器使用浏览器动画API，稳定角色DOM节点，停止与抢占动作不会重播旧事件。页面隐藏、编辑菜单、动作开关与系统减少动态效果都能停止动作；原左键喝水、右键菜单、拖动及外观草稿规则保留。136项检查与motion-test.cjs验证通过，whale-test.cjs及cards-test.cjs验证角色切换/预览、独立卡片与双标签提醒回归通过。日志归档在offwork-hydration-artifacts/character-motion。仅更新指定开发环境，保持1.1.0版本，不把新功能推送到main或重新发布同一版本。

## 当前发布指示：1.1.0

用户明确要求将当前成果发布为1.1.0，已授权本轮更新版本、合并主分支、推送、创建标签和发布npm/GitHub Release。此指示覆盖下文历史阶段的“不改版本、不发布”限制。当前发布分支release/1.1.0，功能基线c7857d6。两张用户提供立绘按本次发布指示随包分发，素材说明已同步更新。

发布与验证见 docs/RELEASE-1.1.0.md。发布提交59efb26已推送main和v1.1.0；GitHub Actions 42000649482成功，GitHub Release及附件已公开，附件校验一致，开发实例已升级。npm于09:32 UTC完成公开验证，latest=1.1.0，下载包SHA-512及逐文件内容与验证包一致。结果归档offwork-hydration-artifacts/release-1.1.0/registry.json，main已在72665ae同步发布结果，本分支已快进包含该文档提交。不要重复发布同一版本。以下内容保留为开发历史。

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
