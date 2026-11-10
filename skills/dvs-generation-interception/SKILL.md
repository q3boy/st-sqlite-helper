---
name: dvs-generation-interception
description: 为 DVS 卡片制作或修改正文生成前的交互界面，如 NPC 人设确认、购物或选项选择。接入触发条件、组件模型请求、结果保存与复用，以及正文资料和执行要求。
---

# 制作 DVS 生成拦截界面

先读[制作生成拦截界面](references/generation-interception-guide.md#制作生成拦截界面)，检查已有注册脚本、世界书规则和界面。沿用卡片的技术栈与风格；可从[原生 DOM 示例](../dvs-docs/assets/dvs-pre-narrative-ui/README.md)接入，不要求使用 Vue。

## 实施

1. 明确何时需要玩家确认、最终保存哪些结果、正文如何承接。在已有注册中加入 `preNarrativeUi`，设置唯一 `key`、自然语言 `condition` 和组件，启用 `exts.pre_narr_ui`。多个条件命中时按注册顺序只打开一项；完整签名查[生成拦截接口](../dvs-docs/references/dvs-api.md#生成拦截)。
2. 分别实现交互 `mount`、只读摘要 `mountResult` 和正文转换 `toPrompt`。用 `context.result` 恢复已保存结果，只在玩家确认时调用 `complete`；取消调用 `cancel`。两个挂载方法各自返回卸载函数，清理本次界面和监听。
3. 需要模型时，由作者函数组装完整请求，返回后对消息调用一次 `context.prompt.expand()`，再调用 `context.requestModel()`，交互结束时请求随之取消。独立按钮或脚本调用模型用 [`DVS.llm()`](../dvs-docs/references/dvs-api.md#独立调用模型)。按任务附带最近正文、用户输入、当前候选或调整历史；读取规则用 `context.worldbook.getEntries()`，先处理不属于本次请求的筛选声明。请求方式见[场景说明](references/generation-interception-guide.md#组织组件请求)。
4. 用 `toPrompt` 提供正文资料，用可选 `insist` 设置执行要求。确认后不再需要的正文规则填入 `narrativeEntriesSkip`，名称去掉 DVS 标签；不改世界书原文或永久启用状态。需要后续变量更新读取的事实或标签，应明确要求正文输出，不能只留在交互结果中。
5. 用 `buttonText` 命名胶囊重开按钮。摘要沿用胶囊样式，完整操作界面放在弹窗；打开或取消不覆盖已保存结果，确认后的保存和正文生成由 DVS 接续。

## 检查与交付

检查首次触发、请求失败、确认、取消、旧结果重开和正文重生成，核对保存结果、正文资料、执行要求及条目屏蔽。提示词要求不等于模型必定遵守；涉及原样输出时核对实际返回。

交付组件、注册接线和必要的构建说明，区分程序、模拟浏览器与真实酒馆结果。此 skill 不自动部署、导入或操作现有聊天数据。

需要完整接口或本场景以外的规则时，使用 `dvs-docs`，按问题查对应章节，不必通读全部手册。安装时保留配套资料包，见各包 `source.json` 的 `requires`。

来源见 `source.json`，署名与许可见 [NOTICE](NOTICE.md) 和 [LICENSE](LICENSE)。
