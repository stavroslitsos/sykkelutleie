// js/core/note-runner.js
import { registerWorkspaceDisposer } from './workspace-disposal.js';

function getNoteCoordinator() {
  return window.__app || {};
}

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  if (totalSec < 60) {
    return totalSec + " sec";
  }

  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return minutes + " min" + (seconds > 0 ? " " + seconds + " sec" : "");
}

function startNoteTimer(noteTimerElement) {
  const noteStartTime = Date.now();

  if (noteTimerElement) {
    noteTimerElement.innerText = "Note Generation Timer: 0 sec";
  }

  const intervalId = setInterval(() => {
    if (noteTimerElement) {
      noteTimerElement.innerText =
        "Note Generation Timer: " + formatTime(Date.now() - noteStartTime);
    }
  }, 1000);
  let disposed = false;
  let unregister = () => {};
  unregister = registerWorkspaceDisposer(() => {
    disposed = true;
    clearInterval(intervalId);
    unregister();
  });

  return {
    stop(finalText = "") {
      clearInterval(intervalId);
      unregister();
      if (disposed) return;
      if (noteTimerElement) {
        noteTimerElement.innerText = finalText;
      }
    }
  };
}

function getTrimmedFieldValue(id) {
  const el = document.getElementById(id);
  return {
    el,
    value: el && typeof el.value === "string" ? el.value.trim() : ""
  };
}

function getSelectValue(id, fallback = "") {
  const el = document.getElementById(id);
  return el && typeof el.value === "string" && el.value
    ? el.value
    : fallback;
}

function getSessionStorageValue(key, fallback = "") {
  try {
    const value = sessionStorage.getItem(key);
    return value == null ? fallback : value;
  } catch (_) {
    return fallback;
  }
}

function buildSupplementaryWrapped(rawValue) {
  return rawValue
    ? `Tilleggsopplysninger(brukes som kontekst):"${rawValue}"\n\n`
    : "";
}

function buildStandardNotePrompt(promptText) {
  const baseInstruction = [
    "Do not use bold text. Do not use asterisks (*) or Markdown formatting anywhere in the output.",
    "All headings should be plain text with a colon, like 'Bakgrunn:'."
  ].join("\n");

  return promptText ? `${promptText}\n\n${baseInstruction}` : baseInstruction;
}

function beginNoteRun(runMeta) {
  try {
    window.__app?.clearNoteUsageAndCost?.();
  } catch (_) {}

  const app = getNoteCoordinator();
  const controller = app.beginNoteGeneration?.(runMeta);
  return { app, controller };
}

function finishNoteAbort({
  generatedNoteField,
  noteTimer,
  runMeta,
  emptyFieldText = "Note generation aborted.",
  timerText = "Text generation aborted."
}) {
  try {
    noteTimer?.stop(timerText);
  } catch (_) {}

  if (generatedNoteField && !generatedNoteField.value.trim()) {
    generatedNoteField.value = emptyFieldText;
  }

  getNoteCoordinator().emitNoteFinished?.({
    ...runMeta,
    aborted: true
  });
}

function getCommonNoteElements() {
  return {
    transcriptionElem: document.getElementById("transcription"),
    customPromptTextarea: document.getElementById("customPrompt"),
    supplementaryElem: document.getElementById("supplementaryInfo"),
    generatedNoteField: document.getElementById("generatedNote"),
    noteTimerElement: document.getElementById("noteTimer")
  };
}

function resolveCommonNoteInputs(app) {
  const {
    transcriptionElem,
    customPromptTextarea,
    supplementaryElem,
    generatedNoteField,
    noteTimerElement
  } = getCommonNoteElements();

  const transcriptionText = transcriptionElem?.value?.trim() || "";
  if (!transcriptionText) {
    app?.finishNoteGeneration?.();
    alert("No transcription text available.");
    return null;
  }

  if (!generatedNoteField) {
    app?.finishNoteGeneration?.();
    return null;
  }

  const promptText = customPromptTextarea ? customPromptTextarea.value : "";
  const supplementaryRaw = supplementaryElem?.value?.trim() || "";

  return {
    transcriptionElem,
    transcriptionText,
    customPromptTextarea,
    promptText,
    supplementaryElem,
    supplementaryRaw,
    supplementaryWrapped: buildSupplementaryWrapped(supplementaryRaw),
    generatedNoteField,
    noteTimerElement
  };
}

function requireSessionKey(storageKey, {
  alertText = "No API key available for note generation.",
  onMissing = () => {}
} = {}) {
  const value = getSessionStorageValue(storageKey, "");
  if (value) return value;

  alert(alertText);
  onMissing();
  return "";
}

function pushNormalizedNoteUsage({
  providerKey,
  modelId,
  usage,
  meta = null
}) {
  if (!usage || !window.__app?.setNoteUsageAndCost) {
    return;
  }

  try {
    const payload = window.__app.normalizeNoteUsage
      ? window.__app.normalizeNoteUsage({
          providerKey,
          modelId,
          usage,
          meta: meta || undefined
        })
      : {
          providerKey,
          modelId,
          inputTokens:
            usage.input_tokens ??
            usage.inputTokens ??
            usage.prompt_tokens ??
            null,
          outputTokens:
            usage.output_tokens ??
            usage.outputTokens ??
            usage.completion_tokens ??
            null,
          totalTokens:
            usage.total_tokens ??
            usage.totalTokens ??
            null,
          estimatedUsd: null,
          meta: meta || undefined
        };

    window.__app.setNoteUsageAndCost(payload);
  } catch (_) {}
}

async function streamChatCompletionsSse(resp, {
  signal,
  onDelta = () => {},
  onDone = () => {},
  onError = (e) => { console.error(e); },
  errorLabel = "OpenAI",
  captureUsage = false
} = {}) {
  if (!resp.ok || !resp.body) {
    const text = await resp.text().catch(() => "");
    throw new Error(`${errorLabel} error ${resp.status}: ${text}`);
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalUsage = null;

  const abortReader = () => {
    try { reader.cancel(); } catch (_) {}
  };

  if (signal) {
    if (signal.aborted) {
      abortReader();
      throw new DOMException("Aborted", "AbortError");
    }
    signal.addEventListener("abort", abortReader, { once: true });
  }

  try {
    while (true) {
      if (signal?.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }

      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";

      for (const frame of frames) {
        if (signal?.aborted) {
          throw new DOMException("Aborted", "AbortError");
        }

        const lines = frame.split("\n");
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const dataStr = line.slice(5).trim();

          if (dataStr === "[DONE]") {
            onDone(captureUsage ? { usage: finalUsage } : undefined);
            return;
          }

          try {
            const payload = JSON.parse(dataStr);

            if (captureUsage && payload?.usage) {
              finalUsage = payload.usage;
            }

            const choice = payload?.choices?.[0];
            const deltaText =
              choice?.delta?.content ??
              choice?.message?.content ??
              "";

            if (deltaText) {
              onDelta(deltaText);
            }
          } catch {
            // Ignore keep-alives / non-JSON frames.
          }
        }
      }
    }

    onDone(captureUsage ? { usage: finalUsage } : undefined);
  } catch (error) {
    onError(error);
  } finally {
    if (signal) {
      try { signal.removeEventListener("abort", abortReader); } catch (_) {}
    }
  }
}

async function streamResponsesSse(resp, {
  signal,
  onDelta = () => {},
  onDone = () => {},
  onError = (e) => { console.error(e); },
  errorLabel = "OpenAI"
} = {}) {
  if (!resp.ok || !resp.body) {
    const text = await resp.text().catch(() => "");
    throw new Error(`${errorLabel} error ${resp.status}: ${text}`);
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let lastEventPayload = null;

  const abortReader = () => {
    try { reader.cancel(); } catch (_) {}
  };

  if (signal) {
    if (signal.aborted) {
      abortReader();
      throw new DOMException("Aborted", "AbortError");
    }
    signal.addEventListener("abort", abortReader, { once: true });
  }

  try {
    while (true) {
      if (signal?.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }

      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";

      for (const part of parts) {
        if (signal?.aborted) {
          throw new DOMException("Aborted", "AbortError");
        }

        const lines = part.split("\n");
        let dataStr = null;

        for (const line of lines) {
          if (line.startsWith("data:")) {
            dataStr = line.slice(5).trim();
          }
        }

        if (!dataStr) continue;
        if (dataStr === "[DONE]") {
          onDone(lastEventPayload);
          return;
        }

        let payload;
        try {
          payload = JSON.parse(dataStr);
        } catch {
          continue;
        }

        if (payload && typeof payload === "object") {
          if (payload.response && typeof payload.response === "object") {
            lastEventPayload = payload;
          } else if (payload.type === "response.completed") {
            lastEventPayload = payload;
          }
        }

        if (payload.type === "response.output_text.delta" && typeof payload.delta === "string") {
          onDelta(payload.delta);
        }

        if (payload.type === "response.completed") {
          onDone(payload);
          return;
        }

        if (payload.type === "response.error") {
          onError(new Error(payload.error?.message || "Unknown streaming error"));
          return;
        }
      }
    }

    onDone(lastEventPayload);
  } catch (error) {
    onError(error);
  } finally {
    if (signal) {
      try { signal.removeEventListener("abort", abortReader); } catch (_) {}
    }
  }
}



function extractResponsesOutputText(json) {
  if (!json || typeof json !== "object") {
    return "";
  }

  if (typeof json.output_text === "string") {
    return json.output_text;
  }

  if (Array.isArray(json.output)) {
    try {
      return json.output
        .flatMap((item) => (Array.isArray(item.content) ? item.content : []))
        .filter((block) => block && (block.type === "output_text" || block.type === "text"))
        .map((block) => block.text || "")
        .join("");
    } catch (_) {}
  }

  if (Array.isArray(json.content)) {
    try {
      return json.content
        .filter((block) => block && (block.type === "output_text" || block.type === "text"))
        .map((block) => block.text || "")
        .join("");
    } catch (_) {}
  }

  return "";
}

function bindGenerateNoteButton(handler) {
  const generateNoteButton = document.getElementById("generateNoteButton");
  if (!generateNoteButton || typeof handler !== "function") return;

  // Only one provider-owned Generate Note handler should be active at a time.
  // Provider modules are re-initialized on runtime switches, so remove the
  // previously bound provider handler before attaching the new one.
  const previousHandler = generateNoteButton.__providerGenerateNoteHandler;
  if (typeof previousHandler === "function") {
    generateNoteButton.removeEventListener("click", previousHandler);
  }

  generateNoteButton.__providerGenerateNoteHandler = handler;
  generateNoteButton.addEventListener("click", handler);
}

export {
  beginNoteRun,
  bindGenerateNoteButton,
  buildStandardNotePrompt,
  extractResponsesOutputText,
  finishNoteAbort,
  formatTime,
  getCommonNoteElements,
  getNoteCoordinator,
  getSelectValue,
  getSessionStorageValue,
  getTrimmedFieldValue,
  pushNormalizedNoteUsage,
  requireSessionKey,
  resolveCommonNoteInputs,
  startNoteTimer,
  streamChatCompletionsSse,
  streamResponsesSse
};
