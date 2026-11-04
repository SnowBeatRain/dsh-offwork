# 1.0.1 稳定发布与推广记录

本轮交付包括现有规范整理、两项界面修复、真实浏览器验证和市场展示素材。功能与验证范围见 [更新记录](../CHANGELOG.md) 和 [浏览器验证记录](VALIDATION-1.0.1.md)。

## 当前状态

| 项目                    | 状态           | 说明                                                                                                                                   |
| ----------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 源码规范与发布检查      | 已完成         | 格式、语法、构建生成物和 npm 打包清单检查接入 CI                                                                                       |
| 自动化测试              | 已通过         | 最终版本的 57 项测试及发布 CI 全部通过                                                                                                 |
| 独立安装验证            | 已通过         | 在临时 Harness `0.2.1-rc.5` 的 Web 配置中安装 `1.0.1` 压缩包                                                                           |
| 浏览器验证              | 已通过         | Linux Headless Chromium，设置、计薪、拖动、刷新恢复及双标签页等场景                                                                    |
| 市场图标                | 已准备         | `assets/icon-256.png`，由项目 SVG 图标生成                                                                                             |
| 展示截图                | 已完成         | 小条、详情、设置各一张，使用隔离环境中的示例数据与受控时间                                                                             |
| 市场条目和介绍          | 已准备         | 收录 YAML 包含 PNG 图标，推广文字见 `PROMOTION.md`                                                                                     |
| npm `1.0.1` 发布        | 已发布         | `latest` 已指向 `1.0.1`，压缩包完整性和运行文件与发布源码一致性已验证                                                                  |
| awesome-dsh-plugin 收录 | 已提交，待审核 | [PR #12050](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/12050)，仓库创建满一天为北京时间 2026 年 11 月 5 日 19:39:22 |

## 截图

根目录 `screenshots.json` 声明以下真实图片，README 使用相同素材：

- `assets/screenshot-compact.png`：小条在 Harness 页面中的位置。
- `assets/screenshot-detail.png`：展开后的计薪进度、收入和班次详情。
- `assets/screenshot-settings.png`：薪资、作息、时区和背景透明度设置。

示例使用月薪 12,000 元、月计薪 20 天。截图不含用户原有会话、工资配置或凭据。详情和设置图仅裁剪画面，未增加不存在的界面元素。

## 本轮验证边界

用户反馈常用环境使用正常，未提供具体系统和浏览器版本。本轮另行在隔离环境中完成有明确版本和操作记录的浏览器验证。Safari、Firefox、触摸手势、长时间后台等未覆盖场景不标记为已验证。

## 发布结果与推广后续

- [npm 1.0.1](https://www.npmjs.com/package/dsh-offwork/v/1.0.1) 已公开可下载。
- [GitHub Release](https://github.com/SnowBeatRain/dsh-offwork/releases/tag/v1.0.1) 已发布，附带直接从 npm 下载并验证过的压缩包。
- [发布 CI](https://github.com/SnowBeatRain/dsh-offwork/actions/runs/41850054244) 已通过。
- 已使用目录自身的 `validateEntries` 校验收录条目，并确认没有重复 URL、图标和三张截图可从 GitHub 公开读取。

[收录 PR #12050](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/12050) 只新增一条 YAML。仓库年龄不足时，目录脚本会定时重跑该检查；申请中已明确写明满足条件的时间，没有将该项标为已通过。最终收录仍由维护者审核决定。

后续跟进目录 CI 和人工审核。维护者合并及目录更新后，再核实市场搜索结果和安装方式；收录未完成时不使用“已上架”等表述。社区推广采用 `PROMOTION.md` 的介绍与真实截图，具体发布渠道另行选择。
