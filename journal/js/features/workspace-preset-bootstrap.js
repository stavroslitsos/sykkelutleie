(function bootstrapWorkspacePresetRuntime() {
  [
    "lemonfox_api_key",
    "deepgram_api_key",
    "gemini_api_key",
    "vertex_backend_url",
    "vertex_backend_secret",
  ].forEach((key) => {
    try { sessionStorage.removeItem(key); } catch {}
  });

  const params = new URLSearchParams(window.location.search || "");
  const runtimeId = String(params.get("workspacePresetFrame") || "").trim();
  const isFrame = Boolean(runtimeId) && window.parent !== window;

  window.__workspacePresetFrame = isFrame;
  window.__workspacePresetRuntimeId = isFrame ? runtimeId : "primary";

  if (!isFrame || typeof Storage === "undefined") return;

  const prefix = `whisper_workspace_runtime::${runtimeId}::`;
  const sharedSessionKeys = new Set([
    "openai_api_key",
    "soniox_api_key",
    "mistral_api_key",
    "requesty_api_key",
    "bedrock_backend_url",
    "bedrock_backend_secret",
    "redactor_general_terms_session",
    "whisper_cloud_backup_active_provider_v1",
    "whisper_cloud_backup_keys_provider_v1",
    "whisper_cloud_backup_password_v1::oneDrive",
    "whisper_cloud_backup_password_v1::googleDrive",
  ]);
  const workspaceLocalExactKeys = new Set([
    "redactor_visible",
    "auto_clear_supplementary",
    "auto_clear_note",
  ]);

  const nativeGetItem = Storage.prototype.getItem;
  const nativeSetItem = Storage.prototype.setItem;
  const nativeRemoveItem = Storage.prototype.removeItem;

  const isSessionStore = (store) => {
    try { return store === window.sessionStorage; } catch { return false; }
  };
  const isLocalStore = (store) => {
    try { return store === window.localStorage; } catch { return false; }
  };
  const scopedSessionKey = (key) => {
    const normalized = String(key || "");
    return sharedSessionKeys.has(normalized) ? normalized : `${prefix}${normalized}`;
  };
  const scopedLocalKey = (key) => {
    const normalized = String(key || "");
    const isWorkspaceKey = workspaceLocalExactKeys.has(normalized) ||
      normalized.startsWith("prompt_selected_slot::");
    return isWorkspaceKey ? `${prefix}${normalized}` : normalized;
  };

  Storage.prototype.getItem = function getWorkspacePresetItem(key) {
    if (isSessionStore(this)) return nativeGetItem.call(this, scopedSessionKey(key));
    if (isLocalStore(this)) return nativeGetItem.call(this, scopedLocalKey(key));
    return nativeGetItem.call(this, key);
  };
  Storage.prototype.setItem = function setWorkspacePresetItem(key, value) {
    if (isSessionStore(this)) return nativeSetItem.call(this, scopedSessionKey(key), value);
    if (isLocalStore(this)) return nativeSetItem.call(this, scopedLocalKey(key), value);
    return nativeSetItem.call(this, key, value);
  };
  Storage.prototype.removeItem = function removeWorkspacePresetItem(key) {
    if (isSessionStore(this)) return nativeRemoveItem.call(this, scopedSessionKey(key));
    if (isLocalStore(this)) return nativeRemoveItem.call(this, scopedLocalKey(key));
    return nativeRemoveItem.call(this, key);
  };

  window.__workspacePresetRawStorage = Object.freeze({
    getSession(key) {
      return nativeGetItem.call(window.sessionStorage, String(key || ""));
    },
    setSession(key, value) {
      return nativeSetItem.call(window.sessionStorage, String(key || ""), String(value ?? ""));
    },
    removeSession(key) {
      return nativeRemoveItem.call(window.sessionStorage, String(key || ""));
    },
  });
})();
