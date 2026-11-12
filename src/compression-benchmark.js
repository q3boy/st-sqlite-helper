(() => {
  // src/chat-storage-settings.ts
  var COMPRESSION_LEVELS = [
    { quality: 3, label: "低" },
    { quality: 4, label: "中" },
    { quality: 7, label: "高" },
    { quality: 9, label: "超高" }
  ];

  // src/protocol.ts
  var extensionEntryPath = undefined;
  var EXTENSION_NAME = extensionEntryPath?.match(/^\/scripts\/extensions\/third-party\/([^/]+)\/src\/index\.js$/)?.[1] ?? "st-sqlite-helper";
  var EXTENSION_TEMPLATE_PATH = `third-party/${EXTENSION_NAME}/src`;
  var EXTENSION_PATH = `/scripts/extensions/${EXTENSION_TEMPLATE_PATH}/`;
  var WORKER_URL = `${EXTENSION_PATH}sqlite-worker.js`;
  var DEDICATED_WORKER_URL = `${EXTENSION_PATH}sqlite-dedicated-worker.js`;
  var EXECUTION_PROBE_URL = `${EXTENSION_PATH}sqlite-probe.js`;

  // src/shared/chat-database-codec.ts
  var sqliteHeader = new TextEncoder().encode("SQLite format 3\x00");
  function createChatDatabaseCodec(module) {
    const wasm = new WebAssembly.Instance(module).exports;
    return (bytes, encode, quality = 4) => {
      const input = wasm.alloc(bytes.length);
      try {
        new Uint8Array(wasm.memory.buffer, input, bytes.length).set(bytes);
        const result = wasm.transform_bytes(input, bytes.length, encode ? 1 : 0, quality);
        const ptr = Number(result & 0xffffffffn);
        const size = Number(result >> 32n & 0x7fffffffn);
        try {
          const output = new Uint8Array(wasm.memory.buffer, ptr, size).slice();
          if (result < 0n)
            throw new Error(new TextDecoder().decode(output));
          return output;
        } finally {
          wasm.release(ptr, size);
        }
      } finally {
        wasm.release(input, bytes.length);
      }
    };
  }
  var codecModule;
  async function loadCodecModule() {
    return codecModule ??= (async () => {
      const worker = typeof document === "undefined" && typeof globalThis.location !== "undefined";
      const base = worker ? new URL("worldbook-codec.wasm", globalThis.location.href).href : `${EXTENSION_PATH}worldbook-codec.wasm`;
      const response = await fetch(base);
      if (!response.ok)
        throw new Error(`无法加载 Brotli 编解码器：HTTP ${response.status}`);
      return WebAssembly.compile(await response.arrayBuffer());
    })().catch((error) => {
      codecModule = undefined;
      throw error;
    });
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

  // src/worker/compression-benchmark.ts
  var report = (event) => self.postMessage(event);
  async function buildSample() {
    let seed = 41365;
    function randomWord() {
      seed = Math.imul(seed, 1664525) + 1013904223 >>> 0;
      return seed;
    }
    function blobId() {
      const hex = Array.from({ length: 4 }, () => randomWord().toString(16).padStart(8, "0")).join("");
      return `X'${hex}'`;
    }
    const sql = await loadWorkerSqlJs();
    const db = new sql.Database;
    const tables = Array.from({ length: 50 }, (_, i) => ({ name: `t${i}`, activeRows: [] }));
    try {
      for (const { name } of tables) {
        db.run(`CREATE TABLE ${name}(rid BLOB PRIMARY KEY NOT NULL,k INTEGER,x INTEGER,y INTEGER,a TEXT,b TEXT,c TEXT,d TEXT,e TEXT,f TEXT,g TEXT);
        CREATE TABLE IF NOT EXISTS "_dvs_index_${name}" (fid BLOB NOT NULL CHECK (typeof(fid) = 'blob' AND length(fid) = 16), rid BLOB NOT NULL CHECK (typeof(rid) = 'blob' AND length(rid) = 16), PRIMARY KEY (fid,rid)) WITHOUT ROWID`);
      }
      let previous = "X'00000000000000000000000000000000'";
      for (let floor = 1;floor <= 300; floor++) {
        const fid = blobId();
        db.run("BEGIN");
        for (const [i, { name, activeRows }] of tables.entries()) {
          const index = `_dvs_index_${name}`;
          const changed = new Set;
          const count = Math.min(activeRows.length, (floor + i) % 4);
          while (changed.size < count)
            changed.add(randomWord() % activeRows.length);
          const fields = Array.from({ length: 7 }, (_, j) => `'${"词".repeat(19)}${String((floor + i + j) % 1000).padStart(3, "0")}'`);
          const statements = [`INSERT INTO ${index} SELECT ${fid},rid FROM ${index} WHERE fid=${previous}`];
          for (const row of changed) {
            const old = activeRows[row];
            const rid = blobId();
            activeRows[row] = rid;
            statements.push(`INSERT INTO ${name} SELECT ${rid},k,x,y,${fields[0]},b,c,d,e,f,g FROM ${name} WHERE rid=${old}`, `DELETE FROM ${index} WHERE fid=${fid} AND rid=${old}`, `INSERT INTO ${index} VALUES(${fid},${rid})`);
          }
          const rid = blobId();
          activeRows.push(rid);
          statements.push(`INSERT INTO ${name} VALUES(${[rid, floor, i + 1, 1e5 + floor, ...fields].join(",")})`, `INSERT INTO ${index} VALUES(${fid},${rid})`);
          db.run(statements.join(";"));
        }
        db.run("COMMIT");
        previous = fid;
        if (floor % 10 === 0)
          report({ phase: "building", floor });
      }
      return db.export();
    } finally {
      db.close();
    }
  }
  async function run(input) {
    const bytes = input.source === "chat" ? input.bytes : await buildSample();
    const module = await loadCodecModule();
    report({ phase: "ready", bytes: bytes.length });
    for (const { quality } of COMPRESSION_LEVELS) {
      for (let seconds = 5;seconds > 0; seconds--) {
        report({ phase: "cooldown", quality, seconds });
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      report({ phase: "encoding", quality });
      const start = performance.now();
      const size = createChatDatabaseCodec(module)(bytes, true, quality).byteLength;
      report({ phase: "result", measurement: { quality, ms: performance.now() - start, bytes: size } });
    }
    report({ phase: "complete" });
  }
  self.onmessage = ({ data }) => {
    self.onmessage = null;
    run(data).catch((error) => report({ phase: "error", message: error instanceof Error ? error.message : String(error) })).finally(() => self.close());
  };
})();
