# 参与开发

本项目是 DeepSeek Harness 的 Web 悬浮窗插件。提交问题或改动前，请先阅读 README 中的运行环境、计薪规则和数据与隐私说明。

## 本地开发

使用 Node.js 22 和 npm：

```sh
npm ci --ignore-scripts
npm run format
npm run check
```

- `npm run format` 格式化源码、测试和文档，然后重新生成客户端和资源清单。
- `npm run build` 生成 `client.js` 与 `media-manifest.js`；两者应随对应源码改动一起提交。
- `npm test` 检查生成物一致性，并运行 Node.js 内置测试。
- `npm run check:package` 检查安装声明、导出文件、语法和实际 npm 打包清单。
- `npm run check` 执行格式检查、测试和包检查，与 CI 使用相同入口。

## 代码约定

使用 ES modules、UTF-8、LF 换行和两个空格缩进。Prettier 的配置与版本在仓库中固定，格式问题通过 `npm run format` 处理。

按现有模块职责修改代码：

- `clock.js`：纯班次和金额计算，不读取文件、浏览器状态或网络。
- `ui-utils.js`：纯显示和状态辅助函数。
- `client.source.js`：React 界面、Harness 客户端接口和浏览器偏好。
- `index.js`：Host 配置验证、原子持久化，以及命令和工具适配器。
- `tools/build.mjs`：内联已测试的界面/业务模块和静态图，生成人物视频的内容指纹地址及Host资源清单，不维护第二套计薪实现。
- `media-server.js`：只读提供清单内的视频，支持完整性检查、Range与缓存；不读取用户配置。

不要直接修改生成的 `client.js` 或 `media-manifest.js`。计薪、时区、配置验证或持久化行为发生变化时，应补充能复现问题的测试。纯格式或文字调整不需要新增测试。

## 配置与隐私

`data.json` 是用户配置，禁止提交或打包。格式化工具也会跳过该文件。不要提交 `.env`、`.npmrc`、令牌、临时配置或含有真实薪资的截图与日志。

界面隐藏工资不影响 Host 文件和会话中已有的配置记录。文档、界面提示和工具说明应明确这个范围，不要声称工资只存在于浏览器中。

工具和界面需共用校验与保存入口。保持部分字段合并保存、写入队列和原子替换；配置损坏时应报告错误，不静默覆盖。

## 人工验证

自动化测试覆盖计算与持久化等逻辑；以下体验应在独立的 Harness 测试配置中检查，使用示例薪资：

1. 从 npm 或本地目录安装，刷新后出现首次配置引导。
2. 保存月薪 / 日薪和作息后，倒计时及收入正常显示；刷新后配置保留。
3. 展开、收起、拖动、方向键微调、Home 复位和缩小浏览器窗口正常。
4. 工资默认隐藏，薪资输入及折算预览一起遮蔽；透明度、位置和显示偏好可恢复。
5. 夜班、工作日和无薪休息与 README 描述一致。
6. 通过界面、命令和代理工具修改后，可读取到同一份配置；多标签页可以手动读取最新配置。

记录实际验证过的 Harness 版本、浏览器和场景。尚未运行的浏览器检查应明确标为未验证。

## 提交与发布

提交说明描述具体改动，常见前缀为 `fix:`、`feat:`、`docs:`、`style:` 和 `chore:`。推送前执行 `npm run check`，不要混入用户配置或本地压缩包。

主分支推送和 PR 会触发 CI 检查。正式发布时按 README 更新版本并推送 `v*` 标签，由 GitHub Actions 发布；不要重新使用已经发布过的 npm 版本。

## 插件目录收录

以 [awesome-dsh-plugin 的实时贡献指南](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/blob/main/contributing.md) 为准。收录材料仅需向对方仓库添加 `data/plugins/SnowBeatRain__dsh-offwork.yml`，不修改其生成的 README。

本仓库须保持公开且活跃，声明 `dsh.bundle`、提供有效补丁，并带有 `dsh-plugin` topic。描述应与实际功能一致；仓库需创建满一天。npm 通过 `repository` 字段关联，不在收录 YAML 中手写 `npm:`。

市场图标是可选的，需使用 GitHub 托管的 PNG、JPG 或 WebP，不能直接使用 SVG。截图也是可选的，可将 1–8 张真实使用图片放入本仓库，并在根目录 `screenshots.json` 中声明相对路径。

本项目的格式与打包检查用于维护代码质量，不能替代插件目录的 CI 和人工审核。
