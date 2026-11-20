# DVS 生成拦截接口

玩家邀请新访客进入书店时，作者可以先显示资料编辑界面，让玩家确认访客后再生成正文。把[最小原生 DOM 组件](../assets/dvs-pre-narrative-ui/README.md)加入已有注册脚本的 `preNarrativeUi` 数组，并设置 `dvs.exts.pre_narr_ui: true`。组件与作者脚本一起构建，不引用插件内部 Vue；样式由组件提供。剧情规划可以同时启用，也可以关闭。

```ts
await DVS.register({
  scriptId: getScriptId(),
  uniqueKeys,
  narrativePrepare,
  beforeGen,
  preNarrativeUi: [{
    key: 'visitor',
    buttonText: '重新编辑访客',
    insist: '正文采用已确认的访客资料，不另行随机生成访客。',
    condition: '本轮邀请新访客进入书店，需要玩家确认其资料。',
    narrativeEntriesSkip: ['自动访客生成'],
    component: visitorComponent,
  }],
}, { signal: lifetime.signal });
```

`key` 在同一注册中唯一，数组顺序就是优先级。输入增强在同一次请求中完成条件判断及已启用的规划等任务；多个条件命中时，只打开注册数组最靠前的一项。没有命中则继续正文。条件只由代码 `condition` 定义；它是输入增强模型需要判断的自然语言条件，不是浏览器执行的布尔函数。

可选的 `buttonText` 为非空字符串，设置胶囊中重开该交互的按钮文字。省略时，待完成显示“继续交互”，已确认显示“重新调整”；设置后两种状态均显示该项文案。点击仍打开交互界面，确认保存后才生成或重新生成正文。

| 组件方法 | 作者负责的工作 |
| --- | --- |
| `mount(container, context)` | 在 DOM 容器内挂载交互界面，返回卸载函数 |
| `mountResult(container, result)` | 独立挂载已保存结果的只读展示，返回卸载函数 |
| `toPrompt(result)` | 将最终结果转为正文补充文本，可返回 Promise；不重新生成候选 |

注册项可通过 `paramsSchema` 声明需要输入增强模型在命中时返回的参数，并用 `validateParams` 检查业务取值。例如房车交互声明正整数人数，模型返回 `{"keys":["npc_generate"],"params":{"npc_generate":{"count":2}}}`。DVS 将选中项的参数随交互记录保存，通过 `context.params` 传给组件。组件重试或继续已有交互时沿用这份参数。

每次交互有自己的实例。完成、取消、原生停止、切聊天或注册失效时，DVS 移除容器并调用卸载函数。作者在卸载函数中移除监听、定时器和框架实例。弹层透明，内容、标题和取消按钮由作者组件提供，DVS 保留焦点、Esc 和关闭管理；宽屏容器放宽，窄屏保留屏幕边距。胶囊展示另建实例，收起、重绘或目标失效时卸载。

`context` 提供本轮 `userInput`、`plotPlan`（未启用时为 `null`）、可选的 `params` 和 `result`、`prompt`、`worldbook`、`requestModel`、`complete(result)`、`cancel()` 和 `signal`。DVS 只在 `key` 和 `params` 都与已确认记录相同时，将旧 `result` 的独立副本传回弹窗。例如同一“生成访客”从 1 人变成 2 人，新弹窗收到 `params.count = 2`，从新的候选开始。作者只在玩家最终确认时以 JSON 值调用 `complete(result)`。DVS 保存并读回消息后才采用结果。交互、组件内的模型请求和 `toPrompt` 都在整组输入增强重试之外。

拦截记录有三种。`{ key: null }` 表示没有选中交互，`{ key }` 表示已命中、正在等待玩家确认，`{ key, result }` 保存最终确认的资料。命中项声明了参数时，待确认和已确认记录都附带 `params`。DVS 先保存已经完成的规划、筛选和拦截选择，再打开界面。取消时停止本次操作，首次命中的待确认交互可以继续。同一项已有确认结果时，取消调整会保留原结果。

| 玩家使用的入口 | 执行什么 | 完成后的正文 |
| --- | --- | --- |
| 用户消息「输入增强」顶部的「重新生成」，或 `DVS.reInject()` | 重做这条消息适用的整组任务。命中拦截时等待玩家确认，保存结果后再等待 `toPrompt` 返回 | 不生成或改写正文。即使 `toPrompt` 报错，已保存的确认结果仍在 |
| 拦截项的「继续交互」／「重新调整」 | 只打开已选组件，沿用保存的参数。有已确认结果时从它开始编辑 | 保存确认结果并成功取得 `toPrompt` 的资料后，已有正文时重新生成，没有正文时生成回复。输入框草稿保留 |
| 酒馆的重新生成正文或新 swipe | 已有成果完整时复用，已确认的交互直接交给 `toPrompt`。仍待确认时先打开组件；成果缺项时按已启用功能重新判断 | 使用本次已确认的结果生成正文 |

前两个入口只操作最新一条未隐藏的用户消息，历史消息仅供查看。

## 正文条目屏蔽

注册项的可选 `narrativeEntriesSkip: readonly string[]` 指定玩家确认后，本轮正文额外排除的条目。填写去掉 DVS 标签并去除首尾空白后的名称，例如 `['自动访客生成']`；本次正文中的所有同名条目都会屏蔽，未匹配时不处理。DVS 标签仍决定原用途范围，原生激活和普通筛选保持原规则，名单只追加排除。普通模型筛选关闭时，生成拦截的名单仍生效。

DVS 确认交互结果已保存后，按最终记录的 key 读取当前注册项的屏蔽名单，只处理本轮正文副本。重新生成正文时，DVS 复用确认结果，重新应用当前名单。取消、未命中或拦截关闭时，不应用本项名单。保存失败时停止正文生成。世界书原文和条目的永久启用状态均保留。

名单只用于本次正文，不撤销输入增强已读取的资料，不改写普通筛选记录，也不控制后续变量请求。消息不另存屏蔽名单。需要额外正文资料时，作者可在 `toPrompt` 中读取世界书后返回。

## 读取世界书条目

组件通过 `context.worldbook.getEntries(names)` 主动读取本轮角色绑定的主世界书和附加世界书。填写去掉 DVS 标签并去除首尾空白后的条目名称，与 `narrativeEntriesSkip` 使用同一匹配规则：

```ts
const entries = await context.worldbook.getEntries(['访客生成规则', '访客资料格式']);
// 每项包含 book、uid、原始 name、原始 content、enabled 和 order。
const materials = entries.map(entry => entry.content).join('\n\n');
```

`names` 为字符串数组，各名称去除首尾空白后不能为空。返回全部精确同名条目，重复传入名称不会重复返回同一条目；没有匹配项时返回空数组，空名称数组不发起读取。结果保持主世界书、附加世界书及各书原有条目顺序，不按传入名称或 order 重新排序。返回条目是独立副本，修改它不写回世界书。

每次调用读取当前文件内容，不缓存为本轮快照；不读取全局、聊天或 Persona 世界书。禁用、未激活、被普通筛选或本轮正文屏蔽的条目仍可读取，DVS 用途标签不限制此主动取材。读取失败直接拒绝 Promise；交互结束或本轮目标失效后不再交付读取结果。

方法不展开酒馆宏、DVS 宏或 EJS，不移除 `DVS_FILTER`，也不执行筛选条件。作者按请求用途处理控制声明和正文专属指令；例如复用可筛选条目时，先移除 `[[DVS_FILTER:...]]` 声明，再在完整请求返回后的统一发送处调用 `context.prompt.expand()`。普通酒馆宏可通过酒馆助手 `substitudeMacros()` 处理。需要原生世界书其他能力时，作者仍可直接调用酒馆助手 API。

## 组件请求与提示词

```ts
// prompts 是作者自己定义的请求函数对象，action 是作者选择的属性名。
const request = await prompts[action](context, input);
const response = await context.requestModel({
  ...request,
  messages: request.messages.map(message => ({
    ...message,
    content: context.prompt.expand(message.content),
  })),
});
// response.content 为完整文本；response.finishReason 为结束原因或 null。
```

作者可用普通对象组织任意多组同步或异步请求函数；initial、regenerate 只是业务示例名称，DVS 不注册或调度这些函数。控件主动调用函数，等其返回完整的 `DvsPreNarrativeModelRequest` 后，在统一发送处对消息内容展开一次宏，再调用 `requestModel`。函数内部不提前展开，函数组装时新增的宏也会得到处理。完整代码见[通用示例](../assets/dvs-pre-narrative-ui/interaction.js)。

请求复用本轮输入增强模型配置与密钥，但输出格式由本次参数决定，省略时为 `text`。`json_object` 请求 JSON；`json_schema` 必须同时传入 `schema`，其他格式不能传 schema。此覆盖不修改玩家设置，也不使用变量更新协议。业务消息由作者组织，DVS 自动在前后附加输入增强的 head/tail；模型名含 gemini（不区分大小写）时使用 Gemini 资源并将 system 消息按顺序合并到首条，其余模型含 DeepSeek 使用通用资源。头尾选择与消息清理复用输入增强逻辑，不额外加入组合任务、JSON 输出指令或随机前缀，也不自动再加入历史、规划或用户输入。请求失败保留界面，由作者显示错误并让玩家决定是否重试；交互结束会取消未完成请求，不交付迟到结果。

交互组件内用 `context.requestModel()`，它绑定正在进行的交互，能按本次请求选择输出格式。普通作者脚本如需独立发送自备的消息并取得完整文本，可使用 0.6.2 后新增的 [DVS.llm](dvs-api.md#独立调用模型)。

| 辅助方法 | 对应宏与范围 |
| --- | --- |
| `prompt.userInput()` | `[[DVS_USER_INPUT]]`，本轮固定用户输入 |
| `prompt.prevNarrative()` | `[[DVS_PREV_NARRATIVE]]`，本轮起点 AI 正文 |
| `prompt.historyNarrative(N)` | `[[DVS_HISTORY_NARRATIVE:N]]`，起点之前最近 N 条 AI 正文，按时间排列，0 返回空文本 |
| `prompt.plotPlan()` | `[[DVS_PLOT_PLAN]]`，本轮规划的 JSON 文本；关闭时为空文本 |
| `prompt.expand(text)` | 展开上表宏及完整表数据宏，返回实际文本 |

用户及正文材料已剥离 DVS 胶囊，经过适用的发送正则。`[[DVS_DATA]]`、`[[DVS_DATA_人物:yaml]]` 等完整数据宏读取本轮 `narrativePrepare` 加工后的完整表，不采用筛选组结果，不再次运行准备回调。组件请求不支持四段筛选宏或 `DVS_FILTER`。

条件和请求由作者代码管理。作者可通过上述 `context.worldbook.getEntries()` 或酒馆助手接口取材；读取原文不代表已进行原生激活、筛选或模板处理，DVS 不隐式用世界书替换请求内容。

`toPrompt` 的文本进入当前用户消息发送副本的资料区，不改写用户原文。注册项可用非空字符串 `insist` 设置“执行要求”中的 `pre_narr_ui` 内容，填写时替换默认要求。未填写时沿用：已确认事项以交互结果为准，规划的对应内容随之调整，其余规划继续采用。首次确认和复用成果均读取当前注册项，不将 `insist` 保存到胶囊，也不改变 `toPrompt` 返回字符串的格式。
