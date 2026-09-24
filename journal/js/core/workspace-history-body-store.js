// Session-scoped, asynchronous storage for the large text bodies behind note history.
//
// History metadata (id, time, prompt label, etc.) stays small and synchronous so the
// sidebar can render immediately. Transcript/supplementary/note text lives in
// IndexedDB and is loaded only when a history item is opened. Bodies are encrypted
// with an AES-GCM key that exists only in sessionStorage for the current tab session;
// after that session ends, any leftover IndexedDB ciphertext is unusable.
const DB_NAME = "whisper_workspace_history_bodies_v1";
const DB_VERSION = 1;
const STORE_NAME = "bodies";
const SESSION_ID_KEY = "whisper_workspace_history_body_session_v1";
const SESSION_SECRET_KEY = "whisper_workspace_history_body_secret_v1";
const FALLBACK_PREFIX = "whisper_workspace_history_body_pending_v1::";

function randomId(cryptoApi) {
  try {
    if (typeof cryptoApi?.randomUUID === "function") return cryptoApi.randomUUID();
  } catch {}
  const bytes = new Uint8Array(16);
  try { cryptoApi?.getRandomValues?.(bytes); } catch {
    for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

function bytesToBase64(bytes) {
  let binary = "";
  const input = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || 0);
  for (let offset = 0; offset < input.length; offset += 0x8000) {
    binary += String.fromCharCode(...input.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(String(value || ""));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function bodyFromEntry(entry) {
  return {
    transcript: String(entry?.transcript || ""),
    supplementary: String(entry?.supplementary || ""),
    note: String(entry?.note || ""),
  };
}

function hasUsableBody(body) {
  return Boolean(String(body?.transcript || "").trim() && String(body?.note || "").trim());
}

export function createWorkspaceHistoryBodyStore({
  storage = globalThis.sessionStorage,
  indexedDb = globalThis.indexedDB,
  cryptoApi = globalThis.crypto,
} = {}) {
  const memoryFallback = new Map();
  const pendingWrites = new Map();
  let dbPromise = null;
  let cryptoKeyPromise = null;

  function readSession(key) {
    try { return storage?.getItem?.(key) || ""; } catch { return ""; }
  }
  function writeSession(key, value) {
    const text = String(value || "");
    try {
      storage?.setItem?.(key, text);
      return storage?.getItem?.(key) === text;
    } catch {
      return false;
    }
  }

  let sessionId = readSession(SESSION_ID_KEY);
  let sessionIdPersisted = Boolean(sessionId);
  if (!sessionId) {
    sessionId = randomId(cryptoApi);
    sessionIdPersisted = writeSession(SESSION_ID_KEY, sessionId);
  }

  function ensureSecret() {
    let encoded = readSession(SESSION_SECRET_KEY);
    if (encoded) return encoded;
    const bytes = new Uint8Array(32);
    cryptoApi?.getRandomValues?.(bytes);
    encoded = bytesToBase64(bytes);
    if (!writeSession(SESSION_SECRET_KEY, encoded)) {
      throw new Error("The session encryption key could not be persisted.");
    }
    return encoded;
  }

  function getCryptoKey() {
    if (cryptoKeyPromise) return cryptoKeyPromise;
    cryptoKeyPromise = (async () => {
      if (!sessionIdPersisted) throw new Error("The history session id could not be persisted.");
      if (!cryptoApi?.subtle) throw new Error("Web Crypto is unavailable.");
      const raw = base64ToBytes(ensureSecret());
      return cryptoApi.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
    })();
    return cryptoKeyPromise;
  }

  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!indexedDb?.open) {
        reject(new Error("IndexedDB is unavailable."));
        return;
      }
      const request = indexedDb.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (db.objectStoreNames.contains(STORE_NAME)) db.deleteObjectStore(STORE_NAME);
        const store = db.createObjectStore(STORE_NAME, { keyPath: "key" });
        store.createIndex("sessionGroup", ["sessionId", "groupId"], { unique: false });
        store.createIndex("sessionId", "sessionId", { unique: false });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("IndexedDB could not be opened."));
      request.onblocked = () => reject(new Error("IndexedDB upgrade is blocked."));
    });
    return dbPromise;
  }

  function recordKey(groupId, entryId) {
    return `${sessionId}::${String(groupId || "")}::${String(entryId || "")}`;
  }

  function fallbackKey(groupId, entryId) {
    return `${FALLBACK_PREFIX}${String(groupId || "")}::${String(entryId || "")}`;
  }

  function readFallback(groupId, entryId) {
    try {
      const raw = storage?.getItem?.(fallbackKey(groupId, entryId));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return hasUsableBody(parsed) ? bodyFromEntry(parsed) : null;
    } catch {
      return null;
    }
  }

  function writeFallback(groupId, entryId, body) {
    try {
      storage?.setItem?.(fallbackKey(groupId, entryId), JSON.stringify(body));
      return true;
    } catch {
      return false;
    }
  }

  function removeFallback(groupId, entryId) {
    try { storage?.removeItem?.(fallbackKey(groupId, entryId)); } catch {}
  }

  function removeFallbackGroup(groupId, keepEntryIds = null) {
    const prefix = `${FALLBACK_PREFIX}${String(groupId || "")}::`;
    const keep = keepEntryIds == null
      ? null
      : new Set(Array.from(keepEntryIds, (value) => String(value || "")));
    try {
      for (let index = Number(storage?.length || 0) - 1; index >= 0; index -= 1) {
        const key = storage?.key?.(index);
        if (!key?.startsWith(prefix)) continue;
        const entryId = key.slice(prefix.length);
        if (!keep || !keep.has(entryId)) storage.removeItem(key);
      }
    } catch {}
  }

  async function encryptBody(groupId, entryId, body) {
    const key = await getCryptoKey();
    const iv = new Uint8Array(12);
    cryptoApi.getRandomValues(iv);
    const payload = new TextEncoder().encode(JSON.stringify(body));
    const cipher = await cryptoApi.subtle.encrypt({ name: "AES-GCM", iv }, key, payload);
    return {
      key: recordKey(groupId, entryId),
      sessionId,
      groupId: String(groupId || ""),
      entryId: String(entryId || ""),
      iv,
      cipher,
      updatedAt: Date.now(),
    };
  }

  async function decryptRecord(record) {
    if (!record) return null;
    const key = await getCryptoKey();
    const plain = await cryptoApi.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(record.iv) },
      key,
      record.cipher
    );
    const parsed = JSON.parse(new TextDecoder().decode(plain));
    return hasUsableBody(parsed) ? bodyFromEntry(parsed) : null;
  }

  async function requestResult(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("IndexedDB request failed."));
    });
  }

  async function putRecord(record) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put(record);
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error || new Error("History body write failed."));
      transaction.onabort = () => reject(transaction.error || new Error("History body write was aborted."));
    });
  }

  async function getRecord(key) {
    const db = await openDb();
    const transaction = db.transaction(STORE_NAME, "readonly");
    return requestResult(transaction.objectStore(STORE_NAME).get(key));
  }

  function put(groupId, entry, { sessionFallback = true } = {}) {
    const entryId = String(entry?.id || "");
    const body = bodyFromEntry(entry);
    if (!entryId || !hasUsableBody(body)) return Promise.resolve(false);
    const key = recordKey(groupId, entryId);

    // Keep the body reachable while the asynchronous encrypted write is pending,
    // so clicking a just-created history item works immediately. A short-lived
    // sessionStorage fallback protects an immediate refresh; it is removed as
    // soon as the asynchronous IndexedDB write succeeds.
    memoryFallback.set(key, body);
    if (sessionFallback) writeFallback(groupId, entryId, body);
    const promise = (async () => {
      try {
        const record = await encryptBody(groupId, entryId, body);
        await putRecord(record);
        memoryFallback.delete(key);
        removeFallback(groupId, entryId);
        return true;
      } catch (error) {
        // Chrome supports both APIs, but retain this session's body in memory if
        // storage is disabled so current-session history still works.
        console.warn("[note-history] Asynchronous history body storage failed; using memory fallback.", error);
        return false;
      } finally {
        if (pendingWrites.get(key) === promise) pendingWrites.delete(key);
      }
    })();
    pendingWrites.set(key, promise);
    return promise;
  }

  async function putMany(groupId, entries, options = {}) {
    const list = Array.isArray(entries) ? entries : [];
    const results = [];

    // A one-time legacy migration is sequential to avoid creating 30 encrypted
    // buffers at once. Seed only lightweight references in the temporary memory
    // fallback first so every old history item remains immediately clickable
    // while its turn to migrate is pending.
    if (options.sessionFallback === false) {
      for (const entry of list) {
        const entryId = String(entry?.id || "");
        const body = bodyFromEntry(entry);
        if (entryId && hasUsableBody(body)) {
          memoryFallback.set(recordKey(groupId, entryId), body);
        }
      }
    }

    for (const entry of list) {
      try {
        results.push({ status: "fulfilled", value: await put(groupId, entry, options) });
      } catch (reason) {
        results.push({ status: "rejected", reason });
      }
    }
    return results;
  }

  async function get(groupId, entryId) {
    const key = recordKey(groupId, entryId);
    if (memoryFallback.has(key)) return { ...memoryFallback.get(key) };

    const fallback = readFallback(groupId, entryId);
    if (fallback) {
      // Re-home a fallback left by an immediate refresh without delaying the click.
      void put(groupId, { id: entryId, ...fallback });
      return { ...fallback };
    }

    const pending = pendingWrites.get(key);
    if (pending) {
      await pending.catch(() => {});
      if (memoryFallback.has(key)) return { ...memoryFallback.get(key) };
    }

    try {
      const record = await getRecord(key);
      return await decryptRecord(record);
    } catch (error) {
      console.warn("[note-history] History body could not be loaded.", error);
      return null;
    }
  }

  async function withGroupCursor(groupId, mode, callback) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, mode);
      const index = transaction.objectStore(STORE_NAME).index("sessionGroup");
      const request = index.openCursor(IDBKeyRange.only([sessionId, String(groupId || "")]));
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) return;
        callback(cursor);
        cursor.continue();
      };
      request.onerror = () => reject(request.error || new Error("History body cursor failed."));
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error || new Error("History body transaction failed."));
      transaction.onabort = () => reject(transaction.error || new Error("History body transaction was aborted."));
    });
  }

  async function reconcile(groupId, keepEntryIds) {
    const keep = new Set(Array.from(keepEntryIds || [], (value) => String(value || "")));
    removeFallbackGroup(groupId, keep);
    for (const key of [...memoryFallback.keys()]) {
      const prefix = `${sessionId}::${String(groupId || "")}::`;
      if (key.startsWith(prefix) && !keep.has(key.slice(prefix.length))) memoryFallback.delete(key);
    }
    try {
      await withGroupCursor(groupId, "readwrite", (cursor) => {
        if (!keep.has(String(cursor.value?.entryId || ""))) cursor.delete();
      });
    } catch (error) {
      console.warn("[note-history] History body cleanup failed.", error);
    }
  }

  async function clearGroup(groupId) {
    removeFallbackGroup(groupId);
    const prefix = `${sessionId}::${String(groupId || "")}::`;
    for (const key of [...memoryFallback.keys()]) {
      if (key.startsWith(prefix)) memoryFallback.delete(key);
    }
    try {
      await withGroupCursor(groupId, "readwrite", (cursor) => cursor.delete());
    } catch (error) {
      console.warn("[note-history] History group cleanup failed.", error);
    }
  }

  async function retainGroups(groupIds) {
    const keep = new Set(Array.from(groupIds || [], (value) => String(value || "")));
    try {
      for (let index = Number(storage?.length || 0) - 1; index >= 0; index -= 1) {
        const key = storage?.key?.(index);
        if (!key?.startsWith(FALLBACK_PREFIX)) continue;
        const remainder = key.slice(FALLBACK_PREFIX.length);
        const separator = remainder.indexOf("::");
        const groupId = separator >= 0 ? remainder.slice(0, separator) : "";
        if (!keep.has(groupId)) storage.removeItem(key);
      }
    } catch {}
    for (const key of [...memoryFallback.keys()]) {
      const prefix = `${sessionId}::`;
      if (!key.startsWith(prefix)) continue;
      const remainder = key.slice(prefix.length);
      const separator = remainder.indexOf("::");
      const groupId = separator >= 0 ? remainder.slice(0, separator) : "";
      if (!keep.has(groupId)) memoryFallback.delete(key);
    }

    try {
      const db = await openDb();
      await new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const index = transaction.objectStore(STORE_NAME).index("sessionId");
        const request = index.openCursor(IDBKeyRange.only(sessionId));
        request.onsuccess = () => {
          const cursor = request.result;
          if (!cursor) return;
          if (!keep.has(String(cursor.value?.groupId || ""))) cursor.delete();
          cursor.continue();
        };
        request.onerror = () => reject(request.error || new Error("History body cursor failed."));
        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => reject(transaction.error || new Error("History body cleanup failed."));
        transaction.onabort = () => reject(transaction.error || new Error("History body cleanup was aborted."));
      });
    } catch (error) {
      console.warn("[note-history] Unused history bodies could not be cleaned up.", error);
    }
  }

  return Object.freeze({
    put,
    putMany,
    get,
    reconcile,
    clearGroup,
    retainGroups,
    release() {
      memoryFallback.clear();
      pendingWrites.clear();
      try {
        dbPromise?.then((db) => db.close()).catch(() => {});
      } catch {}
    },
  });
}
