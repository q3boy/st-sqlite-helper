(() => {
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
    "CHARACTER_COPY_PENDING",
    "CHARACTER_COPY_UNCONFIRMED",
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
        "copyStage",
        "renameStage",
        "deleteStage",
        "copyCleared",
        "databaseScope",
        "initializationStage",
        "databasePersisted",
        "businessResult",
        "retryable",
        "operationId"
      ]) {
        const item = value(key);
        if (item === undefined)
          continue;
        const valid = key === "failureKind" ? ["request-rejected", "sql-rejected", "precondition-rejected", "service"].includes(item) : key === "executionState" ? ["not-started", "rolled-back", "committed", "unknown"].includes(item) : key === "resultState" ? ["not-applied", "unconfirmed"].includes(item) : key === "resultKind" ? ["database", "identity"].includes(item) : key === "identityStage" ? ["save", "register", "sync", "ownership-check"].includes(item) : key === "renameStage" || key === "deleteStage" ? ["pending", "applied", "unconfirmed", "conflict"].includes(item) : key === "copyStage" ? ["pending", "clearing", "cleared", "independent", "unconfirmed"].includes(item) : key === "identitySaved" || key === "copyCleared" || key === "databasePersisted" ? item === true : key === "databaseScope" ? ["char", "chat"].includes(item) : key === "initializationStage" ? ["root-prepare", "target-save", "root-finalize"].includes(item) : key === "businessResult" ? ["not-started", "not-saved", "saved", "unknown"].includes(item) : key === "retryable" ? typeof item === "boolean" : typeof item === "string";
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
  function errorData(error) {
    return serviceData(error) ?? {
      code: "INTERNAL_ERROR",
      failureKind: "service",
      message: `服务内部发生未预期错误，无法确认本次操作结果：${detail(error).message}`,
      causeError: detail(error),
      resultState: "unconfirmed",
      retryable: false
    };
  }
  function identityFailure(message, resultState = "not-applied", cause) {
    return new ServiceError({
      code: "IDENTITY_FAILED",
      message,
      resultKind: "identity",
      resultState,
      ...cause === undefined ? {} : { causeError: detail(cause) }
    });
  }
  function fileRetryable(error) {
    const data = serviceData(error);
    if (data)
      return data.retryable === true;
    return ![
      "NotAllowedError",
      "SecurityError",
      "QuotaExceededError",
      "NotFoundError",
      "TypeMismatchError",
      "InvalidModificationError"
    ].includes(detail(error).name ?? "");
  }

  // src/protocol.ts
  var PROTOCOL_VERSION = 21;
  var BUILD_ID = "2f3f606d-cb30-4167-8177-3ff67c131901";
  var extensionEntryPath = undefined;
  var EXTENSION_NAME = extensionEntryPath?.match(/^\/scripts\/extensions\/third-party\/([^/]+)\/src\/index\.js$/)?.[1] ?? "st-sqlite-helper";
  var EXTENSION_TEMPLATE_PATH = `third-party/${EXTENSION_NAME}/src`;
  var EXTENSION_PATH = `/scripts/extensions/${EXTENSION_TEMPLATE_PATH}/`;
  var WORKER_URL = `${EXTENSION_PATH}sqlite-worker.js`;
  var isUuid = (value) => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  var bindingKey = (b) => JSON.stringify([b.storageId, b.configGeneration, b.scope ?? "global", b.charDbId ?? null, b.chatDbId ?? null]);
  var identityBindingKey = (b) => JSON.stringify([
    bindingKey(b),
    b.characterEntity ?? null,
    b.chatEntity ?? null,
    b.identityGeneration ?? null,
    b.chatIdentityGeneration ?? null,
    b.characterReferenceId ?? null,
    b.chatReferenceId ?? null
  ]);
  function isWriteAction(action) {
    return ["transaction", "checked-transaction", "update", "exec", "runSql", "batch"].includes(action.type);
  }

  // src/worker/character-identities.ts
  class CharacterIdentities {
    beforeIssue;
    beforeRelease;
    entities = new Map;
    confirmed = new Set;
    constructor(beforeIssue = async () => {}, beforeRelease = () => {}) {
      this.beforeIssue = beforeIssue;
      this.beforeRelease = beforeRelease;
    }
    hasLease(entity) {
      const entry = this.entities.get(entity);
      return !!entry?.token || !!entry?.waiters.length;
    }
    hasWorkFor(matches) {
      return [...this.entities].some(([entity, entry]) => matches(entity) && (!!entry.token || !!entry.waiters.length));
    }
    seed(entity, id) {
      if (!this.entities.has(entity))
        this.entities.set(entity, { id, waiters: [] });
    }
    forget(entity) {
      if (this.hasLease(entity))
        throw identityFailure("旧 UUID 保存仍在途，不能清除该文件的身份候选。", "unconfirmed");
      this.entities.delete(entity);
    }
    assertSettled() {
      if ([...this.entities.values()].some((entry) => entry.token || entry.waiters.length))
        throw identityFailure("仍有角色或聊天 UUID 初始化未完成，不能排空服务；请等待保存及 Worker 登记结束。", "unconfirmed");
    }
    acquire(entity, observed, owner) {
      if (!entity || observed !== null && !isUuid(observed))
        return Promise.reject(identityFailure("Worker 收到无效的角色或聊天目标名称或 UUID，未开始初始化；请重新取得目标并读回服务器 UUID。"));
      observed = observed?.toLowerCase() ?? null;
      let entry = this.entities.get(entity);
      if (entry?.token) {
        if (observed && observed !== entry.id)
          return Promise.reject(identityFailure("读回的 UUID 与另一页面正在初始化的 UUID 不一致，未改写 UUID；请重新读回服务器结果。"));
        return new Promise((resolve, reject) => entry.waiters.push({ resolve, reject }));
      }
      if (!observed && entry && this.confirmed.has(entry.id))
        return Promise.resolve({ identityId: entry.id });
      if (observed) {
        this.confirmed.add(observed);
        this.entities.set(entity, { id: observed, waiters: [] });
        return Promise.resolve({ identityId: observed });
      }
      entry ??= { id: crypto.randomUUID(), waiters: [] };
      entry.token = crypto.randomUUID();
      entry.owner = owner;
      this.entities.set(entity, entry);
      const candidate = entry, token = entry.token;
      return this.beforeIssue(candidate.id, entity).then(() => {
        this.beforeRelease(entity);
        if (candidate.token !== token || candidate.owner !== owner)
          throw identityFailure("UUID 凭据所属连接已断开，未开始保存酒馆身份。");
        return { identityId: candidate.id, token };
      }).catch((error) => {
        if (candidate.token === token && candidate.owner === owner) {
          this.settle(entity, token, false, owner);
        }
        throw error;
      });
    }
    pendingTicket(entity, token, owner) {
      const entry = this.entities.get(entity);
      if (!entry || entry.token !== token || entry.owner !== owner)
        throw identityFailure("Worker 拒绝 UUID 登记：初始化凭据已失效或属于另一连接；请重新读回服务器 UUID 并取得目标。");
      return { identityId: entry.id };
    }
    settle(entity, token, confirmed, owner) {
      const result = this.pendingTicket(entity, token, owner);
      const entry = this.entities.get(entity);
      entry.token = undefined;
      entry.owner = undefined;
      if (confirmed) {
        this.confirmed.add(entry.id);
        for (const waiter of entry.waiters)
          waiter.resolve(result);
      } else
        for (const waiter of entry.waiters)
          waiter.reject(identityFailure("另一页面未完成 UUID 保存及登记，无法确认服务器结果；请重新读回原 UUID 后再尝试。", "unconfirmed"));
      entry.waiters = [];
      return result;
    }
    disconnect(owner) {
      for (const [entity, entry] of this.entities)
        if (entry.owner === owner && entry.token)
          this.settle(entity, entry.token, false, owner);
    }
  }

  // src/worker/entity-coordinator.ts
  var roleKey = (entity) => `role:${JSON.stringify(entity)}`;
  var chatKey = (entity) => `chat:${entity}`;
  var copyKey = (taskId) => `copy:${taskId}`;
  var domain = (b) => JSON.stringify([b.storageId, b.configGeneration]);
  var validEntity = (entity) => typeof entity === "string" && !!entity && entity.length <= 4096;
  function fail(code, message, stage) {
    throw new ServiceError({
      code,
      message,
      resultKind: "identity",
      resultState: code === "CHARACTER_COPY_UNCONFIRMED" ? "unconfirmed" : "not-applied",
      retryable: false,
      ...stage ? { copyStage: stage } : {}
    });
  }
  function reference(value) {
    if (value && (!(value.id === null || isUuid(value.id)) || !Number.isSafeInteger(value.generation) || value.generation < 1 || typeof value.confirmed !== "boolean" || !["generated", "legacy"].includes(value.origin))) {
      throw new ServiceError({ code: "LOAD_FAILED", message: "root 文件引用记录无效，拒绝补造身份。" });
    }
    return value;
  }
  function copy(value) {
    if (value && (!isUuid(value.taskId) || !validEntity(value.oldAvatar) || !validEntity(value.newAvatar) || value.oldAvatar === value.newAvatar || value.state !== undefined && !["active", "deleted"].includes(value.state) || value.newReferenceId !== undefined && (!Number.isSafeInteger(value.newReferenceId) || value.newReferenceId < 1) || !["pending", "clearing", "cleared", "independent", "unconfirmed"].includes(value.stage) || value.inheritedId !== undefined && !isUuid(value.inheritedId) || value.independentId !== undefined && !isUuid(value.independentId))) {
      throw new ServiceError({ code: "LOAD_FAILED", message: "root 复制任务记录无效，拒绝解除副本门禁。" });
    }
    return value;
  }

  class EntityCoordinator {
    access;
    checkRename;
    checkTarget;
    readAccess;
    pending = new Map;
    leases = new Map;
    confirmed = new Map;
    currentCoordinates = new Map;
    tail = Promise.resolve();
    disconnected = new WeakSet;
    constructor(access, checkRename = () => {}, checkTarget = () => {}, readAccess = access) {
      this.access = access;
      this.checkRename = checkRename;
      this.checkTarget = checkTarget;
      this.readAccess = readAccess;
    }
    serialize(task) {
      const work = this.tail.then(task);
      this.tail = work.catch(() => {});
      return work;
    }
    cacheKey(binding, entity, chat = false) {
      return JSON.stringify([
        domain(binding),
        chat ? chatKey(entity) : roleKey(entity),
        binding.charDbId ?? null,
        chat ? binding.chatDbId ?? null : null,
        chat ? binding.chatIdentityGeneration ?? null : binding.identityGeneration ?? null
      ]);
    }
    assertPending(entity) {
      const task = this.pending.get(entity);
      if (task && !["cleared", "independent"].includes(task.stage))
        fail(task.stage === "unconfirmed" || task.stage === "clearing" ? "CHARACTER_COPY_UNCONFIRMED" : "CHARACTER_COPY_PENDING", "副本复制处理尚未确认，本次 SQL 未执行；不能访问继承的原角色库。", task.stage);
    }
    async load(records, existingOnly = false) {
      const tasks = existingOnly ? await records.listExisting("copy:") : await records.list("copy:");
      for (const { value } of tasks) {
        const task = copy(value);
        if (!await records.copyIsCurrent(task)) {
          this.forgetCopy(task.taskId);
          continue;
        }
        const newAvatar = task.currentNewAvatar ?? task.newAvatar, oldAvatar = task.currentOldAvatar ?? task.oldAvatar;
        const existing = this.pending.get(newAvatar);
        if (existing && existing.oldAvatar !== oldAvatar && existing.oldAvatar !== task.oldAvatar && !["cleared", "independent"].includes(existing.stage))
          fail("IDENTITY_CONFLICT", "同一副本存在不同源角色的复制任务。");
        this.pending.set(newAvatar, { taskId: task.taskId, oldAvatar, stage: task.stage });
      }
    }
    propose(binding, entity, id, chat = false) {
      return this.serialize(() => this.access(binding, async (records) => {
        this.checkRename(binding, entity);
        this.checkRename(binding, binding.characterEntity);
        this.checkTarget(binding, id, chat);
        await this.load(records);
        this.assertPending(binding.characterEntity ?? entity);
        const key = chat ? chatKey(entity) : roleKey(entity), old = reference(await records.get(key));
        if (old?.id && old.id !== id)
          fail("IDENTITY_CONFLICT", "该文件已确认或提议另一 UUID，不能另建身份。");
        if (old?.id === id)
          return;
        const next = {
          id,
          generation: (old?.generation ?? 0) + 1,
          confirmed: false,
          origin: "generated",
          ...old?.referenceId ? { referenceId: old.referenceId } : {},
          ...chat ? { parent: binding.charDbId } : {}
        };
        await records.put(key, next, old ?? null);
      }));
    }
    generation(binding, entity, chat = false) {
      return this.access(binding, async (records) => {
        const value = reference(await records.get(chat ? chatKey(entity) : roleKey(entity)));
        if (!value)
          fail("STALE_IDENTITY", "身份提案尚未保存。");
        return value.generation;
      });
    }
    credential(binding, entity, chat = false) {
      return this.access(binding, async (records) => {
        const fixed = chat ? binding.scope === "chat" : ["char", "chat"].includes(binding.scope ?? "");
        const value = reference(fixed ? (await records.readReference(entity, chat, chat ? binding.chatIdentityGeneration : binding.identityGeneration, chat ? binding.chatDbId : binding.charDbId, chat ? binding.chatReferenceId : binding.characterReferenceId))?.reference : await records.get(chat ? chatKey(entity) : roleKey(entity)));
        if (!value?.referenceId)
          fail("STALE_IDENTITY", "原管理记录已经不存在。");
        return { generation: value.generation, referenceId: value.referenceId };
      });
    }
    forgetReference(binding, referenceId, chat) {
      for (const [key, value] of this.confirmed)
        if (JSON.parse(key)[0] === domain(binding) && value.referenceId === referenceId && String(JSON.parse(key)[1]).startsWith("chat:") === chat) {
          this.confirmed.delete(key);
          this.currentCoordinates.delete(key);
        }
    }
    candidate(binding, entity, chat = false) {
      return this.access(binding, async (records) => {
        this.checkRename(binding, entity);
        this.checkRename(binding, binding.characterEntity);
        await this.load(records);
        this.assertPending(binding.characterEntity ?? entity);
        const value = reference(await records.get(chat ? chatKey(entity) : roleKey(entity)));
        return value?.origin === "generated" && !value.confirmed && value.id ? value.id : undefined;
      });
    }
    confirm(binding, entity, id, chat = false, matchingEntities, expectedGeneration) {
      return this.serialize(() => this.access(binding, async (records) => {
        if (!validEntity(entity) || !isUuid(id))
          fail("IDENTITY_CONFLICT", "身份确认需要有效的文件坐标和 UUID。");
        this.checkRename(binding, entity);
        this.checkRename(binding, binding.characterEntity);
        this.checkTarget(binding, id, chat);
        await this.load(records);
        this.assertPending(binding.characterEntity ?? entity);
        if (expectedGeneration !== undefined) {
          const resolved = await records.readReference(entity, chat, expectedGeneration, id, chat ? binding.chatReferenceId : binding.characterReferenceId);
          const restored = reference(resolved?.reference);
          this.checkRename(binding, resolved?.currentEntity ?? entity);
          if (!restored?.confirmed || restored.id !== id || chat && restored.parent !== binding.charDbId)
            fail("STALE_IDENTITY", "原文件记录或代次已失效，未重新建立旧文件引用。");
          this.confirmed.set(this.cacheKey(binding, entity, chat), restored);
          this.currentCoordinates.set(this.cacheKey(binding, entity, chat), resolved.currentEntity);
          return restored.generation;
        }
        const key = chat ? chatKey(entity) : roleKey(entity), old = reference(await records.get(key));
        if (old?.id && old.id !== id)
          fail("STALE_IDENTITY", "文件引用与读回 UUID 不一致，不能重定向原代理。");
        if (chat && old?.parent !== undefined && old.parent !== binding.charDbId)
          fail("IDENTITY_CONFLICT", "聊天引用的所属角色 UUID 不一致。");
        const task = !chat ? copy(await records.currentCopy(entity)) : undefined;
        if (task && task.stage === "cleared" && old?.origin !== "generated")
          fail("IDENTITY_CONFLICT", "副本仍携带未经独立生成确认的 UUID，不能访问原库。");
        if (!chat && (!old?.id || !old.confirmed)) {
          for (const { key: otherKey, value } of await records.lookupRoleUuid(id)) {
            const other = reference(value);
            if (otherKey !== key && other.id === id)
              fail("IDENTITY_CONFLICT", "该 UUID 已属于另一角色文件，副本不能访问原库。");
          }
          if (!matchingEntities && old?.origin !== "generated")
            throw new ServiceError({
              code: "IDENTITY_CONFLICT",
              identityStage: "ownership-check",
              resultKind: "identity",
              message: "已有 UUID 缺少角色文件引用，请读回服务器角色列表核对唯一归属。"
            });
          if (matchingEntities && (matchingEntities.length !== 1 || matchingEntities[0] !== entity))
            fail("IDENTITY_CONFLICT", "服务器角色列表中的 UUID 引用不唯一或目标不符，拒绝访问。");
        }
        const next = {
          id,
          generation: old?.generation ?? 1,
          confirmed: true,
          origin: old?.origin ?? "legacy",
          ...old?.referenceId ? { referenceId: old.referenceId } : {},
          ...chat ? { parent: binding.charDbId } : {}
        };
        await records.put(key, next, old ?? null);
        if (task?.stage === "cleared") {
          await records.forgetRecord(copyKey(task.taskId));
          this.forgetCopy(task.taskId);
        }
        this.confirmed.set(this.cacheKey(binding, entity, chat), next);
        return next.generation;
      }));
    }
    confirmReadOnly(binding, entity, id, chat = false) {
      return this.serialize(() => this.readAccess(binding, async (records) => {
        this.checkRename(binding, entity);
        this.checkRename(binding, binding.characterEntity);
        this.checkTarget(binding, id, chat);
        await this.load(records, true);
        this.assertPending(binding.characterEntity ?? entity);
        const old = reference(await records.get(chat ? chatKey(entity) : roleKey(entity)));
        if (!old?.confirmed || old.id !== id || chat && old.parent !== binding.charDbId || (chat ? binding.chatReferenceId : binding.characterReferenceId) !== undefined && old.referenceId !== (chat ? binding.chatReferenceId : binding.characterReferenceId))
          fail("STALE_IDENTITY", "没有与当前 UUID 匹配的已有确认记录；查看不会补写身份。");
        this.confirmed.set(this.cacheKey(binding, entity, chat), old);
        this.currentCoordinates.set(this.cacheKey(binding, entity, chat), entity);
        return old.generation;
      }));
    }
    verify(binding, allowPendingRename = false, readOnly = false) {
      if (!["char", "chat"].includes(binding.scope ?? ""))
        return Promise.resolve();
      return this.serialize(() => (readOnly ? this.readAccess : this.access)(binding, async (records) => {
        await this.load(records);
        const entity = binding.characterEntity;
        if (!validEntity(entity))
          fail("STALE_IDENTITY", "数据库请求缺少已确认的角色文件坐标。");
        if (!allowPendingRename) {
          this.checkRename(binding, entity);
          this.checkRename(binding, binding.chatEntity);
        }
        this.assertPending(entity);
        const resolvedRole = await records.readReference(entity, false, binding.identityGeneration, binding.charDbId, binding.characterReferenceId);
        if (!allowPendingRename)
          this.checkRename(binding, resolvedRole?.currentEntity);
        const role = reference(resolvedRole?.reference);
        if (!role?.confirmed || role.id !== binding.charDbId || role.generation !== binding.identityGeneration || binding.characterReferenceId !== undefined && role.referenceId !== binding.characterReferenceId)
          fail("STALE_IDENTITY", "角色文件的访问确认已失效，本次 SQL 未执行。");
        this.confirmed.set(this.cacheKey(binding, entity), role);
        this.currentCoordinates.set(this.cacheKey(binding, entity), resolvedRole.currentEntity);
        if (binding.scope === "chat") {
          if (!validEntity(binding.chatEntity))
            fail("STALE_IDENTITY", "数据库请求缺少已确认的聊天文件坐标。");
          const resolvedChat = await records.readReference(binding.chatEntity, true, binding.chatIdentityGeneration, binding.chatDbId, binding.chatReferenceId);
          if (!allowPendingRename)
            this.checkRename(binding, resolvedChat?.currentEntity);
          const chat = reference(resolvedChat?.reference);
          if (!chat?.confirmed || chat.id !== binding.chatDbId || chat.parent !== binding.charDbId || chat.generation !== binding.chatIdentityGeneration || binding.chatReferenceId !== undefined && chat.referenceId !== binding.chatReferenceId)
            fail("STALE_IDENTITY", "聊天文件的访问确认已失效，本次 SQL 未执行。");
          this.confirmed.set(this.cacheKey(binding, binding.chatEntity, true), chat);
          this.currentCoordinates.set(this.cacheKey(binding, binding.chatEntity, true), resolvedChat.currentEntity);
        }
      }));
    }
    assertCached(binding) {
      if (!["char", "chat"].includes(binding.scope ?? ""))
        return;
      if (!validEntity(binding.characterEntity))
        fail("STALE_IDENTITY", "角色文件坐标缺失。");
      this.checkRename(binding, binding.characterEntity);
      this.checkRename(binding, binding.chatEntity);
      this.checkRename(binding, this.currentCoordinates.get(this.cacheKey(binding, binding.characterEntity)));
      if (binding.chatEntity)
        this.checkRename(binding, this.currentCoordinates.get(this.cacheKey(binding, binding.chatEntity, true)));
      this.assertPending(binding.characterEntity);
      const role = this.confirmed.get(this.cacheKey(binding, binding.characterEntity));
      if (!role?.confirmed || role.id !== binding.charDbId || role.generation !== binding.identityGeneration || binding.characterReferenceId !== undefined && role.referenceId !== binding.characterReferenceId)
        fail("STALE_IDENTITY", "角色访问确认已失效。");
      if (binding.scope === "chat") {
        const chat = binding.chatEntity && this.confirmed.get(this.cacheKey(binding, binding.chatEntity, true));
        if (!chat || chat.id !== binding.chatDbId || chat.parent !== binding.charDbId || chat.generation !== binding.chatIdentityGeneration || binding.chatReferenceId !== undefined && chat.referenceId !== binding.chatReferenceId)
          fail("STALE_IDENTITY", "聊天访问确认已失效。");
      }
    }
    begin(oldAvatar, newAvatar, binding, taskId) {
      if (!validEntity(oldAvatar) || !validEntity(newAvatar) || oldAvatar === newAvatar)
        return Promise.reject(new ServiceError({ code: "INVALID_REQUEST", message: "角色复制事件坐标无效。" }));
      const existing = this.pending.get(newAvatar);
      if (existing && existing.oldAvatar !== oldAvatar && !["cleared", "independent"].includes(existing.stage)) {
        if (!binding)
          return Promise.reject(new ServiceError({
            code: "IDENTITY_CONFLICT",
            resultKind: "identity",
            message: "矛盾复制通知已拒绝，保留原任务与已确认身份。"
          }));
        existing.stage = "unconfirmed";
        return this.serialize(() => this.access(binding, async (records) => {
          const task = copy(await records.currentCopy(newAvatar));
          if (task && !["cleared", "independent"].includes(task.stage))
            await records.put(copyKey(task.taskId), { ...task, stage: "unconfirmed", conflict: true }, task);
          fail("IDENTITY_CONFLICT", "在途复制收到不同源角色通知，保留冲突，不发新清除或身份凭据。");
        }));
      }
      if (!existing)
        this.pending.set(newAvatar, { oldAvatar, stage: "pending" });
      if (!binding)
        return Promise.reject(new ServiceError({
          code: "CHARACTER_COPY_PENDING",
          resultKind: "identity",
          copyStage: "pending",
          message: "副本待处理；请先授权目录，尚未改写角色或执行 SQL。"
        }));
      return this.serialize(() => this.access(binding, async (records) => {
        await this.load(records);
        let task = copy(await records.currentCopy(newAvatar));
        if (taskId) {
          const original = copy(await records.get(copyKey(taskId)));
          if (original && original.state === "active" && ["cleared", "independent"].includes(original.stage) && original.oldAvatar === oldAvatar && original.newAvatar === newAvatar)
            return { ...original };
        }
        if (taskId && (!task || task.taskId !== taskId))
          fail("STALE_IDENTITY", "原复制任务已经删除或副本已改名，不能按同名的新副本重试。");
        if (task && task.oldAvatar !== oldAvatar)
          fail("IDENTITY_CONFLICT", "副本复制来源与已有任务冲突。");
        if (!task) {
          const role = reference(await records.get(roleKey(newAvatar)));
          const roleId = await records.roleIdFor(newAvatar);
          const sourceRoleId = await records.roleIdFor(oldAvatar);
          task = {
            ...sourceRoleId ? { oldReferenceId: sourceRoleId } : {},
            state: "active",
            taskId: crypto.randomUUID(),
            oldAvatar,
            newAvatar,
            ...roleId ? { newReferenceId: roleId } : {},
            stage: role?.origin === "generated" && role.confirmed ? "independent" : "pending",
            ...role?.origin === "generated" && role.confirmed && role.id ? { independentId: role.id } : {}
          };
          await records.put(copyKey(task.taskId), task);
        }
        if (task.stage === "independent") {
          this.pending.delete(newAvatar);
          await records.forgetRecord(copyKey(task.taskId));
          this.forgetCopy(task.taskId);
        } else {
          this.pending.set(newAvatar, { taskId: task.taskId, oldAvatar, stage: task.stage });
        }
        return { ...task };
      }));
    }
    acquire(oldAvatar, newAvatar, taskId, sourceId, observedId, binding, owner, hasIdentityLease) {
      return this.serialize(() => this.access(binding, async (records) => {
        await this.load(records);
        const task = copy(await records.currentCopy(newAvatar));
        if (!task || task.taskId !== taskId || task.oldAvatar !== oldAvatar)
          fail("STALE_IDENTITY", "原复制任务已失效，不能用旧任务处理同名的新副本。");
        if (task.conflict)
          fail("IDENTITY_CONFLICT", "复制任务有来源冲突，不能继续自动处理。");
        const role = reference(await records.get(roleKey(newAvatar)));
        if (task.stage === "independent") {
          if (observedId !== task.independentId)
            fail("IDENTITY_CONFLICT", "独立副本的服务器 UUID 与已确认记录不同，不能覆盖页面或角色文件。");
          return { ...task };
        }
        if (role?.origin === "generated" && role.id && observedId === role.id && observedId !== sourceId) {
          const next = { ...task, stage: "independent", independentId: role.id };
          await records.forgetRecord(copyKey(task.taskId));
          this.forgetCopy(task.taskId);
          return { ...next };
        }
        if (task.stage === "cleared") {
          if (observedId !== null)
            fail("IDENTITY_CONFLICT", "已清除副本读回未经确认的 UUID，不能重复清除或覆盖页面。");
          if (!role)
            await records.put(roleKey(newAvatar), { id: null, generation: 1, confirmed: false, origin: "generated" });
          return { ...task };
        }
        if (task.stage !== "pending" || hasIdentityLease)
          fail("CHARACTER_COPY_UNCONFIRMED", "先前身份或清除请求尚未确认结束，不能重发清除或生成独立身份。", task.stage);
        if (role?.id && (role.origin === "generated" || role.id !== observedId || role.id !== sourceId))
          fail("CHARACTER_COPY_UNCONFIRMED", "副本有已发出的独立身份提案或不匹配引用，需要先核对旧保存，不能自动清除。", "unconfirmed");
        if (observedId !== null && (!isUuid(observedId) || !isUuid(sourceId) || observedId !== sourceId))
          fail("IDENTITY_CONFLICT", "副本 UUID 与源不符，不能清除未知身份。");
        const token = crypto.randomUUID();
        const next = {
          ...task,
          stage: observedId === null ? "cleared" : "clearing",
          ...observedId ? { inheritedId: observedId, clearToken: token } : {}
        };
        await records.put(roleKey(newAvatar), { id: null, generation: (role?.generation ?? 0) + 1, confirmed: false, origin: "generated" }, role ?? null);
        const linked = copy(await records.get(copyKey(task.taskId)));
        next.newReferenceId = linked.newReferenceId;
        await records.put(copyKey(task.taskId), next, linked);
        for (const key of this.confirmed.keys()) {
          const parts = JSON.parse(key);
          if (parts[0] === domain(binding) && parts[1] === roleKey(newAvatar)) {
            this.confirmed.delete(key);
            this.currentCoordinates.delete(key);
          }
        }
        this.pending.set(newAvatar, { taskId: task.taskId, oldAvatar, stage: next.stage });
        if (next.stage === "cleared") {
          await records.forgetRecord(copyKey(task.taskId));
          this.forgetCopy(task.taskId);
          return { ...next };
        }
        this.leases.set(newAvatar, { taskId: task.taskId, token, owner, binding: { ...binding } });
        return { ...next, token };
      }));
    }
    settle(oldAvatar, newAvatar, taskId, token, confirmed, binding, owner) {
      return this.serialize(() => this.access(binding, async (records) => {
        if (this.disconnected.has(owner))
          fail("STALE_IDENTITY", "清除凭据所属连接已断开，不能用迟到消息解除门禁。");
        const lease = this.leases.get(newAvatar), task = copy(await records.currentCopy(newAvatar));
        if (!task || task.taskId !== taskId || task.oldAvatar !== oldAvatar || task.clearToken !== token)
          fail("STALE_IDENTITY", "清除凭据已失效，不能解除副本门禁。");
        if (task.conflict)
          fail("IDENTITY_CONFLICT", "复制来源冲突尚未确认，不能解除副本门禁。");
        if (confirmed && ["cleared", "independent"].includes(task.stage))
          return { ...task };
        if (lease && (lease.taskId !== taskId || lease.token !== token || lease.owner !== owner || domain(lease.binding) !== domain(binding)) || !["clearing", "unconfirmed"].includes(task.stage))
          fail("STALE_IDENTITY", "清除凭据已失效，不能解除副本门禁。");
        const next = { ...task, stage: confirmed ? "cleared" : "unconfirmed" };
        await records.put(copyKey(task.taskId), next, task);
        this.leases.delete(newAvatar);
        this.pending.set(newAvatar, { taskId: task.taskId, oldAvatar, stage: next.stage });
        if (confirmed) {
          await records.forgetRecord(copyKey(task.taskId));
          this.forgetCopy(task.taskId);
        }
        if (!confirmed)
          fail("CHARACTER_COPY_UNCONFIRMED", "清除请求或服务器读回未确认，副本保持禁用；不会自动重发清除。", next.stage);
        return { ...next };
      }));
    }
    forgetCopy(taskId) {
      for (const [avatar, task] of this.pending)
        if (task.taskId === taskId) {
          this.pending.delete(avatar);
          if (this.leases.get(avatar)?.taskId === taskId)
            this.leases.delete(avatar);
        }
    }
    disconnect(owner) {
      this.disconnected.add(owner);
      for (const [entity, lease] of this.leases)
        if (lease.owner === owner) {
          this.leases.delete(entity);
          const task = this.pending.get(entity);
          if (task)
            task.stage = "unconfirmed";
        }
    }
    assertSettled() {
      if (this.leases.size)
        fail("CHARACTER_COPY_PENDING", "角色复制清除仍在进行，请等待请求结束。");
    }
    hasCopyWorkFor(avatars) {
      return [...this.pending].some(([avatar, task]) => (avatars.includes(avatar) || avatars.includes(task.oldAvatar)) && !["cleared", "independent"].includes(task.stage));
    }
  }

  // src/worker/entity-schema.ts
  var damaged = (message) => new ServiceError({ code: "LOAD_FAILED", message });
  function coordinate(entity, chat) {
    if (!chat) {
      if (!entity || entity.length > 4096 || entity.includes("\x00"))
        throw damaged("角色文件坐标无效。");
      return { chat: false, avatar: entity };
    }
    let value;
    try {
      value = JSON.parse(entity);
    } catch {
      throw damaged("聊天文件坐标不是有效的角色和文件名。");
    }
    if (!Array.isArray(value) || value.length !== 2 || value.some((v) => typeof v !== "string" || !v || v.length > 4096 || v.includes("\x00")))
      throw damaged("聊天文件坐标不是有效的角色和文件名。");
    return { chat: true, avatar: value[0], file: value[1] };
  }
  function entityKey(c) {
    return c.chat ? `chat:${JSON.stringify([c.avatar, c.file])}` : `role:${JSON.stringify(c.avatar)}`;
  }
  function parseEntityKey(key) {
    if (key.startsWith("chat:"))
      return coordinate(key.slice(5), true);
    if (key.startsWith("role:")) {
      let avatar;
      try {
        avatar = JSON.parse(key.slice(5));
      } catch {
        throw damaged("角色记录键无效。");
      }
      if (typeof avatar !== "string")
        throw damaged("角色记录键无效。");
      return coordinate(avatar, false);
    }
  }
  function validateReference(value, chat) {
    const r = value;
    if (!r || typeof r !== "object" || Array.isArray(r) || !(r.id === null || isUuid(r.id)) || !Number.isSafeInteger(r.generation) || r.generation < 1 || typeof r.confirmed !== "boolean" || !["generated", "legacy"].includes(r.origin) || chat && !isUuid(r.parent) || !chat && r.parent !== undefined || r.referenceId !== undefined && (!Number.isSafeInteger(r.referenceId) || r.referenceId < 1) || Object.keys(r).some((k) => !["id", "generation", "confirmed", "origin", "parent", "referenceId"].includes(k)))
      throw damaged("root 角色或聊天引用字段无效，拒绝补造身份。");
    return r;
  }
  var META = "__stsh_meta";
  var TARGETS = "__stsh_targets";
  var ROLES = "__stsh_roles";
  var CHATS = "__stsh_chats";
  var ACTIVE_ROLES = "__stsh_active_roles";
  var ACTIVE_CHATS = "__stsh_active_chats";
  var SCHEMA6 = [
    `CREATE TABLE ${META} (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL)`,
    `CREATE TABLE ${TARGETS} (scope TEXT NOT NULL CHECK(scope IN ('char','chat')), char_dbid TEXT NOT NULL, chat_dbid TEXT NOT NULL, origin TEXT NOT NULL CHECK(origin IN ('generated','legacy')), state TEXT NOT NULL CHECK(state IN ('never','creating','ready')), PRIMARY KEY(scope,char_dbid,chat_dbid), CHECK((scope='char' AND chat_dbid='') OR (scope='chat' AND chat_dbid<>'')))`,
    `CREATE TABLE ${ROLES} (role_id INTEGER PRIMARY KEY AUTOINCREMENT, avatar_name TEXT NOT NULL, char_dbid TEXT, generation INTEGER NOT NULL CHECK(generation>=0), confirmed INTEGER NOT NULL CHECK(confirmed IN (0,1)), origin TEXT NOT NULL CHECK(origin IN ('generated','legacy')), state TEXT NOT NULL DEFAULT 'active' CHECK(state IN ('active','deleted')), CHECK(generation>0 OR (char_dbid IS NULL AND confirmed=0)))`,
    `CREATE TABLE ${CHATS} (chat_id INTEGER PRIMARY KEY AUTOINCREMENT, role_id INTEGER NOT NULL REFERENCES ${ROLES}(role_id), file_name TEXT NOT NULL, chat_dbid TEXT, parent_char_dbid TEXT NOT NULL, generation INTEGER NOT NULL CHECK(generation>0), confirmed INTEGER NOT NULL CHECK(confirmed IN (0,1)), origin TEXT NOT NULL CHECK(origin IN ('generated','legacy')), state TEXT NOT NULL DEFAULT 'active' CHECK(state IN ('active','retained','deleted')))`,
    `CREATE INDEX __stsh_roles_uuid ON ${ROLES}(char_dbid)`,
    `CREATE INDEX __stsh_chats_uuid ON ${CHATS}(chat_dbid)`,
    `CREATE UNIQUE INDEX __stsh_active_role_name ON ${ROLES}(avatar_name) WHERE state='active'`,
    `CREATE UNIQUE INDEX __stsh_active_chat_name ON ${CHATS}(role_id,file_name) WHERE state<>'deleted'`,
    `CREATE INDEX __stsh_chat_file ON ${CHATS}(file_name,state)`,
    `CREATE INDEX __stsh_chat_target ON ${CHATS}(parent_char_dbid,chat_dbid,state)`,
    `CREATE VIEW ${ACTIVE_ROLES} AS SELECT role_id,avatar_name,char_dbid,generation,confirmed,origin FROM ${ROLES} WHERE state='active'`,
    `CREATE VIEW ${ACTIVE_CHATS} AS SELECT c.chat_id,c.role_id,c.file_name,c.chat_dbid,c.parent_char_dbid,c.generation,c.confirmed,c.origin FROM ${CHATS} c JOIN ${ROLES} r USING(role_id) WHERE c.state='active' AND r.state='active'`
  ];
  async function assertSchema6(root) {
    const normalize = (s) => s.replace(/\s+/g, "").replaceAll('"', "").toLowerCase();
    for (const sql of SCHEMA6) {
      const name = sql.split(" ")[sql.startsWith("CREATE UNIQUE") ? 3 : 2];
      const rows = (await root.query({ sql: "SELECT sql FROM sqlite_master WHERE name=?", binds: [name] })).rows;
      if (rows.length !== 1 || normalize(String(rows[0][0])) !== normalize(sql))
        throw damaged(`管理对象 ${name} 结构无效。`);
    }
    const version = (await root.query({ sql: `SELECT value FROM ${META} WHERE key='schema_version'` })).rows;
    if (version.length !== 1 || version[0][0] !== "6")
      throw damaged("管理结构版本无效。");
    if ((await root.query({ sql: "SELECT * FROM pragma_foreign_key_check" })).rows.length)
      throw damaged("管理记录外键关系无效。");
  }

  // src/worker/entity-renames.ts
  var domain2 = (b) => JSON.stringify([b.storageId, b.configGeneration]);

  class EntityRenames {
    access;
    tasks = new Map;
    running = 0;
    tail = Promise.resolve();
    constructor(access) {
      this.access = access;
    }
    serialize(work) {
      this.running++;
      const next = this.tail.then(work).finally(() => {
        this.running--;
      });
      this.tail = next.catch(() => {});
      return next;
    }
    assertEntity(b, entity) {
      if (!entity)
        return;
      for (const [key, task] of this.tasks) {
        if (!key.startsWith(`${domain2(b)}:`))
          continue;
        const affected = [task.oldEntity, task.newEntity].some((name) => name === entity || task.kind === "char" && (() => {
          try {
            return coordinate(entity, true).avatar === name;
          } catch {
            return false;
          }
        })());
        if (affected)
          throw new ServiceError({
            code: task.stage === "pending" ? "ENTITY_RENAME_PENDING" : "ENTITY_RENAME_UNCONFIRMED",
            resultKind: "identity",
            message: "该文件的改名尚未核对，请重新读回酒馆文件；本次 SQL 未执行。"
          });
      }
    }
    assertSettled() {
      if (this.running)
        throw new ServiceError({ code: "ENTITY_RENAME_PENDING", message: "改名登记仍在执行，请等待完成。" });
    }
    begin(kind, oldEntity, newEntity, b) {
      if (!["char", "chat"].includes(kind) || oldEntity === newEntity)
        return Promise.reject(new ServiceError({ code: "INVALID_REQUEST", message: "改名事件需要明确的新旧文件名。" }));
      coordinate(oldEntity, kind === "chat");
      coordinate(newEntity, kind === "chat");
      if (kind === "chat" && coordinate(oldEntity, true).avatar !== coordinate(newEntity, true).avatar)
        return Promise.reject(new ServiceError({ code: "IDENTITY_CONFLICT", message: "聊天改名不能改变所属角色。" }));
      if (!b)
        return Promise.reject(new ServiceError({ code: "ENTITY_RENAME_PENDING", message: "请先授权原数据库目录，再核对改名。" }));
      return this.serialize(() => this.access(b, async (records) => {
        const key = `${domain2(b)}:${JSON.stringify([kind, oldEntity, newEntity])}`;
        const existing = this.tasks.get(key);
        if (existing)
          return structuredClone(existing);
        const info = await records.referenceInfo(oldEntity, kind === "chat");
        if (!info && await records.referenceInfo(newEntity, kind === "chat"))
          return { taskId: crypto.randomUUID(), kind, oldEntity, newEntity, stage: "applied" };
        const ticket = {
          taskId: crypto.randomUUID(),
          kind,
          oldEntity,
          newEntity,
          stage: "pending",
          ...info ? { expected: info.reference } : { unobserved: true }
        };
        this.tasks.set(key, ticket);
        return structuredClone(ticket);
      }));
    }
    settle(ticket, observedId, parentId, confirmed, b, hasExternalWork) {
      return this.serialize(() => this.access(b, async (records) => {
        const key = `${domain2(b)}:${JSON.stringify([ticket.kind, ticket.oldEntity, ticket.newEntity])}`;
        const row = this.tasks.get(key);
        if (!row || row.taskId !== ticket.taskId || row.oldEntity !== ticket.checkedOldEntity || row.newEntity !== ticket.checkedNewEntity || JSON.stringify(row.expected) !== JSON.stringify(ticket.expected))
          throw new ServiceError({ code: "STALE_IDENTITY", message: "原改名核对已失效，请重新读回。" });
        if (!confirmed || hasExternalWork() || row.expected?.id && !row.expected.confirmed) {
          row.stage = "unconfirmed";
          throw new ServiceError({
            code: "ENTITY_RENAME_UNCONFIRMED",
            message: "酒馆文件或原身份尚未确认，未修改数据库引用。"
          });
        }
        if (row.expected && (row.expected.id !== observedId || row.kind === "chat" && row.expected.parent !== parentId))
          throw new ServiceError({
            code: "IDENTITY_CONFLICT",
            message: "改名文件的数据库编号与原对象不同，未修改引用。"
          });
        if (!row.expected) {
          if (row.kind === "char" && observedId && (await records.lookupRoleUuid(observedId)).length)
            throw new ServiceError({ code: "IDENTITY_CONFLICT", message: "该编号已属于其他角色，不能当作改名。" });
          await records.confirmUnknownRename(row.newEntity, row.kind === "chat", {
            id: observedId,
            generation: 1,
            confirmed: observedId !== null,
            origin: "legacy",
            ...row.kind === "chat" ? { parent: parentId } : {}
          });
        } else if (row.kind === "char")
          await records.renameRole(row.oldEntity, row.newEntity, row.expected);
        else
          await records.renameChat(row.oldEntity, row.newEntity, row.expected);
        this.tasks.delete(key);
        return { ...row, stage: "applied" };
      }));
    }
  }

  // src/worker/entity-deletions.ts
  var domain3 = (b) => JSON.stringify([b.storageId, b.configGeneration]);
  var stale = () => new ServiceError({
    code: "STALE_IDENTITY",
    resultKind: "identity",
    resultState: "not-applied",
    message: "原角色或聊天已删除，旧代理不能重新生成身份或创建数据库。"
  });
  function deletionTicket(task) {
    return {
      taskId: task.taskId,
      operationId: task.operationId,
      kind: task.chat ? "chat" : "char",
      entity: task.entity,
      stage: task.phase === "invalidated" ? "applied" : task.phase === "cancelled" ? "cancelled" : task.phase === "blocked" ? "unconfirmed" : "pending",
      revision: task.revision,
      ...task.copyTaskIds ? { copyTaskIds: task.copyTaskIds } : {},
      credentials: task.credentials,
      ...task.reference ? { expected: task.reference } : {},
      ...task.deleteChats !== undefined ? { deleteChats: task.deleteChats } : {},
      ...task.reason ? { reason: task.reason } : {}
    };
  }

  class EntityDeletions {
    storage;
    changed;
    tasks = new Map;
    discoveries = new Map;
    running = new Map;
    scanning = new Map;
    revisions = new Map;
    tail = Promise.resolve();
    constructor(storage, changed = () => {}) {
      this.storage = storage;
      this.changed = changed;
    }
    serialize(work) {
      const next = this.tail.then(work);
      this.tail = next.catch(() => {});
      return next;
    }
    key(b, taskId) {
      return `${domain3(b)}:${taskId}`;
    }
    async load(records, binding) {
      const tasks = await records.listDeletionsExisting();
      this.revisions.set(domain3(binding), Math.max(this.revisions.get(domain3(binding)) ?? 0, await records.entityRevisionExisting()));
      for (const key of this.tasks.keys())
        if (key.startsWith(`${domain3(binding)}:`) && !tasks.some((task) => this.key(binding, task.taskId) === key))
          this.tasks.delete(key);
      for (const task of tasks)
        this.tasks.set(this.key(binding, task.taskId), task);
    }
    revision(binding) {
      return this.revisions.get(domain3(binding)) ?? 0;
    }
    matches(task, entity, chat) {
      if (task.entity === entity && task.chat === chat)
        return true;
      return !task.chat && chat && coordinate(entity, true).avatar === task.entity;
    }
    assertEntity(binding, entity, chat = false) {
      if (!entity)
        return;
      for (const [key, found] of this.discoveries)
        if (key.startsWith(`${domain3(binding)}:`) && this.matches(found, entity, chat)) {
          throw new ServiceError({
            code: "ENTITY_DELETE_PENDING",
            resultKind: "identity",
            resultState: "not-applied",
            deleteStage: "pending",
            message: "原对象的删除正在核对，本次 SQL 未执行。"
          });
        }
      for (const [key, task] of this.tasks) {
        if (!key.startsWith(`${domain3(binding)}:`) || task.phase === "cancelled")
          continue;
        const generation = chat ? binding.chatIdentityGeneration : binding.identityGeneration;
        const credential = task.credentials.some((c) => c.entity === entity && c.chat === chat && generation !== undefined && c.generation === generation && ((chat ? binding.chatReferenceId : binding.characterReferenceId) === undefined || c.referenceId === (chat ? binding.chatReferenceId : binding.characterReferenceId)));
        const affected = this.matches(task, entity, chat) || credential;
        if (!affected)
          continue;
        if (task.phase !== "invalidated")
          throw new ServiceError({
            code: task.phase === "blocked" ? "ENTITY_DELETE_UNCONFIRMED" : "ENTITY_DELETE_PENDING",
            resultKind: "identity",
            resultState: "not-applied",
            deleteStage: task.phase === "blocked" ? "unconfirmed" : "pending",
            message: "原对象的删除结果尚未核对，本次 SQL 未执行。"
          });
        if (credential || (binding.entityRevision ?? -1) < task.revision)
          throw stale();
      }
    }
    assertBinding(binding) {
      this.assertEntity(binding, binding.characterEntity);
      this.assertEntity(binding, binding.chatEntity, true);
    }
    async verify(binding, entity, chat = false) {
      this.assertEntity(binding, entity, chat);
      await this.storage.manageEntities(binding, async (records) => {
        const generation = chat ? binding.chatIdentityGeneration : binding.identityGeneration;
        if (await records.hasDeletedCoordinate(entity, chat, generation, binding.entityRevision))
          throw stale();
      });
    }
    begin(kind, entity, operationId, deleteChats, binding) {
      if (!["char", "chat"].includes(kind) || !isUuid(operationId) || deleteChats !== undefined && typeof deleteChats !== "boolean")
        return Promise.reject(new ServiceError({ code: "INVALID_REQUEST", message: "删除通知参数无效。" }));
      coordinate(entity, kind === "chat");
      if (!binding)
        return Promise.reject(new ServiceError({ code: "ENTITY_DELETE_PENDING", message: "请先授权原数据库目录。" }));
      const discovery = this.key(binding, operationId);
      this.discoveries.set(discovery, { entity, chat: kind === "chat" });
      return this.serialize(() => this.storage.manageEntities(binding, async (records) => {
        records.ensureRevision(this.revision(binding));
        const task = await records.beginDeletion({
          entity,
          chat: kind === "chat",
          operationId,
          ...deleteChats !== undefined ? { deleteChats } : {}
        });
        this.revisions.set(domain3(binding), task.revision);
        this.tasks.set(this.key(binding, task.taskId), task);
        const ticket = deletionTicket(task);
        this.changed(binding, ticket);
        return ticket;
      })).finally(() => this.discoveries.delete(discovery));
    }
    pending(binding) {
      return Promise.resolve([...this.tasks].filter(([key, t]) => key.startsWith(`${domain3(binding)}:`) && t.phase === "observed").map(([, t]) => deletionTicket(t)));
    }
    settle(input, binding) {
      return this.serialize(async () => {
        const key = this.key(binding, input.taskId), task = this.tasks.get(key);
        if (!task || task.entity !== input.entity || task.chat !== (input.kind === "chat") || JSON.stringify(task.reference) !== JSON.stringify(input.expected))
          throw stale();
        try {
          if (!input.confirmed)
            throw new ServiceError({
              code: "ENTITY_DELETE_UNCONFIRMED",
              message: "酒馆删除结果无法确认，未清理数据库；请稍后扫描核对。"
            });
          if (!input.absent) {
            if (input.observedId !== (task.reference?.id ?? null))
              throw stale();
            const ticket = { ...deletionTicket(task), stage: "cancelled" };
            this.changed(binding, ticket);
            return ticket;
          }
          const result = await this.storage.manageEntities(binding, (records) => records.settleDeletion(task, {
            childrenDeleted: task.deleteChats === true && input.remainingChatNames?.length === 0
          }));
          this.tasks.set(key, result.deletion);
          const ticket = deletionTicket(result.deletion);
          this.changed(binding, ticket);
          const outcomes = await this.cleanup(binding);
          if (outcomes.every((t) => t.phase === "done" || t.phase === "retained"))
            await this.storage.manageEntities(binding, (records) => records.finishDeletion(result.deletion));
          return ticket;
        } finally {
          this.tasks.delete(key);
          await this.storage.manageEntities(binding, (records) => records.forgetDeletion(task.taskId)).catch(() => {});
        }
      });
    }
    cleanScan(input, binding) {
      if (!input || !isUuid(input.operationId) || !input.expected || typeof input.removeRecord !== "boolean" || typeof input.removeFile !== "boolean" || !["char", "chat"].includes(input.expected.scope) || !Number.isSafeInteger(input.expected.referenceId) || input.expected.referenceId < 1 || !input.observation || !["deleted", "same", "unknown"].includes(input.observation.status))
        return Promise.reject(new ServiceError({ code: "INVALID_REQUEST", message: "扫描清理必须提供原记录、核对结果和确认范围。" }));
      const request = structuredClone(input);
      const work = this.serialize(async () => {
        await this.running.get(domain3(binding));
        const expected = request.expected;
        const relativePath = expected.id ? `characters/${expected.scope === "char" ? expected.id : expected.parent}/${expected.scope === "chat" ? `chats/${expected.id}.sqlite` : "char.sqlite"}` : undefined;
        const result = {
          scope: expected.scope,
          referenceId: expected.referenceId,
          partial: true,
          file: {
            status: expected.id ? "blocked" : "none",
            ...relativePath ? { relativePath } : {},
            message: expected.id ? "数据库文件尚未清理。" : "原记录没有数据库文件编号。"
          },
          record: { status: "blocked", message: "原管理记录尚未删除。" }
        };
        const blocked = (message) => {
          result.record.message = message;
          if (result.file.status === "blocked")
            result.file.message = message;
          return result;
        };
        let current;
        try {
          current = await this.storage.manageEntities(binding, (records) => records.assertScanRecord(expected, true));
        } catch (error) {
          if (errorData(error).code !== "STALE_IDENTITY")
            throw error;
          result.record = { status: "removed", message: "原记录已清理或对象已变化，请重新扫描。" };
          result.file = { ...result.file, status: "none", message: "本次没有删除文件。" };
          result.partial = false;
          return result;
        }
        if (current.state !== "deleted" && request.observation.status !== "deleted")
          return blocked("原酒馆文件没有确认不存在，请重新扫描核对。");
        if (current.taskReasons.some((reason) => !reason.includes("数据库文件清理")))
          return blocked(current.taskReasons.join("；"));
        if (current.initialization === "creating")
          return blocked("原数据库首次保存尚未确认，请先完成已有恢复操作。");
        let local;
        if (expected.id) {
          local = await this.storage.scan(binding, {
            operation: "file",
            charDbId: expected.scope === "char" ? expected.id : expected.parent,
            ...expected.scope === "chat" ? { chatDbId: expected.id } : {}
          });
          if (local.status === "unknown")
            return blocked(local.reason ?? "无法确认原数据库文件。");
          const protection = await this.storage.manageEntities(binding, (records) => records.protectionReferences({ scope: expected.scope, charDbId: local.charDbId, chatDbId: local.chatDbId }));
          const ownActive = current.state === "active" && current.confirmed ? 1 : 0, ownRetained = current.state === "retained" ? 1 : 0;
          const shared = protection.active > ownActive || protection.retained > ownRetained || protection.unconfirmed > (current.state !== "deleted" && !current.confirmed ? 1 : 0);
          if (local.status === "exists" && !request.removeFile && !shared)
            return blocked("这个数据库文件目前没有共享引用，但本次确认范围没有允许删除文件，请重新扫描选择。");
        }
        const prepared = await this.storage.manageEntities(binding, async (records) => {
          records.ensureRevision(this.revision(binding));
          const result = await records.prepareScanDeletion(expected, request.operationId);
          this.revisions.set(domain3(binding), result.deletion.revision);
          return result;
        });
        this.tasks.set(this.key(binding, prepared.deletion.taskId), prepared.deletion);
        this.changed(binding, deletionTicket(prepared.deletion));
        if (prepared.cleanup) {
          const task = prepared.cleanup;
          const target = {
            storageId: binding.storageId,
            configGeneration: binding.configGeneration,
            scope: task.scope,
            charDbId: task.charDbId,
            ...task.chatDbId ? { chatDbId: task.chatDbId } : {}
          };
          const protection = await this.storage.manageEntities(binding, (records) => records.protectionReferences(target));
          if (protection.active || protection.retained || protection.unconfirmed) {
            result.file = {
              ...result.file,
              status: "shared",
              message: "数据库文件仍被其他有效或保留对象使用，继续保留。"
            };
            await this.storage.manageEntities(binding, (records) => records.updateCleanup(task, "retained", "remaining-reference"));
          } else if (!request.removeFile && local?.status === "exists")
            return blocked("文件引用已改变，本次确认范围没有允许删除文件，请重新扫描。");
          else {
            const tasks = await this.cleanup(binding, task.taskId);
            const outcome = tasks.find((row) => row.taskId === task.taskId);
            if (outcome?.phase !== "done")
              return blocked(outcome?.reason === "permission-required" ? "目录权限不足，文件未确认清理；请恢复授权后重试。" : outcome?.reason === "file-remove-failed" ? "数据库文件删除失败，保留管理记录，请重试。" : "原数据库保存或清理结果尚未确认，保留管理记录，请先核对原操作。");
            result.file = {
              ...result.file,
              status: local?.status === "missing" ? "missing" : "removed",
              message: local?.status === "missing" ? "数据库文件已确认不存在。" : "原数据库文件已精确删除。"
            };
          }
        }
        const after = await this.storage.manageEntities(binding, (records) => records.assertScanRecord(expected, true));
        if (!request.removeRecord || after.parentDependency) {
          result.record = {
            status: "retained",
            message: after.parentDependency ? "保留的聊天仍需要父角色记录定位，管理记录继续保留。" : "本次只确认清理数据库文件，管理记录继续保留。"
          };
          return result;
        }
        if (expected.scope === "char" && await this.storage.manageEntities(binding, (records) => records.hasScanChildren(expected.referenceId)))
          return blocked("父角色下仍有未清理的聊天记录，请先清理所选聊天再处理角色记录。");
        await this.storage.manageEntities(binding, (records) => records.purgeScanRecord(expected));
        await this.storage.manageEntities(binding, (records) => this.load(records, binding));
        result.record = { status: "removed", message: "原管理记录已删除并确认保存。" };
        result.partial = false;
        return result;
      });
      const id = domain3(binding);
      this.scanning.set(id, work);
      work.finally(async () => {
        if (this.scanning.get(id) === work)
          this.scanning.delete(id);
        this.tasks.delete(this.key(binding, request.operationId));
        await this.storage.manageEntities(binding, (records) => records.forgetDeletion(request.operationId));
      }).catch(() => {});
      return work;
    }
    resume(binding) {
      const scanning = this.scanning.get(domain3(binding));
      if (scanning)
        return scanning.then(() => this.resume(binding), () => this.resume(binding));
      const id = domain3(binding), previous = this.running.get(id);
      if (previous)
        return previous;
      const work = this.cleanup(binding);
      this.running.set(id, work);
      work.finally(() => {
        if (this.running.get(id) === work)
          this.running.delete(id);
      }).catch(() => {});
      return work;
    }
    async cleanup(binding, selectedTaskId) {
      const tasks = await this.storage.manageEntities(binding, (records) => records.listCleanupsExisting());
      const results = [];
      for (let task of tasks) {
        if (selectedTaskId && task.taskId !== selectedTaskId)
          continue;
        if (["done", "retained"].includes(task.phase)) {
          results.push(task);
          continue;
        }
        const target = {
          storageId: binding.storageId,
          configGeneration: binding.configGeneration,
          scope: task.scope,
          charDbId: task.charDbId,
          ...task.chatDbId ? { chatDbId: task.chatDbId } : {}
        };
        const update = async (phase, reason) => {
          task = await this.storage.manageEntities(binding, (records) => records.updateCleanup(task, phase, reason));
        };
        try {
          const deletion = this.tasks.get(this.key(binding, task.deletionTaskId));
          if (!deletion || deletion.phase !== "invalidated") {
            await update("blocked", "invalidation-unconfirmed");
            results.push(task);
            continue;
          }
          const check = async (records) => {
            const protection = await records.protectionReferences(target);
            if (protection.active || protection.retained || protection.unconfirmed)
              throw new ServiceError({ code: "IDENTITY_CONFLICT", message: "数据库仍有有效、保留或未确认引用。" });
          };
          const protection = await this.storage.manageEntities(binding, (records) => records.protectionReferences(target));
          if (protection.active || protection.retained || protection.unconfirmed) {
            await update("retained", "remaining-reference");
            results.push(task);
            continue;
          }
          this.storage.sealCleanup(target);
          await this.storage.drainCleanup(target);
          await this.storage.removeCleanupFile(target, check);
          if (!selectedTaskId)
            await this.storage.manageEntities(binding, (records) => records.finishCleanup(task));
          await update("done");
        } catch (error) {
          await update("blocked", errorData(error).code === "PERMISSION_REQUIRED" ? "permission-required" : "file-remove-failed").catch(() => {});
        } finally {
          this.storage.releaseCleanup(target);
        }
        results.push(task);
      }
      return results;
    }
    assertSettled() {
      if (this.discoveries.size || this.running.size || this.scanning.size)
        throw new ServiceError({
          code: "ENTITY_DELETE_UNCONFIRMED",
          resultKind: "identity",
          message: "删除记录或文件清理仍在进行，尚不能确认安全排空。"
        });
    }
  }

  // src/core/sql.ts
  var invalid = (message) => {
    throw new ServiceError({ code: "INVALID_REQUEST", message, failureKind: "request-rejected" });
  };
  function skipHead(sql, emptySeparators = false) {
    let rest = sql;
    while (rest.length) {
      const whitespace = /^\s+/.exec(rest);
      if (whitespace) {
        rest = rest.slice(whitespace[0].length);
        continue;
      }
      if (emptySeparators && rest.startsWith(";")) {
        rest = rest.slice(1);
        continue;
      }
      if (rest.startsWith("--")) {
        const end = rest.search(/[\r\n]/);
        rest = end < 0 ? "" : rest.slice(end);
        continue;
      }
      if (rest.startsWith("/*")) {
        const end = rest.indexOf("*/", 2);
        if (end < 0)
          return invalid("SQL 头部块注释未闭合。");
        rest = rest.slice(end + 2);
        continue;
      }
      break;
    }
    return rest;
  }
  function checkQueryPrefix(sql) {
    checkPrefix(sql, "query");
  }
  var keywords = {
    query: ["SELECT"],
    update: ["INSERT", "UPDATE", "DELETE", "REPLACE"],
    transaction: ["INSERT", "UPDATE", "DELETE", "REPLACE", "CREATE", "ALTER", "DROP"],
    exec: ["CREATE", "ALTER", "DROP"]
  };
  function checkPrefix(sql, method) {
    if (typeof sql !== "string")
      return invalid("SQL 必须是字符串。");
    const head = skipHead(sql);
    const keyword = /^[A-Za-z0-9_$\u0080-\uffff]+/.exec(head)?.[0].toUpperCase();
    if (!keyword || !keywords[method].includes(keyword))
      return invalid(`${method} 只接受 ${keywords[method].join(" / ")} 语句。`);
  }
  function prepareQuery(db, sql) {
    return prepareSingle(db, sql, "query");
  }
  function prepareSingle(db, sql, method) {
    checkPrefix(sql, method);
    const stmt = db.prepare(sql);
    try {
      const remaining = sql.slice(stmt.getSQL().length);
      if (skipHead(remaining, true).length)
        return invalid(`${method} 只接受一条语句，不能附带额外 SQL。`);
      return stmt;
    } catch (error) {
      try {
        stmt.free();
      } catch {}
      throw error;
    }
  }
  function validateCheckedCommands(input) {
    if (!Array.isArray(input) || input.length === 0)
      return invalid("检查事务必须包含命令。");
    const arrayFields = Object.getOwnPropertyDescriptors(input);
    if (Object.getOwnPropertySymbols(input).length || Object.keys(arrayFields).some((key) => key !== "length" && (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= input.length)) || Object.keys(arrayFields).length !== input.length + 1 || Object.entries(arrayFields).some(([key, field]) => key !== "length" && (!("value" in field) || !field.enumerable)))
      return invalid("检查事务命令数组不能包含空位、访问器或额外属性。");
    for (const command of input) {
      if (!command || typeof command !== "object" || Array.isArray(command))
        return invalid("检查事务命令必须是对象。");
      const fields = Object.getOwnPropertyDescriptors(command);
      if (Object.getOwnPropertySymbols(command).length || Object.values(fields).some((field) => !("value" in field) || !field.enumerable))
        return invalid("检查事务命令只能包含普通字段。");
      const kind = fields.kind?.value, sql = fields.sql?.value;
      if (kind !== "check" && kind !== "write")
        return invalid("检查事务命令类型无效。");
      const allowed = kind === "check" ? ["kind", "sql", "binds"] : ["kind", "sql", "binds", "expectChanges"];
      if (Object.keys(fields).some((key) => !allowed.includes(key)))
        return invalid("检查事务命令包含未知字段。");
      checkPrefix(sql, kind === "check" ? "query" : "transaction");
      if (fields.expectChanges) {
        const count = fields.expectChanges.value;
        if (!Number.isSafeInteger(count) || count < 0)
          return invalid("expectChanges 必须是非负安全整数。");
        checkPrefix(sql, "update");
      }
    }
  }

  // src/core/sqlite-errors.ts
  var captured = new WeakSet;

  class SQLiteFailure extends Error {
    sqliteCode;
    original;
    constructor(message, sqliteCode, original) {
      super(message);
      this.sqliteCode = sqliteCode;
      this.original = original;
      this.name = "SQLiteFailure";
      captured.add(this);
    }
  }
  function wrapSQLiteErrors(db) {
    const instance = db;
    const original = instance.handleError;
    if (typeof original !== "function")
      return;
    instance.handleError = function(returnCode) {
      try {
        return original.call(db, returnCode);
      } catch (error) {
        if (!Number.isInteger(returnCode))
          throw error;
        throw new SQLiteFailure(error instanceof Error ? error.message : String(error), returnCode, error);
      }
    };
  }
  function sqliteCode(error) {
    return error && typeof error === "object" && captured.has(error) ? error.sqliteCode : undefined;
  }
  function sqliteFailureKind(error, phase) {
    const code = sqliteCode(error);
    if (phase === "binding" && code === 25)
      return "request-rejected";
    if (["command", "binding", "commit"].includes(phase) && (code === 19 || code === 20))
      return "sql-rejected";
    return "service";
  }

  // src/viewer-contracts.ts
  var VIEWER_LIMITS = Object.freeze({
    rows: 20000,
    columns: 200,
    resultBytes: 16 * 1024 * 1024,
    detailCharacters: 1048576,
    previewCharacters: 100
  });

  // src/core/viewer-read.ts
  var invalid2 = (message) => {
    throw new ServiceError({ code: "INVALID_REQUEST", message });
  };
  var exceeded = (message) => {
    throw new ServiceError({ code: "VIEWER_LIMIT_EXCEEDED", message });
  };
  var quote = (name) => `"${name.replaceAll('"', '""')}"`;
  function query(db, sql, binds = []) {
    const stmt = db.prepare(sql);
    try {
      stmt.bind(binds);
      const rows = [];
      while (stmt.step())
        rows.push(stmt.get());
      return rows;
    } finally {
      stmt.free();
    }
  }
  function tables(db) {
    return query(db, "SELECT name FROM pragma_table_list WHERE schema='main' AND type='table' AND name IN (SELECT name FROM sqlite_master WHERE type='table') ORDER BY name").map((r) => String(r[0]));
  }
  function schema(db, table) {
    const rows = query(db, "SELECT name,type,pk,hidden FROM pragma_table_xinfo(?) ORDER BY cid", [table]);
    if (rows.length > VIEWER_LIMITS.columns)
      exceeded(`当前表超过 ${VIEWER_LIMITS.columns} 列，未读取预览。`);
    const columns = rows.filter((r) => r[3] !== 1).map((r) => ({ name: String(r[0]), declaredType: String(r[1]), primaryKeyOrder: Number(r[2]), sortable: true }));
    const keys = [];
    const primary = columns.filter((c) => c.primaryKeyOrder).sort((a, b) => a.primaryKeyOrder - b.primaryKeyOrder).map((c) => c.name);
    if (primary.length)
      keys.push(primary);
    const indices = query(db, 'SELECT name FROM pragma_index_list(?) WHERE "unique"=1 AND partial=0 ORDER BY seq', [
      table
    ]);
    for (const row of indices) {
      const parts = query(db, "SELECT cid,name,coll FROM pragma_index_xinfo(?) WHERE key=1 ORDER BY seqno", [row[0]]);
      if (parts.length && parts.every((p) => Number(p[0]) >= 0 && typeof p[1] === "string" && columns.some((c) => c.name === p[1]))) {
        const key = parts.map((p) => String(p[1]));
        if (!keys.some((k) => JSON.stringify(k) === JSON.stringify(key)))
          keys.push(key);
      }
    }
    return { columns, keys };
  }
  function cell(type, value, length) {
    if (type === "null")
      return { type: "null" };
    if (type === "blob")
      return { type: "blob", bytes: Number(length) };
    if (type === "text")
      return { type: "text", value: String(value), truncated: Number(length) === 1 };
    if (type === "integer" && !Number.isSafeInteger(Number(value)))
      exceeded("当前表包含超出 JavaScript 安全整数范围的数字，无法准确预览；未返回舍入后的数据。");
    if (type === "integer" || type === "real")
      return { type, value: Number(value) };
    return invalid2("数据库返回了未支持的实际值类型。");
  }
  function projected(name, characters) {
    const c = quote(name), preview = `substr(${c},1,${characters})`;
    return `typeof(${c}),CASE typeof(${c}) WHEN 'text' THEN ${preview} WHEN 'integer' THEN CAST(${c} AS TEXT) WHEN 'blob' THEN NULL ELSE ${c} END,CASE typeof(${c}) WHEN 'blob' THEN length(${c}) WHEN 'text' THEN length(CAST(${c} AS BLOB))>length(CAST(${preview} AS BLOB)) ELSE 0 END`;
  }
  function readViewer(db, request) {
    if (!request || !["tables", "table", "ddl", "detail"].includes(request.operation))
      invalid2("不支持的数据库查看操作。");
    const names = tables(db);
    if (request.operation === "tables")
      return { tables: names };
    if (typeof request.table !== "string" || !names.includes(request.table))
      invalid2("指定表不存在或不是可查看的普通数据表。");
    const table = request.table;
    if (request.operation === "ddl")
      return {
        table,
        ddl: query(db, "SELECT sql FROM sqlite_master WHERE type='table' AND name=?", [table])[0]?.[0] ?? null
      };
    const info = schema(db, table);
    if (request.operation === "detail") {
      const key = request.key;
      if (!info.columns.some((c) => c.name === request.column) || !key || !Array.isArray(key.columns) || !Array.isArray(key.values) || key.columns.length !== key.values.length || !info.keys.some((k) => JSON.stringify(k) === JSON.stringify(key.columns)) || key.values.some((v) => typeof v !== "string" && (typeof v !== "number" || !Number.isFinite(v) || Number.isInteger(v) && !Number.isSafeInteger(v))))
        invalid2("文本详情需要完整、非 NULL、非二进制的可靠键值。");
      const rows = query(db, `SELECT ${projected(request.column, VIEWER_LIMITS.detailCharacters)} FROM ${quote(table)} WHERE ${key.columns.map((c) => `${quote(c)} COLLATE BINARY = ?`).join(" AND ")} LIMIT 2`, key.values);
      if (rows.length > 1)
        invalid2("键值对应多条记录，无法可靠定位详情。");
      if (!rows.length)
        return { found: false };
      const value = cell(...rows[0]);
      if (value.type !== "text")
        return { found: true, type: value.type };
      return { found: true, type: "text", text: value.value, truncated: value.truncated };
    }
    if (!info.columns.length)
      invalid2("当前表没有可读取字段。");
    const locatorColumns = [...new Set(info.keys.flat())];
    const locator = locatorColumns.flatMap((c) => [
      `CASE WHEN typeof(${quote(c)})='text' AND instr(${quote(c)},char(0))>0 THEN 'invalid' ELSE typeof(${quote(c)}) END`,
      `CASE WHEN typeof(${quote(c)})='blob' OR typeof(${quote(c)})='text' AND instr(${quote(c)},char(0))>0 THEN NULL ELSE ${quote(c)} END`
    ]);
    const sql = `SELECT ${info.columns.map((c) => projected(c.name, VIEWER_LIMITS.previewCharacters)).join(",")}${locator.length ? `,${locator.join(",")}` : ""} FROM ${quote(table)} LIMIT ${VIEWER_LIMITS.rows + 1}`;
    const stmt = db.prepare(sql);
    const result = {
      table,
      columns: info.columns,
      rows: [],
      keyColumns: info.keys[0] ?? [],
      initialSortColumns: info.columns.filter((c) => c.primaryKeyOrder).sort((a, b) => a.primaryKeyOrder - b.primaryKeyOrder).map((c) => c.name)
    };
    let bytes = new TextEncoder().encode(JSON.stringify(result)).byteLength;
    try {
      while (stmt.step()) {
        if (result.rows.length === VIEWER_LIMITS.rows)
          exceeded(`当前表超过 ${VIEWER_LIMITS.rows} 行，未返回不完整预览。`);
        const raw = stmt.get();
        const cells = info.columns.map((_, i) => cell(raw[i * 3], raw[i * 3 + 1], raw[i * 3 + 2]));
        const values = new Map(locatorColumns.map((c, i) => [
          c,
          { type: raw[info.columns.length * 3 + i * 2], value: raw[info.columns.length * 3 + i * 2 + 1] }
        ]));
        const key = info.keys.find((k) => k.every((c) => {
          const entry = values.get(c);
          return entry.type === "text" && typeof entry.value === "string" && !entry.value.includes("\x00") || (entry.type === "integer" || entry.type === "real") && typeof entry.value === "number" && Number.isFinite(entry.value) && (!Number.isInteger(entry.value) || Number.isSafeInteger(entry.value));
        }));
        const row = {
          cells,
          ...key ? { key: { columns: key, values: key.map((c) => values.get(c).value) } } : {}
        };
        bytes += new TextEncoder().encode(JSON.stringify(row)).byteLength;
        if (bytes > VIEWER_LIMITS.resultBytes)
          exceeded("当前表预览及完整键值超过 16 MiB，未返回不完整预览。");
        result.rows.push(row);
      }
    } finally {
      stmt.free();
    }
    for (let i = 0;i < result.columns.length; i++)
      if (result.rows.some((r) => r.cells[i]?.type === "blob"))
        result.columns[i].sortable = false;
    if (result.initialSortColumns.some((c) => !result.columns.find((v) => v.name === c)?.sortable))
      result.initialSortColumns = [];
    return result;
  }

  // src/core/database.ts
  class PersistenceFailure extends ServiceError {
    stage;
    fileState;
    constructor(data, stage, fileState) {
      super(data);
      this.stage = stage;
      this.fileState = fileState;
    }
  }
  var META2 = "__stsh_meta";

  class SingleDatabase {
    SQL;
    storage;
    onBackgroundSaveFailed;
    db;
    state = "new";
    transient = false;
    initializationCommitted = false;
    dirty = false;
    saveTimer;
    saveTask;
    savesSealed = false;
    firstSaveHooks;
    fileBaseline;
    tail = Promise.resolve();
    constructor(SQL, storage, onBackgroundSaveFailed) {
      this.SQL = SQL;
      this.storage = storage;
      this.onBackgroundSaveFailed = onBackgroundSaveFailed;
    }
    get availability() {
      return this.state;
    }
    get hasPendingFirstCommit() {
      return this.transient && this.initializationCommitted;
    }
    sealBackgroundSaves() {
      this.savesSealed = true;
      const cancelled = this.saveTask !== undefined;
      this.cancelPendingSave();
      return cancelled;
    }
    resumeBackgroundSaves(cancelled) {
      if (this.state !== "ready")
        return;
      this.savesSealed = false;
      if (cancelled && this.dirty)
        this.scheduleSave();
    }
    drain() {
      return this.enqueue(async () => {});
    }
    close() {
      this.sealBackgroundSaves();
      return this.enqueue(async () => {
        this.disable();
      });
    }
    closeForRestart() {
      this.sealBackgroundSaves();
      const db = this.db;
      this.db = undefined;
      this.state = "disabled";
      this.dirty = false;
      this.firstSaveHooks = undefined;
      db?.close();
    }
    enqueue(task) {
      const result = this.tail.then(task);
      this.tail = result.catch(() => {
        return;
      });
      return result;
    }
    disable() {
      this.cancelPendingSave();
      this.state = "disabled";
      this.transient = false;
      this.initializationCommitted = false;
      this.dirty = false;
      this.firstSaveHooks = undefined;
      this.fileBaseline = undefined;
      const db = this.db;
      this.db = undefined;
      try {
        db?.close();
      } catch {}
    }
    ready() {
      if (this.state !== "ready" || !this.db)
        throw new ServiceError({
          code: this.state === "new" ? "NOT_INITIALIZED" : "INSTANCE_DISABLED",
          message: this.state === "new" ? "数据库尚未打开，本次 SQL 未执行；请先初始化存储。" : "数据库实例已停用，本次 SQL 未执行；请先从文件恢复数据库。"
        });
      return this.db;
    }
    configure(db) {
      db.run("PRAGMA foreign_keys = ON");
    }
    async persist(db, create = false, management = false) {
      let bytes;
      try {
        bytes = db.export();
        this.configure(db);
      } catch (error) {
        this.disable();
        throw new PersistenceFailure({
          code: "SAVE_FAILED",
          failureKind: "service",
          message: `导出失败，修改未保存：${detail(error).message}`,
          saveError: detail(error),
          businessResult: management ? "not-started" : "not-saved"
        }, "export", "not-saved");
      }
      try {
        await this.storage.write(bytes, { create });
      } catch (error) {
        if (management)
          this.disable();
        throw new PersistenceFailure({
          code: "RESULT_UNCONFIRMED",
          failureKind: "service",
          message: `保存失败，无法确认修改是否落盘：${detail(error).message}`,
          saveError: detail(error),
          businessResult: management ? "not-started" : "unknown",
          resultState: "unconfirmed",
          retryable: false
        }, "write", "unknown");
      }
      this.transient = false;
      try {
        this.fileBaseline = await this.storage.metadata?.();
      } catch (error) {
        if (management)
          this.disable();
        throw new PersistenceFailure({
          code: "LOAD_FAILED",
          failureKind: "service",
          message: `${management ? "管理记录" : "数据库"}已保存，但读取文件信息失败：${detail(error).message}`,
          causeError: detail(error),
          businessResult: management ? "not-started" : "saved",
          ...management ? {} : { databasePersisted: true }
        }, "metadata", "saved");
      }
    }
    cancelPendingSave() {
      clearTimeout(this.saveTimer);
      this.saveTimer = undefined;
      this.saveTask = undefined;
    }
    scheduleSave() {
      this.cancelPendingSave();
      if (this.savesSealed || !this.dirty || this.state !== "ready")
        return;
      const task = {}, db = this.db;
      this.saveTask = task;
      this.saveTimer = setTimeout(() => {
        this.saveTimer = undefined;
        this.enqueue(async () => {
          if (this.saveTask !== task || this.db !== db || this.savesSealed || !this.dirty || this.state !== "ready")
            return;
          this.saveTask = undefined;
          let stage = "registration", fileState = "not-saved";
          try {
            await this.firstSaveHooks?.beforeSave?.();
            await this.persist(db, this.transient);
            fileState = "saved";
            await this.firstSaveHooks?.afterSave?.();
            this.firstSaveHooks = undefined;
            this.dirty = false;
          } catch (error) {
            if (error instanceof PersistenceFailure) {
              stage = error.stage;
              fileState = error.fileState;
            }
            const data = errorData(error), memoryAvailable = this.availability === "ready";
            const failure = {
              stage,
              fileState,
              memoryAvailable,
              error: {
                ...data,
                failureKind: "service",
                executionState: "committed",
                databasePersisted: fileState === "saved" ? true : undefined,
                message: `${data.message}。${memoryAvailable ? "内存中的修改仍可读取；关闭或重新加载后可能丢失未保存修改。" : "当前内存实例已不可用。"}请勿重复提交原 SQL。`
              }
            };
            try {
              this.onBackgroundSaveFailed?.(failure);
            } catch {}
          }
        });
      }, 1000);
      this.saveTimer.unref?.();
    }
    open() {
      return this.enqueue(() => this.load("create"));
    }
    openExisting() {
      return this.refresh();
    }
    openTransient() {
      return this.enqueue(() => this.load("transient"));
    }
    cancelPendingSaveForReload() {
      if (!this.hasPendingFirstCommit)
        this.cancelPendingSave();
    }
    refresh() {
      this.cancelPendingSaveForReload();
      return this.enqueue(async () => {
        if (this.transient && this.initializationCommitted)
          throw new ServiceError({
            code: "DATABASE_NOT_INITIALIZED",
            failureKind: "service",
            message: "数据库文件尚未创建，不能重新加载；当前内存数据仍可用。"
          });
        await this.load("existing");
      });
    }
    refreshIfChanged() {
      return this.enqueue(async () => {
        if (this.state !== "ready" || this.transient || !this.fileBaseline || !this.storage.metadata)
          return false;
        try {
          const current = await this.storage.metadata();
          if (current.lastModified <= this.fileBaseline.lastModified && current.size === this.fileBaseline.size)
            return false;
          await this.load("existing");
          return true;
        } catch (error) {
          this.disable();
          if (error instanceof ServiceError)
            throw error;
          throw new ServiceError({
            code: "LOAD_FAILED",
            message: `自动重新加载失败：${detail(error).message}`,
            causeError: detail(error),
            retryable: fileRetryable(error)
          });
        }
      });
    }
    async load(mode = "existing") {
      this.disable();
      try {
        const snapshot = this.storage.readSnapshot ? await this.storage.readSnapshot() : { bytes: await this.storage.read() };
        const bytes = snapshot.bytes;
        if (mode === "existing" && bytes === null)
          throw new Error("已有数据库文件缺失，不能自动重建或确认原操作结果。");
        if (mode === "transient" && bytes !== null)
          throw new Error("首次初始化位置已有文件，拒绝覆盖。");
        if (bytes && bytes.length === 0)
          throw new Error("已有数据库文件为空。");
        this.db = new this.SQL.Database(bytes);
        wrapSQLiteErrors(this.db);
        this.configure(this.db);
        this.db.exec("SELECT name FROM sqlite_master LIMIT 1");
        if (bytes === null) {
          this.db.run("PRAGMA user_version = 0");
          if (mode === "create")
            await this.persist(this.db, true, true);
          else
            this.transient = true;
        } else
          this.fileBaseline = snapshot.metadata ?? await this.storage.metadata?.();
        this.state = "ready";
        this.savesSealed = false;
      } catch (error) {
        this.disable();
        if (error instanceof ServiceError)
          throw error;
        throw new ServiceError({
          code: "LOAD_FAILED",
          message: `读取或打开数据库文件失败，实例不可用：${detail(error).message}`,
          causeError: detail(error),
          retryable: fileRetryable(error)
        });
      }
    }
    async checkFile() {
      this.ready();
      if (this.transient)
        return;
      try {
        if (this.storage.assertExisting)
          await this.storage.assertExisting();
        else {
          const bytes = await this.storage.read();
          if (!bytes || !bytes.length)
            throw new Error(bytes === null ? "已有数据库文件缺失。" : "已有数据库文件为空。");
        }
      } catch (error) {
        this.disable();
        if (error instanceof ServiceError && error.data.code === "PERMISSION_REQUIRED")
          throw error;
        throw new ServiceError({
          code: "LOAD_FAILED",
          message: `已有数据库文件不可用，缓存已停用：${detail(error).message}`,
          causeError: detail(error),
          retryable: fileRetryable(error)
        });
      }
    }
    assertFileExisting() {
      return this.enqueue(() => this.checkFile());
    }
    fileExists() {
      return this.enqueue(async () => {
        try {
          const bytes = await this.storage.read();
          if (bytes === null)
            return false;
          if (!bytes.length)
            throw new Error("已有数据库文件为空。");
          return true;
        } catch (error) {
          if (error instanceof ServiceError && error.data.code === "PERMISSION_REQUIRED")
            throw error;
          throw new ServiceError({
            code: "LOAD_FAILED",
            message: `无法核对数据库文件：${detail(error).message}`,
            causeError: detail(error),
            retryable: fileRetryable(error)
          });
        }
      });
    }
    getInitializationMarker() {
      return this.enqueue(async () => {
        try {
          return this.initializationMarker(this.ready());
        } catch (error) {
          this.disable();
          throw new ServiceError({
            code: "LOAD_FAILED",
            message: `数据库身份无法读取：${detail(error).message}`,
            causeError: detail(error),
            retryable: false
          });
        }
      });
    }
    initializationMarker(db) {
      let marker;
      if (db.exec(`SELECT 1 FROM sqlite_master WHERE type='table' AND name='${META2}'`).length) {
        const rows = db.exec(`SELECT value FROM ${META2} WHERE key='identity'`)[0]?.values;
        if (rows?.length) {
          marker = JSON.parse(String(rows[0][0]));
          if (!marker || typeof marker !== "object")
            throw new Error("数据库身份内容无效。");
        }
      }
      if (marker && (!["char", "chat"].includes(marker.scope) || typeof marker.charDbId !== "string" || !marker.charDbId || marker.scope === "chat" && (typeof marker.chatDbId !== "string" || !marker.chatDbId)))
        throw new Error("数据库身份字段无效。");
      return marker;
    }
    storeInitialization(db, identity) {
      if (identity && (!["char", "chat"].includes(identity.scope) || !identity.charDbId || identity.scope === "chat" && !identity.chatDbId))
        throw new Error("数据库身份字段无效。");
      if (identity) {
        db.run(`CREATE TABLE IF NOT EXISTS ${META2} (key TEXT PRIMARY KEY, value TEXT NOT NULL)`);
        db.run(`INSERT OR REPLACE INTO ${META2} VALUES ('identity', ?)`, [JSON.stringify(identity)]);
      }
    }
    transaction(commands, onComplete = () => {}, hooks = {}) {
      const snapshot = structuredClone(commands), initialization = hooks.initialization && structuredClone(hooks.initialization), management = hooks.management === true;
      return this.enqueue(async () => {
        let db;
        const firstCommit = this.transient && !this.initializationCommitted;
        try {
          db = this.ready();
          if (firstCommit && !initialization)
            throw new ServiceError({
              code: "INVALID_REQUEST",
              failureKind: "request-rejected",
              message: "首次提交必须提供数据库身份。"
            });
          if (initialization && !firstCommit)
            throw new ServiceError({
              code: "INVALID_REQUEST",
              failureKind: "request-rejected",
              message: "已有内存数据库不能重复初始化。"
            });
          if (this.storage.assertExisting && !this.transient)
            await this.checkFile();
          hooks.beforeExecute?.();
        } catch (error) {
          throw new ServiceError({
            ...errorData(error),
            executionState: "not-started",
            businessResult: "not-started",
            databasePersisted: undefined
          });
        }
        let started = false;
        let phase = "begin";
        try {
          db.run("BEGIN TRANSACTION");
          started = true;
          phase = "identity";
          this.storeInitialization(db, initialization);
          phase = "command";
          for (const command of snapshot)
            this.executeCommand(db, command);
          phase = "commit";
          db.run("COMMIT");
        } catch (sqlError) {
          const original = errorData(sqlError), failureKind = management ? "service" : phase === "command" && sqlError instanceof ServiceError ? original.failureKind ?? "service" : sqliteFailureKind(sqlError, phase);
          if (!started)
            throw new ServiceError({
              code: "SQL_FAILED",
              message: `事务未开始：${detail(sqlError).message}`,
              failureKind,
              executionState: "not-started",
              sqlError: detail(sqlError),
              businessResult: "not-started"
            });
          try {
            db.run("ROLLBACK");
          } catch (rollbackError) {
            this.disable();
            throw new ServiceError({
              code: "ROLLBACK_FAILED",
              failureKind,
              executionState: management ? "not-started" : "unknown",
              resultState: "unconfirmed",
              message: `SQL 失败且回滚失败，无法确认事务结果，实例已停用：${detail(sqlError).message}`,
              sqlError: original.sqlError ?? detail(sqlError),
              rollbackError: detail(rollbackError),
              businessResult: management ? "not-started" : "unknown"
            });
          }
          if (firstCommit)
            this.disable();
          throw new ServiceError({
            ...sqlError instanceof ServiceError ? original : {
              code: "SQL_FAILED",
              message: `SQL 执行失败，事务已回滚：${detail(sqlError).message}`,
              sqlError: detail(sqlError)
            },
            failureKind,
            executionState: management ? "not-started" : "rolled-back",
            businessResult: management ? "not-started" : "not-saved",
            databasePersisted: undefined
          });
        }
        this.dirty = true;
        if (firstCommit) {
          this.initializationCommitted = true;
          this.firstSaveHooks = { beforeSave: hooks.beforeSave, afterSave: hooks.afterSave };
        }
        if (management) {
          try {
            await this.persist(db, this.transient, true);
          } catch (error) {
            throw new ServiceError({ ...errorData(error), executionState: "not-started", databasePersisted: undefined });
          }
          this.dirty = false;
          this.cancelPendingSave();
          try {
            onComplete();
          } catch (error) {
            throw new ServiceError({
              ...errorData(error),
              businessResult: "not-started",
              executionState: "not-started",
              databasePersisted: undefined
            });
          }
          return { persisted: true };
        }
        this.scheduleSave();
        try {
          onComplete();
        } catch (error) {
          throw new ServiceError({
            ...errorData(error),
            executionState: "committed",
            businessResult: undefined,
            databasePersisted: undefined
          });
        }
        return { committed: true, persisted: false };
      });
    }
    executeCommand(db, command) {
      if (command.mode === "runSql") {
        db.run(command.sql);
        return;
      }
      if (command.mode === "exec") {
        checkPrefix(command.sql, "exec");
        let remaining = command.sql;
        while ((remaining = skipHead(remaining, true)).length) {
          checkPrefix(remaining, "exec");
          const stmt = db.prepare(remaining);
          let failed = false;
          try {
            remaining = remaining.slice(stmt.getSQL().length);
            while (stmt.step()) {}
          } catch (error) {
            failed = true;
            throw error;
          } finally {
            try {
              stmt.free();
            } catch (error) {
              if (!failed)
                throw error;
            }
          }
        }
        return;
      }
      if (command.expectChanges !== undefined) {
        if (!Number.isSafeInteger(command.expectChanges) || command.expectChanges < 0 || command.kind !== "write")
          throw new ServiceError({
            code: "INVALID_REQUEST",
            failureKind: "request-rejected",
            message: "影响行数检查参数无效。"
          });
        checkPrefix(command.sql, "update");
      }
      const stmt = command.kind === "check" ? prepareQuery(db, command.sql) : command.kind === "write" ? prepareSingle(db, command.sql, "transaction") : command.mode ? prepareSingle(db, command.sql, command.mode) : db.prepare(command.sql);
      let failed = false;
      try {
        if (command.binds) {
          try {
            stmt.bind(command.binds);
          } catch (error) {
            throw new ServiceError({
              code: "SQL_FAILED",
              failureKind: sqliteFailureKind(error, "binding"),
              message: `绑定参数失败：${detail(error).message}`,
              sqlError: detail(error)
            });
          }
        }
        if (command.kind === "check") {
          if (stmt.getColumnNames().length !== 1 || !stmt.step() || stmt.get()[0] !== 1 || stmt.step())
            throw new ServiceError({
              code: "SQL_FAILED",
              failureKind: "precondition-rejected",
              message: "事务检查条件未通过，必须返回恰好一行一列且数值为 1。"
            });
        } else {
          while (stmt.step()) {}
          if (command.expectChanges !== undefined && db.getRowsModified() !== command.expectChanges)
            throw new ServiceError({
              code: "SQL_FAILED",
              failureKind: "precondition-rejected",
              message: `事务写入影响行数与要求的 ${command.expectChanges} 行不符。`
            });
        }
      } catch (error) {
        failed = true;
        throw error;
      } finally {
        try {
          stmt.free();
        } catch (error) {
          if (!failed)
            throw error;
        }
      }
    }
    query(command, beforeExecute) {
      const snapshot = structuredClone(command);
      return this.enqueue(async () => {
        const db = this.ready();
        if (this.storage.assertExisting && !this.transient)
          await this.checkFile();
        beforeExecute?.();
        try {
          const stmt = prepareQuery(db, snapshot.sql);
          let failed = false;
          try {
            if (snapshot.binds) {
              try {
                stmt.bind(snapshot.binds);
              } catch (error) {
                throw new ServiceError({
                  code: "SQL_FAILED",
                  failureKind: sqliteFailureKind(error, "binding"),
                  message: `查询参数绑定失败：${detail(error).message}`,
                  sqlError: detail(error)
                });
              }
            }
            const columns = stmt.getColumnNames();
            const rows = [];
            while (stmt.step())
              rows.push(stmt.get().map((value) => value instanceof Uint8Array ? value.slice() : value));
            return { columns, rows };
          } catch (error) {
            failed = true;
            throw error;
          } finally {
            try {
              stmt.free();
            } catch (error) {
              if (!failed)
                throw error;
            }
          }
        } catch (error) {
          if (error instanceof ServiceError)
            throw error;
          throw new ServiceError({
            code: "SQL_FAILED",
            failureKind: "service",
            message: `执行查询失败：${detail(error).message}；请检查 SQL、参数和表结构。`,
            sqlError: detail(error)
          });
        }
      });
    }
    viewer(request, beforeExecute) {
      if (!request || typeof request !== "object" || !["tables", "table", "ddl", "detail", "file"].includes(request.operation))
        return Promise.reject(new ServiceError({ code: "INVALID_REQUEST", message: "不支持的数据库查看操作。" }));
      const snapshot = structuredClone(request);
      return this.enqueue(async () => {
        const db = this.ready();
        await this.checkFile();
        beforeExecute?.();
        if (snapshot.operation === "file") {
          if (this.transient)
            throw new ServiceError({
              code: "DATABASE_NOT_INITIALIZED",
              failureKind: "service",
              message: "内存数据库可用，但数据库文件尚未创建，没有可显示的文件大小或保存时间。"
            });
          if (!this.storage.metadata)
            throw new ServiceError({ code: "UNSUPPORTED_ENVIRONMENT", message: "当前存储未提供实际文件信息。" });
          try {
            return await this.storage.metadata();
          } catch (error) {
            if (error instanceof ServiceError)
              throw error;
            throw new ServiceError({
              code: "LOAD_FAILED",
              message: `无法读取数据库的实际文件信息：${detail(error).message}`,
              causeError: detail(error),
              retryable: fileRetryable(error)
            });
          }
        }
        try {
          return readViewer(db, snapshot);
        } catch (error) {
          if (error instanceof ServiceError)
            throw error;
          throw new ServiceError({
            code: "SQL_FAILED",
            message: `数据库查看查询失败：${detail(error).message}`,
            sqlError: detail(error)
          });
        }
      });
    }
  }

  // src/worker/storage.ts
  async function directoryPermission(directory) {
    if (!("queryPermission" in directory))
      return "granted";
    return directory.queryPermission({ mode: "readwrite" });
  }

  class DirectoryStorage {
    directory;
    charDbId;
    chatDbId;
    opfs;
    constructor(directory, charDbId, chatDbId, opfs = false) {
      this.directory = directory;
      this.charDbId = charDbId;
      this.chatDbId = chatDbId;
      this.opfs = opfs;
    }
    async target(create) {
      if (!this.charDbId)
        return this.directory;
      const characters = await this.directory.getDirectoryHandle("characters", { create });
      const character = await characters.getDirectoryHandle(this.charDbId, { create });
      return this.chatDbId ? character.getDirectoryHandle("chats", { create }) : character;
    }
    filename() {
      return this.chatDbId ? `${this.chatDbId}.sqlite` : this.charDbId ? "char.sqlite" : "global.sqlite";
    }
    async metadata() {
      await this.permission();
      const file = await (await (await this.target(false)).getFileHandle(this.filename(), { create: false })).getFile();
      return {
        directoryName: this.directory.name,
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
        relativePath: this.charDbId ? `characters/${this.charDbId}/${this.chatDbId ? `chats/${this.chatDbId}.sqlite` : "char.sqlite"}` : "global.sqlite"
      };
    }
    async remove() {
      if (!isUuid(this.charDbId) || this.chatDbId !== undefined && !isUuid(this.chatDbId))
        throw new ServiceError({
          code: "INVALID_REQUEST",
          message: "文件清理必须指定有效的角色或聊天 UUID，不能删除 root。"
        });
      await this.permission();
      let directory;
      try {
        directory = await this.target(false);
      } catch (error) {
        if (error instanceof DOMException && error.name === "NotFoundError")
          return;
        throw error;
      }
      try {
        await directory.removeEntry(this.filename());
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "NotFoundError"))
          throw error;
      }
      try {
        await directory.getFileHandle(this.filename(), { create: false });
      } catch (error) {
        if (error instanceof DOMException && error.name === "NotFoundError")
          return;
        throw error;
      }
      throw new ServiceError({
        code: "RESULT_UNCONFIRMED",
        resultState: "unconfirmed",
        message: "文件删除后仍存在，清理结果尚未确认。"
      });
    }
    async permission() {
      if (this.opfs)
        return;
      if (await directoryPermission(this.directory) !== "granted")
        throw new ServiceError({ code: "PERMISSION_REQUIRED", message: "请在页面点击重新授权目录，再从文件恢复。" });
    }
    async read() {
      return (await this.readSnapshot()).bytes;
    }
    async readSnapshot() {
      await this.permission();
      let file;
      try {
        file = await (await this.target(false)).getFileHandle(this.filename());
      } catch (error) {
        if (error instanceof DOMException && error.name === "NotFoundError")
          return { bytes: null };
        throw error;
      }
      const current = await file.getFile();
      return {
        bytes: new Uint8Array(await current.arrayBuffer()),
        metadata: {
          directoryName: this.directory.name,
          name: current.name,
          size: current.size,
          lastModified: current.lastModified,
          relativePath: this.charDbId ? `characters/${this.charDbId}/${this.chatDbId ? `chats/${this.chatDbId}.sqlite` : "char.sqlite"}` : "global.sqlite"
        }
      };
    }
    async assertExisting() {
      await this.permission();
      const file = await (await this.target(false)).getFileHandle(this.filename(), { create: false });
      if ((await file.getFile()).size === 0)
        throw new Error("已有数据库文件为空。");
    }
    async write(bytes, options = {}) {
      await this.permission();
      const create = options.create === true;
      const file = await (await this.target(create)).getFileHandle(this.filename(), { create });
      const writer = await file.createWritable();
      try {
        await writer.write(bytes);
        await writer.close();
      } catch (error) {
        try {
          await writer.abort();
        } catch {}
        throw error;
      }
    }
  }

  // src/worker/configuration-repository.ts
  var failed = (error) => new ServiceError({
    code: "CONFIG_FAILED",
    message: `读取或保存 IndexedDB 目录配置失败：${detail(error).message}`,
    causeError: detail(error)
  });

  class IndexedDbConfiguration {
    connection;
    open() {
      if (!this.connection)
        this.connection = new Promise((resolve, reject) => {
          const request = indexedDB.open("st-sqlite-helper-storage", 1);
          let rejected = false;
          request.onupgradeneeded = () => {
            request.result.createObjectStore("configuration");
          };
          request.onerror = () => {
            rejected = true;
            reject(failed(request.error));
          };
          request.onblocked = () => {
            rejected = true;
            reject(failed("IndexedDB 升级被阻塞。"));
          };
          request.onsuccess = () => {
            if (rejected) {
              request.result.close();
              return;
            }
            request.result.onversionchange = () => {
              request.result.close();
              this.connection = undefined;
            };
            resolve(request.result);
          };
        }).catch((error) => {
          this.connection = undefined;
          throw error;
        });
      return this.connection;
    }
    async read() {
      try {
        const db = await this.open();
        return await new Promise((resolve, reject) => {
          const transaction = db.transaction("configuration", "readonly");
          const request = transaction.objectStore("configuration").get("current");
          let result = null;
          request.onsuccess = () => {
            result = request.result ?? null;
          };
          transaction.oncomplete = () => resolve(result);
          transaction.onabort = () => reject(transaction.error ?? request.error);
          transaction.onerror = () => {};
        });
      } catch (error) {
        throw failed(error);
      }
    }
    async write(configuration) {
      try {
        const db = await this.open();
        await new Promise((resolve, reject) => {
          const transaction = db.transaction("configuration", "readwrite");
          const request = transaction.objectStore("configuration").put(configuration, "current");
          transaction.oncomplete = () => resolve();
          transaction.onabort = () => reject(transaction.error ?? request.error);
          transaction.onerror = () => {};
        });
      } catch (error) {
        throw failed(error);
      }
    }
  }

  // src/worker/write-errors.ts
  function beforeBusinessSqlError(error) {
    const data = errorData(error);
    return new ServiceError({
      ...data,
      failureKind: data.failureKind ?? "service",
      executionState: "not-started",
      businessResult: "not-started",
      databasePersisted: undefined,
      resultState: "not-applied",
      retryable: false
    });
  }

  // src/worker/target-lifecycle.ts
  var rootInitializations = new WeakMap;
  var key = (b) => [b.scope, b.charDbId, b.chatDbId ?? ""];
  var failed2 = (message) => new ServiceError({ code: "LOAD_FAILED", message });
  var notInitialized = (b) => new ServiceError({
    code: "DATABASE_NOT_INITIALIZED",
    message: `${b.scope === "chat" ? "聊天" : "角色"}数据库尚未创建，请先由业务写入。`,
    databaseScope: b.scope,
    resultKind: "database"
  });

  class RootTargets {
    root;
    readOnly;
    initialized = false;
    constructor(root, readOnly = false) {
      this.root = root;
      this.readOnly = readOnly;
    }
    invalidate() {
      this.initialized = false;
    }
    async validateExisting() {
      const names = (await this.root.query({
        sql: "SELECT name FROM sqlite_master WHERE name GLOB '__stsh_*' OR name GLOB '__st_sle_helper_*'"
      })).rows.map((row) => String(row[0]));
      if (names.some((name) => name.startsWith("__st_sle_helper_")))
        throw failed2("数据库包含已停止支持的旧管理结构，请使用当前结构的数据文件。");
      if (names.length)
        await assertSchema6(this.root);
    }
    async ready() {
      if (this.root.availability !== "ready") {
        this.initialized = false;
        await this.root.refresh();
      }
      await this.root.assertFileExisting();
      if (this.initialized)
        return;
      if (this.readOnly) {
        await assertSchema6(this.root);
        this.initialized = true;
        return;
      }
      let pending = rootInitializations.get(this.root);
      if (!pending) {
        pending = this.initialize().finally(() => rootInitializations.delete(this.root));
        rootInitializations.set(this.root, pending);
      }
      await pending;
      this.initialized = true;
    }
    async initialize() {
      if ((await this.root.query({ sql: "SELECT name FROM sqlite_master WHERE name GLOB '__st_sle_helper_*'" })).rows.length)
        throw failed2("数据库包含已停止支持的旧管理结构，请使用当前结构的数据文件。");
      const known = [META, TARGETS, ROLES, CHATS];
      const rows = (await this.root.query({
        sql: `SELECT name,type FROM sqlite_master WHERE name IN (${known.map(() => "?").join(",")})`,
        binds: known
      })).rows;
      if (rows.some((r) => r[1] !== "table"))
        throw failed2("管理表被其他 SQLite 对象替代。");
      const names = rows.map((r) => String(r[0]));
      if (!names.length)
        await this.root.transaction([...SCHEMA6.map((sql) => ({ sql })), { sql: `INSERT INTO ${META} VALUES('schema_version','6')` }], undefined, { management: true });
      else if (known.some((name) => !names.includes(name)))
        throw failed2("管理结构不完整，拒绝补造记录。");
      await assertSchema6(this.root);
    }
    async read(binding) {
      await this.ready();
      const row = (await this.root.query({
        sql: `SELECT origin,state FROM ${TARGETS} WHERE scope=? AND char_dbid=? AND chat_dbid=?`,
        binds: key(binding)
      })).rows[0];
      if (!row)
        return;
      if (!["generated", "legacy"].includes(String(row[0])) || !["never", "creating", "ready"].includes(String(row[1])))
        throw failed2("目标创建记录无效。");
      return { origin: row[0], state: row[1] };
    }
    async registerGenerated(binding) {
      const old = await this.read(binding);
      if (old) {
        if (old.origin !== "generated")
          throw failed2("新编号与旧数据库冲突。");
        return;
      }
      await this.root.transaction([{ sql: `INSERT INTO ${TARGETS} VALUES(?,?,?,'generated','never')`, binds: key(binding) }], undefined, { management: true });
    }
    async legacy(binding) {
      await this.root.transaction([{ sql: `INSERT INTO ${TARGETS} VALUES(?,?,?,'legacy','ready')`, binds: key(binding) }], undefined, { management: true });
    }
    async transition(binding, previous, state) {
      await this.ready();
      await this.root.transaction([
        {
          sql: `UPDATE ${TARGETS} SET state=? WHERE scope=? AND char_dbid=? AND chat_dbid=? AND state=? AND origin=?`,
          binds: [state, ...key(binding), previous.state, previous.origin]
        }
      ], undefined, { management: true });
      const actual = await this.read(binding);
      if (actual?.state !== state || actual.origin !== previous.origin)
        throw failed2("目标状态已改变，未继续保存。");
    }
  }

  class TargetLifecycle {
    binding;
    db;
    targets;
    loaded = false;
    memoryCommitted = false;
    constructor(binding, db, targets) {
      this.binding = binding;
      this.db = db;
      this.targets = targets;
    }
    marker() {
      return {
        scope: this.binding.scope,
        charDbId: this.binding.charDbId,
        ...this.binding.chatDbId ? { chatDbId: this.binding.chatDbId } : {}
      };
    }
    async identity(required) {
      const actual = await this.db.getInitializationMarker(), expected = this.marker();
      if (!actual && !required)
        return;
      if (!actual || actual.scope !== expected.scope || actual.charDbId !== expected.charDbId || actual.chatDbId !== expected.chatDbId)
        throw failed2("数据库文件身份与固定目标不符，拒绝访问。");
    }
    async openAndVerify(required) {
      try {
        await this.db.openExisting();
        await this.identity(required);
        this.loaded = true;
      } catch (error) {
        this.loaded = false;
        try {
          await this.db.close();
        } catch {}
        throw error;
      }
    }
    async resolve() {
      if (this.memoryCommitted && this.loaded && this.db.availability === "ready") {
        if (!this.db.hasPendingFirstCommit)
          await this.db.assertFileExisting();
        return { origin: "generated", state: "ready" };
      }
      let record = await this.targets.read(this.binding);
      if (!record) {
        if (!await this.db.fileExists())
          throw failed2("已有编号没有登记且文件缺失，不能建立空库替代。");
        await this.openAndVerify(false);
        await this.targets.legacy(this.binding);
        return { origin: "legacy", state: "ready" };
      }
      if (record.state === "never") {
        if (await this.db.fileExists())
          throw failed2("目标尚未创建但已有同名文件，拒绝覆盖。");
        return record;
      }
      if (!this.loaded || this.db.availability !== "ready") {
        await this.openAndVerify(record.origin === "generated");
      } else
        await this.db.assertFileExisting();
      if (record.state === "creating") {
        await this.targets.transition(this.binding, record, "ready");
        record = { ...record, state: "ready" };
      }
      return record;
    }
    async read(task) {
      const record = await this.resolve();
      if (record.state !== "ready")
        throw notInitialized(this.binding);
      return task(this.db);
    }
    async refresh(onlyChanged = false) {
      const record = await this.resolve();
      if (record.state !== "ready")
        throw notInitialized(this.binding);
      const changed = onlyChanged ? await this.db.refreshIfChanged() : (await this.db.refresh(), true);
      if (changed) {
        this.memoryCommitted = false;
        try {
          await this.identity(record.origin === "generated");
        } catch (error) {
          await this.db.close();
          this.loaded = false;
          throw error;
        }
      }
      return changed;
    }
    async inspect(task, targets) {
      if (this.memoryCommitted && this.loaded && this.db.availability === "ready") {
        return task(this.db);
      }
      const record = await targets.read(this.binding);
      if (!record)
        throw failed2("目标没有已有记录；查看不会登记或创建库。");
      if (record.state === "never")
        throw notInitialized(this.binding);
      if (record.state !== "ready")
        throw new ServiceError({
          code: "RESULT_UNCONFIRMED",
          resultState: "unconfirmed",
          message: "数据库首次保存尚未完成核对；查看不会改变创建状态。"
        });
      if (!this.loaded || this.db.availability !== "ready")
        await this.openAndVerify(record.origin === "generated");
      return task(this.db);
    }
    async write(commands, callId, onCommitted, beforeExecute) {
      let record;
      try {
        record = await this.resolve();
        if (record.state !== "ready") {
          await this.db.openTransient();
          this.loaded = true;
        }
      } catch (error) {
        throw beforeBusinessSqlError(error);
      }
      if (record.state === "ready")
        return this.db.transaction(commands, () => onCommitted?.(callId), { beforeExecute });
      try {
        const result = await this.db.transaction(commands, () => {
          this.memoryCommitted = true;
          onCommitted?.(callId);
        }, {
          beforeExecute,
          initialization: this.marker(),
          beforeSave: async () => {
            const current = await this.targets.read(this.binding);
            if (current?.origin === record.origin && (current.state === "creating" || current.state === "ready"))
              return;
            await this.targets.transition(this.binding, record, "creating");
          },
          afterSave: () => this.targets.transition(this.binding, { ...record, state: "creating" }, "ready")
        });
        return result;
      } catch (error) {
        if (!this.memoryCommitted || this.db.availability !== "ready")
          this.loaded = false;
        throw error;
      }
    }
  }

  // src/worker/scan.ts
  var missing = (error) => error instanceof DOMException && error.name === "NotFoundError";
  var path = (charDbId, chatDbId) => `characters/${charDbId}/${chatDbId ? `chats/${chatDbId}.sqlite` : "char.sqlite"}`;
  var targetKey = (scope, char, chat) => JSON.stringify([scope, char, chat ?? ""]);
  function assertTarget(charDbId, chatDbId) {
    if (!isUuid(charDbId) || chatDbId !== undefined && !isUuid(chatDbId))
      throw new ServiceError({ code: "INVALID_REQUEST", message: "扫描文件必须指定有效的角色或聊天数据库编号。" });
  }
  async function scanRecords(root, directoryName) {
    const snapshot = { directoryName, rootReadable: false, records: [], targets: [], issues: [] };
    try {
      if (root.availability !== "ready")
        throw new Error("管理数据库尚未恢复，请先完成现有恢复操作。");
      await new RootTargets(root, true).ready();
      const query = async (sql) => (await root.query({ sql })).rows;
      const version = Number(JSON.parse(String((await query(`SELECT value FROM ${META} WHERE key='schema_version'`))[0]?.[0])));
      snapshot.schemaVersion = version;
      const targets = await query(`SELECT scope,char_dbid,chat_dbid,state FROM ${TARGETS}`);
      for (const row of targets) {
        const scope = String(row[0]), charDbId = String(row[1]), chatDbId = String(row[2]), state = String(row[3]);
        if (!["char", "chat"].includes(scope) || !isUuid(charDbId) || (scope === "chat" ? !isUuid(chatDbId) : chatDbId !== "") || !["never", "creating", "ready"].includes(state))
          throw new Error("数据库初始化记录字段无效。");
        snapshot.targets.push({
          scope,
          charDbId,
          ...chatDbId ? { chatDbId } : {},
          state
        });
      }
      const initialization = new Map(snapshot.targets.map((target) => [targetKey(target.scope, target.charDbId, target.chatDbId), target.state]));
      const roles = await query(`SELECT role_id,avatar_name,char_dbid,state,generation,confirmed,origin FROM ${ROLES} ORDER BY role_id`);
      const chats = await query(`SELECT chat_id,role_id,file_name,chat_dbid,parent_char_dbid,state,generation,confirmed,origin FROM ${CHATS} ORDER BY chat_id`);
      for (const row of roles)
        snapshot.records.push({
          scope: "char",
          referenceId: Number(row[0]),
          avatar: String(row[1]),
          id: row[2] === null ? null : String(row[2]),
          state: row[3],
          generation: Number(row[4]),
          confirmed: row[5] === 1,
          origin: row[6],
          taskReasons: [],
          parentDependency: chats.some((chat) => chat[1] === row[0] && chat[5] !== "deleted"),
          shared: false
        });
      for (const row of chats) {
        const role = roles.find((role) => role[0] === row[1]);
        if (!role)
          throw new Error("聊天记录缺少对应角色记录。");
        snapshot.records.push({
          scope: "chat",
          referenceId: Number(row[0]),
          parentReferenceId: Number(row[1]),
          avatar: String(role[1]),
          file: String(row[2]),
          id: row[3] === null ? null : String(row[3]),
          parent: String(row[4]),
          state: row[5],
          generation: Number(row[6]),
          confirmed: row[7] === 1,
          origin: row[8],
          taskReasons: [],
          parentDependency: false,
          shared: false
        });
      }
      for (const record of snapshot.records) {
        if (!Number.isSafeInteger(record.referenceId) || record.referenceId < 1 || !record.avatar || record.id !== null && !isUuid(record.id) || record.scope === "chat" && (!isUuid(record.parent) || !record.file) || !["active", "retained", "deleted"].includes(record.state))
          throw new Error("角色或聊天管理记录字段无效。");
        if (record.id)
          record.initialization = initialization.get(targetKey(record.scope, record.scope === "char" ? record.id : record.parent, record.scope === "chat" ? record.id : undefined));
        record.shared = record.id !== null && snapshot.records.some((other) => other !== record && other.scope === record.scope && other.state !== "deleted" && other.id === record.id && other.parent === record.parent);
      }
      snapshot.rootReadable = true;
    } catch (error) {
      snapshot.records = [];
      snapshot.targets = [];
      snapshot.issues.push({ relativePath: "global.sqlite", reason: detail(error).message });
    }
    return snapshot;
  }
  async function scanFile(directory, charDbId, chatDbId) {
    assertTarget(charDbId, chatDbId);
    const file = {
      charDbId,
      ...chatDbId ? { chatDbId } : {},
      relativePath: path(charDbId, chatDbId),
      status: "unknown"
    };
    try {
      const metadata = await new DirectoryStorage(directory, charDbId, chatDbId).metadata();
      return { ...file, status: "exists", size: metadata.size };
    } catch (error) {
      return {
        ...file,
        status: missing(error) ? "missing" : "unknown",
        ...missing(error) ? {} : { reason: detail(error).message }
      };
    }
  }
  async function entries(directory) {
    const result = [];
    for await (const item of directory.entries())
      result.push(item);
    return result;
  }
  async function scanDirectory(directory, charDbId) {
    if (charDbId !== undefined)
      assertTarget(charDbId);
    const result = { characters: [], files: [], issues: [] };
    let characters;
    try {
      characters = await directory.getDirectoryHandle("characters", { create: false });
    } catch (error) {
      if (!missing(error))
        result.issues.push({ relativePath: "characters", reason: detail(error).message });
      return result;
    }
    if (!charDbId) {
      try {
        for (const [name, handle] of await entries(characters))
          if (handle.kind === "directory" && isUuid(name))
            result.characters.push(name);
        result.characters.sort();
      } catch (error) {
        result.issues.push({ relativePath: "characters", reason: detail(error).message });
      }
      return result;
    }
    let character;
    try {
      character = await characters.getDirectoryHandle(charDbId, { create: false });
    } catch (error) {
      if (!missing(error))
        result.issues.push({ relativePath: `characters/${charDbId}`, reason: detail(error).message });
      return result;
    }
    const charFile = await scanFile(directory, charDbId);
    if (charFile.status !== "missing")
      result.files.push(charFile);
    try {
      const chats = await character.getDirectoryHandle("chats", { create: false });
      for (const [name, handle] of await entries(chats)) {
        if (handle.kind !== "file" || !name.endsWith(".sqlite") || !isUuid(name.slice(0, -7)))
          continue;
        result.files.push(await scanFile(directory, charDbId, name.slice(0, -7)));
      }
    } catch (error) {
      if (!missing(error))
        result.issues.push({ relativePath: `characters/${charDbId}/chats`, reason: detail(error).message });
    }
    result.files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
    return result;
  }

  // src/worker/entity-records.ts
  var invalid3 = (message) => new ServiceError({ code: "INVALID_REQUEST", message });
  var damaged2 = (message) => new ServiceError({ code: "LOAD_FAILED", message });
  function assertKey(key) {
    if (typeof key !== "string" || !key.trim() || key.length > 4096 || key.includes("\x00"))
      throw invalid3("实体记录键必须是 1—4096 字符的非空字符串，不能包含空字符。");
  }
  function encode(record) {
    const visiting = new Set;
    const encodeValue = (value) => {
      if (value === null || typeof value === "boolean" || typeof value === "string")
        return JSON.stringify(value);
      if (typeof value === "number" && Number.isFinite(value))
        return JSON.stringify(value);
      if (typeof value !== "object" || value === null || visiting.has(value))
        throw invalid3("实体记录必须是有限、无循环的 JSON 数据。");
      const prototype = Object.getPrototypeOf(value);
      if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null)
        throw invalid3("实体记录不能包含类实例或特殊对象。");
      visiting.add(value);
      try {
        const properties = Object.getOwnPropertyDescriptors(value);
        if (Object.getOwnPropertySymbols(value).length || Object.values(properties).some((property) => !("value" in property)))
          throw invalid3("实体记录不能包含符号字段或属性读取函数。");
        if (Array.isArray(value)) {
          const entries = [];
          for (let i = 0;i < value.length; i++) {
            if (!properties[String(i)])
              throw invalid3("实体记录不能包含稀疏数组。");
            entries.push(encodeValue(properties[String(i)].value));
          }
          if (Object.keys(properties).some((key) => key !== "length" && (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= value.length)))
            throw invalid3("JSON 数组不能包含额外字段。");
          return `[${entries.join(",")}]`;
        }
        return `{${Object.keys(properties).sort().map((key) => {
          const property = properties[key];
          if (!property.enumerable)
            throw invalid3("实体记录不能包含不可枚举字段。");
          return `${JSON.stringify(key)}:${encodeValue(property.value)}`;
        }).join(",")}}`;
      } finally {
        visiting.delete(value);
      }
    };
    if (!record || typeof record !== "object" || Array.isArray(record))
      throw invalid3("实体记录必须是 JSON 对象。");
    return encodeValue(record);
  }
  var contexts = new WeakMap;

  class RootEntities {
    root;
    targets;
    context;
    get processes() {
      return this.context.processes;
    }
    get deletions() {
      return this.context.deletions;
    }
    get cleanups() {
      return this.context.cleanups;
    }
    get revision() {
      return this.context.revision;
    }
    set revision(value) {
      this.context.revision = value;
    }
    constructor(root, targets) {
      this.root = root;
      this.targets = targets ?? new RootTargets(root);
      let context = contexts.get(root);
      if (!context) {
        context = { processes: new Map, deletions: new Map, cleanups: new Map, revision: 0 };
        contexts.set(root, context);
      }
      this.context = context;
    }
    async ready() {
      await this.targets.ready();
    }
    activeSql(sql) {
      return sql.replaceAll(ROLES, ACTIVE_ROLES).replaceAll(CHATS, ACTIVE_CHATS);
    }
    async readRows(sql, binds) {
      try {
        return (await this.root.query({ sql: this.activeSql(sql), binds })).rows;
      } catch (error) {
        if (errorData(error).code !== "SQL_FAILED")
          throw error;
        throw damaged2(`root 实体记录无法读取：${detail(error).message}`);
      }
    }
    roleRow(row) {
      if (row[4] !== 0 && row[4] !== 1)
        throw damaged2("角色 confirmed 字段无效。");
      return validateReference({ referenceId: row[0], id: row[2], generation: row[3], confirmed: row[4] === 1, origin: row[5] }, false);
    }
    chatRow(row) {
      if (row[6] !== 0 && row[6] !== 1)
        throw damaged2("聊天 confirmed 字段无效。");
      return validateReference({ referenceId: row[0], id: row[3], parent: row[4], generation: row[5], confirmed: row[6] === 1, origin: row[7] }, true);
    }
    async current(c) {
      const rows = c.chat ? await this.readRows(`SELECT c.chat_id,r.avatar_name,c.file_name,c.chat_dbid,c.parent_char_dbid,c.generation,c.confirmed,c.origin FROM ${CHATS} c JOIN ${ROLES} r USING(role_id) WHERE r.avatar_name=? AND c.file_name=?`, [c.avatar, c.file]) : await this.readRows(`SELECT role_id,avatar_name,char_dbid,generation,confirmed,origin FROM ${ROLES} WHERE avatar_name=? AND generation>0`, [c.avatar]);
      if (rows.length > 1)
        throw damaged2("root 当前文件坐标不唯一。");
      return rows[0] ? c.chat ? this.chatRow(rows[0]) : this.roleRow(rows[0]) : undefined;
    }
    async roleIdFor(avatar) {
      await this.ready();
      const rows = await this.readRows(`SELECT role_id FROM ${ROLES} WHERE avatar_name=?`, [avatar]);
      if (rows.length > 1)
        throw damaged2("当前角色文件名对应多个有效记录。");
      return rows[0] ? Number(rows[0][0]) : undefined;
    }
    async lookupRoleUuid(id) {
      await this.ready();
      const rows = await this.readRows(`SELECT role_id,avatar_name,char_dbid,generation,confirmed,origin FROM ${ROLES} WHERE char_dbid=? AND generation>0 ORDER BY avatar_name`, [id]);
      return rows.map((row) => ({ key: entityKey({ chat: false, avatar: String(row[1]) }), value: this.roleRow(row) }));
    }
    async referenceInfo(entity, chat) {
      await this.ready();
      const reference = await this.current(coordinate(entity, chat));
      return reference ? { referenceId: reference.referenceId, entity, reference } : undefined;
    }
    sameReference(a, b) {
      return a.id === b.id && a.generation === b.generation && a.confirmed === b.confirmed && a.origin === b.origin && a.parent === b.parent && (b.referenceId === undefined || a.referenceId === b.referenceId);
    }
    async scanRecord(expected) {
      const snapshot = await scanRecords(this.root, "");
      if (!snapshot.rootReadable)
        throw damaged2(snapshot.issues[0]?.reason ?? "管理记录无法读取。");
      return snapshot.records.find((row) => row.scope === expected.scope && row.referenceId === expected.referenceId);
    }
    async assertScanRecord(expected, allowDeleted = false) {
      const current = await this.scanRecord(expected);
      const keys = [
        "referenceId",
        "parentReferenceId",
        "scope",
        "avatar",
        "file",
        "id",
        "parent",
        "generation",
        "confirmed",
        "origin"
      ];
      if (!current || expected.generation === undefined || expected.confirmed === undefined || expected.origin === undefined || keys.some((key) => current[key] !== expected[key]) || current.state !== expected.state && !(allowDeleted && current.state === "deleted")) {
        throw new ServiceError({
          code: "STALE_IDENTITY",
          resultKind: "identity",
          resultState: "not-applied",
          message: "原扫描记录的编号、身份或坐标已改变，请重新扫描。"
        });
      }
      return current;
    }
    scanGuard(expected, state) {
      return this.rawGuard(expected.scope === "chat" ? `SELECT 1 FROM ${CHATS} c JOIN ${ROLES} r USING(role_id) WHERE c.chat_id=? AND c.role_id=? AND r.avatar_name=? AND c.file_name=? AND c.chat_dbid IS ? AND c.parent_char_dbid=? AND c.generation=? AND c.confirmed=? AND c.origin=? AND c.state=?` : `SELECT 1 FROM ${ROLES} WHERE role_id=? AND avatar_name=? AND char_dbid IS ? AND generation=? AND confirmed=? AND origin=? AND state=?`, expected.scope === "chat" ? [
        expected.referenceId,
        expected.parentReferenceId,
        expected.avatar,
        expected.file,
        expected.id,
        expected.parent,
        expected.generation,
        Number(expected.confirmed),
        expected.origin,
        state
      ] : [
        expected.referenceId,
        expected.avatar,
        expected.id,
        expected.generation,
        Number(expected.confirmed),
        expected.origin,
        state
      ]);
    }
    async hasScanChildren(referenceId) {
      return (await this.root.query({ sql: `SELECT 1 FROM ${CHATS} WHERE role_id=? LIMIT 1`, binds: [referenceId] })).rows.length > 0;
    }
    async protectionReferences(target) {
      await this.ready();
      const chat = target.scope === "chat";
      const rows = (await this.root.query({
        sql: chat ? `SELECT SUM(CASE WHEN state='active' AND confirmed=1 THEN 1 ELSE 0 END),SUM(CASE WHEN state='retained' THEN 1 ELSE 0 END),SUM(CASE WHEN state<>'deleted' AND confirmed=0 THEN 1 ELSE 0 END) FROM ${CHATS} WHERE parent_char_dbid=? AND chat_dbid=?` : `SELECT SUM(CASE WHEN state='active' AND confirmed=1 THEN 1 ELSE 0 END),0,SUM(CASE WHEN state='active' AND confirmed=0 THEN 1 ELSE 0 END) FROM ${ROLES} WHERE char_dbid=?`,
        binds: chat ? [target.charDbId, target.chatDbId] : [target.charDbId]
      })).rows[0];
      return { active: Number(rows?.[0] ?? 0), retained: Number(rows?.[1] ?? 0), unconfirmed: Number(rows?.[2] ?? 0) };
    }
    async get(key) {
      assertKey(key);
      await this.ready();
      const c = parseEntityKey(key);
      return c ? await this.current(c) : structuredClone(this.processes.get(key));
    }
    async listExisting(prefix) {
      return this.jsonPrefixRows(prefix);
    }
    async list(prefix) {
      await this.ready();
      const result = await this.jsonPrefixRows(prefix);
      if ("role:".startsWith(prefix) || prefix.startsWith("role:"))
        for (const row of await this.readRows(`SELECT role_id,avatar_name,char_dbid,generation,confirmed,origin FROM ${ROLES} WHERE generation>0`, [])) {
          const key = entityKey({ chat: false, avatar: String(row[1]) });
          if (key.startsWith(prefix))
            result.push({ key, value: this.roleRow(row) });
        }
      if ("chat:".startsWith(prefix) || prefix.startsWith("chat:"))
        for (const row of await this.readRows(`SELECT c.chat_id,r.avatar_name,c.file_name,c.chat_dbid,c.parent_char_dbid,c.generation,c.confirmed,c.origin FROM ${CHATS} c JOIN ${ROLES} r USING(role_id)`, [])) {
          const key = entityKey({ chat: true, avatar: String(row[1]), file: String(row[2]) });
          if (key.startsWith(prefix))
            result.push({ key, value: this.chatRow(row) });
        }
      return result.sort((a, b) => a.key.localeCompare(b.key));
    }
    async jsonPrefixRows(prefix) {
      return Array.from(this.processes).filter(([key]) => key.startsWith(prefix)).map(([key, value]) => ({ key, value: structuredClone(value) }));
    }
    async currentCopy(avatar) {
      const id = await this.roleIdFor(avatar);
      return (await this.jsonPrefixRows("copy:")).find(({ value }) => value.state === "active" && (id !== undefined ? value.newReferenceId === id : value.newReferenceId === undefined && (value.currentNewAvatar ?? value.newAvatar) === avatar))?.value;
    }
    async copyIsCurrent(task) {
      if (task.state === "deleted")
        return false;
      return task.newReferenceId === undefined ? task.state === "active" : await this.roleIdFor(task.currentNewAvatar ?? task.newAvatar) === task.newReferenceId;
    }
    async readReference(entity, chat, generation, id, referenceId) {
      await this.ready();
      let reference, currentEntity = entity;
      if (referenceId !== undefined) {
        const rows = chat ? await this.readRows(`SELECT c.chat_id,r.avatar_name,c.file_name,c.chat_dbid,c.parent_char_dbid,c.generation,c.confirmed,c.origin FROM ${CHATS} c JOIN ${ROLES} r USING(role_id) WHERE c.chat_id=?`, [referenceId]) : await this.readRows(`SELECT role_id,avatar_name,char_dbid,generation,confirmed,origin FROM ${ROLES} WHERE role_id=? AND generation>0`, [referenceId]);
        const row = rows[0];
        if (!row)
          return;
        reference = chat ? this.chatRow(row) : this.roleRow(row);
        currentEntity = chat ? JSON.stringify([row[1], row[2]]) : String(row[1]);
      } else
        reference = await this.current(coordinate(entity, chat));
      if (!reference || generation !== undefined && reference.generation !== generation || id !== undefined && reference.id !== id)
        return;
      return { reference, currentEntity };
    }
    conflict(message) {
      return new ServiceError({ code: "IDENTITY_CONFLICT", message });
    }
    rawGuard(sql, binds) {
      return { sql: `INSERT INTO ${META}(key,value) SELECT NULL,'null' WHERE NOT EXISTS(${sql})`, binds };
    }
    guard(sql, binds) {
      return this.rawGuard(this.activeSql(sql), binds);
    }
    referenceGuard(c, r) {
      return this.guard(c.chat ? `SELECT 1 FROM ${CHATS} c JOIN ${ROLES} r USING(role_id) WHERE c.chat_id=? AND c.chat_dbid IS ? AND c.parent_char_dbid=? AND c.generation=? AND c.confirmed=? AND c.origin=?` : `SELECT 1 FROM ${ROLES} WHERE role_id=? AND char_dbid IS ? AND generation=? AND confirmed=? AND origin=?`, c.chat ? [r.referenceId, r.id, r.parent, r.generation, Number(r.confirmed), r.origin] : [r.referenceId, r.id, r.generation, Number(r.confirmed), r.origin]);
    }
    async save(commands) {
      try {
        await this.root.transaction(commands, undefined, { management: true });
      } catch (error) {
        const data = errorData(error);
        if (data.code === "SQL_FAILED" && (data.sqlError?.message?.includes(`${META}.key`) || data.sqlError?.message?.startsWith("UNIQUE constraint failed:")))
          throw this.conflict("对象记录已改变，拒绝覆盖当前事实。");
        throw error;
      }
    }
    async put(key, value, expected = null) {
      assertKey(key);
      await this.ready();
      const c = parseEntityKey(key);
      if (c)
        return this.putReference(c, validateReference(value, c.chat), expected === null ? null : validateReference(expected, c.chat));
      const next = encode(value), old = this.processes.get(key);
      if (old && encode(old) === next)
        return;
      if (expected === null ? old !== undefined : old === undefined || encode(old) !== encode(expected))
        throw this.conflict("当前事件信息已改变。");
      this.processes.set(key, JSON.parse(next));
    }
    async forgetRecord(key) {
      this.processes.delete(key);
    }
    async forgetDeletion(taskId) {
      this.deletions.delete(taskId);
      for (const [key, value] of this.cleanups)
        if (value.deletionTaskId === taskId)
          this.cleanups.delete(key);
    }
    async putReference(c, value, expected) {
      const old = await this.current(c);
      if (old && this.sameReference(old, value))
        return;
      if (expected ? !old || !this.sameReference(old, expected) : !!old)
        throw this.conflict("当前文件引用已改变。");
      if (value.referenceId !== undefined && value.referenceId !== old?.referenceId || old && value.generation < old.generation)
        throw this.conflict("对象编号或身份版本不匹配。");
      if (value.id && await this.isTargetReserved({
        scope: c.chat ? "chat" : "char",
        charDbId: c.chat ? value.parent : value.id,
        chatDbId: c.chat ? value.id : undefined
      }))
        throw this.conflict("数据库正在清理。");
      const commands = old ? [this.referenceGuard(c, old)] : [];
      if (c.chat) {
        commands.push({
          sql: `INSERT INTO ${ROLES}(avatar_name,char_dbid,generation,confirmed,origin) SELECT ?,NULL,0,0,'legacy' WHERE NOT EXISTS(SELECT 1 FROM ${ACTIVE_ROLES} WHERE avatar_name=?)`,
          binds: [c.avatar, c.avatar]
        });
        commands.push(old ? {
          sql: `UPDATE ${CHATS} SET chat_dbid=?,parent_char_dbid=?,generation=?,confirmed=?,origin=? WHERE chat_id=?`,
          binds: [
            value.id,
            value.parent,
            value.generation,
            Number(value.confirmed),
            value.origin,
            old.referenceId
          ]
        } : {
          sql: `INSERT INTO ${CHATS}(role_id,file_name,chat_dbid,parent_char_dbid,generation,confirmed,origin) SELECT role_id,?,?,?,?,?,? FROM ${ACTIVE_ROLES} WHERE avatar_name=?`,
          binds: [
            c.file,
            value.id,
            value.parent,
            value.generation,
            Number(value.confirmed),
            value.origin,
            c.avatar
          ]
        });
      } else
        commands.push(old ? {
          sql: `UPDATE ${ROLES} SET char_dbid=?,generation=?,confirmed=?,origin=? WHERE role_id=?`,
          binds: [value.id, value.generation, Number(value.confirmed), value.origin, old.referenceId]
        } : {
          sql: `INSERT INTO ${ROLES}(avatar_name,char_dbid,generation,confirmed,origin) VALUES(?,?,?,?,?) ON CONFLICT(avatar_name) WHERE state='active' DO UPDATE SET char_dbid=excluded.char_dbid,generation=excluded.generation,confirmed=excluded.confirmed,origin=excluded.origin WHERE generation=0`,
          binds: [c.avatar, value.id, value.generation, Number(value.confirmed), value.origin]
        });
      await this.save(commands);
      const actual = await this.current(c);
      if (!actual || !this.sameReference(actual, value))
        throw damaged2("对象保存后读回不一致。");
      if (!c.chat) {
        for (const [key, task] of this.processes)
          if (key.startsWith("copy:") && task.state === "active" && task.newReferenceId === undefined && (task.currentNewAvatar ?? task.newAvatar) === c.avatar)
            this.processes.set(key, { ...task, newReferenceId: actual.referenceId });
      }
    }
    async confirmUnknownRename(next, chat, observed) {
      await this.ready();
      await this.putReference(coordinate(next, chat), validateReference(observed, chat), null);
      return await this.current(coordinate(next, chat));
    }
    async renameRole(old, next, expected) {
      return this.rename(old, next, false, expected);
    }
    async renameChat(old, next, expected) {
      return this.rename(old, next, true, expected);
    }
    async rename(old, next, chat, expected) {
      await this.ready();
      if (!expected.referenceId)
        throw invalid3("改名需要固定对象编号。");
      const c = coordinate(old, chat), n = coordinate(next, chat);
      if (chat && c.avatar !== n.avatar)
        throw invalid3("聊天改名不能改变角色。");
      const known = await this.readReference(old, chat, expected.generation, expected.id, expected.referenceId);
      if (!known)
        throw this.conflict("原对象已失效。");
      if (known.currentEntity === next)
        return known.reference;
      if (known.currentEntity !== old)
        throw this.conflict("对象已改为其他名称。");
      await this.save([
        this.referenceGuard(c, expected),
        {
          sql: chat ? `UPDATE ${CHATS} SET file_name=? WHERE chat_id=?` : `UPDATE ${ROLES} SET avatar_name=? WHERE role_id=?`,
          binds: [chat ? n.file : n.avatar, expected.referenceId]
        }
      ]);
      if (!chat) {
        for (const [key, task] of this.processes)
          if (key.startsWith("copy:")) {
            const value = { ...task };
            for (const side of ["Old", "New"])
              if (task[`${side.toLowerCase()}ReferenceId`] === expected.referenceId)
                value[`current${side}Avatar`] = next;
            this.processes.set(key, value);
          }
      }
      return await this.current(n);
    }
    async entityRevisionExisting() {
      return this.revision;
    }
    ensureRevision(minimum) {
      this.revision = Math.max(this.revision, minimum);
    }
    async listDeletionsExisting() {
      return structuredClone(Array.from(this.deletions.values()));
    }
    async listCleanupsExisting() {
      return structuredClone(Array.from(this.cleanups.values()));
    }
    async listCleanupsForDeletion(id) {
      return (await this.listCleanupsExisting()).filter((t) => t.deletionTaskId === id);
    }
    async hasDeletedCoordinate(entity, chat, generation, capturedRevision) {
      const c = coordinate(entity, chat);
      return Array.from(this.deletions.values()).some((t) => t.phase !== "cancelled" && t.revision > (capturedRevision ?? -1) && (t.entity === entity && t.chat === chat || chat && !t.chat && t.entity === c.avatar) && (generation === undefined || t.reference?.generation === generation));
    }
    async isTargetReserved(target) {
      return Array.from(this.cleanups.values()).some((t) => t.scope === target.scope && t.charDbId === target.charDbId && t.chatDbId === target.chatDbId && t.phase === "waiting");
    }
    async beginDeletion(input) {
      await this.ready();
      const previous = this.deletions.get(input.operationId);
      if (previous)
        return structuredClone(previous);
      const known = input.expected ? await this.readReference(input.entity, input.chat, input.expected.generation, input.expected.id, input.expected.referenceId) : undefined;
      if (input.expected && !known)
        throw new ServiceError({ code: "STALE_IDENTITY", message: "原删除对象已失效。" });
      const entity = known?.currentEntity ?? input.entity, c = coordinate(entity, input.chat), reference = known?.reference ?? await this.current(c), children = [];
      if (!input.chat)
        for (const row of await this.readRows(`SELECT c.chat_id,r.avatar_name,c.file_name,c.chat_dbid,c.parent_char_dbid,c.generation,c.confirmed,c.origin FROM ${CHATS} c JOIN ${ROLES} r USING(role_id) WHERE r.avatar_name=?`, [c.avatar]))
          children.push({ entity: JSON.stringify([row[1], row[2]]), reference: this.chatRow(row) });
      const credentials = [
        ...reference ? [{ entity, chat: input.chat, reference }] : [],
        ...children.map((c) => ({ ...c, chat: true }))
      ].map((v) => ({
        entity: v.entity,
        chat: v.chat,
        generation: v.reference.generation,
        id: v.reference.id,
        referenceId: v.reference.referenceId,
        ...v.reference.parent ? { parent: v.reference.parent } : {}
      }));
      const copyTaskIds = input.chat ? [] : [...this.processes].filter(([key, value]) => key.startsWith("copy:") && (value.currentNewAvatar ?? value.newAvatar) === c.avatar && (value.newReferenceId === undefined || value.newReferenceId === reference?.referenceId)).map(([key]) => key.slice(5));
      const task = {
        ...input,
        taskId: input.operationId,
        revision: ++this.revision,
        entity,
        ...copyTaskIds.length ? { copyTaskIds } : {},
        ...reference ? { reference } : {},
        ...!input.chat ? { roleRecordId: await this.roleIdFor(c.avatar) } : {},
        children,
        credentials,
        phase: "observed",
        version: 1
      };
      delete task.expected;
      this.deletions.set(task.taskId, task);
      return structuredClone(task);
    }
    async updateDeletion(task, phase, reason, evidence = task.evidence) {
      const next = { ...task, phase, version: task.version + 1, ...evidence ? { evidence } : {} };
      delete next.reason;
      if (reason)
        next.reason = reason;
      this.deletions.set(task.taskId, next);
      return structuredClone(next);
    }
    async settleDeletion(task, options = {}) {
      await this.ready();
      if (task.phase === "invalidated")
        return { deletion: task, cleanups: await this.listCleanupsForDeletion(task.taskId) };
      const commands = [], cleanups = [];
      const candidate = (r, chat) => {
        if (!r.id)
          return;
        const charDbId = chat ? r.parent : r.id, chatDbId = chat ? r.id : undefined;
        if (cleanups.some((t) => t.scope === (chat ? "chat" : "char") && t.charDbId === charDbId && t.chatDbId === chatDbId))
          return;
        cleanups.push({
          taskId: `${task.taskId}:${chat ? "chat" : "char"}:${charDbId}:${chatDbId ?? ""}`,
          deletionTaskId: task.taskId,
          scope: chat ? "chat" : "char",
          charDbId,
          ...chatDbId ? { chatDbId } : {},
          phase: "waiting"
        });
      };
      if (task.reference)
        commands.push(this.referenceGuard(coordinate(task.entity, task.chat), task.reference));
      if (!task.chat)
        for (const child of task.children)
          commands.push(this.referenceGuard(coordinate(child.entity, true), child.reference));
      if (task.reference) {
        commands.push({
          sql: `UPDATE ${task.chat ? CHATS : ROLES} SET state='deleted' WHERE ${task.chat ? "chat_id" : "role_id"}=?`,
          binds: [task.reference.referenceId]
        });
        candidate(task.reference, task.chat);
      } else if (task.roleRecordId)
        commands.push({ sql: `UPDATE ${ROLES} SET state='deleted' WHERE role_id=?`, binds: [task.roleRecordId] });
      if (!task.chat)
        for (const child of task.children) {
          commands.push({
            sql: `UPDATE ${CHATS} SET state=? WHERE chat_id=?`,
            binds: [
              task.deleteChats === true && options.childrenDeleted === true ? "deleted" : "retained",
              child.reference.referenceId
            ]
          });
          candidate(child.reference, true);
        }
      if (commands.length)
        await this.save(commands);
      for (const id of task.copyTaskIds ?? [])
        this.processes.delete(`copy:${id}`);
      const deletion = await this.updateDeletion(task, "invalidated", options.reason);
      for (const t of cleanups)
        this.cleanups.set(t.taskId, t);
      return { deletion, cleanups };
    }
    async updateCleanup(task, phase, reason) {
      const next = { ...task, phase };
      delete next.reason;
      if (reason)
        next.reason = reason;
      if (["done", "retained", "blocked"].includes(phase))
        this.cleanups.delete(task.taskId);
      else
        this.cleanups.set(task.taskId, next);
      return next;
    }
    async finishCleanup(task) {
      const refs = await this.protectionReferences(task);
      if (refs.active || refs.retained || refs.unconfirmed)
        throw this.conflict("数据库仍有引用，不能移除记录。");
      const commands = [];
      if (task.scope === "chat")
        commands.push({
          sql: `DELETE FROM ${CHATS} WHERE parent_char_dbid=? AND chat_dbid=? AND state='deleted'`,
          binds: [task.charDbId, task.chatDbId]
        });
      else
        commands.push({
          sql: `DELETE FROM ${ROLES} WHERE char_dbid=? AND state='deleted' AND NOT EXISTS(SELECT 1 FROM ${CHATS} WHERE role_id=${ROLES}.role_id)`,
          binds: [task.charDbId]
        });
      commands.push({
        sql: `DELETE FROM ${TARGETS} WHERE scope=? AND char_dbid=? AND chat_dbid=?`,
        binds: [task.scope, task.charDbId, task.chatDbId ?? ""]
      });
      if (task.scope === "chat")
        commands.push({
          sql: `DELETE FROM ${ROLES} WHERE char_dbid=? AND state='deleted' AND NOT EXISTS(SELECT 1 FROM ${CHATS} WHERE role_id=${ROLES}.role_id) AND (NOT EXISTS(SELECT 1 FROM ${TARGETS} WHERE scope='char' AND char_dbid=?) OR EXISTS(SELECT 1 FROM ${ROLES} other WHERE other.char_dbid=? AND other.state='active'))`,
          binds: [task.charDbId, task.charDbId, task.charDbId]
        });
      await this.save(commands);
    }
    async finishDeletion(task) {
      await this.ready();
      const rows = [
        ...task.reference ? [{ reference: task.reference, chat: task.chat }] : [],
        ...task.children.map((child) => ({ reference: child.reference, chat: true }))
      ];
      const commands = [];
      for (const { reference: r, chat } of rows) {
        if (!r.id)
          continue;
        const refs = await this.protectionReferences({
          scope: chat ? "chat" : "char",
          charDbId: chat ? r.parent : r.id,
          chatDbId: chat ? r.id : undefined
        });
        const target = await this.targets.read({
          scope: chat ? "chat" : "char",
          charDbId: chat ? r.parent : r.id,
          ...chat ? { chatDbId: r.id } : {}
        });
        if (!target || refs.active || refs.retained)
          commands.push({
            sql: chat ? `DELETE FROM ${CHATS} WHERE chat_id=? AND state='deleted'` : `DELETE FROM ${ROLES} WHERE role_id=? AND state='deleted' AND NOT EXISTS(SELECT 1 FROM ${CHATS} WHERE role_id=?)`,
            binds: chat ? [r.referenceId] : [r.referenceId, r.referenceId]
          });
      }
      if (!task.chat && task.roleRecordId && task.reference?.id) {
        const refs = await this.protectionReferences({ scope: "char", charDbId: task.reference.id });
        const target = await this.targets.read({
          scope: "char",
          charDbId: task.reference.id
        });
        if (!target || refs.active)
          commands.push({
            sql: `DELETE FROM ${ROLES} WHERE role_id=? AND state='deleted' AND NOT EXISTS(SELECT 1 FROM ${CHATS} WHERE role_id=?)`,
            binds: [task.roleRecordId, task.roleRecordId]
          });
      }
      if (commands.length)
        await this.save(commands);
    }
    async prepareScanDeletion(expected, id) {
      await this.ready();
      const current = await this.assertScanRecord(expected, true), entity = expected.scope === "char" ? expected.avatar : JSON.stringify([expected.avatar, expected.file]);
      const reference = expected.generation > 0 ? {
        id: expected.id,
        generation: expected.generation,
        confirmed: expected.confirmed,
        origin: expected.origin,
        referenceId: expected.referenceId,
        ...expected.scope === "chat" ? { parent: expected.parent } : {}
      } : undefined;
      const deletion = {
        taskId: id,
        operationId: id,
        revision: ++this.revision,
        entity,
        chat: expected.scope === "chat",
        ...reference ? { reference } : { roleRecordId: expected.referenceId },
        children: [],
        credentials: [],
        phase: "invalidated",
        version: 1,
        evidence: { source: "scan-absence" }
      };
      if (current.state !== "deleted") {
        const commands = [
          this.scanGuard(expected, current.state),
          {
            sql: `UPDATE ${expected.scope === "chat" ? CHATS : ROLES} SET state='deleted' WHERE ${expected.scope === "chat" ? "chat_id" : "role_id"}=?`,
            binds: [expected.referenceId]
          }
        ];
        if (expected.scope === "char")
          commands.push({
            sql: `UPDATE ${CHATS} SET state='retained' WHERE role_id=? AND state='active'`,
            binds: [expected.referenceId]
          });
        await this.save(commands);
      }
      this.deletions.set(id, deletion);
      let cleanup;
      if (expected.id) {
        cleanup = {
          taskId: `${id}:${expected.scope}:${expected.id}`,
          deletionTaskId: id,
          scope: expected.scope,
          charDbId: expected.scope === "char" ? expected.id : expected.parent,
          ...expected.scope === "chat" ? { chatDbId: expected.id } : {},
          phase: "waiting"
        };
        this.cleanups.set(cleanup.taskId, cleanup);
      }
      return { deletion, ...cleanup ? { cleanup } : {} };
    }
    async purgeScanRecord(expected) {
      await this.ready();
      if (!await this.scanRecord(expected))
        return;
      const commands = [this.scanGuard(expected, "deleted")];
      if (expected.scope === "char")
        commands.push(this.rawGuard(`SELECT 1 WHERE NOT EXISTS(SELECT 1 FROM ${CHATS} WHERE role_id=?)`, [expected.referenceId]));
      commands.push({
        sql: `DELETE FROM ${expected.scope === "chat" ? CHATS : ROLES} WHERE ${expected.scope === "chat" ? "chat_id" : "role_id"}=?`,
        binds: [expected.referenceId]
      });
      if (expected.id)
        commands.push({
          sql: expected.scope === "chat" ? `DELETE FROM ${TARGETS} WHERE scope='chat' AND char_dbid=? AND chat_dbid=? AND NOT EXISTS(SELECT 1 FROM ${CHATS} WHERE parent_char_dbid=? AND chat_dbid=?)` : `DELETE FROM ${TARGETS} WHERE scope='char' AND char_dbid=? AND NOT EXISTS(SELECT 1 FROM ${ROLES} WHERE char_dbid=?)`,
          binds: expected.scope === "chat" ? [expected.parent, expected.id, expected.parent, expected.id] : [expected.id, expected.id]
        });
      await this.save(commands);
    }
  }

  // src/worker/storage-coordinator.ts
  function validateConfiguration(value) {
    const handle = (h) => h?.kind === "directory" && typeof h.getFileHandle === "function" && typeof h.isSameEntry === "function";
    if (!value || !handle(value.directory) || typeof value.storageId !== "string" || !value.storageId || !Number.isSafeInteger(value.configGeneration) || value.configGeneration < 1 || !Array.isArray(value.spaces) || value.spaces.length === 0 || value.mode !== undefined && !["opfs", "directory"].includes(value.mode) || value.autoReloadEnabled !== undefined && typeof value.autoReloadEnabled !== "boolean" || value.spaces.some((s) => !s || typeof s.storageId !== "string" || !s.storageId || !handle(s.directory) || s.mode !== undefined && !["opfs", "directory"].includes(s.mode)) || value.savedDirectory !== undefined && (!handle(value.savedDirectory.directory) || (value.savedDirectory.mode ?? "directory") !== "directory" || !value.spaces.some((s) => s.storageId === value.savedDirectory.storageId && (s.mode ?? "directory") === "directory")) || new Set(value.spaces.map((s) => s.storageId)).size !== value.spaces.length || !value.spaces.some((s) => s.storageId === value.storageId)) {
      throw new ServiceError({ code: "CONFIG_FAILED", message: "已保存目录配置无效，拒绝静默替换存储身份。" });
    }
  }

  class StorageCoordinator {
    repository;
    createDatabase;
    changed;
    getOpfsDirectory;
    tail = Promise.resolve();
    configuration;
    registry;
    mode = "directory";
    autoReloadEnabled = true;
    reloadTimer;
    reloadPending = false;
    registryLoaded = false;
    database;
    scopedDatabases = new Map;
    cleanupSeals = new Set;
    targets;
    beforeScopedExecution;
    beforeConfigurationChange;
    onRootLoaded;
    onBackgroundSaveFailed;
    permission;
    switching = false;
    revision = 0;
    lastError;
    restored;
    constructor(repository, createDatabase, changed = () => {}, getOpfsDirectory = async () => {
      if (typeof navigator === "undefined" || typeof navigator.storage?.getDirectory !== "function")
        throw new ServiceError({
          code: "UNSUPPORTED_ENVIRONMENT",
          message: "当前浏览器没有可用的 OPFS，游玩模式无法启动。"
        });
      if (typeof FileSystemFileHandle === "undefined" || typeof FileSystemFileHandle.prototype.createWritable !== "function")
        throw new ServiceError({
          code: "UNSUPPORTED_ENVIRONMENT",
          message: "当前浏览器未提供 OPFS 异步文件写入接口，游玩模式无法启动。"
        });
      try {
        return await (await navigator.storage.getDirectory()).getDirectoryHandle("st-sqlite-helper", { create: true });
      } catch (error) {
        throw new ServiceError({
          code: "LOAD_FAILED",
          message: `无法取得游玩模式的浏览器存储：${errorData(error).message}`
        });
      }
    }) {
      this.repository = repository;
      this.createDatabase = createDatabase;
      this.changed = changed;
      this.getOpfsDirectory = getOpfsDirectory;
      this.restored = this.enqueue(async () => {
        try {
          await this.readRegistry();
          if (this.configuration && await this.checkPermission())
            await this.loadDatabase();
        } catch (error) {
          this.lastError = errorData(error);
        }
        this.updateReloadTimer();
        this.publish();
      });
    }
    enqueue(task) {
      const result = this.tail.then(task);
      this.tail = result.catch(() => {
        return;
      });
      return result;
    }
    info() {
      const state = !this.configuration ? this.lastError ? "unavailable" : "uninitialized" : this.permission !== "granted" ? "permission-required" : this.database?.availability === "ready" ? "ready" : "unavailable";
      return {
        storage: {
          revision: this.revision,
          state,
          initialized: state === "ready",
          switching: this.switching,
          mode: this.mode,
          autoReloadEnabled: this.autoReloadEnabled,
          storageId: this.configuration?.storageId,
          configGeneration: this.configuration?.configGeneration ?? 0,
          permission: this.permission,
          error: this.lastError
        },
        directory: this.mode === "directory" ? this.configuration?.directory : undefined
      };
    }
    publish() {
      this.revision++;
      try {
        this.changed(this.info());
      } catch {}
    }
    async readRegistry() {
      if (this.registryLoaded)
        return;
      const stored = await this.repository.read();
      if (stored) {
        validateConfiguration(stored);
        const active = stored.spaces.find((s) => s.storageId === stored.storageId);
        if ((stored.mode ?? "directory") !== (active.mode ?? "directory") || !await stored.directory.isSameEntry(active.directory) || stored.savedDirectory && !await stored.savedDirectory.directory.isSameEntry(stored.spaces.find((s) => s.storageId === stored.savedDirectory.storageId).directory))
          throw new ServiceError({ code: "CONFIG_FAILED", message: "目录配置身份与句柄不一致。" });
        this.configuration = stored;
        this.registry = stored;
        this.mode = stored.mode ?? "directory";
        this.autoReloadEnabled = stored.autoReloadEnabled ?? true;
      }
      this.registryLoaded = true;
    }
    async checkPermission() {
      if (!this.configuration)
        return false;
      if (this.mode === "opfs") {
        this.permission = "granted";
        return true;
      }
      this.permission = await directoryPermission(this.configuration.directory);
      return this.permission === "granted";
    }
    async requirePermission() {
      if (!await this.checkPermission())
        throw new ServiceError({
          code: "PERMISSION_REQUIRED",
          message: "已保存目录需要重新授权，请点击重新授权已配置目录。"
        });
    }
    async loadDatabase() {
      if (this.database) {
        await this.database.refresh();
        await this.rootLoaded(this.database, this.configuration, this.targets);
        return;
      }
      const candidate = await this.createDatabase(this.configuration.directory, undefined, this.mode);
      try {
        await candidate.openExisting();
        this.bindDatabase(candidate, this.configuration);
        this.database = candidate;
        this.targets = new RootTargets(candidate);
        await this.rootLoaded(candidate, this.configuration, this.targets);
      } catch (error) {
        await candidate.close();
        throw error;
      }
    }
    bindDatabase(db, binding) {
      const fixed = {
        storageId: binding.storageId,
        configGeneration: binding.configGeneration,
        scope: binding.scope ?? "global",
        ...binding.charDbId ? { charDbId: binding.charDbId } : {},
        ...binding.chatDbId ? { chatDbId: binding.chatDbId } : {}
      };
      db.onBackgroundSaveFailed = (failure) => {
        this.lastError = failure.error;
        this.publish();
        this.onBackgroundSaveFailed?.(fixed, failure);
      };
    }
    async closeDatabases() {
      const databases = [...this.scopedDatabases.values()].map((entry) => entry.db);
      if (this.database)
        databases.push(this.database);
      for (const db of databases)
        db.sealBackgroundSaves();
      await Promise.allSettled([...this.scopedDatabases.values()].map((entry) => entry.tail));
      await Promise.all(databases.map((db) => db.drain()));
      for (const db of databases)
        await db.close();
    }
    async rootLoaded(db, binding, targets = new RootTargets(db)) {
      try {
        await targets.validateExisting();
        targets.invalidate();
        await this.onRootLoaded?.(new RootEntities(db, targets), binding);
      } catch (error) {
        await db.close();
        throw error;
      }
    }
    checkBinding(binding) {
      if (!this.configuration) {
        if (this.lastError?.code === "CONFIG_FAILED")
          throw new ServiceError(this.lastError);
        if (this.mode === "opfs" && this.lastError)
          throw new ServiceError(this.lastError);
        throw new ServiceError({
          code: "NOT_INITIALIZED",
          message: "开发模式尚未配置数据库目录；请在插件中选择并授权存储目录。"
        });
      }
      if (!binding || typeof binding.storageId !== "string" || !Number.isSafeInteger(binding.configGeneration)) {
        throw new ServiceError({
          code: "INVALID_REQUEST",
          failureKind: "request-rejected",
          message: "数据库请求必须携带捕获的存储身份和配置代次。"
        });
      }
      if (binding.storageId !== this.configuration.storageId || binding.configGeneration !== this.configuration.configGeneration) {
        throw new ServiceError({
          code: "STALE_CONFIGURATION",
          message: "原目录配置已失效，请取得新目标；旧请求不会改写新目录。"
        });
      }
    }
    admit() {
      if (this.switching)
        throw new ServiceError({ code: "CONFIG_CHANGING", message: "目录切换正在排空已接收操作，请等待完成。" });
    }
    getStatus() {
      return this.enqueue(async () => {
        if (this.configuration) {
          try {
            await this.checkPermission();
          } catch (error) {
            this.permission = "prompt";
            this.lastError = errorData(error);
          }
        }
        this.publish();
        return this.info();
      });
    }
    select(directory) {
      if (this.mode !== "directory")
        return Promise.reject(new ServiceError({ code: "STALE_CONFIGURATION", message: "当前使用游玩模式，原目录选择结果已失效。" }));
      return this.switchDirectory(directory, "directory");
    }
    configureMode(mode, autoReloadEnabled) {
      if (!["opfs", "directory"].includes(mode) || typeof autoReloadEnabled !== "boolean")
        return Promise.reject(new ServiceError({ code: "INVALID_REQUEST", message: "存储模式设置无效。" }));
      if (this.switching)
        return Promise.reject(new ServiceError({ code: "CONFIG_CHANGING", message: "已有存储切换尚未完成。" }));
      return this.switchDirectory(undefined, mode, autoReloadEnabled);
    }
    switchDirectory(selected, mode, autoReloadEnabled = this.autoReloadEnabled) {
      if (this.switching)
        return Promise.reject(new ServiceError({ code: "CONFIG_CHANGING", message: "已有目录切换尚未完成。" }));
      this.switching = true;
      this.publish();
      return this.enqueue(async () => {
        let candidate;
        try {
          await this.readRegistry();
          const old = this.registry;
          const savedDirectory = old?.savedDirectory ?? (old && (old.mode ?? "directory") === "directory" ? { storageId: old.storageId, directory: old.directory, mode: "directory" } : undefined);
          const directory = selected ?? (mode === "opfs" ? await this.getOpfsDirectory() : savedDirectory?.directory);
          if (!directory) {
            this.beforeConfigurationChange?.();
            await this.closeDatabases();
            this.database = undefined;
            this.targets = undefined;
            this.scopedDatabases.clear();
            this.configuration = undefined;
            this.mode = mode;
            this.autoReloadEnabled = autoReloadEnabled;
            this.permission = undefined;
            this.lastError = undefined;
            this.updateReloadTimer();
            return this.info();
          }
          if (this.configuration && (mode !== this.mode || !await directory.isSameEntry(this.configuration.directory)))
            this.beforeConfigurationChange?.();
          await Promise.allSettled([...this.scopedDatabases.values()].map((entry) => entry.tail));
          const permission = mode === "opfs" ? "granted" : await directoryPermission(directory);
          if (selected && permission !== "granted")
            throw new ServiceError({ code: "PERMISSION_REQUIRED", message: "新目录未获得读写授权，原配置保持不变。" });
          let storageId;
          for (const space of old?.spaces ?? []) {
            if ((space.mode ?? "directory") === mode && await directory.isSameEntry(space.directory)) {
              storageId = space.storageId;
              break;
            }
          }
          storageId ??= crypto.randomUUID();
          const same = storageId === this.configuration?.storageId && mode === this.mode;
          const configGeneration = same ? old.configGeneration : (old?.configGeneration ?? 0) + 1;
          if (!Number.isSafeInteger(configGeneration))
            throw new ServiceError({ code: "CONFIG_FAILED", message: "配置代次已超过安全整数范围。" });
          const known = old?.spaces.some((space) => space.storageId === storageId) ?? false;
          if (permission === "granted") {
            candidate = same && this.database ? this.database : await this.createDatabase(directory, undefined, mode);
            if (!(same && candidate.availability === "ready")) {
              if (known)
                await candidate.openExisting();
              else
                await candidate.open();
            }
            await this.rootLoaded(candidate, { storageId, configGeneration }, same ? this.targets : undefined);
          }
          if (old && !same)
            this.beforeConfigurationChange?.();
          const space = { storageId, directory, mode };
          const spaces = [...(old?.spaces ?? []).filter((s) => s.storageId !== storageId), space];
          const next = {
            ...space,
            configGeneration,
            spaces,
            savedDirectory: mode === "directory" ? space : savedDirectory,
            autoReloadEnabled
          };
          await this.repository.write(next);
          if (this.database !== candidate && (!same || !candidate))
            await this.closeDatabases();
          if (!same || !candidate) {
            this.scopedDatabases.clear();
          }
          this.configuration = next;
          if (this.database !== candidate)
            this.targets = candidate ? new RootTargets(candidate) : undefined;
          this.database = candidate;
          if (candidate)
            this.bindDatabase(candidate, next);
          this.registry = next;
          this.mode = mode;
          this.autoReloadEnabled = autoReloadEnabled;
          this.updateReloadTimer();
          this.permission = permission;
          this.lastError = undefined;
          this.switching = false;
          return this.info();
        } catch (error) {
          if (candidate && candidate !== this.database)
            await candidate.close();
          this.lastError = errorData(error);
          throw error;
        } finally {
          this.switching = false;
          this.publish();
        }
      });
    }
    validateIdentityBinding(binding) {
      try {
        this.admit();
      } catch (error) {
        return Promise.reject(error);
      }
      return this.enqueue(async () => {
        this.checkBinding(binding);
        await this.requirePermission();
      });
    }
    manageEntities(binding, task, readOnly = false) {
      try {
        this.admit();
      } catch (error) {
        return Promise.reject(error);
      }
      const captured = { ...binding };
      return this.enqueue(async () => {
        this.checkBinding(captured);
        await this.requirePermission();
        if (!this.database || !this.targets)
          throw new ServiceError({ code: "INSTANCE_DISABLED", message: "root 文件尚未恢复。" });
        return task(new RootEntities(this.database, readOnly ? new RootTargets(this.database, true) : this.targets));
      });
    }
    scan(binding, request) {
      try {
        this.admit();
      } catch (error) {
        return Promise.reject(error);
      }
      const captured = { ...binding }, instruction = structuredClone(request);
      return this.enqueue(async () => {
        this.checkBinding(captured);
        await this.requirePermission();
        const directory = this.configuration.directory;
        if (instruction.operation === "records") {
          if (!this.database)
            return {
              directoryName: directory.name,
              rootReadable: false,
              records: [],
              targets: [],
              issues: [{ relativePath: "global.sqlite", reason: "管理数据库尚未恢复，请先恢复现有数据库。" }]
            };
          return scanRecords(this.database, directory.name);
        }
        if (instruction.operation === "directory")
          return scanDirectory(directory, instruction.charDbId);
        if (instruction.operation === "file")
          return scanFile(directory, instruction.charDbId, instruction.chatDbId);
        throw new ServiceError({ code: "INVALID_REQUEST", message: "扫描请求类型无效。" });
      });
    }
    execute(binding, task) {
      return this.schedule(binding, (db, lifecycle) => lifecycle ? lifecycle.read(task) : task(db));
    }
    inspect(binding, task) {
      return this.schedule(binding, (db, lifecycle) => lifecycle ? lifecycle.inspect(task, new RootTargets(this.database, true)) : task(db));
    }
    executeWrite(binding, commands, callId, onCommitted) {
      let snapshot;
      try {
        snapshot = structuredClone(commands);
      } catch (error) {
        return Promise.reject(beforeBusinessSqlError(error));
      }
      return this.schedule(binding, async (db, lifecycle) => {
        if (lifecycle)
          return lifecycle.write(snapshot, callId, onCommitted, () => this.assertScoped(binding));
        try {
          await this.targets.ready();
        } catch (error) {
          throw beforeBusinessSqlError(error);
        }
        return db.transaction(snapshot, onCommitted);
      }, true);
    }
    executeBatch(binding, task) {
      return this.schedule(binding, async (db, lifecycle) => {
        if (!lifecycle) {
          try {
            await this.targets.ready();
          } catch (error) {
            throw beforeBusinessSqlError(error);
          }
        }
        return task((commands, callId, onCommitted) => lifecycle ? lifecycle.write(commands, callId, onCommitted, () => this.assertScoped(binding)) : db.transaction(commands, onCommitted));
      }, true);
    }
    assertScoped(binding) {
      if (this.cleanupSeals.has(bindingKey(binding)))
        throw new ServiceError({
          code: "STALE_IDENTITY",
          resultKind: "identity",
          resultState: "not-applied",
          message: "该数据库正在清理，本次 SQL 未执行。"
        });
      this.beforeScopedExecution?.(binding);
    }
    sealCleanup(binding) {
      this.cleanupSeals.add(bindingKey(binding));
    }
    releaseCleanup(binding) {
      this.cleanupSeals.delete(bindingKey(binding));
    }
    assertIdentityTargetAvailable(binding) {
      if (this.cleanupSeals.has(bindingKey(binding)))
        throw new ServiceError({
          code: "STALE_IDENTITY",
          resultKind: "identity",
          resultState: "not-applied",
          message: "该 UUID 的数据库正在清理，不能登记新的访问引用。"
        });
    }
    async drainCleanup(binding) {
      await this.enqueue(async () => {
        this.checkBinding(binding);
        await this.requirePermission();
      });
      const entry = this.scopedDatabases.get(bindingKey(binding));
      if (entry) {
        await entry.tail;
        await entry.db.close();
        this.scopedDatabases.delete(bindingKey(binding));
      }
    }
    removeCleanupFile(binding, authorize = async () => {}) {
      return this.enqueue(async () => {
        this.checkBinding(binding);
        await this.requirePermission();
        this.validateScoped(binding);
        if (!this.cleanupSeals.has(bindingKey(binding)) || this.scopedDatabases.has(bindingKey(binding)))
          throw new ServiceError({
            code: "RESULT_UNCONFIRMED",
            resultState: "unconfirmed",
            message: "文件清理尚未完成排空，拒绝删除。"
          });
        if (!this.database || !this.targets)
          throw new ServiceError({ code: "INSTANCE_DISABLED", message: "root 尚未恢复，拒绝文件清理。" });
        await authorize(new RootEntities(this.database, this.targets));
        await new DirectoryStorage(this.configuration.directory, binding.charDbId, binding.chatDbId, this.mode === "opfs").remove();
      });
    }
    registerGenerated(binding) {
      try {
        this.admit();
      } catch (error) {
        return Promise.reject(error);
      }
      const captured = { ...binding };
      return this.enqueue(async () => {
        this.checkBinding(captured);
        await this.requirePermission();
        this.validateScoped(captured);
        if (!this.database || !this.targets)
          throw new ServiceError({ code: "INSTANCE_DISABLED", message: "root 文件尚未恢复。" });
        await this.targets.registerGenerated(captured);
      });
    }
    registerObserved(binding) {
      try {
        this.admit();
      } catch (error) {
        return Promise.reject(error);
      }
      const captured = { ...binding };
      return this.enqueue(async () => {
        this.checkBinding(captured);
        await this.requirePermission();
        this.validateScoped(captured);
        if (!this.database || !this.targets)
          throw new ServiceError({ code: "INSTANCE_DISABLED", message: "全局数据库尚未恢复。" });
        if (await this.targets.read(captured))
          return;
        const db = await this.createDatabase(this.configuration.directory, captured, this.mode);
        try {
          if (!await db.fileExists())
            await this.targets.registerGenerated(captured);
        } finally {
          await db.close();
        }
      });
    }
    refresh(binding) {
      const captured = { ...binding };
      try {
        this.admit();
        this.checkBinding(captured);
        if (!captured.scope || captured.scope === "global") {
          if (captured.charDbId !== undefined || captured.chatDbId !== undefined)
            throw new ServiceError({
              code: "INVALID_REQUEST",
              failureKind: "request-rejected",
              message: "global 目标不接受角色或聊天身份。"
            });
          this.database?.cancelPendingSaveForReload();
        } else {
          this.validateScoped(captured);
          this.assertScoped(captured);
          this.scopedDatabases.get(bindingKey(captured))?.db.cancelPendingSaveForReload();
        }
      } catch (error) {
        return Promise.reject(error);
      }
      return this.schedule(captured, async (db, lifecycle) => {
        if (lifecycle)
          await lifecycle.refresh();
        else {
          await db.refresh();
          await this.rootLoaded(db, this.configuration, this.targets);
        }
        return { reloaded: true };
      });
    }
    updateReloadTimer() {
      if (this.reloadTimer) {
        clearInterval(this.reloadTimer);
        this.reloadTimer = undefined;
      }
      if (this.mode !== "directory" || !this.autoReloadEnabled || !this.configuration)
        return;
      this.reloadTimer = setInterval(() => {
        this.pollChanges();
      }, 2000);
      this.reloadTimer.unref?.();
    }
    pollChanges() {
      if (this.reloadPending || this.switching || this.mode !== "directory" || !this.autoReloadEnabled || !this.configuration)
        return Promise.resolve();
      this.reloadPending = true;
      return this.enqueue(async () => {
        if (this.switching || this.mode !== "directory" || !this.autoReloadEnabled || !this.configuration)
          return;
        await Promise.allSettled([...this.scopedDatabases.values()].map((entry) => entry.tail));
        let changed = false;
        try {
          await this.requirePermission();
          if (this.database?.availability === "ready" && await this.database.refreshIfChanged()) {
            await this.rootLoaded(this.database, this.configuration, this.targets);
            changed = true;
          }
          for (const entry of this.scopedDatabases.values())
            if (entry.db.availability === "ready") {
              try {
                changed = await entry.lifecycle.refresh(true) || changed;
              } catch (error) {
                this.lastError = errorData(error);
                changed = true;
              }
            }
        } catch (error) {
          this.lastError = errorData(error);
          changed = true;
        }
        if (changed)
          this.publish();
      }).finally(() => {
        this.reloadPending = false;
      });
    }
    validateScoped(binding) {
      if (!["char", "chat"].includes(binding.scope ?? ""))
        throw new ServiceError({
          code: "INVALID_REQUEST",
          failureKind: "request-rejected",
          message: "身份记录需要 char 或 chat 目标。"
        });
      if (!isUuid(binding.charDbId))
        throw new ServiceError({
          code: "INVALID_REQUEST",
          failureKind: "request-rejected",
          message: "角色目标需要有效 UUID。"
        });
      if (binding.scope === "chat" ? !isUuid(binding.chatDbId) : binding.chatDbId !== undefined)
        throw new ServiceError({
          code: "INVALID_REQUEST",
          failureKind: "request-rejected",
          message: "聊天目标需要有效 UUID，char 目标不接受聊天身份。"
        });
    }
    schedule(binding, task, businessWrite = false) {
      try {
        this.admit();
      } catch (error) {
        return Promise.reject(businessWrite ? beforeBusinessSqlError(error) : error);
      }
      const captured = binding && { ...binding };
      const admitted = this.enqueue(async () => {
        let taskStarted = false;
        try {
          this.checkBinding(captured);
          await this.requirePermission();
          if (captured.scope !== undefined && !["global", "char", "chat"].includes(captured.scope))
            throw new ServiceError({
              code: "INVALID_REQUEST",
              failureKind: "request-rejected",
              message: "此数据库层级未实现。"
            });
          if (!captured.scope || captured.scope === "global") {
            if (captured.charDbId !== undefined || captured.chatDbId !== undefined)
              throw new ServiceError({
                code: "INVALID_REQUEST",
                failureKind: "request-rejected",
                message: "global 目标不接受角色或聊天身份。"
              });
            if (!this.database)
              throw new ServiceError({ code: "INSTANCE_DISABLED", message: "文件尚未恢复。" });
            if (this.database.availability === "ready")
              await this.database.assertFileExisting();
            taskStarted = true;
            try {
              const value = await task(this.database);
              this.lastError = undefined;
              return { operation: Promise.resolve(value) };
            } catch (error) {
              this.lastError = errorData(error);
              throw error;
            } finally {
              this.publish();
            }
          }
          this.validateScoped(captured);
          this.assertScoped(captured);
          if (!this.database || !this.targets)
            throw new ServiceError({ code: "INSTANCE_DISABLED", message: "root 文件尚未恢复。" });
          const targets = this.targets;
          const targetKey = bindingKey(captured);
          let entry = this.scopedDatabases.get(targetKey);
          if (!entry) {
            const db = await this.createDatabase(this.configuration.directory, captured, this.mode);
            this.bindDatabase(db, captured);
            entry = {
              db,
              lifecycle: new TargetLifecycle(captured, db, targets),
              tail: Promise.resolve(),
              pending: 0,
              used: Date.now()
            };
            this.scopedDatabases.set(targetKey, entry);
          }
          const fixed = entry;
          fixed.pending++;
          const operation = fixed.tail.then(() => {
            try {
              this.assertScoped(captured);
            } catch (error) {
              throw businessWrite ? beforeBusinessSqlError(error) : error;
            }
            return task(fixed.db, fixed.lifecycle);
          }).finally(() => {
            fixed.pending--;
            fixed.used = Date.now();
          });
          fixed.tail = operation.catch(() => {
            return;
          });
          return { operation };
        } catch (error) {
          throw businessWrite && !taskStarted ? beforeBusinessSqlError(error) : error;
        }
      });
      return admitted.then((result) => result.operation);
    }
    releaseIdle(now = Date.now()) {
      return this.enqueue(async () => {
        for (const [id, entry] of this.scopedDatabases)
          if (!entry.pending && now - entry.used >= 60000) {
            try {
              await entry.db.close();
              this.scopedDatabases.delete(id);
            } catch {}
          }
      });
    }
    drainForRestart() {
      return this.enqueue(async () => {
        if (this.switching)
          throw new ServiceError({ code: "CONFIG_CHANGING", message: "目录切换尚未完成。" });
        await Promise.all([...this.scopedDatabases.values()].map((entry) => entry.tail));
        await Promise.all([...this.scopedDatabases.values()].map((entry) => entry.db.drain()));
        await this.database?.drain();
      });
    }
    resume(binding) {
      try {
        this.admit();
      } catch (error) {
        return Promise.reject(error);
      }
      const captured = binding && { ...binding };
      return this.enqueue(async () => {
        this.checkBinding(captured);
        try {
          await this.requirePermission();
          await this.loadDatabase();
          this.lastError = undefined;
          return this.info();
        } catch (error) {
          this.lastError = errorData(error);
          throw error;
        } finally {
          this.publish();
        }
      });
    }
    async closeForRestart(authorize) {
      return this.enqueue(async () => {
        if (this.switching)
          throw new ServiceError({ code: "CONFIG_CHANGING", message: "目录切换尚未完成。" });
        await Promise.all([...this.scopedDatabases.values()].map((entry) => entry.tail));
        const databases = [...this.scopedDatabases.values()].map((entry) => entry.db);
        if (this.database)
          databases.push(this.database);
        const cancelled = databases.map((db) => db.sealBackgroundSaves());
        try {
          await Promise.all(databases.map((db) => db.drain()));
          authorize();
          for (const db of databases)
            db.closeForRestart();
          this.database = undefined;
          this.targets = undefined;
          this.scopedDatabases.clear();
          if (this.reloadTimer) {
            clearInterval(this.reloadTimer);
            this.reloadTimer = undefined;
          }
        } catch (error) {
          for (let i = 0;i < databases.length; i++)
            if (databases[i].availability === "ready")
              databases[i].resumeBackgroundSaves(cancelled[i]);
          this.lastError = errorData(error);
          this.publish();
          throw error;
        }
      });
    }
  }

  // src/core/binds.ts
  var invalid4 = (reason) => {
    throw new ServiceError({
      code: "INVALID_REQUEST",
      message: `绑定参数无效：${reason}`,
      failureKind: "request-rejected"
    });
  };
  function nativePrototype(prototype, constructor) {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, "constructor");
    return !!descriptor && "value" in descriptor && typeof descriptor.value === "function" && Object.getOwnPropertyDescriptor(descriptor.value, "prototype")?.value === prototype && Function.prototype.toString.call(descriptor.value) === Function.prototype.toString.call(constructor);
  }
  function plain(value) {
    const prototype = Object.getPrototypeOf(value);
    return prototype === null || Object.getPrototypeOf(prototype) === null && nativePrototype(prototype, Object);
  }
  function ordinaryArray(value) {
    const prototype = Object.getPrototypeOf(value);
    return prototype !== null && Array.isArray(prototype) && plain(prototype) && nativePrototype(prototype, Array);
  }
  var typedArrayName = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Uint8Array.prototype), Symbol.toStringTag).get;
  function entries2(value) {
    if (!Array.isArray(value) && !plain(value))
      return invalid4("只接受数组和普通对象。");
    if (Array.isArray(value) && !ordinaryArray(value))
      return invalid4("不接受数组类实例或自定义原型。");
    const descriptors = Object.getOwnPropertyDescriptors(value);
    if (Object.getOwnPropertySymbols(value).length)
      return invalid4("不接受 symbol 属性。");
    const result = [];
    for (const [key, descriptor] of Object.entries(descriptors)) {
      if (Array.isArray(value) && key === "length")
        continue;
      if (!("value" in descriptor) || !descriptor.enumerable)
        return invalid4("不接受访问器或隐藏属性。");
      if (Array.isArray(value) && (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= value.length))
        return invalid4("数组不能包含额外属性。");
      result.push([key, descriptor.value]);
    }
    if (Array.isArray(value) && result.length !== value.length)
      return invalid4("数组不能包含空位。");
    return result;
  }
  function jsonSnapshot(value, ancestors) {
    if (value === null || typeof value === "string" || typeof value === "boolean")
      return value;
    if (typeof value === "number")
      return Number.isFinite(value) ? value : invalid4("数值必须有限。");
    if (typeof value !== "object")
      return invalid4("JSON 中包含不支持的值。");
    if (ancestors.has(value))
      return invalid4("JSON 不能循环引用。");
    ancestors.add(value);
    try {
      const properties = entries2(value);
      if (Array.isArray(value))
        return properties.map(([, item]) => jsonSnapshot(item, ancestors));
      const result = Object.create(null);
      for (const [key, item] of properties)
        result[key] = jsonSnapshot(item, ancestors);
      return result;
    } finally {
      ancestors.delete(value);
    }
  }
  function scalar(value, allowJson) {
    if (value === null || typeof value === "string")
      return value;
    if (typeof value === "number")
      return Number.isFinite(value) ? value : invalid4("数值必须有限。");
    if (ArrayBuffer.isView(value) && typedArrayName.call(value) === "Uint8Array")
      return new Uint8Array(value);
    if (allowJson && typeof value === "object")
      return JSON.stringify(jsonSnapshot(value, new Set));
    return invalid4(allowJson ? "顶层值只接受 NULL、字符串、有限数值、BLOB 或 JSON 数组/对象。" : "Worker 只接受已序列化的原生值。");
  }
  function capture(input, allowJson) {
    if (input === undefined)
      return;
    if (input === null || typeof input !== "object")
      return invalid4("最外层必须是参数数组或命名参数对象。");
    const properties = entries2(input);
    if (Array.isArray(input))
      return properties.map(([, value]) => scalar(value, allowJson));
    const result = Object.create(null);
    for (const [key, value] of properties) {
      if (!/^[:@$].+$/s.test(key))
        return invalid4("命名参数键必须保留 :、@ 或 $ 前缀及参数名。");
      result[key] = scalar(value, allowJson);
    }
    return result;
  }
  function validateSerializedBinds(input) {
    return capture(input, false);
  }

  // src/worker/restart-coordinator.ts
  class RestartCoordinator {
    post;
    drain;
    timeoutMs;
    attempt;
    automaticTargets = new Set;
    constructor(post, drain, timeoutMs = 30000) {
      this.post = post;
      this.drain = drain;
      this.timeoutMs = timeoutMs;
    }
    get state() {
      return this.attempt?.state ?? "idle";
    }
    assertParticipant(port) {
      if (this.attempt && !this.attempt.participants.has(port))
        this.assertAdmission(port);
    }
    cancelAttempt(port, attemptId) {
      if (this.attempt?.id === attemptId && this.attempt.participants.has(port))
        this.cancel();
    }
    assertAdmission(port) {
      const a = this.attempt;
      if (a && (a.state !== "preparing" || a.participants.get(port) !== false)) {
        throw new ServiceError({ code: "SERVICE_RESTARTING", message: "全局准备期间该连接尚未就绪或已封住业务入口。" });
      }
    }
    prepare(targetBuildId, ports, automatic = false, purpose = "update") {
      const existing = this.attempt;
      if (existing) {
        if (automatic)
          this.automaticTargets.add(targetBuildId);
        if (existing.targetBuildId === targetBuildId && existing.purpose === purpose)
          return existing.promise;
        const error = new ServiceError({
          code: "PROTOCOL_MISMATCH",
          message: "多个页面请求不同目标 UUID，请加载一致构建后重试。"
        });
        this.cancel(error.data);
        return Promise.reject(error);
      }
      if (automatic && this.automaticTargets.has(targetBuildId))
        return Promise.reject(new ServiceError({ code: "SERVICE_RESTARTING", message: "该目标 UUID 已自动尝试；修复阻塞后请显式安全重试。" }));
      if (automatic)
        this.automaticTargets.add(targetBuildId);
      let resolve, reject;
      const promise = new Promise((yes, no) => {
        resolve = yes;
        reject = no;
      });
      promise.catch(() => {});
      const a = {
        id: crypto.randomUUID(),
        targetBuildId,
        purpose,
        participants: new Map([...ports].map((p) => [p, false])),
        state: "preparing",
        promise,
        resolve,
        reject,
        timer: setTimeout(() => {
          if (this.attempt === a)
            this.cancel({ code: "SERVICE_RESTARTING", message: "全局准备超过 30 秒上限；没有取消正在执行的写入。" });
        }, this.timeoutMs)
      };
      this.attempt = a;
      for (const port of a.participants.keys()) {
        if (this.attempt !== a)
          break;
        try {
          this.post(port, { type: "restart-event", phase: "prepare", attemptId: a.id, targetBuildId, purpose });
        } catch {
          this.disconnected(port);
        }
      }
      this.finish(a);
      return promise;
    }
    reply(port, attemptId, error) {
      const a = this.attempt;
      if (!a || a.id !== attemptId || a.state !== "preparing" || !a.participants.has(port))
        return;
      if (error) {
        this.cancel(error);
        return;
      }
      a.participants.set(port, true);
      this.finish(a);
    }
    disconnected(port) {
      if (this.attempt?.state === "exiting")
        return;
      if (this.attempt?.participants.has(port))
        this.cancel({ code: "CONNECTION_FAILED", message: "准备参与页面失联，不能确认全局排空。" });
    }
    cancel(error = { code: "SERVICE_RESTARTING", message: "全局准备已取消；原写入及身份工作继续。" }) {
      const a = this.attempt;
      if (!a)
        return;
      if (a.state === "exiting")
        return;
      this.attempt = undefined;
      clearTimeout(a.timer);
      a.reject(new ServiceError(error));
      for (const port of a.participants.keys()) {
        try {
          this.post(port, {
            type: "restart-event",
            phase: "cancel",
            attemptId: a.id,
            targetBuildId: a.targetBuildId,
            purpose: a.purpose,
            error
          });
        } catch {}
      }
    }
    commit(port, attemptId, close, exit) {
      const a = this.attempt;
      const valid = () => this.attempt === a && a?.id === attemptId && a.participants.has(port) && a.state === "prepared";
      if (!a || !valid())
        return Promise.reject(new ServiceError({ code: "SERVICE_RESTARTING", message: "当前全局准备屏障已失效，拒绝关闭或退出。" }));
      if (a.commit)
        return a.commit;
      a.commit = (async () => {
        try {
          await close(() => {
            if (!valid())
              throw new ServiceError({ code: "SERVICE_RESTARTING", message: "关闭前屏障已取消或参与页面失联。" });
            a.state = "exiting";
          });
          for (const p of a.participants.keys()) {
            try {
              this.post(p, {
                type: "restart-event",
                phase: "exit",
                attemptId: a.id,
                targetBuildId: a.targetBuildId,
                purpose: a.purpose
              });
            } catch {}
          }
          exit();
        } catch (error) {
          if (this.attempt === a) {
            a.state = "prepared";
            this.cancel(errorData(error));
          }
          throw error;
        }
      })();
      return a.commit;
    }
    finish(a) {
      if (this.attempt !== a || a.state !== "preparing" || [...a.participants.values()].some((done) => !done))
        return;
      a.state = "draining";
      this.drain().then(() => {
        if (this.attempt !== a)
          return;
        a.state = "prepared";
        clearTimeout(a.timer);
        a.resolve({ prepared: true, attemptId: a.id, targetBuildId: a.targetBuildId, purpose: a.purpose });
      }, (error) => {
        if (this.attempt === a)
          this.cancel(errorData(error));
      });
    }
  }

  // src/worker/entry.ts
  importScripts(new URL("sql-wasm.js", self.location.href).href);
  var engine = initSqlJs({ locateFile: (file) => new URL(file, self.location.href).href });
  var instanceId = crypto.randomUUID();
  var characterIdentities = new Map;
  var chatIdentities = new Map;
  var ports = new Set;
  var lastSeen = new Map;
  var key2 = identityBindingKey;
  function removePort(port) {
    restart.disconnected(port);
    entities.disconnect(port);
    for (const identity of characterIdentities.values())
      identity.disconnect(port);
    for (const identity of chatIdentities.values())
      identity.disconnect(port);
    ports.delete(port);
    lastSeen.delete(port);
    port.close();
  }
  setInterval(() => {
    for (const [port, time] of lastSeen)
      if (Date.now() - time > 90000)
        removePort(port);
  }, 30000);
  var storage = new StorageCoordinator(new IndexedDbConfiguration, async (directory, binding, mode) => new SingleDatabase(await engine, new DirectoryStorage(directory, binding?.charDbId, binding?.chatDbId, mode === "opfs")), (info) => {
    const event = { type: "storage-changed", instanceId, ...withEntityRevision(info) };
    for (const port of ports) {
      try {
        port.postMessage(event);
      } catch {
        removePort(port);
      }
    }
  });
  var renames = new EntityRenames((binding, task) => storage.manageEntities(binding, task));
  storage.onBackgroundSaveFailed = (binding, failure) => {
    const event = { type: "background-save-failed", instanceId, binding, ...failure };
    for (const port of ports) {
      try {
        port.postMessage(event);
      } catch {
        removePort(port);
      }
    }
  };
  function chatCoordinate(entity) {
    if (!entity)
      return false;
    try {
      const parts = JSON.parse(entity);
      return Array.isArray(parts) && parts.length === 2 && parts.every((part) => typeof part === "string");
    } catch {
      return false;
    }
  }
  var deletions = new EntityDeletions(storage, (binding, ticket) => {
    for (const taskId of ticket.copyTaskIds ?? [])
      entities.forgetCopy(taskId);
    if (ticket.stage === "applied")
      for (const c of ticket.credentials ?? [])
        entities.forgetReference(binding, c.referenceId, c.chat);
    for (const participant of ports) {
      try {
        participant.postMessage({
          type: "entity-deleted",
          instanceId,
          storageId: binding.storageId,
          configGeneration: binding.configGeneration,
          ticket
        });
      } catch {
        removePort(participant);
      }
    }
  });
  function withEntityRevision(info) {
    return {
      ...info,
      storage: {
        ...info.storage,
        entityRevision: info.storage.storageId ? deletions.revision({ storageId: info.storage.storageId, configGeneration: info.storage.configGeneration }) : 0
      }
    };
  }
  var entities = new EntityCoordinator((binding, task) => storage.manageEntities(binding, task), (binding, entity) => {
    renames.assertEntity(binding, entity);
    deletions.assertEntity(binding, entity, entity !== binding.characterEntity && chatCoordinate(entity));
  }, (binding, id, chat) => storage.assertIdentityTargetAvailable({
    ...binding,
    scope: chat ? "chat" : "char",
    charDbId: chat ? binding.charDbId : id,
    ...chat ? { chatDbId: id } : { chatDbId: undefined }
  }), (binding, task) => storage.manageEntities(binding, task, true));
  storage.beforeScopedExecution = (binding) => entities.assertCached(binding);
  storage.beforeConfigurationChange = () => {
    entities.assertSettled();
    renames.assertSettled();
    deletions.assertSettled();
  };
  storage.onRootLoaded = async (records, binding) => {
    await entities.load(records, true);
    await deletions.load(records, binding);
  };
  setInterval(() => {
    storage.releaseIdle();
  }, 30000);
  function characters(binding, entity) {
    for (const [key, existing] of characterIdentities) {
      const values = JSON.parse(key);
      if (values[0] === binding.storageId && values[1] === binding.configGeneration && existing.hasLease(entity))
        return existing;
    }
    const domain = JSON.stringify([binding.storageId, binding.configGeneration, binding.entityRevision ?? 0]);
    let coordinator = characterIdentities.get(domain);
    if (!coordinator) {
      coordinator = new CharacterIdentities(async (id, entity) => {
        await entities.propose(binding, entity, id);
        await storage.registerGenerated({ ...binding, scope: "char", charDbId: id });
      }, (entity) => deletions.assertEntity(binding, entity));
      characterIdentities.set(domain, coordinator);
    }
    return coordinator;
  }
  function chats(binding, entity) {
    for (const [key, existing] of chatIdentities) {
      const values = JSON.parse(key);
      if (values[0] === binding.storageId && values[1] === binding.configGeneration && values[2] === binding.charDbId && existing.hasLease(entity))
        return existing;
    }
    const domain = JSON.stringify([
      binding.storageId,
      binding.configGeneration,
      binding.charDbId,
      binding.entityRevision ?? 0
    ]);
    let coordinator = chatIdentities.get(domain);
    if (!coordinator) {
      coordinator = new CharacterIdentities(async (id, entity) => {
        await entities.propose(binding, entity, id, true);
        await storage.registerGenerated({ ...binding, scope: "chat", chatDbId: id });
      }, (entity) => deletions.assertEntity(binding, entity, true));
      chatIdentities.set(domain, coordinator);
    }
    return coordinator;
  }
  var active = new Set;
  async function verifyDrain() {
    entities.assertSettled();
    renames.assertSettled();
    deletions.assertSettled();
    await storage.drainForRestart();
    for (const coordinator of characterIdentities.values())
      coordinator.assertSettled();
    for (const coordinator of chatIdentities.values())
      coordinator.assertSettled();
  }
  var deletionFailure = (error) => ["STALE_IDENTITY", "ENTITY_DELETE_PENDING", "ENTITY_DELETE_UNCONFIRMED"].includes(errorData(error).code);
  function deletedIdentity() {
    return new ServiceError({
      code: "STALE_IDENTITY",
      resultKind: "identity",
      message: "原角色或聊天已经收到删除通知，原身份 HTTP 已结束，但不会恢复这个引用。"
    });
  }
  async function finishIdentityAcquisition(binding, entity, chat, ticket, coordinator, owner) {
    try {
      const generation = await entities.generation(binding, entity, chat);
      deletions.assertEntity(binding, entity, chat);
      if (ticket.token)
        coordinator.pendingTicket(entity, ticket.token, owner);
      return { ...ticket, generation, referenceId: (await entities.credential(binding, entity, chat)).referenceId };
    } catch (error) {
      if (ticket.token) {
        let current = false;
        try {
          coordinator.pendingTicket(entity, ticket.token, owner);
          current = true;
        } catch {}
        if (current) {
          coordinator.settle(entity, ticket.token, false, owner);
        }
      }
      throw error;
    }
  }
  async function settleIdentity(binding, entity, token, confirmed, chat, coordinator, owner) {
    if (!confirmed) {
      const ticket = coordinator.settle(entity, token, false, owner);
      if (chat)
        await entities.verify(binding, true);
      await deletions.verify(binding, entity, chat);
      return { ...ticket, ...await entities.credential(binding, entity, chat) };
    }
    try {
      if (chat)
        await entities.verify(binding, true);
      await deletions.verify(binding, entity, chat);
      deletions.assertEntity(binding, entity, chat);
    } catch (error) {
      if (!deletionFailure(error))
        throw error;
      coordinator.settle(entity, token, false, owner);
      throw deletedIdentity();
    }
    const ticket = coordinator.pendingTicket(entity, token, owner);
    try {
      await entities.confirm(binding, entity, ticket.identityId, chat);
      deletions.assertEntity(binding, entity, chat);
    } catch (error) {
      if (!deletionFailure(error))
        throw error;
      coordinator.settle(entity, token, false, owner);
      throw deletedIdentity();
    }
    coordinator.settle(entity, token, true, owner);
    return { ...ticket, ...await entities.credential(binding, entity, chat) };
  }
  var restart = new RestartCoordinator((port, event) => port.postMessage(event), async () => {
    while (active.size)
      await Promise.allSettled([...active]);
    await verifyDrain();
  });
  var invalid5 = () => {
    throw new ServiceError({
      code: "INVALID_REQUEST",
      failureKind: "request-rejected",
      message: "请求字段或操作类型无效。"
    });
  };
  var isBusinessWrite = isWriteAction;
  var preflightError = (request, error) => isBusinessWrite(request) ? beforeBusinessSqlError(error) : error;
  function sqlCommand(input, mode) {
    if (!input || typeof input !== "object")
      return invalid5();
    checkPrefix(input.sql, mode);
    return { sql: input.sql, binds: validateSerializedBinds(input.binds), mode };
  }
  function writeCommands(operation) {
    if (operation.type === "checked-transaction") {
      validateCheckedCommands(operation.commands);
      return operation.commands.map((input) => ({
        kind: input.kind,
        sql: input.sql,
        binds: validateSerializedBinds(input.binds),
        ...input.kind === "write" ? {
          mode: "transaction",
          ...input.expectChanges === undefined ? {} : { expectChanges: input.expectChanges }
        } : {}
      }));
    }
    if (operation.type === "update")
      return [sqlCommand(operation, "update")];
    if (operation.type === "exec") {
      checkPrefix(operation.sql, "exec");
      return [{ sql: operation.sql, mode: "exec" }];
    }
    if (operation.type === "runSql") {
      const list = Array.isArray(operation.sql) ? operation.sql : [operation.sql];
      if (!list.length || list.some((sql) => typeof sql !== "string"))
        return invalid5();
      return list.map((sql) => ({ sql, mode: "runSql" }));
    }
    if (operation.type === "transaction") {
      if (!Array.isArray(operation.commands) || !operation.commands.length)
        return invalid5();
      return operation.commands.map((input) => {
        if (!input || typeof input !== "object")
          return invalid5();
        return sqlCommand(input, "transaction");
      });
    }
    return invalid5();
  }
  function executeWrite(operation, binding, execute = (commands, id) => storage.executeWrite(binding, commands, id)) {
    let commands, id;
    try {
      commands = writeCommands(operation);
      id = operation.callId ?? crypto.randomUUID();
    } catch (error) {
      throw beforeBusinessSqlError(error);
    }
    return execute(commands, id);
  }
  async function dispatch(request, port) {
    if (request.protocolVersion !== PROTOCOL_VERSION)
      throw preflightError(request, new ServiceError({ code: "PROTOCOL_MISMATCH", message: "通信协议不兼容，请关闭所有旧验证页后加载同一构建。" }));
    if (request.type === "restart-prepare") {
      restart.assertParticipant(port);
      if (!isUuid(request.targetBuildId))
        return invalid5();
      if (request.targetProtocolVersion !== PROTOCOL_VERSION) {
        const error = { code: "PROTOCOL_MISMATCH", message: "目标协议不兼容，取消准备。" };
        restart.cancel(error);
        throw new ServiceError(error);
      }
      if (request.purpose !== undefined && !["update", "disable"].includes(request.purpose))
        return invalid5();
      return restart.prepare(request.targetBuildId, ports, request.automatic === true, request.purpose);
    }
    if (request.type === "restart-reply") {
      if (typeof request.attemptId !== "string")
        return invalid5();
      restart.reply(port, request.attemptId, request.error);
      return {};
    }
    if (request.type === "restart-cancel") {
      if (typeof request.attemptId !== "string")
        return invalid5();
      restart.cancelAttempt(port, request.attemptId);
      return {};
    }
    if (request.type === "restart-commit") {
      if (typeof request.attemptId !== "string")
        return invalid5();
      return restart.commit(port, request.attemptId, (authorize) => storage.closeForRestart(() => {
        entities.assertSettled();
        renames.assertSettled();
        deletions.assertSettled();
        for (const coordinator of characterIdentities.values())
          coordinator.assertSettled();
        for (const coordinator of chatIdentities.values())
          coordinator.assertSettled();
        authorize();
      }), () => self.close());
    }
    if (request.type === "hello" && restart.state !== "idle")
      throw new ServiceError({ code: "SERVICE_RESTARTING", message: "全局准备期间暂停新连接握手，请取消后显式重连。" });
    try {
      if (!["ping", "disconnect", "storage-status", "restart-drain"].includes(request.type))
        restart.assertAdmission(port);
    } catch (error) {
      throw preflightError(request, error);
    }
    if (request.type === "restart-drain") {
      await verifyDrain();
      return { drained: true, buildId: BUILD_ID, protocolVersion: PROTOCOL_VERSION };
    }
    if (request.type === "character-copy-begin")
      return entities.begin(request.oldAvatar, request.newAvatar, request.binding, request.taskId);
    if (request.type === "entity-delete-begin")
      return deletions.begin(request.kind, request.entity, request.operationId, request.deleteChats, request.binding);
    if (request.type === "entity-delete-pending")
      return deletions.pending(request.binding);
    if (request.type === "entity-delete-settle") {
      if (!isUuid(request.taskId) || typeof request.confirmed !== "boolean" || typeof request.absent !== "boolean" || request.requestOperationId !== undefined && !isUuid(request.requestOperationId) || request.nativeResult !== undefined && !["success", "failed", "unknown"].includes(request.nativeResult) || request.observedId !== undefined && request.observedId !== null && !isUuid(request.observedId) || request.remainingChatNames !== undefined && (!Array.isArray(request.remainingChatNames) || request.remainingChatNames.length > 256 || request.remainingChatNames.some((name) => typeof name !== "string" || !name) || new Set(request.remainingChatNames).size !== request.remainingChatNames.length))
        return invalid5();
      return deletions.settle(request, request.binding);
    }
    if (request.type === "entity-delete-resume") {
      return deletions.resume(request.binding);
    }
    if (request.type === "entity-rename-begin")
      return renames.begin(request.kind, request.oldEntity, request.newEntity, request.binding);
    if (request.type === "entity-rename-settle") {
      await storage.validateIdentityBinding(request.binding);
      if (!isUuid(request.taskId) || typeof request.checkedOldEntity !== "string" || typeof request.checkedNewEntity !== "string" || typeof request.confirmed !== "boolean" || request.observedId !== null && !isUuid(request.observedId))
        return invalid5();
      const result = await renames.settle({
        taskId: request.taskId,
        kind: request.kind,
        oldEntity: request.oldEntity,
        newEntity: request.newEntity,
        checkedOldEntity: request.checkedOldEntity,
        checkedNewEntity: request.checkedNewEntity,
        stage: "pending",
        expected: request.expected
      }, request.observedId, request.parentId, request.confirmed, request.binding, () => {
        const avatars = request.kind === "char" ? [request.oldEntity, request.newEntity] : [JSON.parse(request.oldEntity)[0], JSON.parse(request.newEntity)[0]];
        const affects = (entity) => request.kind === "chat" ? entity === request.oldEntity || entity === request.newEntity : (() => {
          try {
            return avatars.includes(JSON.parse(entity)[0]);
          } catch {
            return false;
          }
        })();
        return entities.hasCopyWorkFor(avatars) || [...characterIdentities.values()].some((coordinator) => coordinator.hasWorkFor((entity) => avatars.includes(entity))) || [...chatIdentities.values()].some((coordinator) => coordinator.hasWorkFor(affects));
      });
      if (result.stage === "applied")
        for (const participant of ports) {
          try {
            participant.postMessage({
              type: "entity-renamed",
              instanceId,
              storageId: request.binding.storageId,
              configGeneration: request.binding.configGeneration
            });
          } catch {
            removePort(participant);
          }
        }
      return result;
    }
    if (request.type === "character-copy-acquire") {
      const b = request.binding;
      await storage.validateIdentityBinding(b);
      await deletions.verify(b, request.oldAvatar);
      await deletions.verify(b, request.newAvatar);
      renames.assertEntity(b, request.oldAvatar);
      renames.assertEntity(b, request.newAvatar);
      const coordinator = characters(b, request.newAvatar);
      const ticket = await entities.acquire(request.oldAvatar, request.newAvatar, request.taskId, request.sourceId, request.observedId, b, port, coordinator.hasLease(request.newAvatar));
      if (ticket.token || ticket.stage === "cleared" && !coordinator.hasLease(request.newAvatar) && !await entities.candidate(b, request.newAvatar))
        coordinator.forget(request.newAvatar);
      return ticket;
    }
    if (request.type === "character-copy-settle") {
      await storage.validateIdentityBinding(request.binding);
      const ticket = await entities.settle(request.oldAvatar, request.newAvatar, request.taskId, request.token, request.confirmed, request.binding, port);
      if (request.confirmed) {
        try {
          await deletions.verify(request.binding, request.oldAvatar);
          await deletions.verify(request.binding, request.newAvatar);
        } catch (error) {
          if (deletionFailure(error))
            throw deletedIdentity();
          throw error;
        }
      }
      return ticket;
    }
    if (request.type === "identity-restore") {
      const b = request.binding;
      if (!b || !isUuid(b.charDbId) || !["char", "chat"].includes(b.scope ?? "") || (b.scope === "char" ? b.chatDbId !== undefined : !isUuid(b.chatDbId)) || typeof request.entity !== "string")
        return invalid5();
      await storage.validateIdentityBinding(b);
      if (request.readOnly)
        deletions.assertBinding(b);
      else
        await deletions.verify(b, request.entity, b.scope === "chat");
      renames.assertEntity(b, request.entity);
      renames.assertEntity(b, b.characterEntity);
      if (b.scope === "chat")
        await entities.verify({ ...b, scope: "char", chatDbId: undefined }, false, request.readOnly);
      const id = b.scope === "chat" ? b.chatDbId : b.charDbId;
      const generation = request.readOnly ? await entities.confirmReadOnly(b, request.entity, id, b.scope === "chat") : await entities.confirm(b, request.entity, id, b.scope === "chat", request.matchingEntities, request.generation);
      if (!request.readOnly)
        await storage.registerObserved(b);
      if (request.generation !== undefined && request.generation !== generation)
        throw new ServiceError({ code: "STALE_IDENTITY", resultKind: "identity", message: "恢复的文件引用代次已失效。" });
      return {
        identityId: id,
        generation,
        referenceId: (await entities.credential(b, request.entity, b.scope === "chat")).referenceId,
        restored: true
      };
    }
    if (request.type === "chat-identity-acquire" || request.type === "chat-identity-settle") {
      const b = request.binding;
      if (!b || b.scope !== "char" || !isUuid(b.charDbId) || b.chatDbId !== undefined || typeof request.entity !== "string" || !request.entity)
        return invalid5();
      await storage.validateIdentityBinding(b);
      const coordinator = chats(b, request.entity);
      if (request.type === "chat-identity-acquire") {
        await entities.verify(b);
        await deletions.verify(b, request.entity, true);
        renames.assertEntity(b, request.entity);
        renames.assertEntity(b, b.characterEntity);
        if (request.observedId) {
          await entities.confirm(b, request.entity, request.observedId, true);
          await storage.registerObserved({ ...b, scope: "chat", chatDbId: request.observedId });
        } else {
          const candidate = await entities.candidate(b, request.entity, true);
          if (candidate)
            coordinator.seed(request.entity, candidate);
        }
        const ticket = await coordinator.acquire(request.entity, request.observedId, port);
        return finishIdentityAcquisition(b, request.entity, true, ticket, coordinator, port);
      }
      if (typeof request.token !== "string" || typeof request.confirmed !== "boolean")
        return invalid5();
      return settleIdentity(b, request.entity, request.token, request.confirmed, true, coordinator, port);
    }
    if (request.type === "identity-acquire" || request.type === "identity-settle") {
      const b = request.binding;
      if (typeof request.entity !== "string" || !request.entity || !b || b.scope && b.scope !== "global" || b.charDbId !== undefined || b.chatDbId !== undefined)
        return invalid5();
      await storage.validateIdentityBinding(b);
      const coordinator = characters(b, request.entity);
      if (request.type === "identity-acquire") {
        await deletions.verify(b, request.entity);
        renames.assertEntity(b, request.entity);
        if (request.observedId) {
          await entities.confirm(b, request.entity, request.observedId, false, request.matchingEntities);
          await storage.registerObserved({ ...b, scope: "char", charDbId: request.observedId });
        } else {
          const candidate = await entities.candidate(b, request.entity);
          if (candidate)
            coordinator.seed(request.entity, candidate);
        }
        const ticket = await coordinator.acquire(request.entity, request.observedId, port);
        return finishIdentityAcquisition(b, request.entity, false, ticket, coordinator, port);
      }
      if (typeof request.token !== "string" || typeof request.confirmed !== "boolean")
        return invalid5();
      return settleIdentity(b, request.entity, request.token, request.confirmed, false, coordinator, port);
    }
    if (request.type === "scan-cleanup") {
      const result = await deletions.cleanScan(request.request, request.binding);
      if (result.record.status === "removed")
        entities.forgetReference(request.binding, request.request.expected.referenceId, request.request.expected.scope === "chat");
      return result;
    }
    if (request.type === "scan")
      return storage.scan(request.binding, request.request);
    try {
      if ("binding" in request && request.binding) {
        deletions.assertBinding(request.binding);
        await entities.verify(request.binding, false, request.type === "viewer");
      }
    } catch (error) {
      throw preflightError(request, error);
    }
    if (request.type === "hello")
      return { protocolVersion: PROTOCOL_VERSION, buildId: BUILD_ID, ...withEntityRevision(await storage.getStatus()) };
    if (request.type === "ping")
      return { alive: true };
    if (request.type === "disconnect") {
      removePort(port);
      return {};
    }
    if (request.type === "storage-status")
      return withEntityRevision(await storage.getStatus());
    if (request.type === "storage-configure")
      return withEntityRevision(await storage.configureMode(request.mode, request.autoReloadEnabled));
    if (request.type === "open") {
      if (!request.directory || request.directory.kind !== "directory" || typeof request.directory.getFileHandle !== "function" || typeof request.directory.isSameEntry !== "function")
        return invalid5();
      return withEntityRevision(await storage.select(request.directory));
    }
    if (request.type === "check-permission")
      return withEntityRevision(await storage.resume(request.binding));
    if (request.type === "refresh")
      return storage.refresh(request.binding);
    if (request.type === "batch") {
      if (!Array.isArray(request.operations) || !request.operations.length) {
        try {
          invalid5();
        } catch (error) {
          throw beforeBusinessSqlError(error);
        }
      }
      return storage.executeBatch(request.binding, async (execute) => {
        const results = [];
        for (const operation of request.operations) {
          let handedOff = false;
          try {
            if (!operation || typeof operation.callId !== "string" || !operation.binding || key2(operation.binding) !== key2(request.binding))
              invalid5();
            entities.assertCached(operation.binding);
            handedOff = true;
            const result = await executeWrite(operation, request.binding, execute);
            results.push({ callId: operation.callId, ok: true, result });
          } catch (error) {
            const data = {
              ...errorData(handedOff ? error : beforeBusinessSqlError(error)),
              operationId: operation?.callId
            };
            results.push({ callId: operation?.callId ?? "", ok: false, error: data });
          }
        }
        return results;
      });
    }
    if (isWriteAction(request))
      return executeWrite(request, request.binding);
    if (request.type === "viewer")
      return storage.inspect(request.binding, (db) => db.viewer(request.request, () => {
        if (request.binding)
          entities.assertCached(request.binding);
      }));
    if (request.type === "query") {
      checkQueryPrefix(request.sql);
      const query = { sql: request.sql, binds: validateSerializedBinds(request.binds) };
      return storage.execute(request.binding, (db) => db.query(query, () => {
        if (request.binding)
          entities.assertCached(request.binding);
      }));
    }
    return invalid5();
  }
  self.onconnect = (event) => {
    const port = event.ports[0];
    ports.add(port);
    lastSeen.set(port, Date.now());
    port.onmessageerror = () => {
      removePort(port);
    };
    port.onmessage = (event) => {
      if (!ports.has(port))
        return;
      lastSeen.set(port, Date.now());
      const request = event.data;
      if (!request || typeof request.requestId !== "string")
        return;
      (async () => {
        let response;
        try {
          const work = dispatch(request, port);
          const business = ![
            "ping",
            "disconnect",
            "storage-status",
            "restart-drain",
            "restart-prepare",
            "restart-reply",
            "restart-cancel",
            "restart-commit"
          ].includes(request.type);
          if (business) {
            active.add(work);
            work.finally(() => active.delete(work)).catch(() => {});
          }
          response = { requestId: request.requestId, instanceId, ok: true, result: await work };
        } catch (error) {
          const data = errorData(error);
          response = {
            requestId: request.requestId,
            instanceId,
            ok: false,
            error: isBusinessWrite(request) ? { ...data, failureKind: data.failureKind ?? "service", executionState: data.executionState ?? "unknown" } : data
          };
        }
        try {
          port.postMessage(response);
        } catch {
          removePort(port);
        }
      })();
    };
    port.start();
  };
})();
