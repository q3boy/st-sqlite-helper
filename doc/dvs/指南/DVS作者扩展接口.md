# DVS 作者扩展接口

一张卡沿用一个注册脚本，在原有扩展之后追加 `journal`：`DVS.register({ ...cardRegistration, extensions: [...(cardRegistration.extensions ?? []), journal] })`。下面的 `journal.ts` 在正文前提供历史日志宏，正文后把当前回复保存为一条日志，并在 AI 胶囊里显示记录。它不额外调用模型；需要玩家开启“变量功能”，以便 DvsTables 提供楼层表状态。

将扩展包的配套声明放在项目的 `types/` 目录。模块可以直接使用以下 TypeScript：

```ts
import type { DvsAuthorExtension, StageContext } from './types/dvs';

class Journal {
  static dependencies = { collect: ['tables'], aiResp: ['tables'] };

  async collectPre(ctx: StageContext<'collect'>) {
    const state = ctx.payload.tables?.internal('journal').state;
    if (!state) throw new Error('日志表尚未准备。');
    const rows = await state.table('日志条目').rows();
    const entries = new Map(rows.map(row => [String(row.编号), String(row.正文)]));
    ctx.setMacro('entry', id => entries.get(id) ?? '');
    ctx.setEjs('entryCount', () => entries.size);
  }

  async aiRespPost(ctx: StageContext<'aiResp'>) {
    const state = ctx.payload.tables?.internal('journal').state;
    const ai = ctx.ai;
    if (!state || !('transaction' in state) || !ai) {
      throw new Error('日志需要已提交的本楼表状态和 AI 正文。');
    }
    const entry = { 编号: String(ai.floorid), 正文: ai.content };
    await state.table('日志条目').insert(entry);
    ctx.setCapsule(entry);
  }

  static summarize(type: 'user' | 'ai') {
    return type === 'ai' ? '已保存日志' : undefined;
  }
}

export const journal: DvsAuthorExtension = {
  key: 'journal',
  dvsTableOptions: {
    日志条目: { keys: ['编号'], internal: true },
  },
  migrations: [{
    version: '1.0.0',
    sql: `CREATE TABLE "日志条目" (
      rid BLOB PRIMARY KEY NOT NULL DEFAULT(randomblob(16)),
      "编号" TEXT NOT NULL,
      "正文" TEXT NOT NULL
    )`,
  }],
  controller: Journal,
  ejs: {
    async entry(ctx, id: string) {
      const row = await ctx.state?.internal('journal').table('日志条目').get(id);
      return row?.正文 ?? '';
    },
  },
  display: {
    ai: {
      mount(container, ctx) {
        const pre = container.ownerDocument.createElement('pre');
        pre.textContent = JSON.stringify(ctx.record, null, 2) ?? '本楼没有日志记录。';
        container.append(pre);
        return () => pre.remove();
      },
    },
  },
};
```

示例由扩展自带 `migrations` 建表，DvsTables 根据表声明配套建立索引，无需另写 `[DVS:DDL:journal]` 条目。在角色绑定世界书中增加名称为 `[DVS:初始化:journal]welcome_0` 的初值条目：

```sql
INSERT INTO "日志条目" ("编号", "正文") VALUES ('welcome', '今天抵达青禾书店。');
```

示例将「日志条目」声明为内部表，并使用默认的楼层历史保存方式。普通表、角色卡内部表与扩展内部表的概念、SQL 标签及宏、state、EJS 写法，集中见[内部表](DVS接口与进阶用法.md#内部表)；历史保存方式见[表声明](DVS接口与进阶用法.md#注册与查询)。

DVS 先执行角色卡的 DDL，再按注册顺序执行各扩展的 DDL。角色卡和每个扩展分别记录已完成的版本，各自按版本从低到高升级。SQL 条目即使关闭世界书开关也会读取。扩展与角色卡的表不能重名；建表和初始化的通用规则见[为角色卡准备 SQL](DVS接口与进阶用法.md#为角色卡准备-sql)。

`migrations` 接受 `{ version, sql }` 数组，版本按 SemVer 比较；每个版本的 SQL、自动配套索引和 `_dvs_ext_version` 记录同事务提交。失败版本不记成功，前面已成功版本保留；全部迁移完成后才执行新聊天的 INIT。已有聊天升级或首次引入该扩展时只执行迁移，不补跑开场白 INIT。作者也可不提供 `migrations`，改用世界书 `[DVS:DDL:journal]v1.0.0` 等条目；同一版本的建表 SQL 只提供一次。表声明仍须提供，SQL 本身不声明业务键、内部可见性和楼层保存方式。

主注册脚本导入编译后的模块，把它加入原来那次注册。下面的 `cardRegistration` 代表原卡完整的注册参数，包含 `scriptId`、`dvsTableOptions` 或旧 `uniqueKeys`、`narrativePrepare`、`beforeGen` 等声明；继续保留原卡的角色卡组 DDL 和生命周期：

```js
import { journal } from './journal.js';

const lifetime = new AbortController();
window.addEventListener('pagehide', () => lifetime.abort(), { once: true });
await waitGlobalInitialized('DVS');
const dispose = await DVS.register({
  ...cardRegistration,
  extensions: [...(cardRegistration.extensions ?? []), journal],
}, { signal: lifetime.signal });
```

作者扩展的 SQL 是原卡 SQL 之外新增的表组，不能替代普通组 DDL；即使普通表声明为空，也保留普通组 DDL 条目。正文世界书可用 `[[DVS_EXT:journal:entry:welcome]]` 输出开场日志，或用 `<%= dvs_ext.journal.entryCount() %>` 输出本轮准备的条数。历史回复模板可用 `<%= await dvs_ext.journal.entry('welcome') %>` 查询那条回复所选 swipe 的日志；生成中的定义级 EJS 则查询本轮起点。本楼新增日志在后处理保存，下一轮才出现在正文前准备资料中。

## 扩展入口与数据

| 作者要做什么 | 使用方式 |
| --- | --- |
| 准备本轮资料 | `collectPre(ctx)` 在首次世界书扫描前运行；`collectPost(ctx, availability)` 在扫描后运行。 |
| 正文前提交任务／应用结果 | `userReqPre(ctx, request)`、`userRespPost(ctx, data)`；有任一入口就纳入输入增强与手动重做。完整复用时不运行请求入口，响应入口的 `data` 为 `undefined`，从 `ctx.getCapsule()` 取得已有记录。 |
| 正文后提交任务／处理结果 | `aiReqPre(ctx, request)`、`aiRespPost(ctx, data)`；有任一作者入口时，即使关闭变量功能，也会先独立扫描正文后的世界书并交付 `ctx.rawLorebook`。 |
| 保存楼层记录 | `ctx.setCapsule(value)` 交付本扩展的 JSON 记录，由 DVS 统一保存；`ctx.getCapsule()` 读取本次采用记录。 |
| 使用表 | `ctx.payload.tables` 访问普通工作表及状态，`.internal(key)` 只访问指定归属的内部表。也可从根 `state.internal(key)` 选表。工作表修改只加工资料，持久化写入使用提交后的 `state`。 |
| 与本轮一起请求模型 | 填写 `request.data` 和 `request.task` 的 `instruct`、`example`、`schema`，DVS 合并发送并按 key 分发，扩展负责校验业务结果。作者直接填入的文本不会再展开宏。 |
| 单独请求模型 | 构造器接收 `DvsAuthorHelper`，调用 `this.helper.llm('pre' 或 'post', messages, ctx.helper.signal, configId?)`，返回完整文本。第四个参数可选已有模型配置 ID，省略或为空时跟随 `pre`／`post` 配置。阶段内等待时传入本轮信号；响应重试会再次执行响应入口内的调用。全局独立脚本可用[独立调用模型](DVS接口与进阶用法.md#独立调用模型)。 |

控制器的静态 `dependencies` 按 `collect`、`userReq`、`userResp`、`aiReq`、`aiResp` 声明；字符串表示强依赖，`{ type: 'weak', key: 'tables' }` 表示只在对方启用时排序。卡片依赖某个内置扩展时，可在主注册中用 `requiredBuiltins` 固定启用它；未固定的强依赖被玩家关闭时，DVS 指出双方及阶段，不自动重新开启。控制器还可声明静态 `allowFailure`：省略或 false 表示入口必须成功，true 允许所有入口失败后继续，数组只允许列出的入口，例如 `['collect.post']`。允许失败不会撤销扩展已经完成的外部写入。

## 配置与模板

扩展 `key` 必须匹配 `^[a-z][a-z0-9_]*$`，不能使用 `md`、`yaml` 或任何内置 key，也不能与本卡其他扩展重名。本卡作者扩展随卡固定启用，两个功能面板都不提供其启停开关；`getExtension(key)` 返回 `true`，关闭请求会被拒绝。扩展可声明 `default_config`，参数用 `DVS.getConfig(key)`／`DVS.setConfig(key, values)` 管理，新回合的 `ctx.config` 按顶层字段用保存值覆盖默认值。

卡片可在主注册参数中声明内置扩展的固定状态：

```ts
await DVS.register({
  ...cardRegistration,
  requiredBuiltins: ['tables', 'pre_narr_ui'],
  disabledBuiltins: ['plot_plan'],
});
```

| 注册字段 | 接受的内置 key | 行为 |
| --- | --- | --- |
| `requiredBuiltins` | `tables`、`lb_opt`、`dvs_pre`、`dvs_post_update`、`plot_plan`、`tables_opt`、`pre_narr_ui`、`memory` | 本卡注册生效期间固定启用，覆盖玩家保存的关闭状态；关闭请求被拒绝 |
| `disabledBuiltins` | `plot_plan`、`tables_opt`、`pre_narr_ui`、`memory` | 排除本卡不使用的内置项，不再建立表组、运行控制器或提供模板、摘要和展示；开启请求被拒绝 |

两个字段均为可选数组。未知 key、名单外项目或同一 key 同时出现在两个数组中，会使注册失败。固定状态不改写玩家保存的 `exts`；新版注册移除声明后，恢复按原配置和默认值选择。`getExtension` 返回实际固定状态，生成与展示使用同一状态。`getInject/setInject` 组合开关若要求开启被排除项或关闭必需项，会在写入前拒绝整次修改。

插件设置和开场白配置面板使用相同显示规则：禁用项完全不显示；必需项不显示启停开关，有现成参数控件时只显示参数，没有参数控件时不显示。例如必需的 `tables_opt` 保留筛选方式，必需的 `pre_narr_ui` 不显示。`lb_opt` 的“世界书优化”开关调整 `llm_filter` 参数，不是扩展启停，固定启用后仍可调整。作者扩展不显示启停开关，其自定义参数按扩展说明通过配置 API 或作者提供的界面调整。其他内置项保持原有显示和操作。

升级移除旧表组时，应从新版世界书删去对应 SQL 条目，并为不兼容升级告知玩家手动新开聊天。

阶段调用 `ctx.setMacro('entry', 字符串或同步函数)` 后，后续提示词用 `[[DVS_EXT:journal:entry:参数]]` 取值。参数按冒号拆成字符串；缺失或抛错会指出扩展和宏名，允许无内容时显式返回 `''`。`ctx.setEjs(name, value)` 写入本轮 `dvs_ext.journal[name]`，覆盖定义中同名 `ejs` 成员。回合结束后只保留定义级函数；它们收到普通的 `floorid`、`swipeid` 及根只读 `state`，无目标或表状态时为 `null`。内部表仍须显式调用 `ctx.state.internal(key)`，不会自动加入当前扩展的表。响应失败重试或“清除并继续”会恢复响应处理前的宏和模板成员绑定，作者自行修改的对象及闭包仍由作者管理。

## 胶囊摘要与详情

静态 `summarize(type, data)` 接收本扩展最终保存的记录，返回字符串或 `undefined`。字符串按纯文本显示在胶囊标题旁，只提供摘要也可显示。内置扩展保留各自的结构化摘要。

作者在 `display.user`／`display.ai` 提供 `mount(container, ctx)`，可选的 `display.prepare(ctx)` 在展开时先运行。二者收到普通的 `type`、`floorid`、`swipeid`、只读 `record` 和 `signal`；挂载还收到 `prepared`。折叠时不准备详情。DVS 丢弃失效加载的迟到结果，并在折叠、替换记录或卸载目标时中止挂载信号、调用一次 `mount` 同步返回的卸载函数。作者可以创建 DOM，也可使用自己脚本的 Vue 挂载应用；卸载函数负责释放自己的应用和监听。

重做和清除由外层按当前楼层资格提供，每项一次；只有作者记录、没有详情或详情载入失败时仍可操作。作者详情不接收 `analyses`。历史楼层可查看，只有最新适用消息可重做或清除，忙碌时禁用这些操作；重做输入增强及重新更新的范围分别见[正文筛选与剧情规划](DVS输入增强接口.md)和[主动更新最新回复的变量](DVS接口与进阶用法.md#主动更新最新回复的变量)。
