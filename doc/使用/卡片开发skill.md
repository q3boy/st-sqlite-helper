# DVS 卡片开发 skill

`dvs-card-authoring` 协助 AI 编写设定、开场白、世界书、DDL／INIT 和酒馆助手 DVS 脚本，也可修改已有卡片字段、检查文件是否一致。它交付卡片文件和检查说明；不制作状态栏，不操作酒馆、模型密钥、真实聊天或数据库。

## 安装到 Codex

取得完整的 `dvs-card-authoring` 文件夹，保留其中的 `SKILL.md`、`references/`、`assets/`、`source.json`、`NOTICE.md` 和 `LICENSE`。只复制 `SKILL.md` 会缺少接口参考和示例。完整发布包中位于 `skills/dvs-card-authoring/`，本地验证时使用维护者提供的完整生成目录；安装扩展不会自动安装此 skill。

将整个文件夹放到卡片项目的 `.agents/skills/dvs-card-authoring/`；需要在不同项目共用时，放到用户目录的 `.agents/skills/dvs-card-authoring/`。目录位置及自动发现规则见 [OpenAI 官方 skill 文档](https://learn.chatgpt.com/docs/build-skills#where-codex-loads-local-skills)。Codex 会检测技能变化；未显示时重启 Codex。

本包按 Codex 的本地 skill 使用方式验证。其他 AI 工具的安装目录和调用方式以该工具说明为准，不承诺自动兼容。

## 带上文件和实际要求

新卡可以这样开始：

```text
使用 $dvs-card-authoring，为我制作一张成年花店店员的极简日常卡。
只记录她的亲近度、当前时间地点和随身物品。
交付开场白、世界书源文件与 DVS 脚本，提供条目配置说明。
```

已有卡先把可编辑源文件放入项目，再说明改动和旧数据要求：

```text
使用 $dvs-card-authoring，检查 card 目录中的现有卡片。
给物品增加备注字段，默认空文本。保留已有聊天的历史数据，
同步新聊天初值、世界书规则与受影响代码，并给出迁移 SQL。
```

AI 会按当前任务读取配套参考，不要求每次重做整张卡。已有设定、字段和公式应直接说明；只需检查某个问题时，提供问题和相关文件即可。

## 检查交付结果

核对设定、开场白、DDL／INIT、业务键、世界书条目和脚本是否一致。新聊天初始化与已有聊天迁移分别检查；脚本语法或类型检查通过，不等于已经在酒馆运行。导入、配置模型和真实生成由作者另行操作，操作说明见[最小卡示例](../../examples/dvs-minimal-card/README.md)及[作者手册](../dvs/指南/DVS作者使用手册.md)。

本包接口参考和示例的来源见 `source.json`。更新时替换完整文件夹，避免入口、参考和示例混用不同版本；使用修改后的文件前保留自己的卡片来源。
