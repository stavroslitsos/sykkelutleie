import { getRecordingLifecycle, requestRecordingAction, resetRecordingLifecycle } from './core/recording-lifecycle.js';
import { hasNonEmptyText } from './core/text-performance.js';
import {
  disposeWorkspaceResources as disposeRegisteredWorkspaceResources,
  installWorkspaceDisposalLifecycle,
  isWorkspaceFinalized,
  registerWorkspaceDisposer,
} from './core/workspace-disposal.js';
import { initTranscribeLanguage } from './languageLoaderUsage.js';
import {
  DEFAULTS,
  deriveNoteUiStateFromEffectiveProvider,
  getNoteProviderLogLabel,
  getNoteUiVisibility,
  getTranscribeProviderLabel,
  getTranscribeProviderShortLabel,
  inferNoteProviderUi,
  normalizeNoteUiProvider,
  listBedrockModelOptions,
  listNoteModeOptions,
  listNoteUiProviderOptions,
  listOpenAiModelOptions,
  normalizeOpenAiModel,
  listSonioxRegionOptions,
  listSonioxSpeakerLabelOptions,
  listTranscribeProviderOptions,
  normalizeTranscribeProvider,
  resolveEffectiveNoteProvider,
  resolveNoteInitExportName as resolveNoteInitExportNameFromRegistry,
  resolveNoteModulePath as resolveNoteModulePathFromRegistry,
  resolveTranscribeModulePath as resolveTranscribeModulePathFromRegistry,
} from './core/provider-registry.js';

document.addEventListener('DOMContentLoaded', () => {
  installWorkspaceDisposalLifecycle();
  initTranscribeLanguage();

  const STATE_KEY = '__ui_state_v1';
  const AUTO_GENERATE_KEY = 'auto_generate_enabled';
  const AUTO_COPY_MODE_KEY = 'auto_copy_mode';
  const SUPPLEMENTARY_DATE_TOGGLE_KEY = 'supplementary_date_enabled';
  const AUTO_COPY_EXTENSION_SIGNAL = 'AUTO_COPY_EXTENSION_PRESENT';
  const AUTO_COPY_EXTENSION_COPY_RESULT = 'AUTO_COPY_EXTENSION_COPY_RESULT';
  const AUTO_COPY_EXTENSION_PING = 'AUTO_COPY_EXTENSION_PING';
  const AUTO_COPY_EXTENSION_PING_TIMEOUT_MS = 1200;
  const PROMPT_PROFILE_STORAGE_KEY = 'prompt_profile_id';
  const DEFAULT_PROMPT_PROFILE_ID = 'default';
  const MINI_HUB_CHANNEL_NAME = 'whisperazure-mini-panel-hub';
  const MINI_HUB_PAGE_SESSION_KEY = 'mini_panel_page_session_id';
  const MINI_FAVICON_SYMBOL_URL = 'favicon-32x32.png';
  const MINI_HUB_STALE_MS = 45 * 1000;
  let miniHubChannel = null;
  let miniHubClosed = false;
  let miniHubTabId = '';
  let miniHubPageSessionId = '';
  let miniHubAppliedFaviconDataUrl = '';
  // Accent for THIS tab, as reported by mini-controller.js (the hub
  // authority). Updated via 'mini-panel:accent-changed' events or via
  // 'mini-hub-accent-assigned' channel messages targeted at this tab.
  // main.js no longer maintains a tab registry — the hub owns it.
  let miniHubOwnAccentKey = '';
  let miniHubOwnAccentColor = '';
  let miniHubLiveTabCount = 1;
  let recordingProviderInitSequence = 0;
  let noteProviderInitSequence = 0;

  function getApp() {
    const existing = window.__app || {};
    const app = (window.__app = existing);
    app.cachedModules = app.cachedModules || {};
    if (typeof app.miniPanelOpen !== 'boolean') {
      app.miniPanelOpen = false;
    }
    return app;
  }

  function getOrCreateMiniHubTabId() {
    if (miniHubTabId) return miniHubTabId;

    const app = getApp();
    const shared = String(app.__miniHubRuntimeTabId || '').trim();
    if (shared) {
      miniHubTabId = shared;
      return miniHubTabId;
    }

    miniHubTabId =
      (window.crypto?.randomUUID && window.crypto.randomUUID()) ||
      `mini-tab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    app.__miniHubRuntimeTabId = miniHubTabId;
    return miniHubTabId;
  }

  function getOrCreateMiniHubPageSessionId() {
    if (miniHubPageSessionId) return miniHubPageSessionId;

    const app = getApp();
    const shared = String(app.__miniHubPageSessionId || '').trim();
    if (shared) {
      miniHubPageSessionId = shared;
      return miniHubPageSessionId;
    }

    try {
      const existing = String(sessionStorage.getItem(MINI_HUB_PAGE_SESSION_KEY) || '').trim();
      if (existing) {
        miniHubPageSessionId = existing;
        app.__miniHubPageSessionId = miniHubPageSessionId;
        return miniHubPageSessionId;
      }
    } catch (_) {}

    miniHubPageSessionId =
      (window.crypto?.randomUUID && window.crypto.randomUUID()) ||
      `mini-page-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    try {
      sessionStorage.setItem(MINI_HUB_PAGE_SESSION_KEY, miniHubPageSessionId);
    } catch (_) {}

    app.__miniHubPageSessionId = miniHubPageSessionId;
    return miniHubPageSessionId;
  }

  // NOTE: the old local tab registry and accent-reconcile system
  // (miniHubLiveTabs, getMiniHubAccentPalette, reconcileMiniHubTabAccents,
  // upsertMiniHubLiveTab, removeMiniHubLiveTab, pruneMiniHubLiveTabs,
  // getMiniHubLiveTabCount, getMiniHubTabAccent) has been removed.
  // The authoritative registry and color assignment live in
  // js/features/mini-controller.js. main.js now publishes its own
  // state onto the hub channel and listens for 'mini-hub-accent-assigned'
  // messages + the local 'mini-panel:accent-changed' event to drive
  // its favicon. See mini-controller.js for the hub protocol.


  function shouldUseMiniHubAccentMode() {
    // Only show colored favicon when there are 2+ tabs open AND
    // the hub has assigned us a color. Both pieces of data come from
    // mini-controller.js via 'mini-panel:accent-changed' events.
    return (
      miniHubLiveTabCount > 1 &&
      !!miniHubOwnAccentColor
    );
  }

  function ensureFaviconLink() {
    let link = document.querySelector("link[rel='icon']");
    if (link) return link;

    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
    return link;
  }

  function drawRoundedRect(ctx, x, y, width, height, radius) {
    const r = Math.max(0, Math.min(radius, Math.min(width, height) / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  async function buildMiniHubFaviconDataUrl(symbolUrl, accentColor, size = 32) {
    const img = new Image();
    img.src = symbolUrl;
    await img.decode();

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = accentColor;
    drawRoundedRect(ctx, 0, 0, size, size, Math.round(size * 0.22));
    ctx.fill();
    ctx.drawImage(img, 0, 0, size, size);

    return canvas.toDataURL('image/png');
  }

  async function applyMiniHubAccentFavicon() {
    try {
      const link = ensureFaviconLink();

      // Prefer hub-supplied accent over any cached value. If the hub
      // controller is available and reports a current color for this
      // tab, trust it — that's the authoritative source.
      const controller = window.__miniPanelController;
      if (controller) {
        const count = typeof controller.getLiveTabCount === 'function'
          ? Number(controller.getLiveTabCount() || 0)
          : miniHubLiveTabCount;
        miniHubLiveTabCount = count;

        if (typeof controller.getAccentForTabId === 'function') {
          const assigned = controller.getAccentForTabId(getOrCreateMiniHubTabId());
          if (assigned?.color) {
            miniHubOwnAccentKey = String(assigned.key || '');
            miniHubOwnAccentColor = String(assigned.color || '');
          }
        }
      }

      if (!shouldUseMiniHubAccentMode()) {
        if (miniHubAppliedFaviconDataUrl !== MINI_FAVICON_SYMBOL_URL) {
          miniHubAppliedFaviconDataUrl = MINI_FAVICON_SYMBOL_URL;
          link.href = MINI_FAVICON_SYMBOL_URL;
        }
        return;
      }

      const href = await buildMiniHubFaviconDataUrl(
        MINI_FAVICON_SYMBOL_URL,
        miniHubOwnAccentColor,
        32
      );
      if (!href || href === miniHubAppliedFaviconDataUrl) return;

      miniHubAppliedFaviconDataUrl = href;
      link.href = href;
    } catch (error) {
      console.warn('[mini-hub] failed to apply accent favicon', error);
    }
  }

  function getMiniHubChannel() {
    // Embedded preset runtimes are represented by their parent tab. Letting
    // every same-origin iframe join the BroadcastChannel would make one
    // browser tab appear as several unrelated tabs in the Mini Panel.
    if (window.__workspacePresetFrame || miniHubClosed) return null;

    if (miniHubChannel || typeof BroadcastChannel !== 'function') {
      return miniHubChannel;
    }

    try {
      miniHubChannel = new BroadcastChannel(MINI_HUB_CHANNEL_NAME);
    } catch (_) {
      miniHubChannel = null;
    }

    return miniHubChannel;
  }

  function postMiniHubMessage(message) {
    const channel = getMiniHubChannel();
    if (!channel) return;

    try {
      channel.postMessage(message);
    } catch (_) {}
  }

  function emitAppStateChanged(reason = 'unknown', extra = {}) {
    try {
      window.dispatchEvent(
        new CustomEvent('app:state-changed', {
          detail: {
            reason,
            at: Date.now(),
            ...extra,
          },
        })
      );
    } catch (_) {}
  }

  function normalizePromptOptionLabel(item) {
    const id = String(item?.id || '').trim();
    if (!id) return null;

    const rawLabel = String(item?.label || '').trim();
    return {
      id,
      label: rawLabel || id,
    };
  }

  function stripPromptNumericPrefix(label) {
    return String(label || '')
      .replace(/^\s*\d+\s*[\.\-:)]\s*/u, '')
      .trim();
  }

  function getMiniPanelPromptOptionsSnapshot() {
    const app = getApp();
    if (
      typeof app.getMiniPanelPromptOptions !== 'function' ||
      app.getMiniPanelPromptOptions === getMiniPanelPromptOptionsSnapshot
    ) {
      return [];
    }

    try {
      return (app.getMiniPanelPromptOptions() || [])
        .map(normalizePromptOptionLabel)
        .filter(Boolean);
    } catch (_) {
      return [];
    }
  }

  function getSelectedPromptSlotSnapshot() {
    const app = getApp();
    if (
      typeof app.getSelectedPromptSlot !== 'function' ||
      app.getSelectedPromptSlot === getSelectedPromptSlotSnapshot
    ) {
      return '1';
    }

    try {
      return String(app.getSelectedPromptSlot() || '1').trim() || '1';
    } catch (_) {
      return '1';
    }
  }

  function getCurrentPromptLabelSnapshot() {
    const options = getMiniPanelPromptOptionsSnapshot();
    const selectedSlot = getSelectedPromptSlotSnapshot();

    const selected = options.find((item) => item.id === selectedSlot);
    if (!selected) return 'Untitled';

    const cleaned = stripPromptNumericPrefix(selected.label);
    return cleaned || 'Untitled';
  }

  function getMiniPanelStateSnapshot() {
    const app = getApp();
    if (typeof app.getMiniPanelState !== 'function') {
      return {
        canStart: false,
        canStop: false,
        canPauseResume: false,
        canAbort: false,
        hasTranscript: false,
        hasNote: false,
        statusText: '',
        pauseResumeLabel: 'Pause',
        autoGenerateEnabled: false,
        autoCopyMode: 'off',
        autoCopyExtensionAvailable: false,
        miniPanelStatusPhase: 'idle',
        miniPanelCopiedState: '',
        miniPanelCopiedAt: 0,
        usePromptEnabled: false,
      };
    }

    try {
      return app.getMiniPanelState() || {};
    } catch (_) {
      return {};
    }
  }

  function setMiniPanelCopyState(kind = '', at = Date.now()) {
    const app = getApp();
    const nextKind = String(kind || '').trim();
    const nextAt = Number(at || 0);

    if (
      String(app.miniPanelCopiedState || '') === nextKind &&
      Number(app.miniPanelCopiedAt || 0) === nextAt
    ) {
      return;
    }

    app.miniPanelCopiedState = nextKind;
    app.miniPanelCopiedAt = nextAt;
    emitAppStateChanged('mini-panel-copy-state', { kind: nextKind, at: nextAt });
  }

  function clearMiniPanelCopyState(reason = 'clear') {
    const app = getApp();
    if (!app.miniPanelCopiedState && !app.miniPanelCopiedAt) return;
    app.miniPanelCopiedState = '';
    app.miniPanelCopiedAt = 0;
    emitAppStateChanged('mini-panel-copy-state-cleared', { reason });
  }

  function publishMiniHubSnapshot(reason = 'state') {
    if (miniHubClosed || window.__workspacePresetFrame) return;
    void applyMiniHubAccentFavicon();
    // The controller is the sole publisher; it also updates its local registry
    // and deduplicates state. Its boot snapshot covers events before it loads.
    window.__miniPanelController?.publishState?.(reason);
  }

  function activateMiniHubTab(reason = 'activate') {
    const snapshot = buildMiniHubSnapshot();
    const activatedAt = Date.now();
    void applyMiniHubAccentFavicon();

    postMiniHubMessage({
      type: 'mini-hub-activate-tab',
      reason,
      tabId: snapshot.tabId,
      activatedAt,
      snapshot: {
        ...snapshot,
        activatedAt,
      },
    });
  }

  function closeMiniHubTab() {
    void applyMiniHubAccentFavicon();
    postMiniHubMessage({
      type: 'mini-hub-tab-closed',
      tabId: getOrCreateMiniHubTabId(),
      at: Date.now(),
    });
  }

  function getCurrentMiniHubContentText(kind, presetId = '') {
    const managedContent = window.__workspacePresets?.getContent?.(kind, presetId);
    if (managedContent != null) return String(managedContent);

    const normalizedKind = String(kind || '').trim().toLowerCase();
    const fieldId = normalizedKind === 'note' ? 'generatedNote' : 'transcription';
    const field = document.getElementById(fieldId);
    return String(field?.value || '');
  }

  function bindMiniHubBridge() {
    if (window.__miniHubBridgeBound === true) return;
    window.__miniHubBridgeBound = true;

    const channel = getMiniHubChannel();
    getOrCreateMiniHubTabId();
    getOrCreateMiniHubPageSessionId();
    void applyMiniHubAccentFavicon();

    if (channel) {
      channel.addEventListener('message', (event) => {
        const data = event?.data || {};
        const type = String(data?.type || '').trim();

        // Tab-state and tab-closed messages used to be consumed here
        // to maintain a local tab registry. That registry has been
        // deleted — the hub (mini-controller.js) is now the sole
        // authority. main.js only reacts to messages that affect its
        // own favicon or that invoke a command on this tab.

        if (type === 'mini-hub-accent-assigned') {
          // The hub (or another tab) is telling us what color a tab
          // was assigned. If the message is about OUR tab, cache the
          // color and re-apply the favicon. Other tabs' assignments
          // are tracked by mini-controller.js, not here.
          const tabId = String(data?.tabId || '').trim();
          if (tabId && tabId === getOrCreateMiniHubTabId()) {
            const key = String(data?.accentKey || '').trim();
            const color = String(data?.accentColor || '').trim();
            if (key && color) {
              miniHubOwnAccentKey = key;
              miniHubOwnAccentColor = color;
            }
          }
          const count = Number(data?.liveTabCount || 0);
          if (count > 0) miniHubLiveTabCount = count;
          void applyMiniHubAccentFavicon();
          return;
        }

        if (type === 'mini-hub-content-request') {
          const targetTabId = String(data?.targetTabId || '').trim();
          if (!targetTabId || targetTabId !== getOrCreateMiniHubTabId()) return;

          const requestId = String(data?.requestId || '').trim();
          const kind = String(data?.kind || '').trim().toLowerCase();
          const presetId = String(data?.presetId || '').trim();
          if (!requestId || !kind) return;

          postMiniHubMessage({
            type: 'mini-hub-content-response',
            requestId,
            tabId: getOrCreateMiniHubTabId(),
            pageSessionId: getOrCreateMiniHubPageSessionId(),
            kind,
            presetId,
            text: getCurrentMiniHubContentText(kind, presetId),
            at: Date.now(),
          });
          return;
        }

        // mini-hub-command is handled exclusively by mini-controller.js.
        // Do not also invoke the action here — that would cause every
        // pause/stop/start dispatched from the mini panel to fire twice
        // in the target tab.
      });
    }

    // mini-controller.js dispatches this locally after the hub picks
    // or updates this tab's color. No channel round-trip needed for
    // same-tab updates.
    window.addEventListener('mini-panel:accent-changed', (event) => {
      const detail = event?.detail || {};
      const key = String(detail.accentKey || '').trim();
      const color = String(detail.accentColor || '').trim();
      if (key && color) {
        miniHubOwnAccentKey = key;
        miniHubOwnAccentColor = color;
      }
      const count = Number(detail.liveTabCount || 0);
      if (count > 0) miniHubLiveTabCount = count;
      void applyMiniHubAccentFavicon();
    });

    // app:state-changed is consumed by mini-controller.js, not by both modules.

    window.addEventListener('prompt-slot-selection-changed', () => {
      publishMiniHubSnapshot('prompt-slot-selection-changed');
    });

    window.addEventListener('prompt-slot-names-changed', () => {
      publishMiniHubSnapshot('prompt-slot-names-changed');
    });

    window.addEventListener('prompt-profile-changed', () => {
      publishMiniHubSnapshot('prompt-profile-changed');
    });

    window.addEventListener('transcription:finished', () => {
      publishMiniHubSnapshot('transcription-finished');
    });

    window.addEventListener('note-generation-finished', () => {
      publishMiniHubSnapshot('note-generation-finished');
    });

    window.addEventListener('note:finished', () => {
      publishMiniHubSnapshot('note-finished');
    });

    window.addEventListener('mini-panel:status', () => {
      publishMiniHubSnapshot('mini-panel-status');
    });

    window.setTimeout(() => publishMiniHubSnapshot('bridge-ready'), 0);
  }

  function bindMiniPanelButtonStateObserver() {
    const app = getApp();
    if (app.__miniPanelButtonStateObserverBound) return;
    app.__miniPanelButtonStateObserverBound = true;

    const ids = ['startButton', 'stopButton', 'pauseResumeButton', 'abortButton'];
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!elements.length || typeof MutationObserver !== 'function') {
      return;
    }

    let queued = false;
    const queuePublish = (reason) => {
      if (queued) return;
      queued = true;
      window.setTimeout(() => {
        queued = false;
        publishMiniHubSnapshot(reason || 'button-state-observed');
      }, 0);
    };

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes') {
          queuePublish('button-state-observed');
          return;
        }
        if (mutation.type === 'characterData' || mutation.type === 'childList') {
          queuePublish('pause-label-observed');
          return;
        }
      }
    });

    elements.forEach((el) => {
      observer.observe(el, {
        attributes: true,
        attributeFilter: ['disabled', 'aria-disabled', 'class'],
        childList: true,
        characterData: true,
        subtree: true,
      });
    });

    app.__miniPanelButtonStateObserver = observer;
    window.setTimeout(() => publishMiniHubSnapshot('button-state-observer-bound'), 0);
  }

  function setMiniPanelStatusPhase(phase) {
    const app = getApp();
    const next = String(phase || '').trim() || 'idle';
    if (app.miniPanelStatusPhase === next) return;
    app.miniPanelStatusPhase = next;
    emitAppStateChanged('mini-panel-status-phase', { phase: next });
  }

  function setAutoCopyExtensionAvailable(available) {
    const app = getApp();
    const next = !!available;
    if (app.autoCopyExtensionAvailable === next) return;
    app.autoCopyExtensionAvailable = next;
    emitAppStateChanged('auto-copy-extension-availability', { available: next });
  }

  function isAutoCopyExtensionAvailable() {
    return !!getApp().autoCopyExtensionAvailable;
  }

  // Extension v1.2.0+ advertises a "focus-tab" capability in its
  // presence announcement. Older extension versions do not, so this
  // flag stays false and the mini panel hides the jump-to-tab button.
  function setAutoCopyExtensionFocusTabSupported(supported) {
    const app = getApp();
    const next = !!supported;
    if (app.autoCopyExtensionFocusTabSupported === next) return;
    app.autoCopyExtensionFocusTabSupported = next;
    emitAppStateChanged('auto-copy-extension-focus-tab-availability', { supported: next });
  }

  function isAutoCopyExtensionFocusTabSupported() {
    return !!getApp().autoCopyExtensionFocusTabSupported;
  }

  function pingAutoCopyExtension() {
    return new Promise((resolve) => {
      let settled = false;

      const finish = (available) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeoutId);
        window.removeEventListener('message', onMessage);
        setAutoCopyExtensionAvailable(available);
        if (!available) {
          // No extension at all -> definitely no focus-tab support.
          setAutoCopyExtensionFocusTabSupported(false);
        }
        resolve(available);
      };

      const onMessage = (event) => {
        if (event.source !== window || event.origin !== location.origin) return;
        const data = event?.data || {};
        if (data.type !== AUTO_COPY_EXTENSION_SIGNAL) return;

        const caps = Array.isArray(data?.capabilities) ? data.capabilities : [];
        const supportsFocusTab = caps
          .map((c) => String(c || '').trim().toLowerCase())
          .includes('focus-tab');
        setAutoCopyExtensionFocusTabSupported(supportsFocusTab);

        finish(true);
      };

      const timeoutId = window.setTimeout(() => finish(false), AUTO_COPY_EXTENSION_PING_TIMEOUT_MS);
      window.addEventListener('message', onMessage);

      try {
        window.postMessage({ type: AUTO_COPY_EXTENSION_PING }, window.location.origin);
      } catch (_) {
        finish(false);
      }
    });
  }

  function readSession(key, fallback = '') {
    try {
      const value = sessionStorage.getItem(key);
      return value == null ? fallback : value;
    } catch (_) {
      return fallback;
    }
  }

  function writeSession(key, value) {
    try {
      sessionStorage.setItem(key, String(value ?? ''));
    } catch (_) {}
  }

  function readLocal(key, fallback = '') {
    try {
      const value = localStorage.getItem(key);
      return value == null ? fallback : value;
    } catch (_) {
      return fallback;
    }
  }

  function writeLocal(key, value) {
    try {
      localStorage.setItem(key, String(value ?? ''));
    } catch (_) {}
  }

  function getTodaySupplementaryDateLine() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear());
    return `Dagens dato er ${day}.${month}.${year}`;
  }

  function getSupplementaryDateLineRegex() {
    return /^Dagens dato er \d{2}\.\d{2}\.\d{4}\s*$/im;
  }

  function normalizeSupplementaryDateLine(text, { enabled } = {}) {
    const original = String(text || '');
    const dateLineRegex = getSupplementaryDateLineRegex();

    const lines = original.split(/\r?\n/);
    const nonDateLines = lines.filter((line) => !dateLineRegex.test(String(line).trim()));

    if (!enabled) {
      return nonDateLines.join('\n').replace(/^\n+/, '');
    }

    const todayLine = getTodaySupplementaryDateLine();
    const body = nonDateLines.join('\n').replace(/^\n+/, '');
    // Keep one intentionally blank line between the sticky date and the
    // supplementary text. Preserve the same spacing even while the body is
    // empty so later typing or pasting starts below that blank line.
    return body ? `${todayLine}\n\n${body}` : `${todayLine}\n\n`;
  }

  function syncSupplementaryDateField({ enabled, focus = false, emitReason = '' } = {}) {
    const supplementaryInfo = document.getElementById('supplementaryInfo');
    if (!supplementaryInfo) return false;

    const nextValue = normalizeSupplementaryDateLine(supplementaryInfo.value, { enabled });
    if (supplementaryInfo.value === nextValue) return false;

    supplementaryInfo.value = nextValue;

    try {
      supplementaryInfo.dispatchEvent(new Event('input', { bubbles: true }));
    } catch (_) {}

    if (focus) {
      try {
        supplementaryInfo.focus();
      } catch (_) {}
    }

    if (emitReason) {
      emitAppStateChanged(emitReason, { enabled: !!enabled });
    }

    return true;
  }

  function getSupplementaryDateEnabled() {
    return readSession(SUPPLEMENTARY_DATE_TOGGLE_KEY, '0') === '1';
  }

  function setSupplementaryDateEnabled(enabled, options = {}) {
    const nextEnabled = !!enabled;
    const source =
      String(options?.source || 'supplementary-date-toggle').trim() ||
      'supplementary-date-toggle';

    writeSession(SUPPLEMENTARY_DATE_TOGGLE_KEY, nextEnabled ? '1' : '0');

    const el = document.getElementById('supplementaryDateToggle');
    if (el && el.type === 'checkbox') {
      el.checked = nextEnabled;
    }

    syncSupplementaryDateField({
      enabled: nextEnabled,
      focus: !!options?.focus,
      emitReason: source,
    });
  }

  function initSupplementaryDateToggle() {
    const el = document.getElementById('supplementaryDateToggle');
    if (!el || el.type !== 'checkbox') return;

    if (el.dataset.bound === '1') return;
    el.dataset.bound = '1';

    if (readSession(SUPPLEMENTARY_DATE_TOGGLE_KEY, null) == null) {
      writeSession(SUPPLEMENTARY_DATE_TOGGLE_KEY, '0');
    }

    el.checked = getSupplementaryDateEnabled();

    syncSupplementaryDateField({
      enabled: el.checked,
      focus: false,
      emitReason: 'supplementary-date-toggle-init',
    });

    el.addEventListener('change', () => {
      setSupplementaryDateEnabled(el.checked, {
        source: 'supplementary-date-toggle-change',
        focus: true,
      });
    });
  }

  function reloadWithSavedState(reason = '') {
    if (reason) {
      console.warn(reason);
    }

    try {
      saveState();
    } catch (_) {}

    window.location.reload();
  }

  function saveState() {
    const grab = (id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      return {
        value: el.value ?? '',
        selStart: el.selectionStart ?? null,
        selEnd: el.selectionEnd ?? null,
        scrollTop: el.scrollTop ?? 0,
      };
    };

    const payload = {
      customPrompt: grab('customPrompt'),
      ts: Date.now(),
    };

    try {
      sessionStorage.setItem(STATE_KEY, JSON.stringify(payload));
    } catch {}
  }

  function restoreState() {
    let raw = null;
    try {
      raw = sessionStorage.getItem(STATE_KEY);
    } catch {}
    if (!raw) return;

    try {
      const s = JSON.parse(raw);
      const put = (id, sObj) => {
        if (!sObj) return;
        const el = document.getElementById(id);
        if (!el) return;

        el.value = sObj.value || '';
        if (typeof sObj.scrollTop === 'number') el.scrollTop = sObj.scrollTop;

        setTimeout(() => {
          if (typeof sObj.selStart === 'number' && typeof sObj.selEnd === 'number') {
            try {
              el.setSelectionRange(sObj.selStart, sObj.selEnd);
            } catch {}
          }
        }, 0);
      };

      put('customPrompt', s.customPrompt);
    } finally {
      try {
        sessionStorage.removeItem(STATE_KEY);
      } catch {}
    }

    emitAppStateChanged('state-restored');
  }

  function syncNoteActionButtons() {
    const generateNoteButton = document.getElementById('generateNoteButton');
    const abortNoteButton = document.getElementById('abortNoteButton');
    const noteProviderSelect = document.getElementById('noteProvider');
    const openaiModelSelect = document.getElementById('openaiModel');
    const noteModeSelect = document.getElementById('noteProviderMode');
    const bedrockModelSelect = document.getElementById('bedrockModel');
    const requestyModelSelect = document.getElementById('requestyModel');
    const openaiReasoningSelect = document.getElementById('gpt5Reasoning');
    const requestyNanoReasoningSelect = document.getElementById('requestyNanoReasoning');
    const busy = !!getApp().noteGenerationInFlight;

    if (generateNoteButton) {
      generateNoteButton.disabled = busy;
      generateNoteButton.title = busy ? 'A note is currently generating.' : '';
    }

    if (abortNoteButton) {
      abortNoteButton.disabled = !busy;
      abortNoteButton.title = busy ? '' : 'No active note generation to abort.';
    }

    [
      noteProviderSelect,
      openaiModelSelect,
      noteModeSelect,
      bedrockModelSelect,
      requestyModelSelect,
      openaiReasoningSelect,
      requestyNanoReasoningSelect,
    ].forEach((el) => {
      if (!el) return;
      el.disabled = busy;
      el.title = busy ? 'Provider settings are locked while a note is generating.' : '';
    });
  }

  function beginNoteGeneration(meta = {}) {
    const app = getApp();
    if (app.noteGenerationInFlight) return null;

    const controller = new AbortController();
    app.noteGenerationInFlight = true;
    app.noteGenerationAbortController = controller;
    app.noteGenerationMeta = meta || {};
    syncNoteActionButtons();
    emitAppStateChanged('note-generation-begin', { meta: meta || {} });
    return controller;
  }

  function finishNoteGeneration() {
    const app = getApp();
    app.noteGenerationInFlight = false;
    app.noteGenerationAbortController = null;
    app.noteGenerationMeta = null;
    syncNoteActionButtons();
    emitAppStateChanged('note-generation-finish');
  }

  function abortNoteGeneration() {
    const controller = getApp().noteGenerationAbortController;
    if (controller) {
      try {
        controller.abort();
      } catch (_) {}
    }
    emitAppStateChanged('note-generation-abort-requested');
  }

  function normalizeAutoCopyMode(value) {
    const mode = String(value || '').toLowerCase();
    if (mode === 'both') return 'note';
    return ['off', 'transcript', 'note'].includes(mode) ? mode : 'off';
  }

  function getAutoCopyMode() {
    const raw = readSession(AUTO_COPY_MODE_KEY, '');
    const next = normalizeAutoCopyMode(raw);
    if (next !== raw) {
      writeSession(AUTO_COPY_MODE_KEY, next);
    }
    return next;
  }

  function setAutoCopyMode(mode) {
    const next = normalizeAutoCopyMode(mode);
    if (next !== 'off' && !isAutoCopyExtensionAvailable()) {
      writeSession(AUTO_COPY_MODE_KEY, 'off');

      const el = document.getElementById('autoCopyModeSelect');
      if (el && el.value !== 'off') {
        el.value = 'off';
      }

      emitAppStateChanged('auto-copy-mode-blocked-no-extension', {
        requestedMode: next,
        appliedMode: 'off',
      });
      return 'off';
    }

    writeSession(AUTO_COPY_MODE_KEY, next);

    const el = document.getElementById('autoCopyModeSelect');
    if (el && el.value !== next) {
      el.value = next;
    }

    emitAppStateChanged('auto-copy-mode-changed', { mode: next });
    return next;
  }

  function autoCopyIncludesTranscript() {
    const mode = getAutoCopyMode();
    return mode === 'transcript';
  }

  function autoCopyIncludesNote() {
    const mode = getAutoCopyMode();
    return mode === 'note';
  }

  function buildFinishedNoteDetail(meta = {}) {
    const noteEl = document.getElementById('generatedNote');
    const text = String(noteEl?.value || '');
    return {
      status: meta?.aborted ? 'aborted' : 'success',
      text,
      textLength: text.length,
      autoCopyEnabled: autoCopyIncludesNote(),
      autoCopyMode: getAutoCopyMode(),
      emittedAt: Date.now(),
      ...meta,
    };
  }

  function emitCopiedEvent(text, source = 'manual-copy') {
    try {
      window.dispatchEvent(
        new CustomEvent('note-copied', {
          detail: {
            textLength: String(text || '').length,
            copiedAt: Date.now(),
            source,
          },
        })
      );
    } catch (_) {}
    setMiniPanelCopyState('copied', Date.now());
    emitAppStateChanged('note-copied', {
      textLength: String(text || '').length,
      source,
    });
  }

  function emitTranscriptCopiedEvent(text, source = 'manual-copy-transcript') {
    try {
      window.dispatchEvent(
        new CustomEvent('transcript-copied', {
          detail: {
            textLength: String(text || '').length,
            copiedAt: Date.now(),
            source,
          },
        })
      );
    } catch (_) {}
    setMiniPanelCopyState('copied', Date.now());
    emitAppStateChanged('transcript-copied', {
      textLength: String(text || '').length,
      source,
    });
  }

  function emitTranscriptCopyFailedEvent(
    text,
    source = 'manual-copy-transcript',
    reason = 'unknown'
  ) {
    try {
      window.dispatchEvent(
        new CustomEvent('transcript-copy-failed', {
          detail: {
            textLength: String(text || '').length,
            failedAt: Date.now(),
            source,
            reason,
          },
        })
      );
    } catch (_) {}
    setMiniPanelCopyState('copyFailed', Date.now());
    emitAppStateChanged('transcript-copy-failed', {
      textLength: String(text || '').length,
      source,
      reason,
    });
  }

  function initAutoCopyExtensionCopyBridge() {
    const app = getApp();
    if (app.__autoCopyExtensionCopyBridgeBound) return;
    app.__autoCopyExtensionCopyBridgeBound = true;
    let useFirefoxEventBridge = false;
    const forward = (event, copyKind) => {
      if (!useFirefoxEventBridge) return;
      const detail = event.detail || {};
      if (detail.aborted || detail.failed || ['aborted', 'error', 'failed'].includes(detail.status)) return;
      const redactor = event.type === 'redactor:autocopy';
      if (redactor ? !document.getElementById('redactorAutocopyToggle')?.checked : getAutoCopyMode() !== copyKind) return;
      const field = copyKind === 'note' ? 'generatedNote' : 'transcription';
      const text = typeof detail.text === 'string' ? detail.text : String(document.getElementById(field)?.value || '');
      if (!text.trim()) return;
      window.postMessage({ type: 'AUTO_COPY_APP_EVENT', copyKind, text, sourceEvent: event.type }, location.origin);
    };
    for (const name of ['note:finished', 'note-generation-finished']) {
      window.addEventListener(name, event => forward(event, 'note'));
    }
    for (const name of ['transcription:finished', 'redactor:autocopy']) {
      window.addEventListener(name, event => forward(event, 'transcript'));
    }
    const resetBridge = () => {
      if (useFirefoxEventBridge) window.postMessage({ type: 'AUTO_COPY_APP_EVENT', reset: true }, location.origin);
    };
    window.addEventListener('recording:lifecycle', event => {
      if (event.detail?.phase === 'starting') resetBridge();
    });
    window.addEventListener('note-generation-started', resetBridge);

    // Permanent listener for unsolicited presence announcements. The
    // extension's content script announces itself once on page load
    // (before any ping). Without this listener, capability info from
    // that early announcement would be missed and the focus-tab button
    // wouldn't appear until the next ping cycle. Backward-compatible:
    // older extension versions don't include `capabilities`, so the
    // focus-tab flag stays false for them.
    window.addEventListener('message', (event) => {
      if (event.source !== window || event.origin !== location.origin) return;
      const data = event?.data || {};
      if (data.type !== AUTO_COPY_EXTENSION_SIGNAL) return;

      setAutoCopyExtensionAvailable(true);

      const caps = Array.isArray(data?.capabilities) ? data.capabilities : [];
      useFirefoxEventBridge = data.browser === 'firefox' && caps.includes('event-bridge-v1');
      const supportsFocusTab = caps
        .map((c) => String(c || '').trim().toLowerCase())
        .includes('focus-tab');
      setAutoCopyExtensionFocusTabSupported(supportsFocusTab);
    });

    window.addEventListener('message', (event) => {
      if (event.source !== window || event.origin !== location.origin) return;

      const data = event?.data || {};
      if (data.type !== AUTO_COPY_EXTENSION_COPY_RESULT) return;

      const copyKind = String(data.copyKind || '').trim().toLowerCase();
      const ok = !!data.ok;
      const reason = String(data.reason || '').trim() || 'extension-copy-failed';
      const sourceEvent = String(data.sourceEvent || '').trim();
      const source =
        copyKind === 'transcript'
          ? `extension-auto-copy-transcript:${sourceEvent || 'unknown'}`
          : `extension-auto-copy-note:${sourceEvent || 'unknown'}`;

      const textLength = Number(data.textLength || 0);
      const placeholderText = textLength > 0 ? 'x'.repeat(textLength) : '';

      if (copyKind === 'transcript') {
        if (ok) {
          emitTranscriptCopiedEvent(placeholderText, source);
        } else {
          emitTranscriptCopyFailedEvent(placeholderText, source, reason);
        }
        return;
      }

      if (ok) {
        emitCopiedEvent(placeholderText, source);
      } else {
        emitCopyFailedEvent(placeholderText, source, reason);
      }
    });
  }

  function emitCopyFailedEvent(text, source = 'manual-copy', reason = 'unknown') {
    try {
      window.dispatchEvent(
        new CustomEvent('note-copy-failed', {
          detail: {
            textLength: String(text || '').length,
            failedAt: Date.now(),
            source,
            reason,
          },
        })
      );
    } catch (_) {}
    setMiniPanelCopyState('copyFailed', Date.now());
    emitAppStateChanged('note-copy-failed', {
      textLength: String(text || '').length,
      source,
      reason,
    });
  }

  function delay(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  async function tryClipboardWriteWithRetries(text, retryCount = 5, retryDelayMs = 300) {
    if (!(navigator.clipboard && typeof navigator.clipboard.writeText === 'function')) {
      return { ok: false, reason: 'clipboard-api-unavailable' };
    }

    let lastError = null;

    for (let attempt = 0; attempt < retryCount; attempt += 1) {
      if (attempt > 0) {
        await delay(retryDelayMs);
      }

      try {
        await navigator.clipboard.writeText(text);
        return { ok: true };
      } catch (error) {
        lastError = error;
      }
    }

    return {
      ok: false,
      reason: lastError?.name || 'clipboard-write-failed',
    };
  }

  function tryExecCommandCopyFromField(field, text, source = 'manual-copy') {
    try {
      if (!field) return false;
      const previousSelectionStart = field.selectionStart;
      const previousSelectionEnd = field.selectionEnd;
      const previousActive = document.activeElement;

      field.focus();
      field.select();
      const ok = document.execCommand('copy');

      try {
        if (
          typeof previousSelectionStart === 'number' &&
          typeof previousSelectionEnd === 'number'
        ) {
          field.setSelectionRange(previousSelectionStart, previousSelectionEnd);
        }
      } catch (_) {}

      try {
        if (
          previousActive &&
          typeof previousActive.focus === 'function' &&
          previousActive !== field
        ) {
          previousActive.focus();
        }
      } catch (_) {}

      if (ok) {
        emitCopiedEvent(text, source);
      } else {
        emitCopyFailedEvent(text, source, 'execCommand-returned-false');
      }
      return !!ok;
    } catch (_) {
      emitCopyFailedEvent(text, source, 'execCommand-threw');
      return false;
    } finally {
      try {
        window.getSelection()?.removeAllRanges?.();
      } catch (_) {}
    }
  }

  function tryExecCommandCopyTranscriptFromField(
    field,
    text,
    source = 'manual-copy-transcript'
  ) {
    try {
      if (!field) return false;
      const previousSelectionStart = field.selectionStart;
      const previousSelectionEnd = field.selectionEnd;
      const previousActive = document.activeElement;

      field.focus();
      field.select();
      const ok = document.execCommand('copy');

      try {
        if (
          typeof previousSelectionStart === 'number' &&
          typeof previousSelectionEnd === 'number'
        ) {
          field.setSelectionRange(previousSelectionStart, previousSelectionEnd);
        }
      } catch (_) {}

      try {
        if (
          previousActive &&
          typeof previousActive.focus === 'function' &&
          previousActive !== field
        ) {
          previousActive.focus();
        }
      } catch (_) {}

      if (ok) {
        emitTranscriptCopiedEvent(text, source);
      } else {
        emitTranscriptCopyFailedEvent(text, source, 'execCommand-returned-false');
      }
      return !!ok;
    } catch (_) {
      emitTranscriptCopyFailedEvent(text, source, 'execCommand-threw');
      return false;
    } finally {
      try {
        window.getSelection()?.removeAllRanges?.();
      } catch (_) {}
    }
  }

  function getPageLanguage() {
    const lang = document.documentElement?.lang || localStorage.getItem('selectedLanguage') || 'en';
    return String(lang || 'en').toLowerCase();
  }

  function tNotify(key) {
    const lang = getPageLanguage();
    const dict = {
      copiedTitle: {
        en: 'Finished note copied',
        no: 'Ferdig notat kopiert',
        nb: 'Ferdig notat kopiert',
        nn: 'Ferdig notat kopiert',
        sv: 'Färdig anteckning kopierad',
        da: 'Færdig note kopieret',
        de: 'Fertige Notiz kopiert',
        fr: 'Note finale copiée',
        it: 'Nota finale copiata',
      },
      copiedBody: {
        en: 'The finished note is now on your clipboard.',
        no: 'Det ferdige notatet er nå kopiert til utklippstavlen.',
        nb: 'Det ferdige notatet er nå kopiert til utklippstavlen.',
        nn: 'Det ferdige notatet er no kopiert til utklippstavla.',
        sv: 'Den färdiga anteckningen är nu kopierad till urklipp.',
        da: 'Den færdige note er nu kopieret til udklipsholderen.',
        de: 'Die fertige Notiz befindet sich jetzt in der Zwischenablage.',
        fr: 'La note finale a été copiée dans le presse-papiers.',
        it: 'La nota finale è stata copiata negli appunti.',
      },
      permissionTitle: {
        en: 'Enable notifications?',
        no: 'Aktivere varsler?',
        nb: 'Aktivere varsler?',
        nn: 'Aktivere varsel?',
        sv: 'Aktivera notiser?',
        da: 'Aktivér notifikationer?',
        de: 'Benachrichtigungen aktivieren?',
        fr: 'Activer les notifications ?',
        it: 'Attivare le notifiche?',
      },
    };
    const row = dict[key] || {};
    return row[lang] || row[lang.split('-')[0]] || row.en || key;
  }

  function canUseWebNotifications() {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  function isMiniPanelOpen() {
    return !!getApp().miniPanelOpen;
  }

  function shouldShowCopiedSystemNotification(detail) {
    return !!(detail && detail.status !== 'aborted' && detail.autoCopyEnabled && !isMiniPanelOpen());
  }

  async function requestNotificationPermissionIfNeeded() {
    return 'extension-handled';
  }

  function showCopiedSystemNotification(detail) {
    if (!canUseWebNotifications()) {
      console.warn('[notify] Web Notifications API not supported in this browser/context.');
      emitAppStateChanged('notification-unsupported');
      return false;
    }

    if (Notification.permission !== 'granted') {
      console.warn(
        '[notify] Notification skipped because permission is not granted:',
        Notification.permission
      );
      emitAppStateChanged('notification-not-granted', { permission: Notification.permission });
      return false;
    }

    try {
      const title = tNotify('copiedTitle');
      const body = tNotify('copiedBody');
      const notification = new Notification(title, {
        body,
        tag: 'finished-note-copied',
        renotify: true,
        silent: false,
      });

      notification.onclick = () => {
        try {
          window.focus();
        } catch (_) {}
        try {
          notification.close();
        } catch (_) {}
      };

      setTimeout(() => {
        try {
          notification.close();
        } catch (_) {}
      }, 5000);

      emitAppStateChanged('system-notification-shown', {
        textLength: detail?.textLength || 0,
      });
      return true;
    } catch (err) {
      console.warn('[notify] Notification creation failed:', err);
      emitAppStateChanged('system-notification-failed');
      return false;
    }
  }

  function tryAutoCopyFinishedNote(detail) {
    return;
  }

  function buildFinishedTranscriptDetail(meta = {}) {
    const trEl = document.getElementById('transcription');
    const text = String(trEl?.value || '');
    return {
      status: meta?.aborted ? 'aborted' : 'success',
      text,
      textLength: text.length,
      autoCopyEnabled: autoCopyIncludesTranscript(),
      autoCopyMode: getAutoCopyMode(),
      emittedAt: Date.now(),
      ...meta,
    };
  }

  function tryAutoCopyFinishedTranscript(detail) {
    return;
  }

  function emitNoteFinished(meta = {}) {
    try {
      const detail = buildFinishedNoteDetail(meta);
      window.dispatchEvent(new CustomEvent('note-generation-finished', { detail }));
      window.dispatchEvent(new CustomEvent('note:finished', { detail }));
      finishNoteGeneration();
      return detail;
    } catch (_) {
      finishNoteGeneration();
      return buildFinishedNoteDetail(meta);
    }
  }

  function resetNoteGenerationState() {
    finishNoteGeneration();
    emitAppStateChanged('note-generation-reset');
  }

  function getSelectedTranscribeProvider() {
    const fromUi = document.getElementById('transcribeProvider')?.value;
    const normalized = normalizeTranscribeProvider(
      fromUi || readSession('transcribe_provider', DEFAULTS.transcribeProvider)
    );

    if (normalized !== readSession('transcribe_provider', DEFAULTS.transcribeProvider)) {
      writeSession('transcribe_provider', normalized);
    }

    return normalized;
  }

  function getSelectedSonioxRegion() {
    return String(
      document.getElementById('sonioxRegion')?.value ||
        readSession('soniox_region', DEFAULTS.sonioxRegion)
    ).toLowerCase();
  }

  function getSelectedSonioxSpeakerLabels() {
    return String(
      document.getElementById('sonioxSpeakerLabels')?.value ||
        readSession('soniox_speaker_labels', DEFAULTS.sonioxSpeakerLabels)
    ).toLowerCase();
  }

  function getSelectedEffectiveNoteProvider() {
    return String(readSession('note_provider', DEFAULTS.noteProvider)).toLowerCase();
  }

  function getDerivedNoteUiState() {
    return deriveNoteUiStateFromEffectiveProvider(
      getSelectedEffectiveNoteProvider(),
      readSession('note_provider_mode', DEFAULTS.noteMode)
    );
  }

  function getSelectedNoteProviderUi() {
    return String(
      document.getElementById('noteProvider')?.value ||
        inferNoteProviderUi(getSelectedEffectiveNoteProvider())
    ).toLowerCase();
  }

  function getSelectedOpenAiModel() {
    const domValue = String(document.getElementById('openaiModel')?.value || '').toLowerCase();
    if (domValue) return normalizeOpenAiModel(domValue);

    const stored = String(readSession('openai_model', '')).toLowerCase();
    if (stored) return normalizeOpenAiModel(stored);

    return normalizeOpenAiModel(getDerivedNoteUiState().openaiModel);
  }

  function getSelectedBedrockModel() {
    return String(
      document.getElementById('bedrockModel')?.value ||
        readSession('bedrock_model', '')
    ).toLowerCase();
  }

  function getSelectedRequestyModel() {
    return String(
      document.getElementById('requestyModel')?.value ||
        readSession('requesty_model', DEFAULTS.requestyModel)
    ).toLowerCase();
  }

  function getSelectedNoteProviderMode() {
    const domValue = String(document.getElementById('noteProviderMode')?.value || '').toLowerCase();
    if (domValue) return domValue;

    const stored = String(readSession('note_provider_mode', '')).toLowerCase();
    if (stored) return stored;

    return getDerivedNoteUiState().mode;
  }

  function getTranscribeProviderSnapshot() {
    return {
      transcribeProvider: getSelectedTranscribeProvider(),
      sonioxRegion: getSelectedSonioxRegion(),
      sonioxSpeakerLabels: getSelectedSonioxSpeakerLabels(),
    };
  }

  function getNoteProviderSnapshot() {
    const effective = getSelectedEffectiveNoteProvider();
    const uiProvider = getSelectedNoteProviderUi();
    const bedrockModel = getSelectedBedrockModel();
    const requestyModel = getSelectedRequestyModel();
    const openaiModel = getSelectedOpenAiModel();
    const noteProviderMode = getSelectedNoteProviderMode();

    return {
      noteProviderUi: uiProvider,
      noteProviderEffective: effective,
      noteProviderMode,
      openaiModel,
      bedrockModel,
      requestyModel,
      noteProviderLogLabel: getNoteProviderLogLabel({
        effectiveProvider: effective,
        openaiModel,
        bedrockModel,
      }),
    };
  }

  function getEffectivePromptProfileId() {
    return String(readLocal(PROMPT_PROFILE_STORAGE_KEY, '') || '').trim() || DEFAULT_PROMPT_PROFILE_ID;
  }

  function getPromptSlotNamesMap() {
    const profileId = getEffectivePromptProfileId();
    const raw = readLocal(`prompt_slot_names::${profileId}`, '');
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function getPromptSlotSelect() {
    return document.getElementById('promptSlot');
  }

  function getPromptSlotDisplayLabel(slotValue, namesMap) {
    const slot = String(slotValue || '').trim();
    if (!slot) return '';
    const explicitName = String((namesMap && namesMap[slot]) || '').trim();
    if (explicitName) {
      return `${slot}. ${explicitName}`;
    }
    return `${slot}.`;
  }

  function getMiniPanelPromptOptions() {
    const app = getApp();
    if (typeof app.getMiniPanelPromptOptionsRich === 'function') {
      try {
        const rich = app.getMiniPanelPromptOptionsRich();
        if (Array.isArray(rich) && rich.length) {
          return rich
            .map((item) => ({
              id: String(item?.id || '').trim(),
              label: String(item?.label || '').trim(),
            }))
            .filter((item) => item.id);
        }
      } catch (_) {}
    }

    const select = getPromptSlotSelect();
    const namesMap = getPromptSlotNamesMap();

    if (!select) {
      const selected =
        String(readLocal(`prompt_selected_slot::${getEffectivePromptProfileId()}`, '1') || '1')
          .trim() || '1';
      return [{ id: selected, label: getPromptSlotDisplayLabel(selected, namesMap) }];
    }

    return Array.from(select.options)
      .map((opt) => String(opt.value || '').trim())
      .filter(Boolean)
      .map((slot) => ({
        id: slot,
        label: getPromptSlotDisplayLabel(slot, namesMap),
      }));
  }

  function getSelectedPromptSlot() {
    const app = getApp();
    if (typeof app.getSelectedPromptSlotRich === 'function') {
      try {
        const slot = String(app.getSelectedPromptSlotRich() || '').trim();
        if (slot) return slot;
      } catch (_) {}
    }

    const select = getPromptSlotSelect();
    if (select && select.value) {
      return String(select.value).trim();
    }
    return (
      String(readLocal(`prompt_selected_slot::${getEffectivePromptProfileId()}`, '1') || '1')
        .trim() || '1'
    );
  }

  function getCurrentPromptSlotTitle() {
    const app = getApp();
    if (typeof app.getCurrentPromptSlotTitleRich === 'function') {
      try {
        const title = String(app.getCurrentPromptSlotTitleRich() || '').trim();
        if (title) return title;
      } catch (_) {}
    }

    const selectedSlot = getSelectedPromptSlot();
    const selected = getMiniPanelPromptOptions().find(
      (item) => String(item.id) === String(selectedSlot)
    );
    if (!selected) return '';

    return String(selected.label || '')
      .replace(/^\s*\d+\s*[\.\-:)]\s*/u, '')
      .trim();
  }

  function selectPromptSlot(slot) {
    const next = String(slot || '').trim();
    if (!next) return false;

    const select = getPromptSlotSelect();
    const allowed = new Set(getMiniPanelPromptOptions().map((item) => String(item.id)));

    if (!allowed.has(next)) {
      return false;
    }

    if (select) {
      if (select.value !== next) {
        select.value = next;
      }

      try {
        select.dispatchEvent(new Event('change', { bubbles: true }));
      } catch (_) {}

      try {
        window.dispatchEvent(
          new CustomEvent('prompt-slot-selection-changed', {
            detail: {
              profileId: getEffectivePromptProfileId(),
              slot: next,
            },
          })
        );
      } catch (_) {}

      emitAppStateChanged('prompt-slot-selected', { slot: next });
      return true;
    }

    try {
      localStorage.setItem(`prompt_selected_slot::${getEffectivePromptProfileId()}`, next);
    } catch (_) {}

    emitAppStateChanged('prompt-slot-selected-fallback', { slot: next });
    return true;
  }

  function resolveTranscribeModulePath(provider) {
    return resolveTranscribeModulePathFromRegistry(provider, {
      sonioxSpeakerLabels: getSelectedSonioxSpeakerLabels(),
    });
  }

  function resolveNoteModulePath(choice) {
    return resolveNoteModulePathFromRegistry(choice || getSelectedEffectiveNoteProvider());
  }

  function resolveNoteInitExportName(choice) {
    return resolveNoteInitExportNameFromRegistry(choice || getSelectedEffectiveNoteProvider());
  }

  async function loadCachedModule(path) {
    const app = getApp();
    if (!app.cachedModules[path]) {
      app.cachedModules[path] = await import(path);
    }
    return app.cachedModules[path];
  }

  function replaceButtonWithClone(id, beforeReplace) {
    const btn = document.getElementById(id);
    if (!btn || !btn.parentNode) return null;

    const clone = btn.cloneNode(true);
    if (typeof beforeReplace === 'function') beforeReplace(clone, btn);
    btn.parentNode.replaceChild(clone, btn);
    return clone;
  }

  const RECORDING_UI_ABORT_KEYS = [
    '__recordingUIAbort_openai',
    '__recordingUIAbort_voxtral',
    // The merged Soniox module (js/soniox.js) handles all three modes
    // (async-plain, async-diarized, realtime) and registers a single
    // window-level UI abort controller.
    '__sonioxUIAbort',
  ];

  const RECORDING_VAD_TEARDOWN_KEYS = [
    // Single teardown hook for all Soniox modes — closes the WebSocket,
    // releases the mic, and tears down the Silero VAD if any of those
    // are live, regardless of which Soniox mode was active.
    '__sonioxTeardown',
  ];

  async function teardownRecordingProviderRuntime(reason = 'provider-switch') {
    const disposalTasks = [];
    const disposableModules = Object.values(getApp().cachedModules || {})
      .filter((mod) => typeof mod?.disposeRecording === 'function');
    RECORDING_UI_ABORT_KEYS.forEach((key) => {
      try {
        window[key]?.abort?.(reason);
      } catch (_) {}
    });

    if (!disposableModules.length) {
      RECORDING_VAD_TEARDOWN_KEYS.forEach((key) => {
        try {
          disposalTasks.push(Promise.resolve(window[key]?.(reason)));
        } catch (_) {}
      });
    }

    disposableModules.forEach((mod) => {
      try {
        disposalTasks.push(Promise.resolve(mod.disposeRecording({ reason })));
      } catch (_) {}
    });

    if (disposalTasks.length) await Promise.allSettled(disposalTasks);
  }

  async function initRecordingProvider(provider) {
    const normalized = normalizeTranscribeProvider(provider || getSelectedTranscribeProvider());
    const path = resolveTranscribeModulePath(normalized);
    const initSequence = ++recordingProviderInitSequence;

    console.info('[recording:init] provider:', normalized, 'module:', path);

    try {
      await teardownRecordingProviderRuntime(`switch-to:${normalized}`);
      if (initSequence !== recordingProviderInitSequence || isWorkspaceFinalized()) return;
      const mod = await loadCachedModule(path);
      if (initSequence !== recordingProviderInitSequence || isWorkspaceFinalized()) return;
      if (mod && typeof mod.initRecording === 'function') {
        mod.initRecording();
        emitAppStateChanged('recording-provider-initialized', { provider: normalized });
      } else {
        console.error('Selected recording module lacks initRecording()');
      }
    } catch (e) {
      console.error('Failed to load recording module for provider:', normalized, e);
    }
  }

  async function initNoteProvider(choice) {
    const initSequence = ++noteProviderInitSequence;
    const effectiveChoice = choice || getSelectedEffectiveNoteProvider();
    const path = resolveNoteModulePath(effectiveChoice);
    const initExportName = resolveNoteInitExportName(effectiveChoice);

    const fallbackProvider = DEFAULTS.openaiEffectiveProvider;
    const fallbackPath = resolveNoteModulePath(fallbackProvider);
    const fallbackInitExportName = resolveNoteInitExportName(fallbackProvider);

    // Prefer the registry-specified named export. Fall back to the
    // legacy 'initNoteGeneration' export for modules that don't declare
    // initExportName (Mistral, AWS Bedrock).
    const callInit = (mod, name) => {
      if (initSequence !== noteProviderInitSequence || isWorkspaceFinalized()) return true;
      if (mod && typeof mod[name] === 'function') {
        mod[name]();
        return true;
      }
      if (mod && typeof mod.initNoteGeneration === 'function') {
        mod.initNoteGeneration();
        return true;
      }
      return false;
    };

    try {
      const mod = await loadCachedModule(path);
      if (callInit(mod, initExportName)) {
        emitAppStateChanged('note-provider-initialized', {
          provider: effectiveChoice,
        });
      } else {
        console.warn(`Module ${path} missing ${initExportName}() / initNoteGeneration(); falling back to GPT-5.6 Sol`);
        const fallback = await loadCachedModule(fallbackPath);
        callInit(fallback, fallbackInitExportName);
        emitAppStateChanged('note-provider-fallback-initialized', {
          provider: fallbackProvider,
        });
      }
    } catch (e) {
      console.warn(`Failed to load ${path}; falling back to GPT-5.6 Sol`, e);
      const fallback = await loadCachedModule(fallbackPath);
      callInit(fallback, fallbackInitExportName);
      emitAppStateChanged('note-provider-fallback-initialized', {
        provider: fallbackProvider,
      });
    }
  }

  async function initMiniControllerFeature() {
    try {
      const mod = await import('./features/mini-controller.js');
      if (mod && typeof mod.init === 'function') {
        mod.init(getApp());
      }
    } catch (err) {
      console.warn('[mini-panel] Failed to initialize mini controller feature', err);
    }
  }

  function isTranscribeBusy() {
    if (['starting', 'resuming', 'pausing', 'aborting'].includes(getRecordingLifecycle().phase)) return true;
    const stopBtn = document.getElementById('stopButton');
    if (stopBtn && stopBtn.disabled === false) return true;

    const status = (document.getElementById('statusMessage')?.innerText || '').trim();
    if (!status) return false;
    if (/finishing transcription/i.test(status)) return true;
    if (
      /(transcribing|processing|uploading)/i.test(status) &&
      !/transcription finished/i.test(status)
    ) {
      return true;
    }

    return false;
  }

  function getAutoGenerateEnabled() {
    return readSession(AUTO_GENERATE_KEY, '') === '1';
  }

  function getAutoCopyModeLinkedToAutoGenerate(enabled) {
    return enabled ? 'note' : 'transcript';
  }

  function setAutoGenerateEnabled(enabled, options = {}) {
    const nextEnabled = !!enabled;
    const source =
      String(options?.source || 'auto-generate-toggle').trim() || 'auto-generate-toggle';

    writeSession(AUTO_GENERATE_KEY, nextEnabled ? '1' : '0');
    const el = document.getElementById('autoGenerateToggle');
    if (el && el.type === 'checkbox') el.checked = nextEnabled;

    const linkedAutoCopyMode = getAutoCopyModeLinkedToAutoGenerate(nextEnabled);
    const appliedAutoCopyMode = setAutoCopyMode(linkedAutoCopyMode);

    emitAppStateChanged(source, {
      enabled: nextEnabled,
      linkedAutoCopyMode,
      appliedAutoCopyMode,
    });

    if (nextEnabled && appliedAutoCopyMode === 'note') {
      Promise.resolve(requestNotificationPermissionIfNeeded()).catch(() => {});
    }
  }

  function initAutoGenerateToggle() {
    const el = document.getElementById('autoGenerateToggle');
    if (!el || el.type !== 'checkbox') return;

    if (el.dataset.bound === '1') return;
    el.dataset.bound = '1';

    if (readSession(AUTO_GENERATE_KEY, null) == null) {
      writeSession(AUTO_GENERATE_KEY, '0');
    }

    el.checked = getAutoGenerateEnabled();
    el.addEventListener('change', () => {
      setAutoGenerateEnabled(el.checked, {
        source: 'auto-generate-toggle-change',
      });
    });
  }

  function initAutoCopyModeSelect() {
    const el = document.getElementById('autoCopyModeSelect');
    if (!el || el.dataset.bound === '1') return;
    el.dataset.bound = '1';
    el.value = getAutoCopyMode();
    el.addEventListener('change', () => {
      const applied = setAutoCopyMode(el.value);
      el.value = applied;
    });
  }

  function initNotificationPermissionHooks() {}

  function emitTranscriptionFinished(opts) {
    const detail = {
      ...buildFinishedTranscriptDetail(opts || {}),
      ...(opts || {}),
    };

    try {
      window.dispatchEvent(new CustomEvent('transcription:finished', { detail }));
    } catch (err) {
      try {
        const ev = document.createEvent('CustomEvent');
        ev.initCustomEvent('transcription:finished', false, false, detail);
        window.dispatchEvent(ev);
      } catch {}
    }
    emitAppStateChanged('transcription-finished', { detail });
  }

  function tryAutoGenerateNote(eventDetail) {
    if (!getAutoGenerateEnabled()) return;

    const genBtn = document.getElementById('generateNoteButton');
    if (!genBtn || genBtn.disabled) return;

    const transcript = (document.getElementById('transcription')?.value || '').trim();
    if (!transcript) return;

    if (typeof getApp().isTranscribeBusy === 'function' && getApp().isTranscribeBusy()) {
      return;
    }

    const now = Date.now();
    const fp = `${eventDetail?.provider || 'unknown'}:${eventDetail?.transcriptLength || transcript.length}`;
    const last = getApp().__lastAutoGenerate || null;
    if (last && last.fp === fp && now - last.at < 2000) return;
    getApp().__lastAutoGenerate = { fp, at: now };

    if (getApp().isNoteGenerationBusy?.()) return;
    genBtn.click();
    emitAppStateChanged('auto-generate-clicked');
  }

  function initAutoGenerateOnFinishListener() {
    const app = getApp();
    if (app.__autoGenerateListenerBound) return;
    app.__autoGenerateListenerBound = true;

    window.addEventListener('transcription:finished', (e) => {
      try {
        tryAutoGenerateNote(e && e.detail ? e.detail : null);
      } catch (err) {
        console.warn('Auto-generate failed', err);
      }
    });
  }

  function setSharedStatusMessage(message, color = '') {
    const text = String(message || '').trim();
    if (!text) return;
    const captureState = getRecordingLifecycle();
    if (captureState.pending || captureState.phase === 'recording' || captureState.phase === 'error') return;

    try {
      if (typeof window.updateStatusMessage === 'function') {
        window.updateStatusMessage(text, color || undefined);
      } else {
        const statusEl = document.getElementById('statusMessage');
        if (statusEl) {
          statusEl.innerText = text;
          if (color) statusEl.style.color = color;
        }
      }
    } catch (_) {
      const statusEl = document.getElementById('statusMessage');
      if (statusEl) {
        statusEl.innerText = text;
        if (color) statusEl.style.color = color;
      }
    }
  }

  function initStatusFlowListeners() {
    const app = getApp();
    if (app.__statusFlowListenersBound) return;
    app.__statusFlowListenersBound = true;

    window.addEventListener('app:state-changed', (event) => {
      const reason = String(event?.detail?.reason || '').trim();

      if (reason === 'note-generation-begin') {
        setSharedStatusMessage('Generating note...', 'blue');
      }
    });

    window.addEventListener('transcription:finished', (event) => {
      const detail = event?.detail || {};
      if (detail?.status === 'aborted') {
        setSharedStatusMessage('Recording aborted.', 'red');
        return;
      }

      if (getAutoGenerateEnabled()) {
        setSharedStatusMessage('Generating note...', 'blue');
      } else {
        setSharedStatusMessage('Transcript finished.', 'green');
      }
    });

    const handleNoteFinished = (event) => {
      const detail = event?.detail || {};
      if (detail?.status === 'aborted') return;
      setSharedStatusMessage('Note finished.', 'green');
    };

    window.addEventListener('note-generation-finished', handleNoteFinished);
    window.addEventListener('note:finished', handleNoteFinished);
  }

  function copyGeneratedNoteToClipboard() {
    const noteEl = document.getElementById('generatedNote');
    const text = String(noteEl?.value || '').trim();
    if (!text) return false;

    const emitCopied = () => {
      emitCopiedEvent(text, 'manual-copy');
    };

    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          emitCopied();
        })
        .catch((error) => {
          try {
            noteEl?.focus();
            noteEl?.select();
            const ok = document.execCommand('copy');
            if (ok) {
              emitCopied();
            } else {
              emitCopyFailedEvent(text, 'manual-copy', 'execCommand-returned-false');
            }
          } catch (_) {
            emitCopyFailedEvent(text, 'manual-copy', error?.name || 'clipboard-write-failed');
          } finally {
            try {
              window.getSelection()?.removeAllRanges?.();
            } catch (_) {}
          }
        });
      return true;
    }

    try {
      noteEl?.focus();
      noteEl?.select();
      const ok = document.execCommand('copy');
      if (ok) {
        emitCopied();
        return true;
      }
      emitCopyFailedEvent(text, 'manual-copy', 'execCommand-returned-false');
      return false;
    } catch (_) {
      emitCopyFailedEvent(text, 'manual-copy', 'execCommand-threw');
      return false;
    } finally {
      try {
        window.getSelection()?.removeAllRanges?.();
      } catch (_) {}
    }
  }

  function copyTranscriptionToClipboard() {
    const trEl = document.getElementById('transcription');
    const text = String(trEl?.value || '').trim();
    if (!text) return false;

    const emitCopied = () => {
      emitTranscriptCopiedEvent(text, 'manual-copy-transcript');
    };

    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          emitCopied();
        })
        .catch((error) => {
          try {
            trEl?.focus();
            trEl?.select();
            const ok = document.execCommand('copy');
            if (ok) {
              emitCopied();
            } else {
              emitTranscriptCopyFailedEvent(
                text,
                'manual-copy-transcript',
                'execCommand-returned-false'
              );
            }
          } catch (_) {
            emitTranscriptCopyFailedEvent(
              text,
              'manual-copy-transcript',
              error?.name || 'clipboard-write-failed'
            );
          } finally {
            try {
              window.getSelection()?.removeAllRanges?.();
            } catch (_) {}
          }
        });
      return true;
    }

    try {
      trEl?.focus();
      trEl?.select();
      const ok = document.execCommand('copy');
      if (ok) {
        emitCopied();
        return true;
      }
      emitTranscriptCopyFailedEvent(
        text,
        'manual-copy-transcript',
        'execCommand-returned-false'
      );
      return false;
    } catch (_) {
      emitTranscriptCopyFailedEvent(text, 'manual-copy-transcript', 'execCommand-threw');
      return false;
    } finally {
      try {
        window.getSelection()?.removeAllRanges?.();
      } catch (_) {}
    }
  }

  // Keep Mini Panel transcript copy on the exact same path as the main-page button.
  getApp().copyTranscriptionToClipboard = copyTranscriptionToClipboard;
  getApp().copyTranscription = copyTranscriptionToClipboard;

  function getUsePromptToggleElement() {
    return (
      document.getElementById('includePromptToggle') ||
      document.getElementById('usePromptCheckbox') ||
      null
    );
  }

  function getUsePromptEnabled() {
    return !!getUsePromptToggleElement()?.checked;
  }

  function setUsePromptEnabled(enabled) {
    const el = getUsePromptToggleElement();
    if (!el || el.type !== 'checkbox') return false;

    const next = !!enabled;
    if (el.checked === next) return true;

    el.checked = next;
    try {
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } catch (_) {
      try {
        const ev = document.createEvent('Event');
        ev.initEvent('change', true, true);
        el.dispatchEvent(ev);
      } catch {}
    }

    emitAppStateChanged('use-prompt-toggle-change', { enabled: next });
    return true;
  }

  function getMiniPanelState() {
    const app = getApp();
    const startBtn = document.getElementById('startButton');
    const stopBtn = document.getElementById('stopButton');
    const pauseBtn = document.getElementById('pauseResumeButton');
    const abortBtn = document.getElementById('abortButton');
    const transcriptEl = document.getElementById('transcription');
    const noteEl = document.getElementById('generatedNote');
    const statusEl = document.getElementById('statusMessage');
    const statusText = String(statusEl?.innerText || '').trim();
    const pauseResumeLabel = String(pauseBtn?.textContent || '').trim();
    const lifecycle = getRecordingLifecycle();
    const canStart = !(startBtn?.disabled ?? true) && !lifecycle.pending;
    const canStop = !(stopBtn?.disabled ?? true) && !lifecycle.pending;
    const canPauseResume = !(pauseBtn?.disabled ?? true) && !lifecycle.pending;
    const canAbort = !(abortBtn?.disabled ?? true);
    const transcribeBusy = !!app.isTranscribeBusy?.();
    const noteBusy = !!app.isNoteGenerationBusy?.();
    const recordingStartedAt = Number(app.miniPanelRecordingStartedAt || 0);
    const recordingPausedAt = Number(app.miniPanelRecordingPausedAt || 0);
    const recordingAccumulatedMs = Number(app.miniPanelRecordingAccumulatedMs || 0);

    let effectiveMiniPanelStatusPhase = String(app.miniPanelStatusPhase || 'idle');
    const statusLower = statusText.toLowerCase();
    const pauseLabelLower = pauseResumeLabel.toLowerCase();

    const looksPausedByUi =
      /recording paused|paused/.test(statusLower) ||
      (canPauseResume && /resume/.test(pauseLabelLower));
    const looksRecordingByUi =
      /listening for speech|resuming recording/.test(statusLower) ||
      /^recording(?:\s*\.\.\.)?$/.test(statusLower) ||
      (canPauseResume && /pause/.test(pauseLabelLower));
    const looksIdleByUi =
      canStart &&
      !canStop &&
      !canPauseResume &&
      !canAbort &&
      !transcribeBusy &&
      !noteBusy &&
      recordingStartedAt <= 0 &&
      recordingPausedAt <= 0;
    const staleActivePhase =
      /^(recording|paused|transcribing|generating-transcript|note-generating)$/
        .test(effectiveMiniPanelStatusPhase);

    if (lifecycle.pending || lifecycle.phase === 'error') {
      effectiveMiniPanelStatusPhase = lifecycle.phase;
    } else if (lifecycle.phase === 'paused') {
      effectiveMiniPanelStatusPhase = 'paused';
    } else if (lifecycle.phase === 'recording') {
      effectiveMiniPanelStatusPhase = 'recording';
    } else if (looksIdleByUi && staleActivePhase) {
      effectiveMiniPanelStatusPhase = 'idle';
    }

    return {
      transcribeBusy,
      noteBusy,
      canStart,
      canStop,
      canPauseResume,
      canAbort,
      hasTranscript: hasNonEmptyText(transcriptEl?.value),
      hasNote: hasNonEmptyText(noteEl?.value),
      statusText,
      pauseResumeLabel,
      autoGenerateEnabled: !!getAutoGenerateEnabled(),
      autoCopyMode: getAutoCopyMode(),
      autoCopyExtensionAvailable: isAutoCopyExtensionAvailable(),
      autoCopyExtensionFocusTabSupported: isAutoCopyExtensionFocusTabSupported(),
      miniPanelStatusPhase: effectiveMiniPanelStatusPhase,
      recordingPending: lifecycle.pending,
      recordingError: lifecycle.error,
      recordingSequence: lifecycle.sequence,
      miniPanelCopiedState: String(app.miniPanelCopiedState || ''),
      miniPanelCopiedAt: Number(app.miniPanelCopiedAt || 0),
      recordingStartedAt,
      recordingPausedAt,
      recordingAccumulatedMs,
      transcriptStartedAt: Number(app.miniPanelTranscriptStartedAt || 0),
      transcriptElapsedMs: Number(app.miniPanelTranscriptElapsedMs || 0),
      noteGenerationStartedAt: Number(app.miniPanelNoteGenerationStartedAt || 0),
      noteGenerationElapsedMs: Number(app.miniPanelNoteGenerationElapsedMs || 0),
      usePromptEnabled: getUsePromptEnabled(),
      transcribeProvider: getSelectedTranscribeProvider(),
      sonioxRegion: getSelectedSonioxRegion(),
      sonioxSpeakerLabels: getSelectedSonioxSpeakerLabels(),
      noteProviderUi: getSelectedNoteProviderUi(),
      noteProviderEffective: getSelectedEffectiveNoteProvider(),
      noteProviderMode: getSelectedNoteProviderMode(),
      openaiModel: getSelectedOpenAiModel(),
      bedrockModel: getSelectedBedrockModel(),
      requestyModel: getSelectedRequestyModel(),
    };
  }

  function buildMiniHubSnapshot() {
    let promptOptions = getMiniPanelPromptOptions();
    const selectedPromptSlot = getSelectedPromptSlot();

    if (!Array.isArray(promptOptions) || !promptOptions.length) {
      promptOptions = [{ id: selectedPromptSlot, label: `${selectedPromptSlot}. Untitled` }];
    }

    // Outbound snapshot intentionally omits accentKey/accentColor.
    // The hub (mini-controller.js) owns color assignment and will
    // broadcast 'mini-hub-accent-assigned' separately. Including
    // accent data here would re-introduce the echo-chain bug where
    // multiple tabs overwrote each other's color state.
    const snapshot = {
      tabId: getOrCreateMiniHubTabId(),
      pageSessionId: getOrCreateMiniHubPageSessionId(),
      promptLabel: getCurrentPromptSlotTitle() || 'Untitled',
      selectedPromptSlot,
      promptOptions,
      state: getMiniPanelStateSnapshot(),
      updatedAt: Date.now(),
    };

    return window.__workspacePresets?.decorateHubSnapshot?.(snapshot) || snapshot;
  }

  function initMiniPanelStatusPhaseFlow() {
    const app = getApp();
    if (app.__miniPanelStatusPhaseBound) return;
    app.__miniPanelStatusPhaseBound = true;

    function beginMiniPanelRecordingTimer() {
      const app = getApp();
      const now = Date.now();

      if (!Number.isFinite(app.miniPanelRecordingAccumulatedMs)) {
        app.miniPanelRecordingAccumulatedMs = 0;
      }

      app.miniPanelRecordingStartedAt = now;
      app.miniPanelRecordingPausedAt = 0;
    }

    function pauseMiniPanelRecordingTimer() {
      const app = getApp();
      const now = Date.now();
      const startedAt = Number(app.miniPanelRecordingStartedAt || 0);
      const pausedAt = Number(app.miniPanelRecordingPausedAt || 0);

      if (startedAt > 0 && pausedAt === 0) {
        app.miniPanelRecordingAccumulatedMs =
          Number(app.miniPanelRecordingAccumulatedMs || 0) + Math.max(0, now - startedAt);
        app.miniPanelRecordingPausedAt = now;
        app.miniPanelRecordingStartedAt = 0;
      }
    }

    function resumeMiniPanelRecordingTimer() {
      const app = getApp();
      app.miniPanelRecordingPausedAt = 0;
      app.miniPanelRecordingStartedAt = Date.now();
    }

    function finishMiniPanelRecordingTimer() {
      const app = getApp();
      pauseMiniPanelRecordingTimer();
      app.miniPanelRecordingStartedAt = 0;
      app.miniPanelRecordingPausedAt = 0;
    }

    function resetMiniPanelRecordingTimer() {
      const app = getApp();
      app.miniPanelRecordingStartedAt = 0;
      app.miniPanelRecordingPausedAt = 0;
      app.miniPanelRecordingAccumulatedMs = 0;
    }

    // ── Transcript completion timer ──
    function beginMiniPanelTranscriptTimer() {
      const app = getApp();
      app.miniPanelTranscriptStartedAt = Date.now();
      app.miniPanelTranscriptElapsedMs = 0;
    }

    function finishMiniPanelTranscriptTimer() {
      const app = getApp();
      const startedAt = Number(app.miniPanelTranscriptStartedAt || 0);
      if (startedAt > 0) {
        app.miniPanelTranscriptElapsedMs = Math.max(0, Date.now() - startedAt);
      }
      app.miniPanelTranscriptStartedAt = 0;
    }

    function resetMiniPanelTranscriptTimer() {
      const app = getApp();
      app.miniPanelTranscriptStartedAt = 0;
      app.miniPanelTranscriptElapsedMs = 0;
    }

    // ── Note generation timer ──
    function beginMiniPanelNoteGenerationTimer() {
      const app = getApp();
      app.miniPanelNoteGenerationStartedAt = Date.now();
      app.miniPanelNoteGenerationElapsedMs = 0;
    }

    function finishMiniPanelNoteGenerationTimer() {
      const app = getApp();
      const startedAt = Number(app.miniPanelNoteGenerationStartedAt || 0);
      if (startedAt > 0) {
        app.miniPanelNoteGenerationElapsedMs = Math.max(0, Date.now() - startedAt);
      }
      app.miniPanelNoteGenerationStartedAt = 0;
    }

    function resetMiniPanelNoteGenerationTimer() {
      const app = getApp();
      app.miniPanelNoteGenerationStartedAt = 0;
      app.miniPanelNoteGenerationElapsedMs = 0;
    }

    // ── Reset all three timers at once (called on Start) ──
    function resetAllMiniPanelTimers() {
      resetMiniPanelRecordingTimer();
      resetMiniPanelTranscriptTimer();
      resetMiniPanelNoteGenerationTimer();
    }

    window.addEventListener('recording:lifecycle', (event) => {
      const lifecycle = event.detail;
      const phase = lifecycle.phase;
      if (phase === 'starting') {
        clearMiniPanelCopyState('recording-start-requested');
        resetAllMiniPanelTimers();
        setMiniPanelStatusPhase('starting');
      } else if (phase === 'recording') {
        if (lifecycle.action === 'start') beginMiniPanelRecordingTimer();
        else resumeMiniPanelRecordingTimer();
        setMiniPanelStatusPhase('recording');
      } else if (phase === 'paused') {
        pauseMiniPanelRecordingTimer();
        setMiniPanelStatusPhase('paused');
      } else if (phase === 'stopping') {
        finishMiniPanelRecordingTimer();
        beginMiniPanelTranscriptTimer();
        setMiniPanelStatusPhase('stopping');
      } else if (phase === 'stopped') {
        // Completion may already have arrived while Stop was draining audio.
        if (app.miniPanelStatusPhase === 'stopping') setMiniPanelStatusPhase('transcribing');
      } else if (phase === 'aborted') {
        resetAllMiniPanelTimers();
        setMiniPanelStatusPhase('aborted');
      } else if (phase === 'error') {
        pauseMiniPanelRecordingTimer();
        setMiniPanelStatusPhase('error');
      } else {
        setMiniPanelStatusPhase(phase);
      }
      emitAppStateChanged('recording-lifecycle-confirmed');
    });

    window.addEventListener('transcription:finished', (event) => {
      const detail = event?.detail || {};
      if (detail?.status === 'aborted') {
        resetAllMiniPanelTimers();
        setMiniPanelStatusPhase('aborted');
        return;
      }

      finishMiniPanelTranscriptTimer();

      if (getAutoGenerateEnabled()) {
        beginMiniPanelNoteGenerationTimer();
        setMiniPanelStatusPhase('note-generating');
      } else {
        setMiniPanelStatusPhase('transcript-completed');
      }
    });

    window.addEventListener('note-generation-finished', (event) => {
      const detail = event?.detail || {};
      if (detail?.status === 'aborted') return;
      finishMiniPanelNoteGenerationTimer();
      setMiniPanelStatusPhase('note-completed');
    });

    window.addEventListener('note:finished', (event) => {
      const detail = event?.detail || {};
      if (detail?.status === 'aborted') return;
      finishMiniPanelNoteGenerationTimer();
      setMiniPanelStatusPhase('note-completed');
    });

    window.addEventListener('app:state-changed', (event) => {
      const reason = String(event?.detail?.reason || '').trim();

      if (reason === 'note-generation-begin') {
        beginMiniPanelNoteGenerationTimer();
        setMiniPanelStatusPhase('note-generating');
      }
    });

    resetAllMiniPanelTimers();
    setMiniPanelStatusPhase('idle');
  }

  const app = getApp();

  registerWorkspaceDisposer(async ({ reason, final }) => {
    // Invalidate a provider import that may still be resolving while this
    // Workspace is being removed or repurposed.
    recordingProviderInitSequence += 1;
    noteProviderInitSequence += 1;

    try { app.noteGenerationAbortController?.abort?.(reason); } catch (_) {}
    app.noteGenerationInFlight = false;
    app.noteGenerationAbortController = null;
    app.noteGenerationMeta = null;
    const teardown = teardownRecordingProviderRuntime(reason);
    resetRecordingLifecycle();
    if (!final) {
      syncNoteActionButtons();
      ['miniPanelRecordingStartedAt', 'miniPanelRecordingPausedAt', 'miniPanelRecordingAccumulatedMs',
        'miniPanelTranscriptStartedAt', 'miniPanelTranscriptElapsedMs', 'miniPanelNoteGenerationStartedAt',
        'miniPanelNoteGenerationElapsedMs', 'miniPanelCopiedAt'].forEach((key) => { app[key] = 0; });
      app.miniPanelStatusPhase = 'idle';
      app.miniPanelCopiedState = '';
      ['stopButton', 'pauseResumeButton', 'abortButton'].forEach((id) => {
        const button = document.getElementById(id);
        if (button) button.disabled = true;
      });
      const start = document.getElementById('startButton');
      if (start) start.disabled = false;
      const status = document.getElementById('statusMessage');
      if (status) status.textContent = '';
    }
    await teardown;
  });

  registerWorkspaceDisposer(() => {
    // Notify peer tabs before closing this Workspace's channel. This mirrors
    // the existing unload notification but also covers deterministic disposal.
    closeMiniHubTab();
    miniHubClosed = true;
    try { miniHubChannel?.close?.(); } catch (_) {}
    miniHubChannel = null;

    try { app.__miniPanelButtonStateObserver?.disconnect?.(); } catch (_) {}
    app.__miniPanelButtonStateObserver = null;
  }, { scope: 'window' });

  app.saveState = saveState;
  app.restoreState = restoreState;
  app.reloadWithSavedState = reloadWithSavedState;
  app.emitAppStateChanged = emitAppStateChanged;
  app.noteGenerationInFlight = false;
  app.noteGenerationAbortController = null;
  app.noteGenerationMeta = null;
  app.syncNoteActionButtons = syncNoteActionButtons;
  // Shared supplementary date handling (used by e.g. the secondary note
  // generator's auto-transfer so the app-managed date header is preserved
  // with the exact same logic as the rest of the app).
  app.normalizeSupplementaryDateLine = normalizeSupplementaryDateLine;
  app.getSupplementaryDateEnabled = getSupplementaryDateEnabled;
  app.beginNoteGeneration = beginNoteGeneration;
  app.finishNoteGeneration = finishNoteGeneration;
  app.abortNoteGeneration = abortNoteGeneration;
  app.emitNoteFinished = emitNoteFinished;
  app.resetNoteGenerationState = resetNoteGenerationState;
  app.disposeWorkspaceResources = (options = {}) =>
    disposeRegisteredWorkspaceResources(options);
  app.isNoteGenerationBusy = () => !!getApp().noteGenerationInFlight;
  app.triggerGenerateNote = function triggerGenerateNote() {
    const btn = document.getElementById('generateNoteButton');
    if (btn && !btn.disabled) btn.click();
  };
  app.isTranscribeBusy = isTranscribeBusy;
  app.getAutoGenerateEnabled = getAutoGenerateEnabled;
  app.setAutoGenerateEnabled = setAutoGenerateEnabled;
  app.getAutoCopyMode = getAutoCopyMode;
  app.setAutoCopyMode = setAutoCopyMode;
  app.isAutoCopyExtensionAvailable = () => isAutoCopyExtensionAvailable();
  app.pingAutoCopyExtension = () => pingAutoCopyExtension();
  app.getUsePromptEnabled = getUsePromptEnabled;
  app.setUsePromptEnabled = setUsePromptEnabled;
  app.initAutoGenerateToggle = initAutoGenerateToggle;
  app.initAutoCopyModeSelect = initAutoCopyModeSelect;
  app.emitTranscriptionFinished = emitTranscriptionFinished;
  app.tryAutoGenerateNote = tryAutoGenerateNote;
  app.initAutoGenerateOnFinishListener = initAutoGenerateOnFinishListener;
  app.getSelectedTranscribeProvider = getSelectedTranscribeProvider;
  app.getSelectedSonioxRegion = getSelectedSonioxRegion;
  app.getSelectedSonioxSpeakerLabels = getSelectedSonioxSpeakerLabels;
  app.getSelectedEffectiveNoteProvider = getSelectedEffectiveNoteProvider;
  app.getSelectedNoteProviderUi = getSelectedNoteProviderUi;
  app.getSelectedOpenAiModel = getSelectedOpenAiModel;
  app.getSelectedBedrockModel = getSelectedBedrockModel;
  app.getSelectedNoteProviderMode = getSelectedNoteProviderMode;
  app.getTranscribeProviderSnapshot = getTranscribeProviderSnapshot;
  app.getNoteProviderSnapshot = getNoteProviderSnapshot;
  app.getMiniPanelPromptOptions = getMiniPanelPromptOptions;
  app.getSelectedPromptSlot = getSelectedPromptSlot;
  app.getCurrentPromptSlotTitle = getCurrentPromptSlotTitle;
  app.selectPromptSlot = selectPromptSlot;
  app.resolveTranscribeModulePath = resolveTranscribeModulePath;
  app.resolveNoteModulePath = resolveNoteModulePath;
  app.requestNotificationPermissionIfNeeded = requestNotificationPermissionIfNeeded;
  app.showCopiedSystemNotification = showCopiedSystemNotification;
  app.isMiniPanelOpen = isMiniPanelOpen;
  app.providerRegistry = {
    defaults: DEFAULTS,
    deriveNoteUiStateFromEffectiveProvider,
    getNoteUiVisibility,
    getTranscribeProviderLabel,
    getTranscribeProviderShortLabel,
    inferNoteProviderUi,
    listBedrockModelOptions,
    listNoteModeOptions,
    listNoteUiProviderOptions,
    normalizeNoteUiProvider,
    listOpenAiModelOptions,
    listSonioxRegionOptions,
    listSonioxSpeakerLabelOptions,
    listTranscribeProviderOptions,
    normalizeTranscribeProvider,
    resolveTranscribeModulePath,
    resolveNoteModulePath,
  };
  app.loadCachedModule = loadCachedModule;
  app.initRecordingProvider = initRecordingProvider;
  app.initNoteProvider = initNoteProvider;
  app.startRecording = () => requestRecordingAction('start');
  app.stopRecording = () => requestRecordingAction('stop');
  app.togglePauseResume = () => requestRecordingAction('pauseResume');
  app.pauseResumeRecording = () => requestRecordingAction('pauseResume');
  app.abortRecording = () => requestRecordingAction('abort');
  app.copyGeneratedNote = () => copyGeneratedNoteToClipboard();
  app.copyTranscription = () => copyTranscriptionToClipboard();
  app.setMiniPanelCopyFeedback = (kind) => {
    const nextKind = String(kind || '').trim();
    if (!nextKind) {
      clearMiniPanelCopyState('mini-panel-feedback-cleared');
      return true;
    }

    setMiniPanelCopyState(nextKind, Date.now());
    emitAppStateChanged('mini-panel-copy-feedback', { kind: nextKind });
    return true;
  };
  app.setSelectedPromptSlot = (slot) => selectPromptSlot(slot);
  app.getMiniPanelState = () => getMiniPanelState();
  app.openMiniPanel = () => {
    // Prefer calling the controller directly if mini-controller.js
    // has booted and exposed its opener. This keeps the user-gesture
    // activation chain intact, which is required for window.open and
    // documentPictureInPicture.requestWindow to succeed.
    if (typeof window.__openMiniPanel === 'function') {
      try {
        window.__openMiniPanel();
        return;
      } catch (err) {
        console.warn('[mini-panel] app.openMiniPanel direct call failed', err);
      }
    }
    // Fallback: dispatch the event in case the controller booted late
    // and registered its listener after this call site was wired up.
    try {
      window.dispatchEvent(
        new CustomEvent('mini-panel:open-requested', {
          detail: { requestedAt: Date.now() },
        })
      );
    } catch (_) {}
  };

  pingAutoCopyExtension().catch(() => {
    setAutoCopyExtensionAvailable(false);
  });

  window.addEventListener('focus', () => {
    pingAutoCopyExtension().catch(() => {});
  });

  app.switchNoteProvider = async function switchNoteProvider(next) {
    const normalizedNext = String(next || '').trim().toLowerCase();
    if (!normalizedNext) return false;

    // Callers may pass either a UI provider ('openai', 'mistral',
    // 'aws-bedrock', ...) or an EFFECTIVE provider ('openai-gpt56-sol',
    // 'requesty-claude', ...). A raw UI value like 'openai' must stay
    // 'openai' here; if we
    // feed it through inferNoteProviderUi() it gets treated like an
    // unknown effective provider and can fall back to the default UI.
    const normalizedUiProvider = normalizeNoteUiProvider(normalizedNext);
    const isUiProvider = normalizedNext === normalizedUiProvider;
    const uiValue = isUiProvider
      ? normalizedNext
      : inferNoteProviderUi(normalizedNext);

    const noteProviderSelect = document.getElementById('noteProvider');
    if (noteProviderSelect && noteProviderSelect.value !== uiValue) {
      noteProviderSelect.value = uiValue;
      noteProviderSelect.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }

    const effectiveProvider = isUiProvider
      ? resolveEffectiveNoteProvider({
          provider: normalizedNext,
          openaiModel: document.getElementById('openaiModel')?.value || DEFAULTS.openaiModel,
          noteMode: document.getElementById('noteProviderMode')?.value || DEFAULTS.noteMode,
          requestyModel: document.getElementById('requestyModel')?.value || DEFAULTS.requestyModel,
        })
      : normalizedNext;

    // Select was already on the right UI value (or there's no select).
    // Write the EFFECTIVE provider to sessionStorage and init the
    // correct module. provider-persistence.js uses this same
    // effective-value convention for the stored key.
    writeSession('note_provider', effectiveProvider);
    await initNoteProvider(effectiveProvider);
    emitAppStateChanged('note-provider-switched-programmatically', {
      provider: effectiveProvider,
    });
    return true;
  };

  app.switchTranscribeProvider = async function switchTranscribeProvider(next) {
    const normalizedNext = normalizeTranscribeProvider(next);
    const transcribeProviderSelect = document.getElementById('transcribeProvider');
    if (transcribeProviderSelect && transcribeProviderSelect.value !== normalizedNext) {
      transcribeProviderSelect.value = normalizedNext;
      transcribeProviderSelect.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }

    writeSession('transcribe_provider', normalizedNext);
    await initRecordingProvider(normalizedNext);
    emitAppStateChanged('transcribe-provider-switched-programmatically', {
      provider: normalizedNext,
    });
    return true;
  };

  // Programmatic setter for the Soniox speaker-labels dropdown. Used by
  // the Mini panel mirror so that the change runs through the exact same
  // code path as a manual click on the main page: dispatch a 'change'
  // event on the underlying <select>, which the provider-persistence
  // bridge already handles (writes session storage and calls
  // switchTranscribeProvider('soniox') to apply the change live).
  //
  // Returns false if the change is suppressed because transcription is
  // currently busy — same rule as on the main page (the select gets
  // disabled by initProviderLockWhileRecording while recording).
  app.setSonioxSpeakerLabels = function setSonioxSpeakerLabels(next) {
    const normalizedNext = String(next || '').trim().toLowerCase() === 'on' ? 'on' : 'off';

    if (typeof app.isTranscribeBusy === 'function' && app.isTranscribeBusy()) {
      console.warn('[mini-panel] setSonioxSpeakerLabels ignored while transcription is busy.');
      return false;
    }

    const el = document.getElementById('sonioxSpeakerLabels');
    if (el && el.value !== normalizedNext) {
      el.value = normalizedNext;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }

    // Already at target value — no work to do, but persist defensively.
    writeSession('soniox_speaker_labels', normalizedNext);
    emitAppStateChanged('soniox-speaker-labels-set-programmatically', {
      sonioxSpeakerLabels: normalizedNext,
    });
    return true;
  };

  app.setOpenAiModel = function setOpenAiModel(next) {
    const rawNext = String(next || '').trim().toLowerCase();
    if (!rawNext) return false;
    const normalizedNext = normalizeOpenAiModel(rawNext);

    const el = document.getElementById('openaiModel');
    if (el && el.value !== normalizedNext) {
      el.value = normalizedNext;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }

    writeSession('openai_model', normalizedNext);
    emitAppStateChanged('openai-model-set-programmatically', {
      model: normalizedNext,
    });
    return true;
  };

  app.setBedrockModel = function setBedrockModel(next) {
    const normalizedNext = String(next || '').trim().toLowerCase();
    if (!normalizedNext) return false;

    const el = document.getElementById('bedrockModel');
    if (el && el.value !== normalizedNext) {
      el.value = normalizedNext;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }

    writeSession('bedrock_model', normalizedNext);
    emitAppStateChanged('bedrock-model-set-programmatically', {
      model: normalizedNext,
    });
    return true;
  };

  app.setRequestyModel = function setRequestyModel(next) {
    const normalizedNext = String(next || '').trim().toLowerCase();
    if (!normalizedNext) return false;

    const el = document.getElementById('requestyModel');
    if (el && el.value !== normalizedNext) {
      el.value = normalizedNext;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }

    writeSession('requesty_model', normalizedNext);
    emitAppStateChanged('requesty-model-set-programmatically', {
      model: normalizedNext,
    });
    return true;
  };

  app.setNoteProviderMode = function setNoteProviderMode(next) {
    const normalizedNext = String(next || '').trim().toLowerCase();
    if (!normalizedNext) return false;

    const el = document.getElementById('noteProviderMode');
    if (el && el.value !== normalizedNext) {
      el.value = normalizedNext;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }

    writeSession('note_provider_mode', normalizedNext);
    emitAppStateChanged('note-provider-mode-set-programmatically', {
      mode: normalizedNext,
    });
    return true;
  };

  app.openPromptPanel = function openPromptPanel() {
    const btn =
      document.getElementById('openPromptPanelButton') ||
      document.querySelector('[data-open-prompt-panel]');
    if (btn) {
      btn.click();
      emitAppStateChanged('open-prompt-panel-click');
      return true;
    }

    try {
      window.dispatchEvent(
        new CustomEvent('prompt-panel:open-requested', {
          detail: { requestedAt: Date.now() },
        })
      );
      emitAppStateChanged('open-prompt-panel-dispatched');
      return true;
    } catch (_) {
      return false;
    }
  };

  app.closePromptPanel = function closePromptPanel() {
    const btn =
      document.getElementById('closePromptPanelButton') ||
      document.querySelector('[data-close-prompt-panel]');
    if (btn) {
      btn.click();
      emitAppStateChanged('close-prompt-panel-click');
      return true;
    }

    try {
      window.dispatchEvent(
        new CustomEvent('prompt-panel:close-requested', {
          detail: { requestedAt: Date.now() },
        })
      );
      emitAppStateChanged('close-prompt-panel-dispatched');
      return true;
    } catch (_) {
      return false;
    }
  };

  bindMiniHubBridge();
  bindMiniPanelButtonStateObserver();
  initAutoGenerateOnFinishListener();
  initAutoGenerateToggle();
  initAutoCopyModeSelect();
  initNotificationPermissionHooks();
  initAutoCopyExtensionCopyBridge();
  initMiniPanelStatusPhaseFlow();
  initStatusFlowListeners();
  syncNoteActionButtons();
  restoreState();

  const transcriptionEl = document.getElementById('transcription');
  const generatedNoteEl = document.getElementById('generatedNote');
  const customPromptEl = document.getElementById('customPrompt');

  [transcriptionEl, generatedNoteEl, customPromptEl].forEach((el) => {
    if (!el) return;
    el.addEventListener('input', saveState);
    el.addEventListener('select', saveState);
    el.addEventListener('keyup', saveState);
    el.addEventListener('scroll', saveState);
  });

  const openMiniPanelButton = document.getElementById('openMiniPanelButton');
  if (openMiniPanelButton && openMiniPanelButton.dataset.bound !== '1') {
    openMiniPanelButton.dataset.bound = '1';
    openMiniPanelButton.addEventListener('click', () => {
      // Preferred path: call the controller's opener directly if
      // mini-controller.js has booted. The synchronous call from
      // inside the click handler preserves the user-gesture
      // activation that window.open / documentPictureInPicture
      // require. app.openMiniPanel() itself also prefers this path,
      // but we call __openMiniPanel directly here to keep the
      // activation chain as short as possible.
      if (typeof window.__openMiniPanel === 'function') {
        try {
          window.__openMiniPanel();
        } catch (err) {
          console.warn('[mini-panel] direct open from button failed', err);
        }
      } else {
        // Fallback: dispatch the event. mini-controller.js listens
        // for this and calls openMiniPanel() from the handler, which
        // still runs inside the user activation window.
        try {
          window.dispatchEvent(
            new CustomEvent('mini-panel:open-requested', {
              detail: { at: Date.now() },
            })
          );
        } catch (_) {}
        getApp().openMiniPanel?.();
      }
      emitAppStateChanged('mini-panel-open-button-click');
    });
  }

  const generateNoteButton = document.getElementById('generateNoteButton');
  if (generateNoteButton) {
    generateNoteButton.addEventListener('click', () => {
      emitAppStateChanged('generate-note-click');
    });
  }

  const abortNoteButton = document.getElementById('abortNoteButton');
  if (abortNoteButton) {
    abortNoteButton.addEventListener('click', () => {
      abortNoteGeneration();
    });
  }

  const copyNoteButton = document.getElementById('copyNoteButton');
  if (copyNoteButton) {
    copyNoteButton.addEventListener('click', () => {
      copyGeneratedNoteToClipboard();
    });
  }

  const copyTranscriptButton = document.getElementById('copyTranscriptButton');
  if (copyTranscriptButton) {
    copyTranscriptButton.addEventListener('click', () => {
      copyTranscriptionToClipboard();
    });
  }

  const transcribeProviderSelect = document.getElementById('transcribeProvider');
  if (transcribeProviderSelect) {
    transcribeProviderSelect.addEventListener('change', async () => {
      const provider = getSelectedTranscribeProvider();
      writeSession('transcribe_provider', provider);
      await initRecordingProvider(provider);
      emitAppStateChanged('transcribe-provider-changed', { provider });
    });
  }

  // NOTE: the #noteProvider change handler lives in
  // provider-persistence.js, which is the authoritative owner of
  // note-provider selection and persistence. It already resolves the
  // UI value ('openai') to an effective provider ('openai-gpt56-sol',
  // etc.) via resolveEffectiveNoteProvider and writes the correct
  // value to sessionStorage. main.js used to ALSO bind a listener
  // here that wrote the raw UI value — which overwrote the correct
  // effective value with 'openai', which then failed to resolve at
  // init time and silently fell back to aws-bedrock. Removing it.

  const openaiModelSelect = document.getElementById('openaiModel');
  if (openaiModelSelect) {
    openaiModelSelect.addEventListener('change', () => {
      writeSession('openai_model', openaiModelSelect.value);
      emitAppStateChanged('openai-model-changed', { model: openaiModelSelect.value });
    });
  }

  const bedrockModelSelect = document.getElementById('bedrockModel');
  if (bedrockModelSelect) {
    bedrockModelSelect.addEventListener('change', () => {
      writeSession('bedrock_model', bedrockModelSelect.value);
      emitAppStateChanged('bedrock-model-changed', { model: bedrockModelSelect.value });
    });
  }

  const noteProviderModeSelect = document.getElementById('noteProviderMode');
  if (noteProviderModeSelect) {
    noteProviderModeSelect.addEventListener('change', () => {
      writeSession('note_provider_mode', noteProviderModeSelect.value);
      emitAppStateChanged('note-provider-mode-changed', { mode: noteProviderModeSelect.value });
    });
  }

  const promptSlotSelect = document.getElementById('promptSlot');
  if (promptSlotSelect) {
    promptSlotSelect.addEventListener('change', () => {
      try {
        writeLocal(`prompt_selected_slot::${getEffectivePromptProfileId()}`, promptSlotSelect.value);
      } catch (_) {}
      emitAppStateChanged('prompt-slot-changed', { slot: promptSlotSelect.value });
    });
  }

  const includePromptToggle = getUsePromptToggleElement();
  if (includePromptToggle && includePromptToggle.dataset.bound !== '1') {
    includePromptToggle.dataset.bound = '1';
    includePromptToggle.addEventListener('change', () => {
      emitAppStateChanged('use-prompt-toggle-change', {
        enabled: !!includePromptToggle.checked,
      });
    });
  }

  initSupplementaryDateToggle();

  window.addEventListener('note-copied', (event) => {
    const detail = event?.detail || {};
    if (!shouldShowCopiedSystemNotification(detail)) return;
    showCopiedSystemNotification(detail);
  });

  window.addEventListener('note-generation-finished', (event) => {
    const detail = event?.detail || {};
    tryAutoCopyFinishedNote(detail);
  });

  window.addEventListener('transcription:finished', (event) => {
    const detail = event?.detail || {};
    tryAutoCopyFinishedTranscript(detail);
  });

  void initRecordingProvider(getSelectedTranscribeProvider());
  void initNoteProvider(getSelectedEffectiveNoteProvider());
  void initMiniControllerFeature();
});
