---
name: dvs-author-extension
description: 为 DVS 角色卡开发随卡扩展，或把现成的扩展模块、配套 SQL 和模板接入已有卡片。
---

# 开发和接入 DVS 随卡扩展

- **已有扩展，要装进卡里**：从扩展的导出对象、世界书条目和卡的注册脚本入手。把模块加入原有注册，按扩展说明配置并验证玩家实际看到的结果。见[接入现成扩展](references/author-extension-guide.md#接入现成扩展)。
- **给卡开发新扩展**：先确定数据何时产生、何时要读。以 `journal` 为例，正文后的日志写入当前回复的表版本，本轮宏和历史 EJS 分别从相应阶段取值。见[开发日志扩展](references/author-extension-guide.md#开发日志扩展)和[核对历史分支](references/author-extension-guide.md#核对历史分支)。

完整模块、DDL 与注册示例见[随卡注册作者扩展](../dvs-docs/references/author-extension-api.md)。交付扩展时一并交代入口、配套条目和用法，接入已有卡时沿用它的打包方式。

## 内部表

扩展需要保存内部数据时，先读[内部表](../dvs-docs/references/dvs-api.md#内部表)独立章节，按对照表配置声明、DDL／INIT 和访问方式。采用无版本表时，再按[表声明与保存范围](../dvs-docs/references/dvs-api.md#注册与查询)确认业务是否需要历史恢复。

扩展回调中的 `ctx.payload.tables.internal(key)` 提供本阶段的内部表资料；其使用位置见[日志扩展完整示例](../dvs-docs/references/author-extension-api.md)。

来源见 `source.json`，署名与许可见 [NOTICE](NOTICE.md) 和 [LICENSE](LICENSE)。
