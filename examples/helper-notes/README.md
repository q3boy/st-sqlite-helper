# 当前聊天笔记

这个示例只使用 SQLite Helper。在一个专用单人聊天中创建 `app_notes` 表，用参数绑定写入一条笔记，再查询结果；不需要 DVS 或变量模型。

## 运行

1. 按[安装与日常使用](../../doc/sqlite-helper/指南/使用与维护指南.md)安装并启用插件和酒馆助手，确认当前页面的 SQLite 服务已启用。
2. 打开一个专用单人聊天。在酒馆助手中临时新建脚本，将 [notes.js](notes.js) 完整粘贴进去，启用并运行。示例会向这个聊天的数据库写入数据；不要用业务聊天试运行。
3. 在浏览器控制台查看执行结果，或通过插件的数据库查看器选择“聊天”及 `app_notes`。
4. 核对后停用或删除这个临时脚本，避免它在后续聊天加载时再次运行。

预期查询列为 `id`、`content`，唯一记录是 `['welcome', '第一条笔记']`。重复运行仍然只有这一行：`ON CONFLICT` 按固定笔记编号覆盖内容，不追加重复笔记，也不覆盖其他编号的数据。修改脚本中的笔记内容后再运行，更新的仍是 `welcome` 这一行。

脚本等待 `waitGlobalInitialized('SqliteHelper')` 后取得 `SqliteHelper.chat`，立即固定本次聊天。`debounce(false)` 只关闭这个代理的发送等待，方便观察；切换聊天不会把已取得的代理改为新聊天。建表和写入放在一个 `transaction` 中，共同提交或回滚。

## 查询与错误

为了在酒馆助手脚本中单独查询，可以运行：

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

本次应被 SQLite 主键约束拒绝，原笔记内容不变。这个错误演示使用已打开的专用聊天，不作为自动重试方案。

正常返回 `{ committed: true, persisted: false }` 只证明内存事务提交。随后同一服务中的查询成功也不证明文件已保存；后台保存失败由插件另行提示。需要确认保存时，等待后台处理、正常关闭服务并重新打开，再查询同一聊天的数据。开发模式还可在服务关闭后用外部 SQLite 工具只读核对实际文件。不要为了“再确认”而重新写一次。

遇到 `SQL_COMMITTED`、`SQL_SAVED` 或 `SQL_UNKNOWN` 时停止依赖该结果的流程，按[错误说明](../../doc/sqlite-helper/指南/错误说明.md)核对原调用，不直接重发。没有当前聊天、服务未启用、权限或文件失败也会报错，不能一律当作“没有笔记”。

## 改为自己的脚本

修改表名、笔记编号、正文及查询条件即可。先决定数据应该属于全局、角色还是某个聊天，再选择代理；不要让旧代理自动跟随界面。完整接口见[业务侧使用指南](../../doc/sqlite-helper/指南/业务侧使用指南.md)。本例不实现业务备份恢复、聊天复制独立身份或跨设备同步。
