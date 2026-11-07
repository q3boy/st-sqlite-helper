---
name: st-sqlite-scripting
description: 使用酒馆sqlite助手的 SqliteHelper 编写或修改数据库业务脚本，选择全局、角色或聊天数据库，处理 SQL、事务、保存结果和调用错误。用于直接使用 Helper 的业务；DVS 楼层状态按 DVS 接口处理。
---

# 编写 SQLite 业务脚本

先读[业务侧使用指南](references/helper-author-guide.md)。需要完整起步代码时，参考[笔记示例](assets/helper-notes/README.md)；保留用户现有业务，不把示例表照搬成需求。

## 实施

1. 确定数据属于全局、角色还是单人聊天，选择对应代理。代理固定在取得时的目标；切换目标后重新取得，异步结果只更新对应目标的界面。
2. 按业务设计表和键。用绑定参数传入用户数据；必须共同成功的修改放进一次 `transaction`。方法签名和绑定值规则查[公共接口](references/helper-api.md)与[SQL 和保存](references/helper-sql.md)。
3. 先等待有依赖的写入完成，再查询或执行后续动作。Promise 成功表示当前内存事务已提交，不等于文件保存已确认；按业务指南分别说明查询结果与保存检查。
4. 错误处理保留输入并停止依赖结果的动作。执行结果不明或已提交时先核对数据，不直接重复写入；错误字段与处理办法查[错误说明](references/helper-errors.md)，连接问题再查[调用等待与恢复](references/helper-recovery.md)。

如果操作对象实际是 DVS 管理的楼层状态，使用 DVS 接口处理；不要通过 Helper 直接改写其日常状态或关联。

## 交付

交付可编辑脚本、必要的 SQL 和使用说明。按改动执行可用的脚本语法与隔离 SQL 检查，说明重复执行的结果、目标数据库和未验证部分。现有酒馆部署、授权目录确认及真实数据操作仍按用户另行授权执行。

完整 DVS 接入和跨系统资料按需查 `dvs-docs`；安装时按 `source.json.requires` 保留对应资料包。

来源见 `source.json`，署名与许可见 [NOTICE](NOTICE.md) 和 [LICENSE](LICENSE)。
