# 宠物模型与系统桌宠接入调查

状态：可行性调查，未安装或接入第三方宠物插件，未改变运行中的功能。

用户最新澄清：最终希望使用 dshpet 一类插件的卡通人物模型，呈现独立宠物/桌面宠物。此前卡片内的原创水滴角色只解决了表现层，并不等同于该最终目标。早期“不做桌面宠物”的范围约束已被这条新方向更新；具体首先交付网页悬浮还是系统桌面常驻、目标操作系统仍待明确。

## 查阅来源

- https://github.com/zhu1090093659/dsh-pet ：当前 README 声明支持 `sprite2d`、`frames2d`、`live2d` 的 pet manifest；宿主层提供 `pet.announce` 和 `pet.registerPanelAction` 扩展接口。
- https://github.com/DamonKoy/dsh-web-ui/tree/main/packages/dsh-pet ：网页悬浮版本，文档定义 `pet.json` + 精灵图及 9 类动画轨道。
- https://github.com/qiqibabyy/dsh-pet-desktop ：Electron 独立透明置顶窗口、点击穿透、拖动、宠物选择。文档明确只渲染 sprite2d，跳过 Live2D/frames2d。API 为宿主端 loopback-only，本地监督器启动 Electron。

本次核对的是公开 README 和市场条目，不代表已经验证其与当前 Harness 的安装兼容性。下载的资料位于 `/tmp/offwork-pet-research`。

## 形态与边界

- 网页悬浮宠物：可以在当前 `dsh.toolscc.cn` 页面内展示与拖动，点击宠物打开喝水/倒计时面板；关闭网页后不运行。
- 系统桌宠：在用户电脑上运行本地透明窗口。服务器上的插件不能仅凭浏览器访问就在用户系统桌面创建常驻窗口。需要本地客户端与服务器或本地 Harness 的连接适配。
- 现有喝水偏好和班次记录保存在浏览器 IndexedDB。系统桌宠与浏览器不天然共享这份数据；关闭网页后继续提醒，需要设计单一提醒执行方、共享状态及明确的数据迁移。
- 可复用 `clock.js`、`hydration.js` 的规则；宠物宿主、模型渲染、状态桥接和交互入口需独立适配。当前 `companion.js` 的动作映射理念可保留，SVG 不是最终模型格式。

## 推荐方向

由 dsh-offwork 维护下班/喝水/休息的业务事实，由宠物插件/渲染器承担模型、拖动和动作。通过适配层连接真实事件与宠物气泡、菜单按钮，避免两个插件各自弹同一条提醒。

先根据目标形态和操作系统确定宿主，再选兼容的具体宠物资源和对应许可。不要把“支持某种 pet.json”解释为所有 Live2D、序列帧与精灵图都能直接互换，也不要在没有兼容性验证时宣称可以直接安装使用。
