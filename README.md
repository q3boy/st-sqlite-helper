# 酒馆sqlite助手

为酒馆助手脚本提供全局、角色和单人聊天 SQLite 数据库，并内嵌 DVS 卡片变量系统。Helper 负责数据库读写；DVS 管理随 AI 回复变化的状态；卡片作者决定字段、初值和更新规则。单独使用 Helper 不需要配置 DVS。

每次写入在内存事务提交后返回，文件随后在后台保存。返回成功不等于文件已经保存，关闭、切换或重新加载前请留意保存提示。

正式发布入口为 [q3boy/st-sqlite-helper](https://github.com/q3boy/st-sqlite-helper)。安装前确认仓库根目录包含 `manifest.json` 的完整包，再按[安装说明](doc/sqlite-helper/指南/使用与维护指南.md#安装与更新)操作。只有项目介绍的仓库不是可安装扩展。

必须安装并启用[酒馆助手 JS-Slash-Runner](https://github.com/N0VI028/JS-Slash-Runner)。只有使用 EJS／`dvs_state` 模板查询时才需要 ST-Prompt-Template，普通 Helper 调用和 DVS 宏不需要它。

| 你要做什么 | 阅读入口 |
| --- | --- |
| 玩角色卡，安装、更新、查看或清理数据 | [使用与维护指南](doc/sqlite-helper/指南/使用与维护指南.md) |
| 编写酒馆助手脚本 | [笔记示例](examples/helper-notes/README.md) → [业务侧使用指南](doc/sqlite-helper/指南/业务侧使用指南.md) |
| 为角色卡接入 DVS | [最小角色卡](examples/dvs-minimal-card/README.md) → [DVS 作者手册](doc/dvs/指南/DVS作者使用手册.md) |
| 随角色卡附带可选的插件安装提示 | [安装引导脚本](doc/使用/安装引导脚本.md)（JSON 导入或 JS 打包） |
| 让 AI 协助编写或调整 DVS 卡片 | [卡片开发 skill](doc/使用/卡片开发skill.md) |
| 找到完整使用路径和常见问题 | [使用导航](doc/使用/README.md) |

项目署名和许可见 [NOTICE](NOTICE.md)、[LICENSE](LICENSE)，第三方组件见[第三方声明](THIRD_PARTY_NOTICES.md)，版本变化见[更新说明](CHANGELOG.md)。
