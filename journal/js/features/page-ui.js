const AUTO_COPY_STORAGE_KEY = "auto_copy_mode";
import { autoCopyHelpHtml } from "./autocopy-help.js";

function getCurrentTranscribeLanguage() {
  const select = document.getElementById("lang-select-transcribe");
  return (select && select.value) || localStorage.getItem("siteLanguage") || "en";
}

function setGridHeight() {
  const grid = document.querySelector(".grid-container");
  if (!grid) return;
  const height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  grid.style.height = `${height}px`;
}

function setupGridHeight() {
  window.addEventListener("load", () => {
    setGridHeight();
    const interval = setInterval(setGridHeight, 200);
    setTimeout(() => clearInterval(interval), 2000);
  });

  window.addEventListener("resize", setGridHeight);
  window.visualViewport?.addEventListener?.("resize", setGridHeight);
}

function setupAutoGenerateTooltip() {
  const labelEl = document.getElementById("autoGenerateToggleLabel");
  const tooltipEl = document.getElementById("autoGenerateTooltipText");
  const langSelectTranscribe = document.getElementById("lang-select-transcribe");
  if (!labelEl || !tooltipEl) return;

  const syncAutoGenerateCopy = () => {
    const isNorwegian = getCurrentTranscribeLanguage() === "no";
    labelEl.textContent = isNorwegian ? "Auto-generer" : "Auto-generate";
    tooltipEl.innerHTML = isNorwegian
      ? "<strong>Når PÅ:</strong><br/>Et notat genereres automatisk når transkripsjonen er ferdig.<br/><br/><strong>Når AV:</strong><br/>Du genererer notater manuelt med Generate Note-knappen."
      : "<strong>When ON:</strong><br/>A note is generated automatically when transcription finishes.<br/><br/><strong>When OFF:</strong><br/>You generate notes manually using the Generate Note button.";
  };

  langSelectTranscribe?.addEventListener("change", syncAutoGenerateCopy);
  window.addEventListener("transcribe-language-updated", syncAutoGenerateCopy);
  syncAutoGenerateCopy();
}

function normalizeAutoCopyMode(value) {
  const mode = String(value || "").toLowerCase();
  if (mode === "both") return "note";
  return ["off", "transcript", "note"].includes(mode) ? mode : "off";
}

function getApp() {
  const existing = window.__app || {};
  window.__app = existing;
  return existing;
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

function isAutoCopyExtensionAvailable() {
  return !!getApp().isAutoCopyExtensionAvailable?.();
}

function setupAutoCopyModeUi() {
  const selectEl = document.getElementById("autoCopyModeSelect");
  const labelEl = document.getElementById("autoCopyModeLabel");
  const tooltipEl = document.getElementById("autoCopyModeTooltipText");
  const tooltipContainer = document.getElementById("autoCopyModeTooltipContainer");
  const langSelectTranscribe = document.getElementById("lang-select-transcribe");
  if (!selectEl) return;

  const syncCopyLabel = () => {
    const isNorwegian = getCurrentTranscribeLanguage() === "no";
    if (labelEl) {
      labelEl.textContent = isNorwegian ? "Auto-copy" : "Auto-copy";
    }
    if (tooltipEl) {
      tooltipEl.innerHTML = autoCopyHelpHtml(getCurrentTranscribeLanguage());
    }

    const options = Array.from(selectEl.options || []);
    options.forEach((option) => {
      const value = String(option.value || "").toLowerCase();
      if (isNorwegian) {
        if (value === "off") option.textContent = "Av";
        else if (value === "transcript") option.textContent = "Transkripsjon";
        else if (value === "note") option.textContent = "Notat";
      } else {
        if (value === "off") option.textContent = "Off";
        else if (value === "transcript") option.textContent = "Transcript";
        else if (value === "note") option.textContent = "Note";
      }
    });
  };

  const storedRaw = readSession(AUTO_COPY_STORAGE_KEY, "");
  const stored = normalizeAutoCopyMode(storedRaw);
  if (storedRaw !== stored) {
    writeSession(AUTO_COPY_STORAGE_KEY, stored);
  }
  selectEl.value = stored;
  selectEl.dataset.workspaceConfiguredMode = stored;
  selectEl.addEventListener("change", (event) => {
    const next = normalizeAutoCopyMode(selectEl.value);
    selectEl.value = next;
    writeSession(AUTO_COPY_STORAGE_KEY, next);
    if (event.isTrusted || isAutoCopyExtensionAvailable()) {
      selectEl.dataset.workspaceConfiguredMode = next;
    }
  });

  const syncAvailabilityUi = (event) => {
    const available = isAutoCopyExtensionAvailable();
    const storedMode = normalizeAutoCopyMode(readSession(AUTO_COPY_STORAGE_KEY, "off"));
    const reason = String(event?.detail?.reason || "");
    // A real app-side mode change (including Mini Panel and Auto-generate)
    // becomes the new per-workspace preference. An extension-availability
    // change instead restores the preference that was imported earlier.
    const configuredMode = reason === "auto-copy-mode-changed"
      ? storedMode
      : normalizeAutoCopyMode(selectEl.dataset.workspaceConfiguredMode || storedMode);
    let appliedMode = "off";

    if (available) {
      appliedMode = configuredMode;
      if (storedMode !== configuredMode) {
        const applied = getApp().setAutoCopyMode?.(configuredMode);
        appliedMode = normalizeAutoCopyMode(applied ?? configuredMode);
      }
      selectEl.dataset.workspaceConfiguredMode = appliedMode;
    }

    selectEl.disabled = !available;
    selectEl.value = appliedMode;
    selectEl.title = available
      ? ""
      : "Install and activate the Chrome extension to enable Auto-copy.";

    if (labelEl) {
      labelEl.style.opacity = available ? "1" : "0.6";
    }
    if (tooltipContainer) {
      tooltipContainer.style.opacity = "1";
    }
  };

  langSelectTranscribe?.addEventListener("change", syncCopyLabel);
  window.addEventListener("transcribe-language-updated", syncCopyLabel);
  window.addEventListener("app:state-changed", syncAvailabilityUi);
  syncCopyLabel();
  syncAvailabilityUi();
}

function setupPromptInclusionToggle() {
  const promptTextarea = document.getElementById("customPrompt");
  const includePromptToggle = document.getElementById("includePromptToggle");
  const includePromptToggleLabel = document.getElementById("includePromptToggleLabel");
  const includePromptToggleTooltip = document.getElementById("includePromptToggleTooltip");

  if (!promptTextarea || !includePromptToggle) return;

  const nativeValueDescriptor = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value");
  const nativeGetValue = nativeValueDescriptor?.get;
  const nativeSetValue = nativeValueDescriptor?.set;

  if (nativeGetValue && nativeSetValue && !promptTextarea.__promptMaskInstalled) {
    Object.defineProperty(promptTextarea, "value", {
      configurable: true,
      enumerable: true,
      get() {
        const actualValue = nativeGetValue.call(this);
        return includePromptToggle.checked ? actualValue : "";
      },
      set(nextValue) {
        nativeSetValue.call(this, nextValue ?? "");
      }
    });

    promptTextarea.__promptMaskInstalled = true;
    promptTextarea.__getVisiblePromptValue = () => nativeGetValue.call(promptTextarea);
    promptTextarea.__setVisiblePromptValue = (nextValue) => nativeSetValue.call(promptTextarea, nextValue ?? "");

    window.__getVisibleCustomPromptValue = () => nativeGetValue.call(promptTextarea);
    window.__setVisibleCustomPromptValue = (nextValue) => nativeSetValue.call(promptTextarea, nextValue ?? "");
  }

  const syncPromptToggleLabel = () => {
    const isNorwegian = getCurrentTranscribeLanguage() === "no";

    if (includePromptToggleLabel) {
      includePromptToggleLabel.textContent = isNorwegian ? "Bruk prompt" : "Use prompt";
    }

    if (includePromptToggleTooltip) {
      includePromptToggleTooltip.textContent = isNorwegian
        ? "Når denne er aktivert, blir den egendefinerte prompten brukt i notatgenerering. Slå den av for å generere notater uten prompt/instruksjon."
        : "When enabled, your custom prompt is included in note generation. Turn it off to generate notes without using the prompt text.";
    }
  };

  const langSelectTranscribe = document.getElementById("lang-select-transcribe");
  langSelectTranscribe?.addEventListener("change", syncPromptToggleLabel);
  window.addEventListener("transcribe-language-updated", syncPromptToggleLabel);
  syncPromptToggleLabel();
}

function setupNoteAutoClearCopy() {
  const labelEl = document.getElementById("autoClearNoteToggleLabel");
  const tooltipEl = document.getElementById("autoClearNoteTooltipText");
  const langSelectTranscribe = document.getElementById("lang-select-transcribe");
  if (!labelEl || !tooltipEl) return;

  const syncNoteAutoClearCopy = () => {
    const isNorwegian = getCurrentTranscribeLanguage() === "no";
    labelEl.textContent = "Auto clear";
    tooltipEl.innerHTML = isNorwegian
      ? "<strong>Når PÅ:</strong><br/>Notatfeltet tømmes når du starter et nytt opptak.<br/><br/><strong>Når AV:</strong><br/>Å starte et nytt opptak endrer ikke notatfeltet."
      : "<strong>When ON:</strong><br/>The generated note field is cleared when you start a new recording.<br/><br/><strong>When OFF:</strong><br/>Starting a new recording does not change the generated note field.";
  };

  langSelectTranscribe?.addEventListener("change", syncNoteAutoClearCopy);
  window.addEventListener("transcribe-language-updated", syncNoteAutoClearCopy);
  syncNoteAutoClearCopy();
}

function setupSupplementaryDateToggleCopy() {
  const labelEl = document.getElementById("supplementaryDateToggleLabel");
  const tooltipEl = document.getElementById("supplementaryDateTooltipText");
  const langSelectTranscribe = document.getElementById("lang-select-transcribe");
  if (!labelEl || !tooltipEl) return;

  const syncSupplementaryDateCopy = () => {
    const isNorwegian = getCurrentTranscribeLanguage() === "no";

    labelEl.textContent = isNorwegian ? "Dato" : "Date";
    tooltipEl.innerHTML = isNorwegian
      ? "<strong>Når PÅ:</strong><br/>Holder linjen <strong>\"Dagens dato er DD.MM.YYYY\"</strong> øverst i Tilleggsinformasjon og legger den inn igjen etter oppdatering av siden.<br/><br/><strong>Når AV:</strong><br/>Fjerner denne datolinjen fra Tilleggsinformasjon."
      : "<strong>When ON:</strong><br/>Keeps the line <strong>\"Dagens dato er DD.MM.YYYY\"</strong> at the top of Supplementary information and restores it after refresh.<br/><br/><strong>When OFF:</strong><br/>Removes that date line from Supplementary information.";
  };

  langSelectTranscribe?.addEventListener("change", syncSupplementaryDateCopy);
  window.addEventListener("transcribe-language-updated", syncSupplementaryDateCopy);
  syncSupplementaryDateCopy();
}

function initPageUi() {
  setupGridHeight();
  setupAutoGenerateTooltip();
  setupAutoCopyModeUi();
  setupPromptInclusionToggle();
  setupNoteAutoClearCopy();
  setupSupplementaryDateToggleCopy();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPageUi, { once: true });
} else {
  initPageUi();
}
