const PROVIDERS = new Set(["oneDrive", "googleDrive"]);

const ACTIVE_PROVIDER_KEY = "whisper_cloud_backup_active_provider_v1";
const KEYS_PROVIDER_KEY = "whisper_cloud_backup_keys_provider_v1";
const PASSWORD_KEY_PREFIX = "whisper_cloud_backup_password_v1::";
const PENDING_PROMPTS_KEY = "whisper_cloud_restore_prompts_v1";
const PENDING_WORKSPACES_KEY = "whisper_cloud_restore_workspace_set_v1";

function normalizeProvider(provider) {
  const value = String(provider || "");
  return PROVIDERS.has(value) ? value : "";
}

function readSession(key) {
  try { return sessionStorage.getItem(key) || ""; } catch { return ""; }
}

function writeSession(key, value) {
  try {
    sessionStorage.setItem(key, String(value ?? ""));
    return true;
  } catch {
    return false;
  }
}

function removeSession(key) {
  try { sessionStorage.removeItem(key); } catch {}
}

function passwordKey(provider) {
  const normalized = normalizeProvider(provider);
  return normalized ? `${PASSWORD_KEY_PREFIX}${normalized}` : "";
}

function unlock(provider, password, { makeActive = true } = {}) {
  const normalized = normalizeProvider(provider);
  const value = String(password || "");
  if (!normalized || !value) return false;
  if (!writeSession(passwordKey(normalized), value)) return false;
  if (makeActive) writeSession(ACTIVE_PROVIDER_KEY, normalized);
  try {
    window.dispatchEvent(new CustomEvent("cloud-backup-session-changed", {
      detail: { provider: normalized, unlocked: true },
    }));
  } catch {}
  return true;
}

function getPassword(provider) {
  const key = passwordKey(provider);
  return key ? readSession(key) : "";
}

function getActiveProvider() {
  return normalizeProvider(readSession(ACTIVE_PROVIDER_KEY));
}

function setActiveProvider(provider) {
  const normalized = normalizeProvider(provider);
  if (!normalized) {
    removeSession(ACTIVE_PROVIDER_KEY);
    return false;
  }
  return writeSession(ACTIVE_PROVIDER_KEY, normalized);
}

function markKeysImportedFrom(provider) {
  const normalized = normalizeProvider(provider);
  if (!normalized) {
    removeSession(KEYS_PROVIDER_KEY);
    return false;
  }
  return writeSession(KEYS_PROVIDER_KEY, normalized);
}

function getKeysImportedProvider() {
  return normalizeProvider(readSession(KEYS_PROVIDER_KEY));
}

function clearKeysImportedProvider() {
  removeSession(KEYS_PROVIDER_KEY);
}

function lock(provider) {
  const normalized = normalizeProvider(provider);
  if (!normalized) return;
  removeSession(passwordKey(normalized));
  if (getActiveProvider() === normalized) removeSession(ACTIVE_PROVIDER_KEY);
}

function lockAll() {
  PROVIDERS.forEach(lock);
  clearKeysImportedProvider();
  clearPendingRestore();
}

function writePending(key, value) {
  if (value == null) {
    removeSession(key);
    return;
  }
  writeSession(key, JSON.stringify(value));
}

function readAndRemovePending(key) {
  const raw = readSession(key);
  removeSession(key);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function stageRestore({ promptPackage = null, workspaceSet = null } = {}) {
  writePending(PENDING_PROMPTS_KEY, promptPackage);
  writePending(PENDING_WORKSPACES_KEY, workspaceSet);
}

function consumePendingRestore() {
  return {
    promptPackage: readAndRemovePending(PENDING_PROMPTS_KEY),
    workspaceSet: readAndRemovePending(PENDING_WORKSPACES_KEY),
  };
}

function clearPendingRestore() {
  removeSession(PENDING_PROMPTS_KEY);
  removeSession(PENDING_WORKSPACES_KEY);
}

export const CloudBackupSession = Object.freeze({
  providers: Object.freeze(["oneDrive", "googleDrive"]),
  normalizeProvider,
  unlock,
  getPassword,
  getActiveProvider,
  setActiveProvider,
  markKeysImportedFrom,
  getKeysImportedProvider,
  clearKeysImportedProvider,
  lock,
  lockAll,
  stageRestore,
  consumePendingRestore,
  clearPendingRestore,
});
