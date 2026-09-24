// Acknowledged, expiring, at-most-once commands between browser tabs.
// A missing reply is uncertainty, never evidence that recording started/stopped.
const ACTIONS = new Set([
  'startRecording', 'stopRecording', 'pauseResumeRecording', 'abortRecording',
  'triggerGenerateNote', 'setAutoGenerateEnabled', 'setAutoCopyMode',
  'setUsePromptEnabled', 'switchNoteProvider', 'setOpenAiModel',
  'setNoteProviderMode', 'setBedrockModel', 'setRequestyModel',
  'setSonioxSpeakerLabels', 'setSelectedPromptSlot', 'selectWorkspacePreset',
  'setMiniPanelCopyFeedback', 'runWorkspacePresetAction',
]);

export function createMiniCommandChannel({ tabId, send, run, onResult = () => {}, timeoutMs = 70000, now = Date.now }) {
  const pending = new Map();
  const completed = new Map();
  const clientId = globalThis.crypto?.randomUUID?.() || `${now()}-${Math.random()}`;
  let sequence = 0;
  let closed = false;

  function allowed(action, args) {
    return ACTIONS.has(action) && (action !== 'runWorkspacePresetAction' ||
      (typeof args[0] === 'string' && args[0] && ACTIONS.has(args[1]) && args[1] !== 'runWorkspacePresetAction'));
  }

  function request(targetTabId, actionName, args = []) {
    if (closed) return Promise.resolve({ ok: false, error: 'Command channel closed.' });
    const requestId = `${clientId}-${++sequence}`;
    const message = { type: 'mini-hub-command', requestId, sourceTabId: tabId,
      targetTabId, actionName, args, expiresAt: now() + 15000 };
    return new Promise(resolve => {
      const timeout = setTimeout(() => finish(requestId, {
        ok: false, error: 'No completion confirmation. Check the selected workspace in the main tab before trying again.', uncertain: true,
      }), timeoutMs);
      pending.set(requestId, { resolve, timeout, message });
      if (targetTabId === tabId) receive(message);
      else if (!send(message)) finish(requestId, { ok: false, error: 'Cannot contact the selected browser tab.' });
    });
  }

  function finish(id, result) {
    const entry = pending.get(id);
    if (!entry) return;
    clearTimeout(entry.timeout);
    pending.delete(id);
    onResult(result, entry.message);
    entry.resolve(result);
  }

  function reply(message, result, received = false) {
    if (closed) return;
    const response = { type: 'mini-hub-command-result', requestId: message.requestId,
      sourceTabId: tabId, targetTabId: message.sourceTabId, received, result };
    if (response.targetTabId === tabId) receive(response);
    else send(response);
  }

  function receive(message) {
    if (closed) return false;
    if (message?.targetTabId !== tabId) return false;
    if (message.type === 'mini-hub-command-result') {
      const entry = pending.get(message.requestId);
      if (!entry || entry.message.targetTabId !== message.sourceTabId) return true;
      if (!message.received) finish(message.requestId, message.result || { ok: false, error: 'Invalid command confirmation.' });
      return true;
    }
    if (message.type !== 'mini-hub-command') return false;
    // Old panels without IDs must be reopened after updating; never replay an
    // ambiguous Start/Pause command from a stale browser tab.
    if (typeof message.requestId !== 'string' || !message.requestId || !message.sourceTabId) return true;
    const key = `${message.sourceTabId}:${message.requestId}`;
    const existing = completed.get(key);
    if (existing) { existing.promise.then(result => reply(message, result)); return true; }
    const args = Array.isArray(message.args) ? message.args : [];
    if (!allowed(message.actionName, args) || !Number.isFinite(message.expiresAt) || now() > message.expiresAt) {
      reply(message, { ok: false, error: 'The command expired or is unavailable. Check the main tab and try again.' });
      return true;
    }
    reply(message, null, true);
    // Invoke synchronously in the same click task for local commands. Browser
    // user activation cannot be transferred with BroadcastChannel to other tabs.
    let work;
    try { work = run(message.actionName, ...args); }
    catch (error) { work = Promise.reject(error); }
    const promise = Promise.resolve(work).then(value => {
      if (value === false) return { ok: false, error: 'The selected workspace is not ready or the action is unavailable.' };
      return value && typeof value.ok === 'boolean' ? value : { ok: true };
    }, error => ({ ok: false, error: String(error?.message || error) }));
    completed.set(key, { promise, expiresAt: message.expiresAt });
    // Keep entries until their commands expire, so eviction cannot replay one.
    for (const [id, entry] of completed) if (now() > entry.expiresAt) completed.delete(id);
    promise.then(result => reply(message, result));
    return true;
  }

  function close(reason = 'Command channel closed.') {
    closed = true;
    const result = { ok: false, error: String(reason), uncertain: true };
    for (const [id, entry] of pending) {
      clearTimeout(entry.timeout);
      pending.delete(id);
      try { entry.resolve(result); } catch (_) {}
    }
    completed.clear();
  }

  return { request, receive, isPending(targetTabId, presetId = '') {
    return [...pending.values()].some(({ message }) => message.targetTabId === targetTabId &&
      (!presetId || message.actionName === 'runWorkspacePresetAction' && message.args[0] === presetId));
  }, close };
}
