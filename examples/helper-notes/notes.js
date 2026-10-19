(async () => {
  try {
    await waitGlobalInitialized('SqliteHelper');
    const db = SqliteHelper.chat?.debounce(false);
    if (!db) throw new Error('请先打开一个单人聊天，再运行笔记示例。');
    const result = await db.transaction([
      { sql: 'CREATE TABLE IF NOT EXISTS app_notes (id TEXT PRIMARY KEY, content TEXT NOT NULL)' },
      {
        sql: 'INSERT INTO app_notes(id, content) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET content=excluded.content',
        binds: ['welcome', '第一条笔记'],
      },
    ]);
    console.info('笔记已在内存提交，文件由插件随后保存。', result);
    const notes = await db.query('SELECT id, content FROM app_notes ORDER BY id');
    console.table(notes.rows.map(row => Object.fromEntries(notes.columns.map((column, i) => [column, row[i]]))));
    return { result, notes };
  } catch (error) {
    // 只报告错误，不自动重发；先核对原调用是否提交，再决定下一步。
    console.error('笔记示例未完成，请根据错误核对服务和原调用结果。', error);
    throw error;
  }
})();
