CREATE TABLE 人物 (
  rid BLOB PRIMARY KEY CHECK(typeof(rid)='blob' AND length(rid)=16),
  姓名 TEXT NOT NULL,
  好感度 INTEGER NOT NULL CHECK(typeof(好感度)='integer' AND 好感度 BETWEEN 0 AND 100)
);
CREATE TABLE 场景 (
  rid BLOB PRIMARY KEY CHECK(typeof(rid)='blob' AND length(rid)=16),
  编号 TEXT NOT NULL,
  时间 TEXT NOT NULL,
  地点 TEXT NOT NULL
);
CREATE TABLE 物品 (
  rid BLOB PRIMARY KEY CHECK(typeof(rid)='blob' AND length(rid)=16),
  名称 TEXT NOT NULL,
  数量 INTEGER NOT NULL CHECK(typeof(数量)='integer' AND 数量 > 0)
);
