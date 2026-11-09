---
name: dvs
description: DVS 卡片开发总入口。用于新卡接入、已有卡整体调整、跨文件一致性检查，或尚不确定应修改数据表、回调、世界书还是状态栏的需求；按实际任务完成对应部分。
---

# 开发 DVS 角色卡

先读卡片现有文件，确定需要随剧情变化的数据和本次交付。新卡从[接入场景](references/setup-guide.md#新建卡片或接入-dvs)开始，按需参考[最小卡](assets/dvs-minimal-card/README.md)；已有卡沿用其设定和文件组织。用户已指定单一任务时，只处理该任务涉及的部分，无需重做整张卡。

## 按改动读取

| 本次需求 | 指导 |
| --- | --- |
| 增加表或修改字段、业务键 | [新增数据表](../dvs-docs/references/data-model-guide.md#新增数据表)、[修改字段或业务键](../dvs-docs/references/data-model-guide.md#修改字段或业务键) |
| 派生描述、固定计算或事件结算 | [加工正文数据与计算结果](../dvs-docs/references/data-processing-guide.md#加工正文数据与计算结果) |
| 筛选资料或规划剧情 | [筛选资料与剧情规划](../dvs-docs/references/input-enhancement-guide.md#筛选资料与剧情规划) |
| 拦截正文生成，用于正文前确认人设、购物、前置交互对话等场景 | [制作生成拦截界面](../dvs-docs/references/generation-interception-guide.md#制作生成拦截界面) |
| 制作或修改悬浮状态栏 | [制作悬浮状态栏](../dvs-docs/references/statusbar-guide.md#制作悬浮状态栏) |
| 转换旧标签和默认配置 | [旧卡升级](../dvs-docs/references/migration-guide.md)，使用本包 `scripts/dvs-card-migrate.mjs` |
| 压缩角色卡中的长文本、DDL 或 INIT | 使用本包 `scripts/dvs-card-compress.mjs`，步骤见下文 |
| 初值、更新或显示不符合预期 | [按现象检查问题](references/setup-guide.md#按现象检查问题) |

## 压缩世界书条目

在角色卡的 `index.yaml` 旁创建 `compress-list.yaml`。每项填写一个被世界书条目引用的明文文件，路径相对于 `index.yaml`，写全扩展名。例如：

```yaml
- 世界书/DVS-INIT.sql
- 世界书/房车设定.txt
```

先按卡片原有方式打包。假设索引和打好的 `原卡.png` 都在工程根目录，且本 skill 安装在 `.agents/skills/dvs`，从工程根目录运行：

```sh
node ".agents/skills/dvs/scripts/dvs-card-compress.mjs" "index.yaml" "原卡.png" "发布卡.png"
```

用 Node.js 22.2 或更高版本，或用 Bun 直接运行同一个脚本。默认保留 PNG 的 `ccv3`，需要同时保留已有 `chara` 时加 `--save-chara`。默认使用 U20 编码，`--encoding base64` 可切换为 Base64。`--list-file` 可指定相对于当前工作目录的清单路径，清单内的文件路径仍相对于索引目录。若 skill 安装在别处，把命令中的脚本路径换成实际位置。三个参数依次为索引、原始卡和另存的发布卡。输入是 JSON 卡时，输出也用 `.json`。发布生成的副本，源文件保留明文。玩家需要支持对应编码的 SQLite Helper 插件。首次打开聊天时，插件解压并保存绑定世界书。等弹窗中的“刷新”按钮可用后，点击它重新加载酒馆页面，再打开聊天即可使用明文。

## 完成卡片接入

1. 分开静态设定和动态状态，明确字段含义、单位、初值、业务键及变化规则。固定公式由代码计算；只有需要临时事件输入时才使用虚拟表。
2. 同步 DDL、各开场白 INIT、注册声明、世界书规则与宏。真实表以 `rid` 区分历史行，业务键只要求在一份状态中唯一；已有聊天按更高版本迁移，保留历史及关联。
3. 新卡使用 `[DVS:…]` 标签：多个范围用逗号连接，范围与用途用分号分隔，例如 `[DVS:正文,后处理;可筛选]`。默认脚本变量使用 `{ "dvs": { "enabled": true } }`。只保留一个业务注册脚本，提供 `narrativePrepare` 和 `beforeGen`；准备回调使用收到的本轮起点。完整步骤查[作者手册](../dvs-docs/references/dvs-author-guide.md)，准确签名查[接口参考](../dvs-docs/references/dvs-api.md)。
4. 只实现本次需要的筛选、规划、结算或界面。按所选场景同步相关文件，再核对源文件与导入包；旧写法转换不会自动更新打包工具、版本号或生成卡包。

## 交付

交付可编辑文件及实际检查结果。分别说明新聊天初始化、已有聊天迁移和生成包状态；静态或模拟检查不等于真实酒馆运行。此 skill 编写卡片及界面源文件，不自动部署、导入、配置密钥或操作现有聊天与数据库。

需要完整接口或本场景以外的规则时，使用 `dvs-docs`，按问题查对应章节，不必通读全部手册。安装时保留配套资料包，见各包 `source.json` 的 `requires`。

来源见 `source.json`，署名与许可见 [NOTICE](NOTICE.md) 和 [LICENSE](LICENSE)。
