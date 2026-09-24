// js/features/field-feedback.js
// UI-only feedback helpers that run after main.js.
// This module intentionally does NOT own note/transcription lifecycle state.
// main.js remains the controller; this file only listens to controller events
// and exposes a small set of UI sync helpers on window.__app.

import { registerWorkspaceDisposer } from "../core/workspace-disposal.js";
import { analyzeTextForCounter } from "../core/text-performance.js";

(function initNoteTimerFeedback() {
  const timerEl = document.getElementById("noteTimer");
  if (!timerEl) return;

  const belowEl = document.getElementById("noteTimerStatusBelow");
  const TIMER_PREFIX = "Note Generation Timer:";
  const COMPLETED_RE = /completed/i;
  // Treat localized timer text as "timer updates" too, not status.
  const TIMER_LIKE_RE = /\b\d+\s*(sec|sek|min|mins|minute|minutes|minut|minutter)\b/i;

  let lastTimerText = "";
  let suppress = false;

  function ensureStructure(timerText, statusText) {
    suppress = true;
    try {
      timerEl.innerHTML = "";

      const valueSpan = document.createElement("span");
      valueSpan.id = "noteTimerValue";
      valueSpan.textContent = timerText || `${TIMER_PREFIX} 0 sec`;

      const statusSpan = document.createElement("span");
      statusSpan.id = "noteTimerStatus";
      statusSpan.className = "timer-status";
      statusSpan.textContent = statusText || "";

      timerEl.appendChild(valueSpan);
      timerEl.appendChild(statusSpan);
    } finally {
      // Let the DOM settle before re-enabling observer reactions.
      setTimeout(() => {
        suppress = false;
      }, 0);
    }
  }

  function setBelowStatus(text) {
    if (!belowEl) return;
    belowEl.textContent = text || "";
  }

  const initialText = (timerEl.textContent || "").trim();
  if (initialText.startsWith(TIMER_PREFIX)) {
    lastTimerText = initialText;
  }

  ensureStructure(lastTimerText || `${TIMER_PREFIX} 0 sec`, "");
  setBelowStatus("");

  const observer = new MutationObserver(() => {
    if (suppress) return;

    const valueSpan = timerEl.querySelector("#noteTimerValue");
    const statusSpan = timerEl.querySelector("#noteTimerStatus");
    if (valueSpan && statusSpan) {
      const currentValue = (valueSpan.textContent || "").trim();
      if (currentValue.startsWith(TIMER_PREFIX)) {
        lastTimerText = currentValue;
      }
      return;
    }

    const raw = (timerEl.textContent || "").trim();

    if (!raw) {
      ensureStructure(lastTimerText || `${TIMER_PREFIX} 0 sec`, "");
      setBelowStatus("");
      return;
    }

    if (COMPLETED_RE.test(raw)) {
      const finalTimer = lastTimerText || `${TIMER_PREFIX} 0 sec`;
      ensureStructure(finalTimer, "");
      setBelowStatus("Completed!");
      return;
    }

    if (raw.startsWith(TIMER_PREFIX) || TIMER_LIKE_RE.test(raw)) {
      lastTimerText = raw;
      ensureStructure(raw, "");
      setBelowStatus("");
      return;
    }

    ensureStructure(lastTimerText || `${TIMER_PREFIX} 0 sec`, "");
    setBelowStatus("");
  });

  observer.observe(timerEl, { childList: true, characterData: true, subtree: true });
  registerWorkspaceDisposer(() => observer.disconnect(), { scope: "window" });

  const genBtn = document.getElementById("generateNoteButton");
  if (genBtn) {
    genBtn.addEventListener(
      "click",
      () => {
        lastTimerText = `${TIMER_PREFIX} 0 sec`;
        ensureStructure(lastTimerText, "");
        setBelowStatus("");
      },
      true
    );
  }
})();

(function initCompletionFeedback() {
  function getApp() {
    const existing = window.__app || {};
    window.__app = existing;
    return existing;
  }

  const app = getApp();

  function ensureCompletionFlashHost(fieldId) {
    const el = document.getElementById(fieldId);
    if (!el) return null;

    const parent = el.parentElement;
    if (parent && parent.classList.contains("completion-flash-host")) {
      return parent;
    }

    const host = document.createElement("div");
    host.className = "completion-flash-host";
    el.parentNode.insertBefore(host, el);
    host.appendChild(el);
    return host;
  }

  function pulseCompletionField(fieldId) {
    const el = document.getElementById(fieldId);
    if (!el) return;
    if (!(el.value || "").trim()) return;

    const host = ensureCompletionFlashHost(fieldId);
    if (!host) return;

    host.classList.remove("note-start-sweep");
    host.classList.remove("completion-flash");
    void host.offsetWidth; // restart animation cleanly
    host.classList.add("completion-flash");
  }

  function pulseNoteStartSweep() {
    const host = ensureCompletionFlashHost("generatedNote");
    if (!host) return;

    host.classList.remove("completion-flash");
    host.classList.remove("note-start-sweep");
    void host.offsetWidth; // restart animation cleanly
    host.classList.add("note-start-sweep");

    setTimeout(() => {
      host.classList.remove("note-start-sweep");
    }, 700);
  }

  function noteStartHasUsableInput() {
    const transcriptionEl = document.getElementById("transcription");
    const supplementaryEl = document.getElementById("supplementaryInfo");
    const promptEl = document.getElementById("customPrompt");
    const includePromptToggle = document.getElementById("includePromptToggle");

    return Boolean(
      (transcriptionEl && (transcriptionEl.value || "").trim()) ||
      (supplementaryEl && (supplementaryEl.value || "").trim()) ||
      (includePromptToggle?.checked && promptEl && (promptEl.value || "").trim())
    );
  }

  function bindNoteStartPulse() {
    if (app.__noteStartPulseBound) return;

    const btn = document.getElementById("generateNoteButton");
    if (!btn) return;
    if (btn.dataset.noteStartPulseBound === "1") return;

    app.__noteStartPulseBound = true;
    btn.dataset.noteStartPulseBound = "1";

    btn.addEventListener(
      "click",
      () => {
        if (!noteStartHasUsableInput()) return;
        pulseNoteStartSweep();
      },
      true
    );
  }

  function pulseFinishedTranscription() {
    pulseCompletionField("transcription");
  }

  function pulseFinishedNote() {
    pulseCompletionField("generatedNote");
  }

  Object.assign(app, {
    ensureCompletionFlashHost,
    pulseCompletionField,
    pulseNoteStartSweep,
    noteStartHasUsableInput,
    bindNoteStartPulse,
    pulseFinishedTranscription,
    pulseFinishedNote,
  });

  ensureCompletionFlashHost("transcription");
  ensureCompletionFlashHost("generatedNote");
  bindNoteStartPulse();

  if (!app.__transcriptionPulseBound) {
    app.__transcriptionPulseBound = true;
    window.addEventListener("transcription:finished", () => {
      pulseFinishedTranscription();
    });
  }

  if (!app.__notePulseBound) {
    app.__notePulseBound = true;
    window.addEventListener("note:finished", () => {
      pulseFinishedNote();
    });
  }
})();

(function initFieldCounters() {
  const COUNT_TARGETS = [
    { inputId: "transcription", counterId: "transcriptionLiveCounter" },
    { inputId: "supplementaryInfo", counterId: "supplementaryInfoLiveCounter" },
    { inputId: "customPrompt", counterId: "customPromptLiveCounter" },
    { inputId: "secondarySourceText", counterId: "secondarySourceTextLiveCounter" },
    { inputId: "generatedNote", counterId: "generatedNoteLiveCounter" },
  ];

  const syncMap = new Map();
  const COUNTER_DEBOUNCE_MS = 160;
  const pendingCounterTimers = new Set();

  function getApp() {
    const existing = window.__app || {};
    window.__app = existing;
    return existing;
  }

  function renderCounter(input, counter) {
    if (!input || !counter) return;
    const { words, tokens } = analyzeTextForCounter(input.value || "");
    counter.textContent = `${words} words · ${tokens} tokens`;
  }

  function makeCounterScheduler(sync) {
    let timer = 0;
    const cancel = () => {
      if (!timer) return;
      clearTimeout(timer);
      pendingCounterTimers.delete(timer);
      timer = 0;
    };
    const run = () => {
      cancel();
      sync();
    };
    const schedule = (delay = COUNTER_DEBOUNCE_MS) => {
      cancel();
      timer = setTimeout(() => {
        pendingCounterTimers.delete(timer);
        timer = 0;
        sync();
      }, delay);
      pendingCounterTimers.add(timer);
    };
    return { run, schedule, cancel };
  }

  function bindLiveCounter({ inputId, counterId }) {
    const input = document.getElementById(inputId);
    const counter = document.getElementById(counterId);
    if (!input || !counter) return;
    if (input.dataset.liveCounterBound === "1") return;

    const sync = () => renderCounter(input, counter);
    const scheduler = makeCounterScheduler(sync);
    input.dataset.liveCounterBound = "1";
    syncMap.set(inputId, scheduler);

    input.addEventListener("input", () => scheduler.schedule());
    input.addEventListener("change", scheduler.run);
    scheduler.run();
  }

  function syncCounterByInputId(inputId) {
    const scheduler = syncMap.get(inputId);
    if (scheduler) {
      scheduler.schedule(0);
      return;
    }

    const target = COUNT_TARGETS.find((item) => item.inputId === inputId);
    if (target) {
      bindLiveCounter(target);
    }
  }

  function syncAllFieldLiveCounters() {
    COUNT_TARGETS.forEach(({ inputId }) => syncCounterByInputId(inputId));
  }

  function initCounters() {
    const app = getApp();

    COUNT_TARGETS.forEach(bindLiveCounter);

    app.syncFieldLiveCounter = syncCounterByInputId;
    app.syncAllFieldLiveCounters = syncAllFieldLiveCounters;

    if (!app.__fieldCounterTranscriptionBound) {
      app.__fieldCounterTranscriptionBound = true;
      window.addEventListener("transcription:finished", () => {
        syncCounterByInputId("transcription");
      });
    }

    if (!app.__fieldCounterNoteBound) {
      app.__fieldCounterNoteBound = true;
      window.addEventListener("note:finished", () => {
        syncCounterByInputId("generatedNote");
      });
    }

    const generateNoteButton = document.getElementById("generateNoteButton");
    if (
      generateNoteButton &&
      generateNoteButton.dataset.generatedNoteCounterBound !== "1"
    ) {
      generateNoteButton.dataset.generatedNoteCounterBound = "1";
      generateNoteButton.addEventListener("click", () => {
        setTimeout(() => syncCounterByInputId("generatedNote"), 0);
      });
    }
  }

  registerWorkspaceDisposer(() => {
    syncMap.forEach((scheduler) => scheduler.cancel());
    pendingCounterTimers.forEach((timer) => clearTimeout(timer));
    pendingCounterTimers.clear();
    syncMap.clear();
  }, { scope: "window" });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCounters, { once: true });
  } else {
    initCounters();
  }
})();
