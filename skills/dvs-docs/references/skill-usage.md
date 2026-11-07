# SQLite Helper 与 DVS 开发 skills

这些 skill 帮助 AI 根据你的卡片文件完成开发，并给出可编辑文件和检查结果。需要整卡开发，或还不确定该改哪部分时，使用 `dvs`；任务明确时，可以直接选下面的专用入口。

| skill | 适合的任务 |
| --- | --- |
| `dvs` | 新卡接入、整卡调整、跨文件检查，以及选择适合的开发场景 |
| `dvs-docs` | 查询完整 DVS 手册、API、场景说明和最小卡示例 |
| `st-sqlite-scripting` | 直接使用 SQLite Helper 写业务脚本、查询与保存数据 |
| `dvs-data-model` | 新增数据表、修改字段或业务键、安排已有聊天的数据迁移 |
| `dvs-data-processing` | 将好感度转为正文阶段描述，用 `preUpdate` 完成固定计算或事件结算 |
| `dvs-input-enhancement` | 筛选世界书和变量行、配置剧情规划 |
| `dvs-generation-interception` | 制作正文前的交互界面，接入条件、模型请求、确认结果与正文交接 |
| `dvs-statusbar` | 制作读取 DVS 数据的悬浮状态栏，处理刷新和界面清理 |
| `dvs-card-migrate` | 用随包工具转换旧版 DVS 标签和脚本默认配置 |

场景 skill 只携带本任务常用且必要的指导，完整 DVS 手册和 API 集中在 `dvs-docs`；Helper 资料由 `st-sqlite-scripting` 提供。`dvs` 负责整卡开发和选择场景，不要求安装所有专用入口。各场景的步骤和例子见[DVS 场景开发指南](dvs-scenarios.md)。

## 安装到 Codex

推荐将开发库或完整发布包 `skills/` 下的九个 skill 文件夹一起复制到卡片项目的 `.agents/skills/`。例如安装总入口后，应有 `.agents/skills/dvs/SKILL.md`。需要跨项目共用时，放到用户目录的 `.agents/skills/`。

按需安装时，选择场景 skill，并同时保留 `dvs-docs` 和 `st-sqlite-scripting` 两个资料来源；只使用 Helper 时保留 `st-sqlite-scripting` 和 `dvs-docs`，后者供查阅文档中的 DVS 交叉引用。各包 `source.json` 的 `requires` 列出直接引用的资料包，安装时也要保留这些资料包自身的依赖。文件夹保持同级，名称不变，跨包相对链接才有效。

保留各包实际提供的 `references/`、`assets/`、`scripts/`（有些场景没有 assets），以及 `source.json`、`NOTICE.md` 和 `LICENSE`。只复制 `SKILL.md` 会缺少参考或工具。开发库中的完整文件夹和发布包使用相同内容及包内、跨包链接，按上述目录关系复制后无需修改链接。

安装扩展不会自动安装这些 skill。Codex 的目录与发现规则见[官方 skill 文档](https://learn.chatgpt.com/docs/build-skills#where-codex-loads-local-skills)；未显示时重启 Codex。其他 AI 工具的安装目录和调用方式以该工具说明为准。

## 资料和示例怎样分配

完整最小卡只放在 `dvs` 和 `dvs-docs` 中；Helper 笔记示例只放在 `st-sqlite-scripting` 中。其余场景使用各自参考文档里的 SQL、回调或接线片段，不再复制整张卡。迁移脚本仍随 `dvs` 和 `dvs-card-migrate` 提供。

只想确认接口时，可以要求：“使用 `$dvs-docs` 查询 `preUpdate` 的参数与返回要求，暂不修改卡片。”

## 带上文件和实际要求

新卡可以这样开始：

```text
使用 $dvs，为我制作一张成年花店店员的极简日常卡。
只记录她的亲近度、当前时间地点和随身物品。
交付开场白、世界书源文件与 DVS 脚本，提供条目配置说明。
```

已有卡先把可编辑源文件放入项目，再说明改动和旧数据要求：

```text
使用 $dvs-data-model，给 card 目录中卡片的物品表增加备注字段，默认空文本。
保留已有聊天的历史数据，同步新聊天初值、世界书规则与受影响代码，
并给出迁移 SQL。
```

数值处理应说明结果用于显示还是保存：

```text
使用 $dvs-data-processing，把好感度转换成正文中的关系阶段，数据库保留原数值。
装备的最终防御按现有公式在 preUpdate 中计算，不让模型计算这个结果。
```

状态栏需求可以直接描述外观和数据：

```text
使用 $dvs-statusbar，为现有卡制作右下角可展开的状态栏，显示时间、地点和物品。
沿用已有注册脚本，数据更新后刷新，切换卡片时清理界面。
```

AI 按任务读取对应资料，不需要每次重做整张卡。已有设定、字段和公式应直接说明；只检查某个问题时，提供现象和相关文件即可。

## 转换旧卡写法

将可编辑的 `index.yaml` 放入项目后，可以这样要求：

```text
使用 $dvs-card-migrate，转换 card/index.yaml 中的旧 DVS 标签和默认配置。
用随包转换脚本完成，筛选规则保留共用；核对受影响的自有打包工具和测试。
保持内容宏、业务表和已有聊天不变，再按现有工程生成导入包。
```

也可在 `dvs` 或 `dvs-card-migrate` 目录执行 `node scripts/dvs-card-migrate.mjs "索引路径"`。交互模式对每个旧筛选规则提供共用、仅世界书、仅变量三项；无交互且需要选择时传 `--filter-rules common|worldbook|variables`，其中竖线表示任选一个值。

工具只转换索引，不处理 PNG／JSON 卡包、版本号、测试、打包工具和在线数据。运行条件、默认配置与玩家配置的区别、差异核对和打包步骤见[旧版 DVS 卡片升级](dvs-author-guide.md#旧版-dvs-卡片升级)。

## 检查交付结果

按本次改动核对设定、开场白、DDL／INIT、业务键、世界书条目和脚本是否一致。新聊天初始化与已有聊天迁移分别检查；脚本语法或模拟检查通过，不等于已经在酒馆运行。导入、配置模型和真实生成由作者另行操作，见[最小卡示例](../assets/dvs-minimal-card/README.md)及[作者手册](dvs-author-guide.md)。

每个包的来源和内容校验值见 `source.json`。更新时替换完整文件夹，避免入口、参考和示例混用不同版本；修改卡片前保留自己的原文件。
