---
name: dvs-data-model
description: 为 DVS 卡片新增数据表，或修改字段、业务键和表结构；同步注册、初值、规则及查询，并为已有聊天编写保留历史的版本迁移。只改旧标签或脚本开关不属于表结构迁移。
---

# 修改 DVS 数据结构

先检查现有 DDL、各开场白 INIT、`dvsTableOptions`（含兼容的 `uniqueKeys`）和受影响的世界书、回调及查询。新增表读[新增数据表](references/data-model-guide.md#新增数据表)，其他结构变化读[修改字段或业务键](references/data-model-guide.md#修改字段或业务键)。

## 实施

1. 确认数据是否需要保存。仅供正文或界面显示的派生描述，按[数据加工](../dvs-docs/references/data-processing-guide.md#加工正文数据与计算结果)处理；需要持久化时明确类型、单位、初值和完整业务键。
2. 分开新聊天和已有聊天。保留已发布 DDL，新增更高版本的迁移条目；同步新聊天 INIT。已有聊天不靠重跑 INIT 或删除数据库升级。
3. 用 `dvsTableOptions` 登记 `keys` 并选择历史保存方式 `useVersion`。迁移时明确新行关联到哪些状态：有版本表按需用 `[[last_fid]]` 关联，无版本表的初值关联到整数 `0`、`128`。完整规则见[角色卡升级](../dvs-docs/references/dvs-api.md#角色卡升级)。
4. 同步使用该结构的变量规则、数据宏、回调、查询和界面。改业务键时核对原有行是否仍能唯一定位；真实表的 `rid` 是历史行编号，业务键不增加全表 SQL `UNIQUE`。

## 内部表

需要由脚本管理、退出默认变量更新的表时，按[内部表](../dvs-docs/references/dvs-api.md#内部表)章节选择 `internal`，同时核对声明位置、DDL／INIT 标签，以及宏、state 和 EJS 入口。该章给出普通表、角色卡内部表与扩展内部表的完整对照。

## 检查与交付

用隔离数据分别检查新聊天建表与初值、已有数据迁移及历史关联。核对迁移前后的业务值和键，说明有意改变的内容。交付迁移 SQL、受影响的源文件和检查结果；真实聊天执行另按用户授权，不把 SQL 内存检查称为完成酒馆升级。

需要完整接口或本场景以外的规则时，使用 `dvs-docs`，按问题查对应章节，不必通读全部手册。安装时保留配套资料包，见各包 `source.json` 的 `requires`。

来源见 `source.json`，署名与许可见 [NOTICE](NOTICE.md) 和 [LICENSE](LICENSE)。
