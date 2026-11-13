# 下班计时器 · Offwork Clock

> **1.2.5（已发布）**：轻量的工作日陪伴插件。看下班、记喝水、用计时，顺手写下明天第一件事。 [更新记录](https://github.com/SnowBeatRain/dsh-offwork/blob/main/CHANGELOG.md) · [发布说明](https://github.com/SnowBeatRain/dsh-offwork/blob/main/docs/RELEASE-1.2.5.md)

在 DeepSeek Harness 页面内显示一个可拖动的陪伴角色或紧凑小卡片。点击脚下的时间即可打开对应功能；角色关闭后，纯卡片模式仍可使用全部核心功能。

[GitHub](https://github.com/SnowBeatRain/dsh-offwork) · [npm](https://www.npmjs.com/package/dsh-offwork) · [问题反馈](https://github.com/SnowBeatRain/dsh-offwork/issues) · [路线图](https://github.com/SnowBeatRain/dsh-offwork/blob/main/ROADMAP.md)

## 功能

- **下班计时与收入**：月薪/日薪、跨午夜班次、无薪休息、时区、工资隐藏。
- **喝水提醒**：5–240 分钟自然时间提醒，随时打卡、稍后、暂停和免打扰。
- **抽烟与其他计时**：手动开始、暂停、重开；可添加最多 8 个具名计时。
- **到点提醒**：可选提示音和后台浏览器通知，多标签页只提示一次。
- **下班收尾**：写下今天完成的事和明天第一件事；不影响代理任务或喝水提醒。
- **人物与外观**：内置动态/静态角色，也支持本地图片、主题和卡片缩放。
- **两种形态**：陪伴角色或非宠物紧凑卡片，位置和偏好保存在浏览器。

## 环境

- DeepSeek Harness：`>=0.2.1-rc.5 <0.3.0-0`。已在 **0.2.1-rc.5** 和 **0.2.2-rc.1** 验证。
- 使用 Harness Web 界面；安装或升级后刷新所有标签页。

## 安装

在 Harness 插件管理器中安装：

```text
plugin_manager → install_bundle → target: dsh-offwork
```

或使用命令行：

```sh
dsh plugin --profile web add dsh-offwork
```

<details>
<summary>从 GitHub 或本地源码安装</summary>

GitHub：

```text
plugin_manager → install_bundle → target: github:SnowBeatRain/dsh-offwork
```

本地源码：

```sh
git clone https://github.com/SnowBeatRain/dsh-offwork.git
cd dsh-offwork
npm ci --ignore-scripts
npm run build
```

然后把克隆目录的绝对路径填入 `install_bundle` 的 `target`。
</details>

## 快速使用

1. 安装后刷新页面。
2. 点击人物脚下的下班、喝水或抽烟时间进入对应卡片。
3. 首次使用先设置作息与薪资；喝水提醒可独立开启。
4. 人物卡片右侧 `…` 打开菜单，可进入计时、外观、设置和备份。
5. 到点后使用“稍后/关闭/重新计时”，关闭不会修改原计时。

| 操作          | 方式                                   |
| ------------- | -------------------------------------- |
| 移动角色      | 拖动；方向键微调，Home 复位            |
| 喝水          | 点击脚下喝水时间；提醒到期时可直接打卡 |
| 吸烟计时      | 点击脚下抽烟时间                       |
| 收尾          | 点击下班卡片里的“明天第一件事”         |
| 外观          | `…` → 外观；修改后点“应用”             |
| 设置          | `…` → 设置                             |
| 工资显示/隐藏 | 收入明细中的眼睛按钮                   |

## 数据与隐私

- 作息和薪资保存在 Harness Host：`$DSH_HOME/storages/dsh-offwork/settings.json`，权限 `0600`；旧 `data.json` 首次迁移后保留。
- 喝水、计时、收尾笔记和外观保存在当前浏览器；不上传服务器。
- 界面读写不进入会话记录。插件不注册斜杠命令。
- 代理工具 `offwork_clock` 默认关闭，开启后调用结果可能进入会话记录。
- 浏览器备份不含薪资；薪资需单独导出。详见 [数据与隐私](https://github.com/SnowBeatRain/dsh-offwork/blob/main/docs/DATA.md)。

## 兼容与边界

- 需要保持 Harness 页面打开才能显示页面内提醒、声音和浏览器通知；后台可能被浏览器节流。
- 关闭所有页面后不保证准点通知，重开会恢复到期状态。
- 这是页面内插件，不是独立桌面宠物；不提供 Live2D 或外部模型包导入。
- 当前金额为个人参考估算，不包含税费或复杂假期规则。

## 详细文档

- [计薪规则](https://github.com/SnowBeatRain/dsh-offwork/blob/main/docs/PAY.md)
- [代理工具](https://github.com/SnowBeatRain/dsh-offwork/blob/main/docs/TOOL.md)
- [喝水规则与迁移](https://github.com/SnowBeatRain/dsh-offwork/blob/main/docs/HYDRATION.md)
- [开发与发布](https://github.com/SnowBeatRain/dsh-offwork/blob/main/CONTRIBUTING.md)
- [路线图](https://github.com/SnowBeatRain/dsh-offwork/blob/main/ROADMAP.md)

## 许可

代码采用 [MIT License](https://github.com/SnowBeatRain/dsh-offwork/blob/main/LICENSE)。用户提供的角色图片单独授权，详见 [素材说明](https://github.com/SnowBeatRain/dsh-offwork/blob/main/assets/characters/NOTICE.md)。
