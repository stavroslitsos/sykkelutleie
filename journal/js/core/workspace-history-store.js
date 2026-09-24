// One small in-memory metadata record and one small sessionStorage payload per
// clone family. Large transcript/supplementary/note bodies are delegated to the
// asynchronous body store and loaded only when a history item is opened.
export const HISTORY_PREFIX = "whisper_workspace_history_group_v2::";
export const LEGACY_HISTORY_PREFIX = "whisper_workspace_history_group_v1::";
const MAX_ENTRIES = 30;

function normalizeMetadataEntry(raw) {
  if (!raw || typeof raw !== "object") return null;
  const sequence = Number(raw.sequence);
  const createdAt = Number(raw.createdAt);
  if (!Number.isInteger(sequence) || sequence < 1 ||
      !Number.isFinite(createdAt) || createdAt < 1) return null;
  return {
    id: String(raw.id || `note-${sequence}-${createdAt}`),
    sequence,
    createdAt,
    promptSlot: String(raw.promptSlot || ""),
    promptLabel: String(raw.promptLabel || ""),
    usedPrompt: raw.usedPrompt !== false,
  };
}

function hasBody(entry) {
  return typeof entry?.transcript === "string" &&
    typeof entry?.note === "string" &&
    Boolean(entry.transcript.trim()) &&
    Boolean(entry.note.trim());
}

function toMetadataEntry(entry) {
  return normalizeMetadataEntry(entry);
}

function fullEntriesFromSnapshots(snapshots) {
  const byId = new Map();
  for (const snapshot of snapshots) {
    for (const raw of Array.isArray(snapshot?.entries) ? snapshot.entries : []) {
      const metadata = normalizeMetadataEntry(raw);
      if (!metadata || !hasBody(raw)) continue;
      const key = metadata.id;
      if (!byId.has(key)) {
        byId.set(key, {
          ...metadata,
          transcript: String(raw.transcript || ""),
          supplementary: String(raw.supplementary || ""),
          note: String(raw.note || ""),
        });
      }
    }
  }
  return [...byId.values()];
}

export function mergeHistorySnapshots(snapshots) {
  const entriesById = new Map();
  let nextSequence = 1;
  for (const snapshot of snapshots) {
    const requestedNext = Number(snapshot?.nextSequence);
    if (Number.isInteger(requestedNext) && requestedNext > 0) {
      nextSequence = Math.max(nextSequence, requestedNext);
    }
    for (const raw of Array.isArray(snapshot?.entries) ? snapshot.entries : []) {
      const entry = normalizeMetadataEntry(raw);
      if (!entry) continue;
      const key = entry.id;
      if (!entriesById.has(key)) entriesById.set(key, entry);
    }
  }

  const chronological = [...entriesById.values()].sort((a, b) =>
    Number(a.createdAt || 0) - Number(b.createdAt || 0) ||
    String(a.id || "").localeCompare(String(b.id || "")));

  const used = new Set();
  let highest = 0;
  for (const entry of chronological) {
    let sequence = Number(entry.sequence);
    if (!Number.isInteger(sequence) || sequence < 1 || used.has(sequence)) sequence = highest + 1;
    entry.sequence = sequence;
    used.add(sequence);
    highest = Math.max(highest, sequence);
  }

  return {
    entries: chronological.reverse().slice(0, MAX_ENTRIES),
    nextSequence: Math.max(nextSequence, highest + 1),
  };
}

export function createWorkspaceHistoryStore(storage, bodyStore = null) {
  const groups = new Map();
  // Temporary in-memory copy of recoverable legacy bodies. This lets history
  // remain clickable while an asynchronous migration is in progress (or when
  // IndexedDB is unavailable) without keeping full bodies in the active record.
  const legacyRecovery = new Map();

  const read = (key) => {
    try { return JSON.parse(storage.getItem(key) || "null"); } catch { return null; }
  };

  function writeMetadata(groupId, record) {
    try {
      storage.setItem(
        HISTORY_PREFIX + groupId,
        JSON.stringify({ version: 2, entries: record.entries, nextSequence: record.nextSequence })
      );
      return true;
    } catch {
      return false;
    }
  }

  function removeStorageKey(key) {
    try { storage.removeItem(key); } catch {}
  }

  function commitMigratedMetadata(groupId, record, legacyKeys) {
    const obsoleteKeys = [...new Set([LEGACY_HISTORY_PREFIX + groupId, ...legacyKeys])];
    if (writeMetadata(groupId, record)) {
      obsoleteKeys.forEach(removeStorageKey);
      return true;
    }

    // If the old full-text history has filled sessionStorage, temporarily free
    // those exact keys, write the tiny metadata index, and roll back on failure.
    const backups = new Map();
    try {
      for (const key of obsoleteKeys) {
        const value = storage.getItem(key);
        if (value != null) backups.set(key, value);
      }
      obsoleteKeys.forEach(removeStorageKey);
      if (writeMetadata(groupId, record)) return true;
    } catch {}

    for (const [key, value] of backups) {
      try { storage.setItem(key, value); } catch {}
    }
    return false;
  }

  function queueBodies(groupId, entries, options = {}) {
    if (!bodyStore || !entries.length) return Promise.resolve([]);
    return bodyStore.putMany(groupId, entries, options);
  }

  function persist(groupId) {
    const record = groups.get(groupId);
    if (!record) return false;

    const fullEntries = record.entries.filter(hasBody);
    if (fullEntries.length) {
      // Capture the full strings for the async write, then immediately shrink the
      // active workspace record to metadata. The body store keeps a temporary
      // memory fallback until the IndexedDB write finishes.
      void queueBodies(groupId, fullEntries);
      record.entries = record.entries.map(toMetadataEntry).filter(Boolean).slice(0, MAX_ENTRIES);
    }

    const saved = writeMetadata(groupId, record);
    void bodyStore?.reconcile?.(groupId, record.entries.map((entry) => entry.id));
    return saved;
  }

  function ensure(groupId, legacyKeys = []) {
    if (groups.has(groupId)) return groups.get(groupId);

    const current = read(HISTORY_PREFIX + groupId);
    const previousShared = read(LEGACY_HISTORY_PREFIX + groupId);
    const legacySnapshots = legacyKeys.map(read).filter(
      (snapshot) => Array.isArray(snapshot?.entries)
    );

    // The v2 metadata index is authoritative when it exists. Older full-text
    // snapshots are still inspected below for body recovery, but they must not
    // re-introduce entries that were intentionally cleared from the v2 index.
    let metadataSources;
    if (Array.isArray(current?.entries)) {
      metadataSources = [current];
    } else if (Array.isArray(previousShared?.entries)) {
      metadataSources = [previousShared];
    } else {
      metadataSources = legacySnapshots;
    }

    const record = mergeHistorySnapshots(metadataSources);
    groups.set(groupId, record);

    // IMPORTANT: always inspect every legacy source for recoverable bodies even
    // when a v2 metadata index already exists. Older builds could leave v2
    // metadata in place before all bodies reached IndexedDB. Deleting the
    // legacy snapshots in that state creates visible history cards that cannot
    // be opened.
    const bodySources = [
      ...(Array.isArray(previousShared?.entries) ? [previousShared] : []),
      ...legacySnapshots,
    ];
    const activeIds = new Set(record.entries.map((entry) => entry.id));
    const recoverableEntries = fullEntriesFromSnapshots(bodySources).filter(
      (entry) => activeIds.has(entry.id)
    );

    if (recoverableEntries.length) {
      legacyRecovery.set(
        groupId,
        new Map(recoverableEntries.map((entry) => [entry.id, entry]))
      );
    } else {
      legacyRecovery.delete(groupId);
    }

    if (recoverableEntries.length && bodyStore) {
      // Keep every legacy full-text payload until every recoverable body has
      // been stored successfully. This also protects a refresh in the middle of
      // migration.
      void queueBodies(groupId, recoverableEntries, { sessionFallback: false }).then((results) => {
        const storedAll = results.length === recoverableEntries.length && results.every(
          (result) => result.status === "fulfilled" && result.value === true
        );
        if (!storedAll) return;
        if (commitMigratedMetadata(groupId, record, legacyKeys)) {
          legacyRecovery.delete(groupId);
        }
      }).catch(() => {});
    } else if (recoverableEntries.length) {
      // IndexedDB is unavailable. Keep the legacy snapshots intact; writing the
      // small v2 index is safe because patched loads continue to inspect legacy
      // bodies on the next refresh.
      writeMetadata(groupId, record);
    } else {
      // No active entry depends on a legacy body. Only remove old snapshots
      // after the replacement metadata index has definitely been persisted.
      if (writeMetadata(groupId, record)) {
        removeStorageKey(LEGACY_HISTORY_PREFIX + groupId);
        legacyKeys.forEach(removeStorageKey);
      }
    }

    return record;
  }

  return {
    ensure,
    persist,

    snapshot(groupId) {
      const record = ensure(groupId);
      return {
        entries: record.entries.map((entry) => ({ ...entry })),
        nextSequence: record.nextSequence,
      };
    },

    async loadEntry(groupId, entryId) {
      const record = ensure(groupId);
      const metadata = record.entries.find((entry) => entry.id === String(entryId || ""));
      if (!metadata) return null;

      // During the same synchronous turn in which a note was completed, the entry
      // can still contain its body. Normally persist() strips it immediately.
      if (hasBody(metadata)) return { ...metadata };

      const body = await bodyStore?.get?.(groupId, metadata.id);
      if (body) return { ...metadata, ...body };

      // Last-resort recovery for legacy snapshots that are still present while a
      // migration is pending or has failed. Only body fields are copied so stale
      // legacy metadata cannot override the authoritative v2 index.
      const recovered = legacyRecovery.get(groupId)?.get(metadata.id);
      if (!recovered || !hasBody(recovered)) return null;
      return {
        ...metadata,
        transcript: recovered.transcript,
        supplementary: recovered.supplementary,
        note: recovered.note,
      };
    },

    replace(groupId, snapshot) {
      const record = ensure(groupId);
      const fullEntries = fullEntriesFromSnapshots([snapshot]);
      Object.assign(record, mergeHistorySnapshots([snapshot]));
      if (fullEntries.length) void queueBodies(groupId, fullEntries);
      if (!record.entries.length) void bodyStore?.clearGroup?.(groupId);
      persist(groupId);
      return record;
    },

    retain(groupIds) {
      const keep = new Set(groupIds);
      for (const id of [...groups.keys()]) {
        if (keep.has(id)) continue;
        groups.delete(id);
        legacyRecovery.delete(id);
        removeStorageKey(HISTORY_PREFIX + id);
        removeStorageKey(LEGACY_HISTORY_PREFIX + id);
        void bodyStore?.clearGroup?.(id);
      }
      void bodyStore?.retainGroups?.(keep);
    },

    release() {
      groups.clear();
      legacyRecovery.clear();
      bodyStore?.release?.();
    },
  };
}
