# 当前聊天笔记

这个示例只使用 SQLite Helper。在一个专用单人聊天中创建 `app_notes` 表，用参数绑定写入一条笔记，再查询结果；不需要 DVS 或变量模型。

## 运行

1. 按[安装后的首次使用](../../references/helper-usage.md#安装后的首次使用)启用酒馆助手和 SQLite Helper，完成「自动设置」并刷新，确认 SQLite 服务可用。
2. 打开一个专用单人聊天。在酒馆助手中临时新建脚本，将 [notes.js](notes.js) 完整粘贴进去，启用并运行。示例会向这个聊天的数据库写入数据；不要用业务聊天试运行。
3. 在浏览器控制台查看执行结果，或通过插件的数据库查看器选择“聊天”及 `app_notes`。
4. 检查写入内容后停用临时脚本 `notes.js`，特别是在关闭服务或刷新之前。脚本每次加载都会把 `welcome` 写回，之后验证文件保存时只运行下文的查询。

在全新的测试聊天中运行原样脚本，查询列为 `id`、`content`，唯一记录是 `['welcome', '第一条笔记']`。重复运行时，`ON CONFLICT` 只更新 `welcome` 这一行。修改脚本中的笔记文字再运行，就能看到内容更新，其他编号的笔记保留原值。

脚本等待 `waitGlobalInitialized('SqliteHelper')` 后取得 `SqliteHelper.chat`，立即固定本次聊天。`debounce(false)` 只关闭这个代理的发送等待，方便观察；切换聊天不会把已取得的代理改为新聊天。建表和写入放在一个 `transaction` 中，共同提交或回滚。

## 查询与错误

在同一个单人聊天中，以下脚本只读笔记。查询成功但没有匹配行时，结果保留列名，`rows` 为 `[]`。

```js
await waitGlobalInitialized('SqliteHelper');
const db = SqliteHelper.chat;
if (!db) throw new Error('请先打开单人聊天。');
console.log(await db.query('SELECT id, content FROM app_notes ORDER BY id'));
```

要观察约束错误，在已有 `welcome` 笔记后执行一次普通 INSERT：

```js
try {
  await SqliteHelper.chat.debounce(false).update(
    'INSERT INTO app_notes(id, content) VALUES (?, ?)', ['welcome', '不应覆盖原笔记'],
  );
} catch (error) {
  console.error(error); // 主键冲突；核对 failureKind、executionState 和 message。
}
```

本次插入应被 SQLite 主键约束拒绝，原笔记内容不变。`notes.js` 遇到异常时在控制台打印原错误，再将它抛给调用方。错误字段见[错误说明](../../references/helper-errors.md)。

### 核对上一次写入是否保存

1. 如果刚在全新的专用测试聊天中运行了上面的示例，本次要核对的值就是 `第一条笔记`。如果在有这条笔记的聊天中复测，先查询 `welcome` 的原内容。把 `notes.js` 中的 `第一条笔记` 改成与原内容不同的文字，记下新值并运行一次脚本。
2. 停用 `notes.js`，等待插件后台保存。设置栏若提示有未保存修改，等提示消失。出现保存失败时，先按提示处理。
3. 正常关闭 SQLite 服务，看到“服务已关闭”后再开启，按提示刷新并重开原来的测试聊天。
4. 只运行上面的 `SELECT` 查询。找到 `id` 为 `welcome` 的行，逐字核对 `content` 与本次写入的文字。两者一致才说明这次写入已从保存的数据重新载入。制卡模式也可在服务关闭后，用外部 SQLite 工具只读核对这两个值。

写入返回 `{ committed: true, persisted: false }` 只确认内存事务已提交。在同一服务实例中立即查到笔记，也只确认内存中的值。

遇到 `SQL_COMMITTED`、`SQL_SAVED` 或 `SQL_UNKNOWN` 时停止依赖该结果的流程，按[错误说明](../../references/helper-errors.md)核对原调用，不直接重发。没有当前聊天、服务未启用、权限或文件失败也会报错，不能一律当作“没有笔记”。

## 改为自己的脚本

修改表名、笔记编号、正文及查询条件即可。先决定数据应该属于全局、角色还是某个聊天，再选择代理；不要让旧代理自动跟随界面。完整接口见[业务侧使用指南](../../references/helper-author-guide.md)。本例不实现业务备份恢复、聊天复制独立身份或跨设备同步。
