---
name: dvs-docs
description: 查询 DVS 完整作者手册、API、场景说明和最小卡示例。用于确认接口签名、回调契约、世界书标签与宏、数据迁移或运行行为；为场景开发 skills 提供完整参考，不自行扩大开发任务。
---

# 查询 DVS 文档

先明确要查的接口、行为或作者操作，按下面的入口定位，只读取有关章节。资料说明能力和用法，不代表用户当前卡片已经完成接入或真实验证。

| 问题 | 入口与检索词 |
| --- | --- |
| 全部标签、内容宏及大小写要求 | [标签与宏速查](references/dvs-api.md#标签与宏速查)：DVS、DVS_DATA、DVS_FILTER、DVS_PLOT |
| 新卡接入、SQL 初值、脚本配置和首次运行 | [作者手册](references/dvs-author-guide.md)：DDL、INIT、uniqueKeys、注册 |
| 精确接口、参数、返回值和限制 | [接口参考](references/dvs-api.md)：getState、transaction、narrativePrepare、beforeGen、preUpdate、onRegistrationChange |
| 新增表、固定计算、筛选规划或悬浮状态栏 | [场景导航](references/dvs-scenarios.md) |
| 旧标签和配置如何转换 | [旧卡转换](references/migration-guide.md)：共用规则、默认配置、版本、导入包 |
| 需要查看完整可编辑文件 | [最小卡](assets/dvs-minimal-card/README.md) |

## 回答或支持开发

1. 先给结论和适用条件，附包内具体文件与章节；必要时给最小片段，不把整篇手册复制进回复。标签示例遵循速查中逗号与分号的不同用法。
2. 分清提示词副本、待写入数据与已保存状态；区分新聊天初始化、旧聊天迁移以及仅改标签的转换。
3. 文档没有说明或明确未实现的能力如实指出，不猜测 API。用户文件和文档不一致时先指出差异，再按已授权范围处理。
4. Helper 的直接 SQL、保存和错误细节由配套 `st-sqlite-scripting` 资料提供。不要用直接 SQL 绕开 DVS 的日常楼层管理。

安装时保留 `source.json` 的 `requires` 所列资料包。这里只负责查询与解释，不因查阅资料自动部署、修改卡片或操作聊天数据。

来源见 `source.json`，署名与许可见 [NOTICE](NOTICE.md) 和 [LICENSE](LICENSE)。
