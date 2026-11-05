# Harness 页面宠物接入方案

状态：接入调查，尚未改动现有宠物插件或部署接入功能。

## 已确认范围

用户最新明确：只做 DeepSeek Harness 页面内的宠物，不做系统桌面宠物。无需 Electron、独立桌面客户端或操作系统选型。

最终形态是使用 dsh-pet 一类插件的卡通人物模型，在 Harness 页面内独立悬浮、拖动、显示动作与气泡，点击角色打开下班倒计时、喝水打卡、免打扰等操作。当前卡片内的 SVG“小歇”是已完成的表现层原型，不等同于最终的独立宠物形态。

## 当前环境的实际基础

已只读核对 `/opt/dsh/users/xxy/home/profiles/web/package.json` 与本地文件：

- Web profile 声明 `dsh-pet: 0.4.1`。
- 同时声明 `@local/dsh-pet-offwork`，链接到 `/opt/dsh/users/xxy/workspace/dsh/plugins/dsh-pet-offwork`；链接与包均存在。
- 本地定制包版本 `0.4.1-offwork.1`，来源为 `PC2005-cloud/dsh-pet`，带透明 WebM 动画素材。
- `lib/client.js` 中的 `offworkSnapshot` 当前固定上海时区、周一至周五、17:00 下班；`OffworkBadge` 作为宠物舞台子元素随角色移动和显隐。
- 这份倒计时目前没有使用 dsh-offwork 的作息配置或喝水状态。接入前需确认实际启用的宠物实例与现有构建方式，避免双实例或覆盖已有本地定制。

## 推荐接入结构

1. dsh-offwork 继续作为计薪、班次、喝水、免打扰的业务事实来源。
2. 通过适配层提供可显示的状态与明确操作，不从页面文字或 DOM 反推计时。
3. 已有宠物承担角色模型、拖动、动作和气泡；点击后打开喝水/倒计时功能面板。
4. 将定制包中写死的 17:00 倒计时替换为真实作息状态，处理夜班、休息日和无薪休息。
5. 同一提醒只展示一次；免打扰、本班暂停、隐藏角色与现有标签页租约保持一致。
6. 优先复用现有安装和素材，核对实际版本的扩展接口，不把不同作者同名 dsh-pet 的接口直接混用。

当前提醒数据保存在浏览器 IndexedDB。网页内集成应优先保留这条数据边界；如果实际宠物接口仅支持 Host 调用，则单独设计状态桥接，不擅自迁移个人记录。页面关闭后不承诺继续提醒。

## 已查阅的外部资料

- https://github.com/PC2005-cloud/dsh-pet ：当前本地定制包的上游。包内 README 标明代码 MIT；素材禁止商用，公开二创需署名。
- https://github.com/zhu1090093659/dsh-pet ：另一实现，README 声明 sprite2d/frames2d/live2d 与 Host 扩展接口，可参考设计，不能假设本地 0.4.1 实现支持同一接口。
- https://github.com/DamonKoy/dsh-web-ui/tree/main/packages/dsh-pet ：网页悬浮与 pet.json/精灵图模型契约参考。

先前调查过的 Electron dsh-pet-desktop 已排除在本项目当前范围之外。此次未安装新依赖、未修改已有宠物源码、未更改在线交互。
