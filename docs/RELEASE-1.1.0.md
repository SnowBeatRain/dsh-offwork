# 1.1.0 发布记录

本次版本把独立页面陪伴角色、喝水提醒和独立功能卡片正式纳入 `dsh-offwork`。此前开发预览沿用的 1.0.1 标记更新为 1.1.0；原候选 1.0.2 不再单独发布。

## 发布内容

- 默认鲸系少女长裙立绘，可切换礼裙或原创水滴。图片随客户端加载，支持预览、应用、取消、缩放、拖动和轻微整体反馈。
- 右键菜单打开独立的倒计时、喝水、收入、外观、作息与薪资卡片，支持键盘操作、草稿保护和自适应布局。
- 喝水提醒默认关闭，支持5–240工作分钟间隔、秒级倒计时、手动打卡、稍后提醒、本班暂停/恢复及30/60自然分钟免打扰。
- 同源标签页共享喝水记录并去重，存储异常时停止自动提醒并提供恢复入口。
- 计薪、夜班、时区、无薪休息和金额隐藏行为保留。

人物是透明立绘，不包含独立眨眼、摆尾、视频动画或Live2D。插件显示在Harness页面内，不是系统桌面客户端。代码和加载逻辑独立，不依赖其他宠物插件。用户提供的角色素材见 [来源说明](../assets/characters/NOTICE.md)。

## 升级与数据

Host薪资配置文件保持原格式。喝水存储支持schema 1→2事务迁移；外观偏好v5从v4迁移，保留大小、位置、透明度、动作和隐私选择。已有偏好缺少角色字段时使用长裙立绘。

更新后刷新所有Harness标签页以加载新客户端。旧版本标签页的v4外观写入不会覆盖v5。关闭页面后不会继续在后台发送喝水提醒。

## 验证范围

- `npm ci --ignore-scripts`、完整格式/生成物/测试/语法/实际npm打包清单检查。
- 131项自动化测试覆盖计薪、时区、Host持久化、喝水状态机与事务、导航、布局、人物比例及偏好兼容。
- 独立Harness `0.2.1-rc.5`与Chromium：角色加载、预览取消/应用、刷新、拖动、打卡、v4→v5迁移、新旧标签页隔离、新版角色同步。
- 320px窄屏及横屏逐项验证功能卡片边界；此前界面验收还覆盖五组窗口尺寸、大字体、长文案、暗色主题变量、触控模拟和模拟软键盘视口。
- 发布前使用实际1.1.0压缩包在隔离配置中复核版本与核心操作。

真实Safari、Firefox、iOS和Android未独立验收；不将桌面Chromium模拟等同于真实设备测试。

## 发布入口

- [npm 1.1.0](https://www.npmjs.com/package/dsh-offwork/v/1.1.0)
- [GitHub Release v1.1.0](https://github.com/SnowBeatRain/dsh-offwork/releases/tag/v1.1.0)
- [发布工作流](https://github.com/SnowBeatRain/dsh-offwork/actions/workflows/publish.yml)

## 本轮发布结果

- 发布提交：`59efb26`，已推送主分支及 `v1.1.0` 标签。
- [标签发布工作流](https://github.com/SnowBeatRain/dsh-offwork/actions/runs/42000649482) 的测试与 publish 任务均成功。npm 日志确认接收 `dsh-offwork@1.1.0`，同时提示包正在服务端处理中。
- GitHub Release 已公开，附带 `dsh-offwork-1.1.0.tgz`。从公开 Release 下载的文件与本地验证包 SHA-512 完全一致。
- 指定开发环境已更新为 1.1.0，服务正常。
- npm于2026-11-05 09:32 UTC完成公开可用验证：latest=1.1.0，新版本压缩包可以下载；SHA-512及包内所有文件均与已验证的本地安装包一致。此前09:24 UTC仍在服务端处理中，现已完成该项核对。

安装包 SHA-512：

```text
sha512-dE28YocLUUYhkRLu+3kdjPBqbabcAEXIxQwHFcvXcynawQqMCpkMtaUaPOTtuycQrx1FiYcIlRzclSQ6hMr2pg==
```
