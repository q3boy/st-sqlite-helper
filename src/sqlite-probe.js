(() => {
  // src/platform-crypto.ts
  function randomUuid(source = crypto) {
    const bytes = source.getRandomValues(new Uint8Array(16));
    bytes[6] = bytes[6] & 15 | 64;
    bytes[8] = bytes[8] & 63 | 128;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  // src/core/errors.ts
  var errorCodes = [
    "VIEWER_LIMIT_EXCEEDED",
    "SERVICE_DISABLED",
    "SETTINGS_FAILED",
    "AUTHORIZATION_CANCELLED",
    "AUTHORIZATION_TIMEOUT",
    "AUTHORIZATION_FAILED",
    "SERVICE_RESTARTING",
    "IDENTITY_FAILED",
    "IDENTITY_CONFLICT",
    "STALE_IDENTITY",
    "ENTITY_RENAME_PENDING",
    "ENTITY_RENAME_UNCONFIRMED",
    "ENTITY_DELETE_PENDING",
    "ENTITY_DELETE_UNCONFIRMED",
    "UUID_SAVE_FAILED",
    "UUID_REGISTRATION_FAILED",
    "UUID_SYNC_FAILED",
    "NOT_INITIALIZED",
    "DATABASE_NOT_INITIALIZED",
    "INSTANCE_DISABLED",
    "SQL_FAILED",
    "ROLLBACK_FAILED",
    "SAVE_FAILED",
    "LOAD_FAILED",
    "PERMISSION_REQUIRED",
    "INVALID_REQUEST",
    "INTERNAL_ERROR",
    "UNSUPPORTED_ENVIRONMENT",
    "PROTOCOL_MISMATCH",
    "ALREADY_INITIALIZED",
    "CONNECTION_FAILED",
    "RESULT_UNCONFIRMED",
    "STALE_CONFIGURATION",
    "CONFIG_CHANGING",
    "CONFIG_FAILED"
  ];
  function serviceData(error, depth = 0) {
    try {
      if (depth > 4)
        return;
      if (!error || typeof error !== "object")
        return;
      const source = Object.getOwnPropertyDescriptor(error, "data")?.value;
      if (!source || typeof source !== "object" || Array.isArray(source))
        return;
      const value = (key) => {
        const property = Object.getOwnPropertyDescriptor(source, key);
        if (property && !("value" in property))
          throw new Error("Error data must contain values.");
        return property?.value;
      };
      const code = value("code"), message = value("message");
      if (!errorCodes.includes(code) || typeof message !== "string")
        return;
      const result = { code, message, resultState: "not-applied", retryable: false };
      for (const key of [
        "failureKind",
        "executionState",
        "resultState",
        "resultKind",
        "identityStage",
        "identitySaved",
        "renameStage",
        "deleteStage",
        "databaseScope",
        "initializationStage",
        "databasePersisted",
        "businessResult",
        "retryable",
        "operationId",
        "disabledReason"
      ]) {
        const item = value(key);
        if (item === undefined)
          continue;
        const valid = key === "failureKind" ? ["request-rejected", "sql-rejected", "precondition-rejected", "service"].includes(item) : key === "executionState" ? ["not-started", "rolled-back", "committed", "unknown"].includes(item) : key === "resultState" ? ["not-applied", "unconfirmed"].includes(item) : key === "resultKind" ? ["database", "identity"].includes(item) : key === "identityStage" ? ["save", "register", "sync"].includes(item) : key === "renameStage" || key === "deleteStage" ? ["pending", "applied", "unconfirmed", "conflict"].includes(item) : key === "identitySaved" || key === "databasePersisted" ? item === true : key === "databaseScope" ? ["char", "chat"].includes(item) : key === "initializationStage" ? ["root-prepare", "target-save", "root-finalize"].includes(item) : key === "businessResult" ? ["not-started", "not-saved", "saved", "unknown"].includes(item) : key === "retryable" ? typeof item === "boolean" : key === "disabledReason" ? item === "not-configured" : typeof item === "string";
        if (!valid)
          return;
        Object.assign(result, { [key]: item });
      }
      for (const key of ["sqlError", "rollbackError", "recoveryError", "saveError", "causeError"]) {
        const item = value(key);
        if (item === undefined)
          continue;
        if (!item || typeof item !== "object" || Array.isArray(item))
          return;
        const fields = Object.getOwnPropertyDescriptors(item);
        if (!fields.message || !("value" in fields.message) || typeof fields.message.value !== "string")
          return;
        const projected = { message: fields.message.value };
        for (const field of ["name", "code"]) {
          const property = fields[field];
          if (!property)
            continue;
          if (!("value" in property))
            return;
          if (property.value === undefined)
            continue;
          if (typeof property.value !== "string" || field === "code" && !errorCodes.includes(property.value))
            return;
          Object.assign(projected, { [field]: property.value });
        }
        const nativeCode = fields.sqliteCode;
        if (nativeCode) {
          if (!("value" in nativeCode) || !Number.isInteger(nativeCode.value))
            return;
          projected.sqliteCode = nativeCode.value;
        }
        result[key] = projected;
      }
      return result;
    } catch {
      return;
    }
  }
  function detail(error) {
    const data = serviceData(error);
    try {
      if (error && typeof error === "object") {
        const message = data?.message ?? Reflect.get(error, "message"), name = Reflect.get(error, "name");
        const nativeCode = Object.getOwnPropertyDescriptor(error, "sqliteCode")?.value;
        if (typeof message === "string")
          return {
            message,
            ...typeof name === "string" ? { name } : {},
            ...data ? { code: data.code } : {},
            ...Number.isInteger(nativeCode) ? { sqliteCode: nativeCode } : {}
          };
      }
      return { message: String(error) };
    } catch {
      return { message: "无法读取原异常内容。" };
    }
  }

  class ServiceError extends Error {
    data;
    constructor(data) {
      super(data.message);
      this.data = data;
      this.name = "ServiceError";
      this.data = { resultState: "not-applied", retryable: false, ...data };
    }
  }

  // src/protocol.ts
  var extensionEntryPath = undefined;
  var EXTENSION_NAME = extensionEntryPath?.match(/^\/scripts\/extensions\/third-party\/([^/]+)\/src\/index\.js$/)?.[1] ?? "st-sqlite-helper";
  var EXTENSION_TEMPLATE_PATH = `third-party/${EXTENSION_NAME}/src`;
  var EXTENSION_PATH = `/scripts/extensions/${EXTENSION_TEMPLATE_PATH}/`;
  var WORKER_URL = `${EXTENSION_PATH}sqlite-worker.js`;
  var DEDICATED_WORKER_URL = `${EXTENSION_PATH}sqlite-dedicated-worker.js`;
  var EXECUTION_PROBE_URL = `${EXTENSION_PATH}sqlite-probe.js`;

  // src/storage-database.ts
  var connection;
  function openStorageDatabase() {
    return connection ??= new Promise((resolve, reject) => {
      const request = indexedDB.open("st-sqlite-helper-storage", 2);
      let rejected = false;
      const fail = (error) => {
        rejected = true;
        reject(new ServiceError({
          code: "CONFIG_FAILED",
          message: "无法打开本地存储设置，请查看详情。",
          causeError: detail(error)
        }));
      };
      request.onupgradeneeded = () => {
        for (const name of ["configuration", "files"])
          if (!request.result.objectStoreNames.contains(name))
            request.result.createObjectStore(name);
      };
      request.onerror = () => fail(request.error);
      request.onblocked = () => fail("本地存储升级被旧页面阻塞，请关闭其他旧页面后刷新。");
      request.onsuccess = () => {
        const db = request.result;
        if (rejected) {
          db.close();
          return;
        }
        db.onversionchange = () => {
          db.close();
          connection = undefined;
        };
        resolve(db);
      };
    }).catch((error) => {
      connection = undefined;
      throw error;
    });
  }

  // src/worker/storage.ts
  var PROBE_FILE_PREFIX = "__st_sqlite_helper_probe__/";
  var indexedDbSource = (source) => ("mode" in source) && source.mode === "indexeddb";
  function storageDirectory(source) {
    if ("storageId" in source) {
      if (source.mode === "indexeddb")
        throw new Error("IndexedDB 存储没有目录句柄。");
      return source.directory;
    }
    return source;
  }
  async function filesTransaction(mode, operation) {
    const db = await openStorageDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("files", mode);
      let value;
      tx.oncomplete = () => resolve(value);
      tx.onabort = () => reject(tx.error ?? new Error("IndexedDB 文件事务失败。"));
      operation(tx.objectStore("files"), (result) => {
        value = result;
      });
    });
  }
  async function indexedDbRecord(path) {
    const entry = await filesTransaction("readonly", (store, result) => {
      const request = store.openCursor(path);
      request.onsuccess = () => result(request.result ? { value: request.result.value } : undefined);
    });
    if (entry === undefined)
      return;
    const value = entry.value;
    if (value === null || typeof value !== "object" || !("bytes" in value) || !(value.bytes instanceof Uint8Array) || !("lastModified" in value) || typeof value.lastModified !== "number" || !Number.isFinite(value.lastModified))
      throw new Error("IndexedDB 数据库文件记录格式无效，原文件未被替换。");
    return { bytes: value.bytes, lastModified: value.lastModified };
  }
  async function writeIndexedDbFile(path, bytes, create) {
    const record = { bytes: bytes.slice(), lastModified: Date.now() };
    if (create)
      return filesTransaction("readwrite", (store) => {
        store.put(record, path);
      });
    let missing = false;
    await filesTransaction("readwrite", (store) => {
      const request = store.getKey(path);
      request.onsuccess = () => {
        if (request.result === undefined)
          missing = true;
        else
          store.put(record, path);
      };
    });
    if (missing)
      throw new DOMException("数据库文件不存在。", "NotFoundError");
  }
  function deleteIndexedDbFile(path) {
    return filesTransaction("readwrite", (store) => {
      store.delete(path);
    });
  }
  async function readStorageFile(source, path) {
    if (indexedDbSource(source)) {
      const record = await indexedDbRecord(path);
      if (record === undefined)
        throw new DOMException("数据库文件不存在。", "NotFoundError");
      return { relativePath: path, size: record.bytes.length, lastModified: record.lastModified, bytes: record.bytes };
    }
    let parent = storageDirectory(source);
    const parts = path.split("/");
    for (const part of parts.slice(0, -1))
      parent = await parent.getDirectoryHandle(part, { create: false });
    const file = await (await parent.getFileHandle(parts.at(-1), { create: false })).getFile();
    return {
      relativePath: path,
      size: file.size,
      lastModified: file.lastModified,
      bytes: new Uint8Array(await file.arrayBuffer())
    };
  }

  // src/worker/storage-probe.ts
  var sample = new Uint8Array([83, 81, 76, 105, 116, 101]);
  var verify = (bytes) => {
    if (bytes.length !== sample.length || bytes.some((byte, index) => byte !== sample[index]))
      throw new Error("存储读回内容与写入内容不同。");
  };
  async function probeOpfs() {
    let stage = "open";
    let root;
    let created = false;
    let failure;
    const name = `__st_sqlite_helper_probe__-${randomUuid()}`;
    try {
      if (typeof navigator === "undefined" || typeof navigator.storage?.getDirectory !== "function")
        throw new Error("当前浏览器没有可用的 OPFS。");
      root = await navigator.storage.getDirectory();
      const directory = await root.getDirectoryHandle(name, { create: true });
      created = true;
      stage = "write";
      const file = await directory.getFileHandle("probe.bin", { create: true });
      const writer = await file.createWritable();
      try {
        await writer.write(sample);
        await writer.close();
      } catch (error) {
        try {
          await writer.abort();
        } catch {}
        throw error;
      }
      stage = "read";
      verify(new Uint8Array(await (await file.getFile()).arrayBuffer()));
    } catch (error) {
      failure = { available: false, stage, reason: detail(error).message };
    }
    if (created) {
      try {
        const directory = await root.getDirectoryHandle(name, { create: false });
        try {
          await directory.removeEntry("probe.bin");
        } catch (error) {
          if (!(error instanceof DOMException && error.name === "NotFoundError"))
            throw error;
        }
        await root.removeEntry(name);
      } catch (error) {
        return {
          available: false,
          stage: "cleanup",
          reason: failure ? `${failure.reason}；清理失败：${detail(error).message}` : detail(error).message
        };
      }
    }
    return failure ?? { available: true };
  }
  async function probeIndexedDb() {
    const key = `${PROBE_FILE_PREFIX}${randomUuid()}`;
    let stage = "write";
    let failure;
    try {
      await writeIndexedDbFile(key, sample, true);
      stage = "read";
      verify((await readStorageFile({ storageId: "", mode: "indexeddb" }, key)).bytes);
    } catch (error) {
      failure = { available: false, stage, reason: detail(error).message };
    }
    try {
      await deleteIndexedDbFile(key);
    } catch (error) {
      return {
        available: false,
        stage: "cleanup",
        reason: failure ? `${failure.reason}；清理失败：${detail(error).message}` : detail(error).message
      };
    }
    return failure ?? { available: true };
  }
  async function probeStorage() {
    const [opfs, indexeddb] = await Promise.all([probeOpfs(), probeIndexedDb()]);
    return { opfs, indexeddb };
  }

  // src/worker/execution-probe.ts
  function unavailableExecution(reason, stage) {
    const unavailable = { available: false, reason: "执行环境尚未通过检测。", stage };
    return {
      available: false,
      reason,
      stage,
      storage: { opfs: unavailable, indexeddb: unavailable, directory: unavailable }
    };
  }
  async function runExecutionProbe(load, stage) {
    let currentStage = "resource";
    try {
      stage(currentStage);
      const engine = await load();
      currentStage = "sql";
      stage(currentStage);
      const db = new engine.Database;
      try {
        const result = db.exec("SELECT 1 AS capability");
        if (result[0]?.values[0]?.[0] !== 1)
          throw new Error("内存 SQL 查询结果不符合预期。");
      } finally {
        db.close();
      }
      currentStage = "storage";
      stage(currentStage);
      const storage = await probeStorage();
      return {
        available: true,
        storage: { ...storage, directory: { available: false, reason: "目录接口由页面检查。" } }
      };
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      return unavailableExecution(reason, currentStage);
    }
  }

  // src/worker/sql-loader.ts
  function loadWorkerSqlJs() {
    try {
      const base = self.location.href;
      importScripts(new URL("sql-wasm.js", base).href);
      return globalThis.initSqlJs({
        locateFile: (file) => new URL(file, base).href
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // src/worker/probe-entry.ts
  var active = false;
  var lifetime = setTimeout(() => self.close(), 15000);
  function connect(port) {
    if (active) {
      port.close();
      return;
    }
    active = true;
    port.start();
    port.onmessage = (event) => {
      if (event.data?.type === "probe-close")
        self.close();
    };
    port.postMessage({ type: "probe-stage", stage: "connected" });
    runExecutionProbe(loadWorkerSqlJs, (stage) => port.postMessage({ type: "probe-stage", stage })).then((result) => {
      port.postMessage({ type: "probe-result", result });
      clearTimeout(lifetime);
      setTimeout(() => {
        port.close();
        self.close();
      }, 0);
    });
  }
  if ("onconnect" in self) {
    self.onconnect = (event) => connect(event.ports[0]);
  } else {
    self.onmessage = (event) => {
      if (event.data?.type === "probe-connect" && event.data.port instanceof MessagePort)
        connect(event.data.port);
    };
  }
})();
