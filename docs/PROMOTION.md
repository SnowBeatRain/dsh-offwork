# 推广文案草稿

以下内容可用于社区介绍或市场投稿，配图已准备。市场收录状态以实际结果为准。

## 社区介绍

### 标题

给 DeepSeek Harness 加一个下班倒计时，顺便看看这班赚了多少

### 正文

做了一个 DeepSeek Harness 小插件：**下班计时器 · dsh-offwork**。

打开 Harness 后，页面里会出现一条可拖动的小条，显示距离下班还有多久；展开后可以看本班已赚金额、计薪进度、日薪和有效时薪。工资默认隐藏，需要时再点开。

目前支持：

- 月薪或日薪，自定义上下班时间和工作日。
- 跨午夜班次，以及一段可选的无薪休息。
- 展开 / 收起、拖动、背景透明度调整和位置记忆。
- 中英文界面，以及命令和代理工具读写配置。

安装方式：在 Harness 中调用 `plugin_manager` 的 `install_bundle`，将 `target` 填为 `dsh-offwork`。命令行管理 Web 配置时，也可以执行：

```sh
dsh plugin --profile web add dsh-offwork
```

`web` 请替换成实际使用的配置名，安装后刷新页面。

金额是按作息和税前薪资估算的个人参考值。薪资配置保存在运行 Harness 的机器上，配置命令和代理工具的读写结果会进入会话记录；工资隐藏控制的是界面展示。

- 源码：https://github.com/SnowBeatRain/dsh-offwork
- npm：https://www.npmjs.com/package/dsh-offwork
- 使用说明：https://github.com/SnowBeatRain/dsh-offwork#readme
- 问题反馈：https://github.com/SnowBeatRain/dsh-offwork/issues

欢迎试用，反馈时附上 Harness 版本、浏览器和复现步骤就很有帮助。后续计划加入喝水、远眺与起身提醒，当前已发布版本的功能以 README 为准。

发布时配图顺序：

1. [小条全景](https://raw.githubusercontent.com/SnowBeatRain/dsh-offwork/main/assets/screenshot-compact.png)。
2. [展开详情](https://raw.githubusercontent.com/SnowBeatRain/dsh-offwork/main/assets/screenshot-detail.png)。
3. [设置页](https://raw.githubusercontent.com/SnowBeatRain/dsh-offwork/main/assets/screenshot-settings.png)。

配图使用独立测试环境中的示例数据，未包含个人薪资或会话内容。

## 市场中文简介

DeepSeek Harness 下班倒计时与实时工资悬浮窗，支持月薪或日薪、跨午夜班次、可选无薪休息、工资隐藏和背景透明度调整。

## 市场英文简介

A draggable clock-out countdown and live salary overlay for DeepSeek Harness, with monthly or daily pay, overnight shifts, an optional unpaid break, salary masking, and adjustable background opacity.
