// js/features/secondary-note.js
//
// Optional Secondary Note Generation module displayed beside the Recording
// Transcript. It reuses the application's shared infrastructure:
//
//   - provider registry (option lists, normalizers, UI visibility rules)
//   - note-runner streaming/request helpers
//   - PromptManager (shared saved prompt slots — read-only from here)
//   - note-usage-cost normalization + pricing (via window.__app helpers)
//   - the same sessionStorage credential keys as the primary generator
//
// ...while keeping a completely separate generation session:
//
//   - own provider/model/mode/reasoning selections (own storage keys)
//   - own prompt-slot selection (prompt TEXTS are shared, selection is not)
//   - own AbortController, timer, usage/cost line, status and output field
//
// The module never calls app.beginNoteGeneration / app.emitNoteFinished, so
// primary and secondary requests can run independently without locking or
// overwriting each other's UI.

import {
  buildStandardNotePrompt,
  extractResponsesOutputText,
  formatTime,
  streamChatCompletionsSse,
  streamResponsesSse
} from "../core/note-runner.js";
import {
  DEFAULTS,
  getDefaultOpenAiReasoning,
  getDefaultRequestyReasoning,
  getNoteUiVisibility,
  listBedrockModelOptions,
  listNoteModeOptions,
  listNoteUiProviderOptions,
  listOpenAiModelOptions,
  listOpenAiReasoningOptions,
  listRequestyModelOptions,
  listRequestyNanoReasoningOptions,
  listSharedRequestyReasoningOptions,
  normalizeNoteMode,
  normalizeNoteUiProvider,
  normalizeOpenAiModel,
  normalizeOpenAiReasoning,
  normalizeRequestyModel,
  normalizeRequestyNanoReasoning,
  normalizeSharedRequestyReasoning
} from "../core/provider-registry.js";
import { PromptManager } from "../promptManager.js";
import { registerWorkspaceDisposer } from "../core/workspace-disposal.js";

// -----------------------------------------------------------------------------
// Storage keys (secondary-only — never overlap with the primary generator)
// -----------------------------------------------------------------------------

const STORAGE_KEYS = {
  provider: "secondary_note_provider",
  mode: "secondary_note_provider_mode",
  openaiModel: "secondary_openai_model",
  openaiReasoning: "secondary_openai_reasoning",
  bedrockModel: "secondary_bedrock_model",
  requestyModel: "secondary_requesty_model",
  requestyNanoReasoning: "secondary_requesty_nano_reasoning",
  promptSlot: "secondary_prompt_slot",
  autoTransfer: "secondary_auto_transfer",
  clearOnGenerate: "secondary_clear_on_generate",
  sourceDateEnabled: "secondary_source_date_enabled"
};

// Same allow-list as AWSBedrock.js so stale values never reach the backend.
const ALLOWED_BEDROCK_MODEL_KEYS = new Set([
  "haiku-4-5",
  "sonnet-4",
  "sonnet-4-5",
  "sonnet-4-6",
  "opus-4-5",
  "opus-4-6",
  "opus-4-7"
]);

// Mirrors requesty.js VARIANTS (EU endpoint + EU-region models).
const REQUESTY_EU_CHAT_COMPLETIONS_URL =
  "https://router.eu.requesty.ai/v1/chat/completions";

const REQUESTY_VARIANTS = {
  "claude-opus-5-5": {
    requestyModelId: "bedrock/claude-opus-5-5@eu-north-1",
    pricingModelId: "claude-opus-5-5",
    reasoningSelector: "dedicated"
  },
  "claude-sonnet-5": {
    requestyModelId: "vertex/claude-sonnet-5@eu",
    pricingModelId: "claude-sonnet-5"
  },
  "gpt-6-luna": {
    requestyModelId: "azure/gpt-6-luna@swedencentral",
    pricingModelId: "gpt-6-luna",
    reasoningSelector: "dedicated",
    sendNoneReasoning: true
  },
  "gpt-6-sol": {
    requestyModelId: "azure/gpt-6-sol@swedencentral",
    pricingModelId: "gpt-6-sol",
    reasoningSelector: "dedicated",
    sendNoneReasoning: true
  },
  "gpt-5.5": {
    requestyModelId: "azure/gpt-5.5@swedencentral",
    pricingModelId: "gpt-5.5"
  },
  "gpt-5-nano": {
    requestyModelId: "azure/gpt-5-nano@swedencentral",
    pricingModelId: "gpt-5-nano",
    reasoningSelector: "dedicated"
  },
  "gpt-5.6-luna": {
    requestyModelId: "azure/gpt-5.6-luna@swedencentral",
    pricingModelId: "gpt-5.6-luna",
    reasoningSelector: "dedicated"
  },
  "gpt-5.6-terra": {
    requestyModelId: "azure/gpt-5.6-terra@swedencentral",
    pricingModelId: "gpt-5.6-terra",
    reasoningSelector: "dedicated"
  },
  "gpt-5.6-sol": {
    requestyModelId: "azure/gpt-5.6-sol@swedencentral",
    pricingModelId: "gpt-5.6-sol",
    reasoningSelector: "dedicated"
  },
  "gemini-3.8-flash": {
    requestyModelId: "vertex/gemini-3.8-flash@eu",
    pricingModelId: "gemini-3.8-flash",
    reasoningSelector: "dedicated"
  },
  "deepseek-v4-pro-0813": {
    requestyModelId: "tensorx/deepseek-v4-pro-0813",
    pricingModelId: "deepseek-v4-pro-0813",
    reasoningSelector: "dedicated",
    sendNoneReasoning: true
  },
  "deepseek-v4.1-flash": {
    requestyModelId: "sference/deepseek-v4.1-flash",
    pricingModelId: "deepseek-v4.1-flash",
    reasoningSelector: "dedicated",
    sendNoneReasoning: true
  },
  "kimi-k3": {
    requestyModelId: "nebius/kimi-k3",
    pricingModelId: "kimi-k3",
    reasoningSelector: "dedicated"
  }
};

// -----------------------------------------------------------------------------
// i18n
// -----------------------------------------------------------------------------
//
// languageLoaderUsage.js merges the active language's `secondaryNote` object
// with English fallbacks and publishes it on window.__secondaryNoteI18n,
// dispatching "secondary-note-i18n-changed" whenever the language changes.

const I18N_FALLBACK = {
  showButton: "Show secondary note generator",
  hideButton: "Hide secondary note generator",
  title: "Secondary Note Generator",
  sourceLabel: "Source text",
  sourcePlaceholder: "Paste or type source text here...",
  providerLabel: "Provider:",
  modelLabel: "Model:",
  modeLabel: "Mode:",
  reasoningLabel: "Reasoning effort:",
  thinkingLabel: "Thinking level:",
  promptLabel: "Prompt:",
  generateButton: "Generate Note",
  abortButton: "Abort",
  copyButton: "Copy",
  copiedButton: "Copied",
  pushButton: "Insert",
  clearOnGenerateLabel: "Clear Supplementary Information on Generate",
  autoTransferLabel: "Automatically copy result to Supplementary Information",
  sourceDateLabel: "Date",
  sourceDateToggleAriaLabel: "Keep today's date in source text",
  sourceDateHelp:
    'When ON: Keeps the line "Dagens dato er DD.MM.YYYY" at the top of the source text and restores it after refresh. When OFF: Removes that date line from the source text.',
  outputPlaceholder: "Generated note will appear here...",
  timerLabel: "Note Generation Timer",
  statusGenerating: "Generating…",
  statusCompleted: "Text generation completed!",
  statusFailed: "Generation failed",
  statusAborted: "Note generation aborted.",
  noSourceText: "No source text",
  noPromptSelected: "No prompt selected",
  noOutputToPush: "No note to copy over yet",
  transferred: "Result copied to Supplementary Information."
};

function i18n() {
  const fromLoader = window.__secondaryNoteI18n;
  return fromLoader && typeof fromLoader === "object"
    ? { ...I18N_FALLBACK, ...fromLoader }
    : { ...I18N_FALLBACK };
}

// -----------------------------------------------------------------------------
// Small helpers
// -----------------------------------------------------------------------------

function getApp() {
  return window.__app || {};
}

function readSession(key, fallback = "") {
  try {
    const value = sessionStorage.getItem(key);
    return value == null ? fallback : value;
  } catch (_) {
    return fallback;
  }
}

function writeSession(key, value) {
  try {
    sessionStorage.setItem(key, String(value ?? ""));
  } catch (_) {}
}

function el(id) {
  return document.getElementById(id);
}

function getTodaySecondarySourceDateLine() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  return `Dagens dato er ${day}.${month}.${year}`;
}

function stripSecondarySourceDateLines(text) {
  return String(text || "")
    .replace(/^Dagens dato er \d{2}\.\d{2}\.\d{4}\s*$/gim, "")
    .replace(/^\s*\n/, "")
    .trim();
}

function normalizeSecondarySourceDateLine(text, { enabled } = {}) {
  const body = stripSecondarySourceDateLines(text);
  if (!enabled) return body;

  const todayLine = getTodaySecondarySourceDateLine();
  return body ? `${todayLine}\n${body}` : todayLine;
}

function getSecondarySourceDateEnabled() {
  return readSession(STORAGE_KEYS.sourceDateEnabled, "1") === "1";
}

function syncSecondarySourceDate({ focus = false } = {}) {
  const sourceField = el("secondarySourceText");
  if (!sourceField) return false;

  const nextValue = normalizeSecondarySourceDateLine(sourceField.value, {
    enabled: getSecondarySourceDateEnabled()
  });
  const changed = sourceField.value !== nextValue;

  if (changed) {
    sourceField.value = nextValue;
    try {
      sourceField.dispatchEvent(new Event("input", { bubbles: true }));
    } catch (_) {}
  }

  if (focus) {
    sourceField.focus();
    const position = getSecondarySourceDateEnabled()
      ? getTodaySecondarySourceDateLine().length
      : 0;
    try {
      sourceField.setSelectionRange(position, position);
    } catch (_) {}
  }

  return changed;
}

function initSecondarySourceDateToggle() {
  const toggle = el("secondarySourceDateToggle");
  const sourceField = el("secondarySourceText");
  if (!toggle || !sourceField) return;

  if (readSession(STORAGE_KEYS.sourceDateEnabled, null) == null) {
    writeSession(STORAGE_KEYS.sourceDateEnabled, "1");
  }

  toggle.checked = getSecondarySourceDateEnabled();
  syncSecondarySourceDate();

  toggle.addEventListener("change", () => {
    writeSession(STORAGE_KEYS.sourceDateEnabled, toggle.checked ? "1" : "0");
    syncSecondarySourceDate({ focus: toggle.checked });
  });

  sourceField.addEventListener("blur", () => {
    if (getSecondarySourceDateEnabled()) syncSecondarySourceDate();
  });
}

function setSelectOptions(selectEl, options) {
  if (!selectEl) return;
  const previous = String(selectEl.value || "").trim();
  selectEl.innerHTML = "";
  (Array.isArray(options) ? options : []).forEach((item) => {
    const optionEl = document.createElement("option");
    optionEl.value = String(item.value ?? "");
    optionEl.textContent = String(item.label ?? item.value ?? "");
    selectEl.appendChild(optionEl);
  });
  if (options.some((item) => String(item.value) === previous)) {
    selectEl.value = previous;
  }
}

function setDisplay(container, show) {
  if (!container) return;
  container.style.display = show ? "inline-flex" : "none";
}

// -----------------------------------------------------------------------------
// Module state — fully independent of the primary generator
// -----------------------------------------------------------------------------

const state = {
  inFlight: false,
  abortController: null,
  timerIntervalId: null,
  timerStartedAt: 0
};

let secondaryNoteModuleInitialized = false;
let secondaryNoteModuleInitializing = false;

// -----------------------------------------------------------------------------
// Timer / status / usage helpers (secondary-only DOM targets)
// -----------------------------------------------------------------------------

function renderTimerText(ms) {
  const timerEl = el("secondaryNoteTimer");
  if (!timerEl) return;
  timerEl.textContent = `${i18n().timerLabel}: ${formatTime(ms)}`;
}

function startSecondaryTimer() {
  stopSecondaryTimer();
  state.timerStartedAt = Date.now();
  renderTimerText(0);
  state.timerIntervalId = setInterval(() => {
    renderTimerText(Date.now() - state.timerStartedAt);
  }, 1000);
}

function stopSecondaryTimer() {
  if (state.timerIntervalId) {
    clearInterval(state.timerIntervalId);
    state.timerIntervalId = null;
  }
}

function setStatus(text, { isError = false } = {}) {
  const statusEl = el("secondaryNoteStatus");
  if (!statusEl) return;
  statusEl.textContent = text || "";
  statusEl.style.color = isError ? "#b00020" : "#555";
}

function clearSecondaryUsageAndCost() {
  const usageEl = el("secondaryNoteUsageCost");
  if (usageEl) usageEl.textContent = "";
}

function pushSecondaryUsage({ providerKey, modelId, usage, meta = null }) {
  if (!usage) return;
  const usageEl = el("secondaryNoteUsageCost");
  if (!usageEl) return;

  try {
    const app = getApp();
    if (typeof app.formatNoteUsageAndCost === "function") {
      const text = app.formatNoteUsageAndCost({
        providerKey,
        modelId,
        usage,
        meta: meta || undefined
      });
      if (text) usageEl.textContent = text;
    }
  } catch (_) {}
}

// -----------------------------------------------------------------------------
// Persistence + hydration of the secondary selectors
// -----------------------------------------------------------------------------

function getSelections() {
  const provider = normalizeNoteUiProvider(readSession(STORAGE_KEYS.provider, DEFAULTS.noteProvider));
  const openaiModel = normalizeOpenAiModel(
    readSession(STORAGE_KEYS.openaiModel, DEFAULTS.openaiModel)
  );
  const bedrockModel = (() => {
    const raw = String(readSession(STORAGE_KEYS.bedrockModel, DEFAULTS.bedrockModel)).trim();
    return ALLOWED_BEDROCK_MODEL_KEYS.has(raw) ? raw : DEFAULTS.bedrockModel;
  })();
  const requestyModel = normalizeRequestyModel(
    readSession(STORAGE_KEYS.requestyModel, DEFAULTS.requestyModel)
  );
  const storedRequestyReasoning = readSession(STORAGE_KEYS.requestyNanoReasoning, null);

  return {
    provider,
    mode: normalizeNoteMode(readSession(STORAGE_KEYS.mode, DEFAULTS.noteMode)),
    openaiModel,
    openaiReasoning:
      provider === "openai"
        ? normalizeOpenAiReasoning(
            readSession(STORAGE_KEYS.openaiReasoning, getDefaultOpenAiReasoning()),
            openaiModel
          )
        : normalizeSharedRequestyReasoning(
            readSession(STORAGE_KEYS.openaiReasoning, "low")
          ),
    bedrockModel,
    requestyModel,
    requestyNanoReasoning: normalizeRequestyNanoReasoning(
      storedRequestyReasoning == null
        ? getDefaultRequestyReasoning(requestyModel)
        : storedRequestyReasoning,
      requestyModel
    ),
    promptSlot: (() => {
      const raw = parseInt(readSession(STORAGE_KEYS.promptSlot, "1"), 10);
      return Number.isFinite(raw) && raw >= 1 && raw <= PromptManager.PROMPT_SLOT_COUNT
        ? String(raw)
        : "1";
    })(),
    autoTransfer: readSession(STORAGE_KEYS.autoTransfer, "0") === "1",
    clearOnGenerate: readSession(STORAGE_KEYS.clearOnGenerate, "0") === "1"
  };
}

function syncVisibility() {
  const selections = getSelections();
  const visibility = getNoteUiVisibility({
    provider: selections.provider,
    openaiModel: selections.openaiModel,
    requestyModel: selections.requestyModel
  });

  setDisplay(el("secondaryOpenaiModelContainer"), visibility.showOpenAi);
  setDisplay(el("secondaryModeContainer"), visibility.showOpenAiMode);
  setDisplay(el("secondaryOpenaiReasoningContainer"), visibility.showOpenAiReasoning);
  setDisplay(el("secondaryNanoReasoningContainer"), visibility.showRequestyNanoReasoning);
  setDisplay(el("secondaryBedrockModelContainer"), visibility.showBedrock);
  setDisplay(el("secondaryRequestyModelContainer"), visibility.showRequesty);
}

function hydrateSelectors() {
  const selections = getSelections();
  // Existing sessions may still contain a provider that is no longer
  // available. Persist the normalized fallback during hydration.
  writeSession(STORAGE_KEYS.provider, selections.provider);
  writeSession(STORAGE_KEYS.openaiModel, selections.openaiModel);
  writeSession(STORAGE_KEYS.openaiReasoning, selections.openaiReasoning);

  setSelectOptions(el("secondaryProvider"), listNoteUiProviderOptions());
  setSelectOptions(el("secondaryOpenaiModel"), listOpenAiModelOptions());
  setSelectOptions(el("secondaryMode"), listNoteModeOptions());
  setSelectOptions(
    el("secondaryOpenaiReasoning"),
    selections.provider === "openai"
      ? listOpenAiReasoningOptions(selections.openaiModel)
      : listSharedRequestyReasoningOptions()
  );
  setSelectOptions(
    el("secondaryNanoReasoning"),
    listRequestyNanoReasoningOptions(selections.requestyModel)
  );
  setSelectOptions(el("secondaryBedrockModel"), listBedrockModelOptions());
  setSelectOptions(el("secondaryRequestyModel"), listRequestyModelOptions());

  const assign = (id, value) => {
    const select = el(id);
    if (select) select.value = value;
  };

  assign("secondaryProvider", selections.provider);
  assign("secondaryOpenaiModel", selections.openaiModel);
  assign("secondaryMode", selections.mode);
  assign("secondaryOpenaiReasoning", selections.openaiReasoning);
  assign("secondaryNanoReasoning", selections.requestyNanoReasoning);
  assign("secondaryBedrockModel", selections.bedrockModel);
  assign("secondaryRequestyModel", selections.requestyModel);

  const autoTransfer = el("secondaryAutoTransferToggle");
  if (autoTransfer) autoTransfer.checked = selections.autoTransfer;

  const clearOnGenerateToggle = el("secondaryClearOnGenerateToggle");
  if (clearOnGenerateToggle) clearOnGenerateToggle.checked = selections.clearOnGenerate;

  hydratePromptOptions(selections.promptSlot);
  syncVisibility();
  try {
    getApp().renderNoteModelPrices?.();
  } catch (_) {}
}

// -----------------------------------------------------------------------------
// Prompt dropdown — SHARED prompt texts, INDEPENDENT selection
// -----------------------------------------------------------------------------
//
// The dropdown only stores the selected slot number. The actual prompt text is
// read from PromptManager at generation time, so edits saved in the main
// Custom Prompt area are always picked up without any duplicate copy here.

function buildPromptOptionLabel(slot) {
  let name = "";
  try {
    const profileId = PromptManager.getPromptProfileId();
    name = String(PromptManager.getSlotDisplayName(String(slot), profileId) || "").trim();
  } catch (_) {}
  return name ? `${slot}. ${name}` : `${slot}.`;
}

function hydratePromptOptions(preferredSlot = null) {
  const select = el("secondaryPromptSelect");
  if (!select) return;

  const current = preferredSlot != null ? String(preferredSlot) : String(select.value || "1");
  const options = [];
  for (let slot = 1; slot <= PromptManager.PROMPT_SLOT_COUNT; slot++) {
    options.push({ value: String(slot), label: buildPromptOptionLabel(slot) });
  }
  setSelectOptions(select, options);
  select.value = options.some((o) => o.value === current) ? current : "1";
}

// -----------------------------------------------------------------------------
// Transfer to Supplementary Information
// -----------------------------------------------------------------------------
//
// The generated note is always wrapped in a single pair of quotation marks
// ("...") — this applies to BOTH the automatic transfer (on successful
// generation) and the manual "Insert" button.
//
// The note is appended as a new paragraph at the bottom of the Supplementary
// Information field, leaving any existing content untouched. (Whether the
// field is emptied first is governed separately by the "Clear Supplementary
// Information on Generate" toggle, which acts when Generate is clicked.)

function transferToSupplementary(noteText) {
  const supplementaryEl = el("supplementaryInfo");
  if (!supplementaryEl) return false;

  const quotedNote = `"${String(noteText || "")}"`;

  const existing = String(supplementaryEl.value || "");
  if (existing.trim()) {
    supplementaryEl.value = `${existing.replace(/\s+$/, "")}\n\n${quotedNote}`;
  } else {
    supplementaryEl.value = quotedNote;
  }

  try {
    supplementaryEl.dispatchEvent(new Event("input", { bubbles: true }));
  } catch (_) {}
  return true;
}

// Clear-on-Generate — when the "Clear Supplementary Information on Generate"
// toggle is checked, clicking Generate empties the Supplementary Information
// field before generation. If the app's date toggle is on, the managed
// "Dagens dato er DD.MM.YYYY" header line is preserved (only the body below
// it is removed); if the date toggle is off, the field is fully emptied.

function isClearOnGenerateEnabled() {
  const toggle = el("secondaryClearOnGenerateToggle");
  return toggle ? !!toggle.checked : false;
}

function clearSupplementaryForGenerate() {
  const supplementaryEl = el("supplementaryInfo");
  if (!supplementaryEl) return;

  const app = getApp();
  const current = String(supplementaryEl.value || "");

  let dateEnabled = false;
  try {
    dateEnabled =
      typeof app.getSupplementaryDateEnabled === "function"
        ? !!app.getSupplementaryDateEnabled()
        : false;
  } catch (_) {}

  let nextValue = "";
  if (dateEnabled) {
    // Preserve the existing managed date header line exactly if present...
    const dateLineRegex = /^Dagens dato er \d{2}\.\d{2}\.\d{4}\s*$/im;
    const existingDateLine = current
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => dateLineRegex.test(line));

    if (existingDateLine) {
      nextValue = existingDateLine;
    } else if (typeof app.normalizeSupplementaryDateLine === "function") {
      // ...otherwise generate today's header, consistent with the app.
      try {
        nextValue = app.normalizeSupplementaryDateLine("", { enabled: true });
      } catch (_) {
        nextValue = "";
      }
    }
  }

  supplementaryEl.value = nextValue;
  try {
    supplementaryEl.dispatchEvent(new Event("input", { bubbles: true }));
  } catch (_) {}

  // Match the app's normal Supplementary Information clear behavior:
  // return the textarea to its captured default height and top position.
  supplementaryEl.scrollTop = 0;
  const defaultHeight = supplementaryEl.dataset.defaultHeight;
  supplementaryEl.style.height = defaultHeight || "";
}

// Manual push — user-initiated copy of the current secondary output into the
// Supplementary Information field (uses the same quoting + append rules as the
// automatic transfer).
function pushToSupplementary() {
  const strings = i18n();
  const outputField = el("secondaryGeneratedNote");
  if (!outputField) return;

  const text = String(outputField.value || "");
  if (!text.trim()) {
    setStatus(strings.noOutputToPush, { isError: true });
    return;
  }

  if (transferToSupplementary(text)) {
    setStatus(strings.transferred);
  }
}

// -----------------------------------------------------------------------------
// Busy-state handling (secondary controls only)
// -----------------------------------------------------------------------------

const LOCKABLE_CONTROL_IDS = [
  "secondaryProvider",
  "secondaryOpenaiModel",
  "secondaryMode",
  "secondaryOpenaiReasoning",
  "secondaryNanoReasoning",
  "secondaryBedrockModel",
  "secondaryRequestyModel",
  "secondaryPromptSelect"
];

function setBusy(busy) {
  state.inFlight = busy;

  const generateButton = el("secondaryGenerateButton");
  if (generateButton) generateButton.disabled = busy;

  const abortButton = el("secondaryAbortButton");
  if (abortButton) abortButton.disabled = !busy;

  LOCKABLE_CONTROL_IDS.forEach((id) => {
    const control = el(id);
    if (control) control.disabled = busy;
  });
}

// -----------------------------------------------------------------------------
// Generation — one parameterized request function per provider, mirroring the
// exact request shapes of the primary provider modules (same endpoints, same
// credential sessionStorage keys, same usage payloads).
// -----------------------------------------------------------------------------

function requireSecondarySessionKey(storageKey, alertText) {
  const value = readSession(storageKey, "").trim();
  if (value) return value;
  alert(alertText || "No API key available for note generation.");
  return "";
}

async function generateOpenAi({ selections, sourceText, promptText, outputField, signal }) {
  const apiKey = requireSecondarySessionKey(
    "openai_api_key",
    "No API key available for note generation."
  );
  if (!apiKey) return { ok: false, silent: true };

  const modelId = normalizeOpenAiModel(selections.openaiModel);
  const streaming = selections.mode !== "non-streaming";
  const reasoningLevel = selections.openaiReasoning;

  const requestBody = {
    model: modelId,
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: buildStandardNotePrompt(promptText) }]
      },
      {
        role: "user",
        content: [{ type: "input_text", text: sourceText }]
      }
    ],
    text: { verbosity: "medium" }
  };
  if (streaming) requestBody.stream = true;
  // Send `none` explicitly because GPT-5.6 otherwise defaults to Medium.
  if (reasoningLevel) {
    requestBody.reasoning = { effort: reasoningLevel };
  }

  const resp = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody),
    signal
  });

  if (!streaming) {
    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      throw new Error(`OpenAI error ${resp.status}: ${errText}`);
    }
    const json = await resp.json();
    outputField.value = extractResponsesOutputText(json) || "";
    pushSecondaryUsage({
      providerKey: "openai",
      modelId,
      usage: json?.usage ?? null,
      meta: { reasoningTokens: json?.usage?.output_tokens_details?.reasoning_tokens ?? 0 }
    });
  } else {
    await streamResponsesSse(resp, {
      signal,
      errorLabel: "OpenAI",
      onDelta: (textChunk) => {
        outputField.value += textChunk;
      },
      onDone: (finalEvent) => {
        const usage = finalEvent?.response?.usage ?? finalEvent?.usage ?? null;
        pushSecondaryUsage({
          providerKey: "openai",
          modelId,
          usage,
          meta: { reasoningTokens: usage?.output_tokens_details?.reasoning_tokens ?? 0 }
        });
      },
      onError: (error) => {
        throw error;
      }
    });
  }

  return { ok: true };
}

async function generateMistral({ sourceText, promptText, outputField, signal }) {
  const apiKey = requireSecondarySessionKey(
    "mistral_api_key",
    "No API key available for note generation."
  );
  if (!apiKey) return { ok: false, silent: true };

  const resp = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "mistral-large-latest",
      messages: [
        { role: "system", content: buildStandardNotePrompt(promptText) },
        { role: "user", content: sourceText }
      ],
      stream: true
    }),
    signal
  });

  await streamChatCompletionsSse(resp, {
    signal,
    errorLabel: "Mistral",
    captureUsage: true,
    onDelta: (textChunk) => {
      outputField.value += textChunk;
    },
    onDone: (finalEvent) => {
      pushSecondaryUsage({
        providerKey: "mistral",
        modelId: "mistral-large-latest",
        usage: finalEvent?.usage ?? null
      });
    },
    onError: (error) => {
      throw error;
    }
  });

  return { ok: true };
}

async function generateBedrock({ selections, sourceText, promptText, outputField, signal }) {
  const backendUrl = readSession("bedrock_backend_url", "").trim();
  const backendSecret = readSession("bedrock_backend_secret", "").trim();

  if (!backendUrl) {
    alert(
      "No Bedrock backend URL configured.\n\n" +
        "Please paste your Bedrock proxy URL on the start page before using AWS Bedrock."
    );
    return { ok: false, silent: true };
  }
  if (!backendSecret) {
    alert(
      "No Bedrock backend secret configured.\n\n" +
        "Please paste your backend secret (X-Proxy-Secret) on the start page before using AWS Bedrock."
    );
    return { ok: false, silent: true };
  }

  const modelKey = ALLOWED_BEDROCK_MODEL_KEYS.has(selections.bedrockModel)
    ? selections.bedrockModel
    : "";

  const resp = await fetch(backendUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Proxy-Secret": backendSecret
    },
    body: JSON.stringify({
      transcription: sourceText,
      customPrompt: promptText,
      modelKey: modelKey || undefined
    }),
    signal
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error("Bedrock backend HTTP " + resp.status + (text ? ": " + text : ""));
  }

  const data = await resp.json().catch(() => ({}));
  const noteText =
    (data && (data.noteText || data.text || data.output || data.note)) ||
    "[No text returned from Bedrock backend]";
  const effectiveModelKey =
    (data && (data.modelKey || data.model)) || modelKey || "backend_default";

  outputField.value = noteText;

  const usage = data && data.usage;
  if (usage) {
    pushSecondaryUsage({
      providerKey: "aws-bedrock",
      modelId: effectiveModelKey,
      usage: {
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens
      }
    });
  }

  return { ok: true, noteText };
}

async function generateRequesty({ selections, sourceText, promptText, outputField, signal }) {
  const apiKey = requireSecondarySessionKey(
    "requesty_api_key",
    "No Requesty API key available.\n\n" +
      "Please paste your Requesty API key on the start page before using the Requesty provider."
  );
  if (!apiKey) return { ok: false, silent: true };

  const variantConfig = REQUESTY_VARIANTS[selections.requestyModel] || REQUESTY_VARIANTS["claude-opus-5-5"];
  const streaming = selections.mode !== "non-streaming";

  const reasoningLevel =
    variantConfig.reasoningSelector === "dedicated"
      ? selections.requestyNanoReasoning
      : selections.openaiReasoning;

  const requestBody = {
    model: variantConfig.requestyModelId,
    messages: [
      { role: "system", content: buildStandardNotePrompt(promptText) },
      { role: "user", content: sourceText }
    ]
  };
  if (streaming) {
    requestBody.stream = true;
    requestBody.stream_options = { include_usage: true };
  }
  if (
    reasoningLevel &&
    (reasoningLevel !== "none" || variantConfig.sendNoneReasoning === true)
  ) {
    requestBody.reasoning_effort = reasoningLevel;
  }

  const pushUsage = (usage) => {
    if (!usage) return;
    pushSecondaryUsage({
      providerKey: "requesty",
      modelId: variantConfig.pricingModelId,
      usage,
      meta: {
        reasoningTokens: usage?.completion_tokens_details?.reasoning_tokens ?? 0,
        requestyReportedCost: typeof usage?.cost === "number" ? usage.cost : null
      }
    });
  };

  const resp = await fetch(REQUESTY_EU_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody),
    signal
  });

  if (!streaming) {
    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      throw new Error(`Requesty error ${resp.status}: ${errText}`);
    }
    const json = await resp.json();
    pushUsage(json?.usage ?? null);
    outputField.value = json?.choices?.[0]?.message?.content || "";
  } else {
    await streamChatCompletionsSse(resp, {
      signal,
      errorLabel: "Requesty",
      captureUsage: true,
      onDelta: (textChunk) => {
        outputField.value += textChunk;
      },
      onDone: (finalEvent) => {
        pushUsage(finalEvent?.usage ?? null);
      },
      onError: (error) => {
        throw error;
      }
    });
  }

  return { ok: true };
}

// -----------------------------------------------------------------------------
// Orchestration
// -----------------------------------------------------------------------------

async function generateSecondaryNote() {
  if (state.inFlight) return;

  const strings = i18n();
  const sourceField = el("secondarySourceText");
  const outputField = el("secondaryGeneratedNote");
  if (!sourceField || !outputField) return;

  syncSecondarySourceDate();
  const sourceText = String(sourceField.value || "").trim();
  if (!stripSecondarySourceDateLines(sourceText)) {
    setStatus(strings.noSourceText, { isError: true });
    return;
  }

  const promptSelect = el("secondaryPromptSelect");
  const promptSlot = String(promptSelect?.value || "").trim();
  if (!promptSlot) {
    setStatus(strings.noPromptSelected, { isError: true });
    return;
  }

  // Always read the LATEST saved text for the selected slot from the shared
  // prompt storage — never a cached/duplicated copy.
  const promptText = String(PromptManager.getPrompt(promptSlot) || "");

  const selections = getSelections();
  const controller = new AbortController();
  state.abortController = controller;

  // If enabled, clear the Supplementary Information field now that a valid
  // generation is starting (the managed date header is preserved when the
  // app's date toggle is on).
  if (isClearOnGenerateEnabled()) {
    clearSupplementaryForGenerate();
  }

  outputField.value = "";
  clearSecondaryUsageAndCost();
  setStatus(strings.statusGenerating);
  setBusy(true);
  startSecondaryTimer();

  const context = {
    selections,
    sourceText,
    promptText,
    outputField,
    signal: controller.signal,
    controller
  };

  try {
    let result;
    switch (selections.provider) {
      case "openai":
        result = await generateOpenAi(context);
        break;
      case "mistral":
        result = await generateMistral(context);
        break;
      case "aws-bedrock":
        result = await generateBedrock(context);
        break;
      case "requesty":
        result = await generateRequesty(context);
        break;
      default:
        result = await generateBedrock(context);
        break;
    }

    if (state.abortController !== controller) return;
    stopSecondaryTimer();

    if (!result || !result.ok) {
      // Missing key/config — alert already shown; reset quietly.
      renderTimerText(0);
      setStatus("");
      return;
    }

    setStatus(strings.statusCompleted);

    // Automatic transfer to Supplementary Information — ONLY after a
    // successful, non-empty generation, and only when the toggle is on.
    const autoTransferEnabled = !!el("secondaryAutoTransferToggle")?.checked;
    const generatedText = String(outputField.value || "");
    if (autoTransferEnabled && generatedText.trim()) {
      if (transferToSupplementary(generatedText)) {
        setStatus(`${strings.statusCompleted} ${strings.transferred}`);
      }
    }
  } catch (error) {
    if (state.abortController !== controller) return;
    stopSecondaryTimer();

    if (error?.name === "AbortError") {
      setStatus(strings.statusAborted);
      if (!outputField.value.trim()) {
        outputField.value = strings.statusAborted;
      }
      return;
    }

    console.error("[secondary-note] generation error:", error);
    setStatus(`${strings.statusFailed}: ${String(error?.message || error)}`, { isError: true });
    if (!outputField.value.trim()) {
      outputField.value = "Error generating note: " + String(error);
    }
  } finally {
    if (state.abortController === controller) {
      state.abortController = null;
      setBusy(false);
    }
  }
}

function abortSecondaryNote() {
  const controller = state.abortController;
  if (controller) {
    try {
      controller.abort();
    } catch (_) {}
  }
}

function disposeSecondaryNote({ final = false } = {}) {
  abortSecondaryNote();
  stopSecondaryTimer();
  state.abortController = null;
  state.inFlight = false;
  state.timerStartedAt = 0;
  if (!final) setBusy(false);
}

// -----------------------------------------------------------------------------
// Copy button
// -----------------------------------------------------------------------------

async function copySecondaryNote() {
  const outputField = el("secondaryGeneratedNote");
  const button = el("secondaryCopyNoteButton");
  if (!outputField) return;

  const text = String(outputField.value || "");
  const flashCopied = () => {
    if (!button) return;
    const strings = i18n();
    button.textContent = strings.copiedButton;
    setTimeout(() => {
      button.textContent = i18n().copyButton;
    }, 1200);
  };

  try {
    await navigator.clipboard.writeText(text);
    flashCopied();
  } catch (_) {
    try {
      outputField.focus();
      outputField.select();
      document.execCommand("copy");
      outputField.setSelectionRange(0, 0);
      flashCopied();
    } catch (err) {
      console.warn("[secondary-note] copy failed:", err);
    }
  }
}

// -----------------------------------------------------------------------------
// Show / hide toggle (Redactor-style: hiding never clears any state)
// -----------------------------------------------------------------------------

function isSecondaryOpen() {
  const pane = el("secondaryNotePane");
  return !!pane && !pane.hidden;
}

function setSecondaryOpen(isOpen) {
  const layout = el("transcriptSecondaryLayout");
  const pane = el("secondaryNotePane");
  const button = el("toggleSecondaryNoteButton");
  if (!layout || !pane || !button) return;

  layout.classList.toggle("secondary-open", !!isOpen);
  pane.hidden = !isOpen;
  pane.setAttribute("aria-hidden", isOpen ? "false" : "true");
  button.setAttribute("aria-expanded", isOpen ? "true" : "false");
  refreshToggleButtonLabel();
}

function refreshToggleButtonLabel() {
  const button = el("toggleSecondaryNoteButton");
  if (!button) return;
  const strings = i18n();
  button.textContent = isSecondaryOpen() ? strings.hideButton : strings.showButton;
}

// -----------------------------------------------------------------------------
// Wiring
// -----------------------------------------------------------------------------

function bindPersistedSelect(id, storageKey, { normalize = (v) => v, onChange = null } = {}) {
  const select = el(id);
  if (!select) return;
  select.addEventListener("change", () => {
    const value = normalize(String(select.value || ""));
    writeSession(storageKey, value);
    if (select.value !== value) select.value = value;
    if (typeof onChange === "function") onChange(value);
  });
}

function initSecondaryNoteModule() {
  if (secondaryNoteModuleInitialized) return true;
  if (secondaryNoteModuleInitializing) return false;

  const pane = el("secondaryNotePane");
  const toggleButton = el("toggleSecondaryNoteButton");
  if (!pane || !toggleButton) return false;

  secondaryNoteModuleInitializing = true;

  try {
    hydrateSelectors();
    initSecondarySourceDateToggle();
    refreshToggleButtonLabel();
    renderTimerText(0);
    setBusy(false);

    toggleButton.addEventListener("click", () => {
      setSecondaryOpen(!isSecondaryOpen());
    });

    bindPersistedSelect("secondaryProvider", STORAGE_KEYS.provider, {
      normalize: normalizeNoteUiProvider,
      onChange: (provider) => {
        clearSecondaryUsageAndCost();
        const selections = getSelections();
        const reasoningSelect = el("secondaryOpenaiReasoning");
        const previousReasoning = String(reasoningSelect?.value || "");
        setSelectOptions(
          reasoningSelect,
          provider === "openai"
            ? listOpenAiReasoningOptions(selections.openaiModel)
            : listSharedRequestyReasoningOptions()
        );
        const normalizedReasoning =
          provider === "openai"
            ? normalizeOpenAiReasoning(previousReasoning, selections.openaiModel)
            : normalizeSharedRequestyReasoning(previousReasoning);
        if (reasoningSelect) reasoningSelect.value = normalizedReasoning;
        writeSession(STORAGE_KEYS.openaiReasoning, normalizedReasoning);
        syncVisibility();
      }
    });
    bindPersistedSelect("secondaryOpenaiModel", STORAGE_KEYS.openaiModel, {
      normalize: normalizeOpenAiModel,
      onChange: (modelId) => {
        clearSecondaryUsageAndCost();
        const provider = getSelections().provider;
        const reasoningSelect = el("secondaryOpenaiReasoning");
        const previousReasoning = String(reasoningSelect?.value || "");
        setSelectOptions(
          reasoningSelect,
          provider === "openai"
            ? listOpenAiReasoningOptions(modelId)
            : listSharedRequestyReasoningOptions()
        );
        const normalizedReasoning =
          provider === "openai"
            ? normalizeOpenAiReasoning(previousReasoning, modelId)
            : normalizeSharedRequestyReasoning(previousReasoning);
        if (reasoningSelect) reasoningSelect.value = normalizedReasoning;
        writeSession(STORAGE_KEYS.openaiReasoning, normalizedReasoning);
        syncVisibility();
      }
    });
    bindPersistedSelect("secondaryMode", STORAGE_KEYS.mode, {
      normalize: normalizeNoteMode,
      onChange: () => clearSecondaryUsageAndCost()
    });
    bindPersistedSelect("secondaryOpenaiReasoning", STORAGE_KEYS.openaiReasoning, {
      normalize: (value) =>
        getSelections().provider === "openai"
          ? normalizeOpenAiReasoning(value, getSelections().openaiModel)
          : normalizeSharedRequestyReasoning(value)
    });
    bindPersistedSelect("secondaryNanoReasoning", STORAGE_KEYS.requestyNanoReasoning, {
      normalize: (value) =>
        normalizeRequestyNanoReasoning(value, getSelections().requestyModel)
    });
    bindPersistedSelect("secondaryBedrockModel", STORAGE_KEYS.bedrockModel, {
      normalize: (v) => (ALLOWED_BEDROCK_MODEL_KEYS.has(v) ? v : DEFAULTS.bedrockModel),
      onChange: () => clearSecondaryUsageAndCost()
    });
    bindPersistedSelect("secondaryRequestyModel", STORAGE_KEYS.requestyModel, {
      normalize: normalizeRequestyModel,
      onChange: (modelId) => {
        clearSecondaryUsageAndCost();
        const reasoningSelect = el("secondaryNanoReasoning");
        const storedReasoning = readSession(STORAGE_KEYS.requestyNanoReasoning, null);
        const previous = modelId.startsWith("gpt-6-")
          ? (storedReasoning == null
              ? getDefaultRequestyReasoning(modelId)
              : storedReasoning)
          : modelId === "claude-opus-5-5" ||
              modelId === "gemini-3.8-flash" ||
              modelId.startsWith("deepseek-")
            ? getDefaultRequestyReasoning(modelId)
            : String(reasoningSelect?.value || "");
        setSelectOptions(
          reasoningSelect,
          listRequestyNanoReasoningOptions(modelId)
        );
        const normalized = normalizeRequestyNanoReasoning(previous, modelId);
        if (reasoningSelect) reasoningSelect.value = normalized;
        writeSession(STORAGE_KEYS.requestyNanoReasoning, normalized);
        syncVisibility();
      }
    });
    bindPersistedSelect("secondaryPromptSelect", STORAGE_KEYS.promptSlot);

    const autoTransfer = el("secondaryAutoTransferToggle");
    if (autoTransfer) {
      autoTransfer.addEventListener("change", () => {
        writeSession(STORAGE_KEYS.autoTransfer, autoTransfer.checked ? "1" : "0");
      });
    }

    const clearOnGenerateToggle = el("secondaryClearOnGenerateToggle");
    if (clearOnGenerateToggle) {
      clearOnGenerateToggle.addEventListener("change", () => {
        writeSession(STORAGE_KEYS.clearOnGenerate, clearOnGenerateToggle.checked ? "1" : "0");
      });
    }

    const generateButton = el("secondaryGenerateButton");
    if (generateButton) generateButton.addEventListener("click", generateSecondaryNote);

    const abortButton = el("secondaryAbortButton");
    if (abortButton) abortButton.addEventListener("click", abortSecondaryNote);

    const copyButton = el("secondaryCopyNoteButton");
    if (copyButton) copyButton.addEventListener("click", copySecondaryNote);

    const pushButton = el("secondaryPushToSupplementaryButton");
    if (pushButton) pushButton.addEventListener("click", pushToSupplementary);

    // Shared prompt storage: refresh slot labels when names change; the prompt
    // TEXT is always read live at generation time, so value changes need no
    // action here — but keeping labels current avoids stale dropdown names.
    window.addEventListener("prompt-slot-names-changed", () => hydratePromptOptions());
    window.addEventListener("prompt-slots-reordered", () => hydratePromptOptions());
    window.addEventListener("prompt-slots-imported", () => hydratePromptOptions());
    window.addEventListener("prompt-profile-changed", () => hydratePromptOptions());

    // Language switches: refresh dynamic labels owned by this module.
    window.addEventListener("secondary-note-i18n-changed", () => {
      refreshToggleButtonLabel();
      if (!state.inFlight) renderTimerText(0);
    });

    secondaryNoteModuleInitialized = true;
    window.__secondaryNoteModuleReady = true;
    window.dispatchEvent(new window.Event("secondary-note-ready"));
    return true;
  } catch (error) {
    window.__secondaryNoteModuleReady = false;
    console.error("[secondary-note] Module initialization failed:", error);
    return false;
  } finally {
    secondaryNoteModuleInitializing = false;
  }
}

window.__secondaryNoteModuleReady = false;
window.__initSecondaryNoteModule = initSecondaryNoteModule;
registerWorkspaceDisposer(disposeSecondaryNote);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSecondaryNoteModule, { once: true });
} else {
  initSecondaryNoteModule();
}
